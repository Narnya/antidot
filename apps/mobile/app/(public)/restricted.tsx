// AUTH-007 — «Доступ ограничен» gate, pixel-matched to mockups/all-screens.html frame
// I: a centered lock tile, calm non-stigmatizing copy (no shame, no «вас исключили»),
// and a «Написать в поддержку» action. Reachable by URL today; wired into the auth
// state machine once the real moderation schema lands (MOD-005/006).
import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { Button, HeroTitle } from '../../src/components';

export default function Restricted() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.tile}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.text.secondary} />
        </View>
        <HeroTitle style={styles.title}>Доступ ограничен</HeroTitle>
        <Text style={styles.sub}>Сейчас вход в приложение недоступен для этого аккаунта.</Text>
        <Text style={styles.sub2}>Если это ошибка — напиши нам, спокойно разберёмся.</Text>
        <View style={styles.cta}>
          <Button
            label="Написать в поддержку"
            variant="ghost"
            icon={<Ionicons name="mail-outline" size={18} color={colors.text.primary} />}
            onPress={() => Linking.openURL('mailto:hello@antidot.space')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  tile: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#F1ECE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, textAlign: 'center' },
  sub: { ...typography.body, fontSize: 15.5, color: colors.text.secondary, textAlign: 'center', marginTop: 14 },
  sub2: { ...typography.body, fontSize: 14, color: colors.text.muted, textAlign: 'center', marginTop: 12 },
  cta: { alignSelf: 'stretch', marginTop: 28 },
});
