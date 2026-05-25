import Link from 'next/link';

// Placeholder navigation. Labels map to future admin sections (Architecture §19).
// No active-state/auth logic — static links only.
const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/moderation', label: 'Moderation Queue' },
  { href: '/reports', label: 'Reports' },
  { href: '/users', label: 'Users' },
  { href: '/events', label: 'Events' },
  { href: '/messages', label: 'Messages' },
  { href: '/suspicious-activity', label: 'Suspicious Activity' },
  { href: '/audit-logs', label: 'Audit Logs' },
  { href: '/settings', label: 'Settings' },
] as const;

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h1>Social Events Admin</h1>
      <div className="tag">Infrastructure shell · web-only</div>
      <nav className="admin-nav">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
