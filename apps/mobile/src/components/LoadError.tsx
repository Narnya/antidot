// Shared load-error state. Screens that fetch data show this INSTEAD of an
// infinite spinner or a misleading «empty» state when a load throws (expired
// session, transient network, an RLS error). Visual pattern mirrors the app's
// empty states (78×78 tile + Playfair title + Inter sub) so a failure still
// looks finished, plus a «Повторить» action to re-run the load.
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, PLAYFAIR_FAMILY, radius, spacing } from '@social-events/ui';

import { Button } from './Button';

type Props = {
  onRetry: () => void;
  title?: string;
  sub?: string;
  /** Compact inline variant (no flex:1 centering) for use inside a list slot. */
  inline?: boolean;
};

export function LoadError({
  onRetry,
  title = 'Не удалось загрузить',
  sub = 'Проверь связь и попробуй ещё раз.',
  inline = false,
}: Props) {
  return (
    <View style={[styles.wrap, inline && styles.inline]}>
      <View style={styles.ic}>
        <Ionicons name="cloud-offline-outline" size={34} color={colors.action.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
      <View style={styles.cta}>
        <Button label="Повторить" variant="ghost" onPress={onRetry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  inline: { flex: 0, paddingVertical: spacing[8] },
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
