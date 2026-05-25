import { StyleSheet, Text, View } from 'react-native';

type PlaceholderProps = {
  routeName: string;
  note?: string;
};

// Infrastructure placeholder only — no product UI, no Figma design, no product logic.
// Kept OUTSIDE app/ so Expo Router does not treat it as a route.
export function Placeholder({ routeName, note }: PlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Social Events App</Text>
      <Text style={styles.route}>{routeName}</Text>
      <Text style={styles.sub}>Infrastructure placeholder only</Text>
      <Text style={styles.note}>
        {note ?? 'Product UI will be implemented later from Figma. No product logic implemented.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  brand: { fontSize: 18, fontWeight: '700' },
  route: { fontSize: 15, fontWeight: '600', opacity: 0.8 },
  sub: { fontSize: 13, opacity: 0.6 },
  note: { fontSize: 12, opacity: 0.5, textAlign: 'center', marginTop: 8 },
});
