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
