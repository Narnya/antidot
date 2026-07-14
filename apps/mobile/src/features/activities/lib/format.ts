// ACT-003 — Pure presentation helpers for activities (no I/O, no React).
import type { IsoTimestamp } from './model';

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

/** "Чт, 9 июл · 19:00" — local time, coarse and friendly. */
export function formatWhen(iso: IsoTimestamp): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = DAYS[d.getDay()] ?? '';
  const month = MONTHS[d.getMonth()] ?? '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day}, ${d.getDate()} ${month} · ${hh}:${mm}`;
}

/** "19:00" — local time only. */
export function formatTime(iso: IsoTimestamp): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Сегодня" / "Завтра" / "9 июл" — for feed day-group headers. */
export function formatDayLabel(iso: IsoTimestamp): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Завтра';
  return `${d.getDate()} ${MONTHS[d.getMonth()] ?? ''}`;
}
