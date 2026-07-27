// ACT / P1 — «Чат круга» (mockup frame L). Member-only group chat: the ONE
// sanctioned messaging surface (Core §10) — never open DMs / 1:1 / cold messages
// (Инв. 2). System lines carry lifecycle events, incl. the only membership signal
// «Состав круга обновился» (Инв. 11–12).
//
// UI port: messages come from repo.getCircleChat (mock = illustrative; live = empty
// header until the `circle_messages` table + RLS + Realtime land). Sending appends
// an ephemeral local bubble — NOT persisted yet.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_SEMIBOLD, radius, shadows, spacing, typography } from '@social-events/ui';

import { AppTextInput, IconClock, IconSend } from '../../../components';
import type { ChatMessage, CircleChatView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const AVATAR_TINTS = ['#C9B9A2', '#B7C2AE', '#D6C3B0', '#CDBBA6', '#C1B39F'];
const tint = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return AVATAR_TINTS[Math.abs(h) % AVATAR_TINTS.length];
};

function membersWord(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'участник';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'участника';
  return 'участников';
}

type Props = { circleId: string };

export function CircleChatScreen({ circleId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [chat, setChat] = useState<CircleChatView | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const localSeq = useRef(0);

  const load = useCallback(async () => {
    const v = await repo.getCircleChat(circleId, userId);
    setChat(v);
    setMessages(v?.messages ?? []);
    setLoading(false);
  }, [repo, circleId, userId]);

  useEffect(() => {
    void load();
    // Realtime: another member's message reloads the thread (no-op on mock).
    const unsubscribe = repo.subscribeCircleChat(circleId, () => void load());
    return unsubscribe;
  }, [load, repo, circleId]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (text.length === 0) return;
    setDraft('');
    // Optimistic echo so it feels instant; the reload reconciles with the store/DB.
    localSeq.current += 1;
    setMessages((prev) => [...prev, { id: `local-${localSeq.current}`, kind: 'msg', mine: true, text }]);
    try {
      await repo.sendCircleMessage(circleId, userId, text);
      await load();
    } catch {
      // Keep the optimistic bubble; a failed send is rare in preview/dev.
    }
  }, [draft, repo, circleId, userId, load]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.top}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Назад"
            testID="chat-back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={styles.headTitleWrap}>
            <Text style={styles.headTitle} numberOfLines={1}>
              {chat?.name ?? 'Чат круга'}
            </Text>
            {chat ? (
              <Text style={styles.headSub}>
                Чат круга · {chat.memberCount} {membersWord(chat.memberCount)}
              </Text>
            ) : null}
          </View>
        </View>

        {chat?.pinned ? (
          <View style={styles.pinned}>
            <IconClock color={colors.action.primary} size={18} />
            <View style={styles.pinnedTxt}>
              <Text style={styles.pt1}>{chat.pinned.title}</Text>
              <Text style={styles.pt2}>{chat.pinned.detail}</Text>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.text.muted} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.wrap, { paddingBottom: 92 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока пусто. Напиши первым — участники круга увидят.
              </Text>
            ) : (
              messages.map((m) =>
                m.kind === 'system' ? (
                  <Text key={m.id} style={styles.sys}>
                    {m.text}
                  </Text>
                ) : m.mine ? (
                  <View key={m.id} style={[styles.msg, styles.msgMine]}>
                    <View style={[styles.bubble, styles.bubbleMine]}>
                      <Text style={styles.txMine}>{m.text}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={m.id} style={styles.msg}>
                    <View style={[styles.ava, { backgroundColor: tint(m.authorName ?? m.id) }]} />
                    <View style={styles.bubble}>
                      {m.authorName ? <Text style={styles.who}>{m.authorName}</Text> : null}
                      <Text style={styles.tx}>{m.text}</Text>
                    </View>
                  </View>
                ),
              )
            )}
          </ScrollView>
        )}
      </SafeAreaView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 14 }]}>
        <AppTextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Сообщение…"
          style={styles.box}
          onSubmitEditing={send}
          returnKeyType="send"
          testID="chat-input"
        />
        <Pressable
          onPress={send}
          style={styles.send}
          accessibilityRole="button"
          accessibilityLabel="Отправить"
          testID="chat-send"
        >
          <IconSend color={colors.text.inverse} size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  top: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // header (ctx-header + stack-top, Inter 18 — not Playfair)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[1],
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  headTitleWrap: { flex: 1 },
  headTitle: { fontFamily: INTER_SEMIBOLD, fontSize: 18, color: colors.text.primary },
  headSub: { fontSize: 12.5, color: colors.text.secondary, marginTop: 1 },

  // pinned meeting
  pinned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: '#EEF3EC',
    borderWidth: 1,
    borderColor: '#D6E2D0',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  pinnedTxt: { flex: 1 },
  pt1: { fontFamily: INTER_SEMIBOLD, fontSize: 13, color: colors.action.primary },
  pt2: { fontSize: 12, color: '#4A5C50', marginTop: 1 },

  // messages
  wrap: { paddingHorizontal: 18, paddingTop: 16, gap: 11 },
  emptyText: { ...typography.body, fontSize: 14, color: colors.text.muted, textAlign: 'center', marginTop: 24 },
  sys: {
    alignSelf: 'center',
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    color: colors.text.secondary,
    fontSize: 12,
    fontFamily: typography.caption.fontFamily,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  msg: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', maxWidth: '82%', alignSelf: 'flex-start' },
  msgMine: { alignSelf: 'flex-end' },
  ava: { width: 30, height: 30, borderRadius: radius.full, flexShrink: 0 },
  bubble: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexShrink: 1,
  },
  bubbleMine: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  who: { fontFamily: INTER_SEMIBOLD, fontSize: 12, color: colors.action.primary, marginBottom: 2 },
  tx: { fontSize: 14, lineHeight: 19, color: colors.text.primary },
  txMine: { fontSize: 14, lineHeight: 19, color: colors.text.inverse },

  // input bar
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(247,245,239,0.98)',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text.primary,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.action.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
