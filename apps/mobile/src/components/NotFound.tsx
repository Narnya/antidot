// Shared not-found state. For screens whose target genuinely doesn't exist or
// isn't accessible (deleted circle/activity, no access) — distinct from LoadError
// (a transient failure worth retrying). Same visual family as the empty states
// (78×78 tile + Playfair title + Inter sub), with a calm «go back» action rather
// than a retry, so an absence still reads as finished, never a bare gray line.
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, PLAYFAIR_FAMILY, radius, spacing } from '@social-events/ui';

import { Button } from './Button';

type Props = {
  onBack: () => void;
  title?: string;
  sub?: string;
  backLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function NotFound({
  onBack,
  title = 'Не найдено',
  sub = 'Возможно, это удалили или у тебя нет доступа.',
  backLabel = 'Назад',
  icon = 'search-outline',
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.ic}>
        <Ionicons name={icon} size={34} color={colors.action.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
      <View style={styles.cta}>
        <Button label={backLabel} variant="ghost" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  ic: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: PLAYFAIR_FAMILY, fontSize: 26, letterSpacing: -0.4, color: colors.action.primary },
  sub: { fontSize: 15, lineHeight: 22, color: colors.text.secondary, textAlign: 'center', marginTop: 12 },
  cta: { alignSelf: 'stretch', marginTop: 26 },
});
