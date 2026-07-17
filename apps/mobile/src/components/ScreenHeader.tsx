// Shared stack-screen header, matched to the mockups' `.stack-top`: a circular
// 38×38 back button (surface + hairline border, back chevron) followed by an inline
// Playfair 24 title, with an optional right-hand action slot. Replaces the old
// «‹ Назад» text link + 28px standalone title used across the stack screens.
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, PLAYFAIR_FAMILY, radius, shadows, spacing } from '@social-events/ui';

type Props = {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  /** Optional second line under the title (e.g. «Сегодня 19:00 · управление»). */
  subtitle?: string;
};

export function ScreenHeader({ title, onBack, right, subtitle }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          testID="screen-back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
      ) : null}
      {title ? (
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.titleWrap} />
      )}
      {right ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[4],
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
  titleWrap: { flex: 1 },
  title: { fontFamily: PLAYFAIR_FAMILY, fontSize: 24, letterSpacing: -0.3, color: colors.text.primary },
  subtitle: { fontSize: 12.5, color: colors.text.secondary, marginTop: 1 },
});
