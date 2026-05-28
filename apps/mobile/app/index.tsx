import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { Placeholder } from '../components/Placeholder';

// "/" — app shell landing. Links exercise each route-group placeholder. No product logic.
export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Placeholder
        routeName="/ (app shell)"
        note="Mobile shell placeholder. No product logic implemented."
      />
      <Link href="/welcome" style={styles.link}>
        (public) → /welcome
      </Link>
      <Link href="/start" style={styles.link}>
        (onboarding) → /start
      </Link>
      <Link href="/home" style={styles.link}>
        (app) → /home
      </Link>
      <Link href="/placeholder" style={styles.link}>
        (modals) → /placeholder
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  link: { fontSize: 14, color: '#2F5BFF' },
});
