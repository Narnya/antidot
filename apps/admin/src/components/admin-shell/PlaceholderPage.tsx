type PlaceholderPageProps = {
  title: string;
  subtitle?: string;
};

// Generic placeholder body for admin routes. No real data, no actions.
export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <section>
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-sub">
        {subtitle ??
          'Infrastructure placeholder only. Real admin data and actions will be implemented later.'}
      </p>
      <ul className="placeholder-notes">
        <li>Infrastructure placeholder only — no real admin data.</li>
        <li>No Supabase / service role connected.</li>
        <li>No moderation actions are functional.</li>
        <li>All future admin actions must create audit logs.</li>
        <li>AI moderation is assistive only — never the final judge.</li>
      </ul>
    </section>
  );
}
