// A self-contained date + time picker modal (no extra deps; works on web + native).
// A real month calendar (Mon-first, past days disabled) + a compact time stepper.
// Used by «Новая активность» so «Когда» opens a calendar instead of cycling presets.
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, INTER_SEMIBOLD, PLAYFAIR_FAMILY, radius, typography } from '@social-events/ui';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** 42 days (6 weeks) starting from the Monday of the week containing the 1st. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const monOffset = (first.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(year, month, 1 - monOffset);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

type Props = {
  visible: boolean;
  value: Date;
  onChange: (next: Date) => void;
  onClose: () => void;
};

export function WhenPicker({ visible, value, onChange, onClose }: Props) {
  const [sel, setSel] = useState<Date>(value);
  const [viewY, setViewY] = useState<number>(value.getFullYear());
  const [viewM, setViewM] = useState<number>(value.getMonth());

  // Re-sync when reopened with a different value.
  const [lastValue, setLastValue] = useState(value.getTime());
  if (value.getTime() !== lastValue && visible) {
    setLastValue(value.getTime());
    setSel(value);
    setViewY(value.getFullYear());
    setViewM(value.getMonth());
  }

  const today = startOfDay(new Date());
  const grid = monthGrid(viewY, viewM);

  const shiftMonth = (delta: number) => {
    const m = viewM + delta;
    const y = viewY + Math.floor(m / 12);
    setViewY(y);
    setViewM(((m % 12) + 12) % 12);
  };

  const pickDay = (d: Date) => {
    setSel(new Date(d.getFullYear(), d.getMonth(), d.getDate(), sel.getHours(), sel.getMinutes()));
  };
  const shiftHour = (delta: number) => {
    const h = (sel.getHours() + delta + 24) % 24;
    setSel(new Date(sel.getFullYear(), sel.getMonth(), sel.getDate(), h, sel.getMinutes()));
  };
  const shiftMinute = (delta: number) => {
    const total = (sel.getHours() * 60 + sel.getMinutes() + delta + 1440) % 1440;
    setSel(new Date(sel.getFullYear(), sel.getMonth(), sel.getDate(), Math.floor(total / 60), total % 60));
  };

  const hh = String(sel.getHours()).padStart(2, '0');
  const mm = String(sel.getMinutes()).padStart(2, '0');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {/* Month header */}
          <View style={styles.header}>
            <Pressable onPress={() => shiftMonth(-1)} style={styles.navBtn} accessibilityRole="button">
              <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {MONTHS[viewM]} {viewY}
            </Text>
            <Pressable onPress={() => shiftMonth(1)} style={styles.navBtn} accessibilityRole="button">
              <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Weekday row */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.weekday}>
                {w}
              </Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.grid}>
            {grid.map((d) => {
              const inMonth = d.getMonth() === viewM;
              const past = startOfDay(d) < today;
              const selected = sameDay(d, sel);
              const isToday = sameDay(d, today);
              const disabled = past;
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => !disabled && pickDay(d)}
                  disabled={disabled}
                  style={[styles.day, selected && styles.daySel]}
                  accessibilityRole="button"
                  testID={`wp-day-${d.getDate()}`}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.dayOut,
                      disabled && styles.dayDisabled,
                      selected && styles.dayTextSel,
                      isToday && !selected && styles.dayToday,
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Time */}
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Время</Text>
            <View style={styles.timeControls}>
              <Stepper onDown={() => shiftHour(-1)} onUp={() => shiftHour(1)} value={hh} />
              <Text style={styles.colon}>:</Text>
              <Stepper onDown={() => shiftMinute(-15)} onUp={() => shiftMinute(15)} value={mm} />
            </View>
          </View>

          <Pressable
            onPress={() => {
              onChange(sel);
              onClose();
            }}
            style={styles.done}
            accessibilityRole="button"
            testID="wp-done"
          >
            <Text style={styles.doneText}>Готово</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Stepper({ value, onDown, onUp }: { value: string; onDown: () => void; onUp: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable onPress={onDown} style={styles.stepBtn} accessibilityRole="button">
        <Ionicons name="remove" size={18} color={colors.text.primary} />
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable onPress={onUp} style={styles.stepBtn} accessibilityRole="button">
        <Ionicons name="add" size={18} color={colors.text.primary} />
      </Pressable>
    </View>
  );
}

const CELL = `${100 / 7}%`;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(21,19,15,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface.default,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontFamily: PLAYFAIR_FAMILY, fontSize: 18, color: colors.text.primary },

  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    width: CELL,
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.muted,
    fontFamily: typography.caption.fontFamily,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: CELL, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  daySel: {},
  dayText: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 34,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: typography.caption.fontFamily,
    overflow: 'hidden',
  },
  dayOut: { color: colors.text.muted, opacity: 0.4 },
  dayDisabled: { color: colors.text.muted, opacity: 0.35 },
  dayToday: { color: colors.action.primary, fontFamily: INTER_SEMIBOLD },
  dayTextSel: {
    backgroundColor: colors.action.primary,
    color: colors.action.primaryText,
    fontFamily: INTER_SEMIBOLD,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
  },
  timeLabel: { fontFamily: INTER_SEMIBOLD, fontSize: 14, color: colors.text.secondary },
  timeControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colon: { fontSize: 18, color: colors.text.primary, marginHorizontal: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.field,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 26, textAlign: 'center', fontFamily: INTER_SEMIBOLD, fontSize: 16, color: colors.text.primary },

  done: {
    marginTop: 14,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.action.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: { fontFamily: INTER_SEMIBOLD, fontSize: 16, color: colors.action.primaryText },
});
