// Shared small ANTIDOT wordmark, matched to the mockups' `.brand-mini`: Inter 500
// uppercase letters (green), evenly gapped, with a coral dot floating over the "I".
// Used atop the auth / beta screens (Login, Signup, Waitlist, Invite).
import { StyleSheet, Text, View } from 'react-native';

import { colors, INTER_MEDIUM } from '@social-events/ui';

const LETTERS = ['A', 'N', 'T', 'I', 'D', 'O', 'T'];

export function BrandMini() {
  return (
    <View style={styles.row}>
      {LETTERS.map((ch, i) =>
        ch === 'I' ? (
          <View key={i} style={styles.iWrap}>
            <Text style={styles.letter}>I</Text>
            <View style={styles.dot} />
          </View>
        ) : (
          <Text key={i} style={styles.letter}>
            {ch}
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  iWrap: { position: 'relative', alignItems: 'center' },
  letter: { fontFamily: INTER_MEDIUM, fontSize: 17, lineHeight: 17, color: colors.action.primary },
  dot: {
    position: 'absolute',
    top: -16,
    left: '50%',
    marginLeft: -2.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accent.coral,
  },
});
