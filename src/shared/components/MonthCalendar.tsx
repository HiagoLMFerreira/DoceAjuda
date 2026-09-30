import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatDateForDatabase } from '../../core/formatters';

type Props = {
  markedDates: readonly string[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  initialMonth?: string;
};

const WEEK_DAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseMonth(value?: string): Date {
  const match = value?.match(/^(\d{4})-(\d{2})/);
  if (!match) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export default function MonthCalendar({
  markedDates,
  selectedDate,
  onSelectDate,
  initialMonth,
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    parseMonth(initialMonth ?? selectedDate)
  );
  const marked = useMemo(() => new Set(markedDates), [markedDates]);
  const today = formatDateForDatabase(new Date());

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay();
    const numberOfDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekDay + 1;
      if (day < 1 || day > numberOfDays) return null;
      return formatDateForDatabase(new Date(year, month, day));
    });
  }, [visibleMonth]);

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.navigationButton} onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={20} color="#FF3B73" />
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </Text>
        <Pressable style={styles.navigationButton} onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={20} color="#FF3B73" />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEK_DAYS.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => {
          if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;
          const selected = selectedDate === date;
          const hasOrder = marked.has(date);
          const isToday = today === date;

          return (
            <Pressable
              key={date}
              style={[styles.dayCell, selected && styles.selectedCell]}
              onPress={() => onSelectDate?.(date)}
            >
              <Text
                style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  selected && styles.selectedText,
                ]}
              >
                {Number(date.slice(-2))}
              </Text>
              {hasOrder && (
                <View style={[styles.marker, selected && styles.selectedMarker]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 20,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navigationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
  },
  monthTitle: {
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  weekDay: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#9B98A0',
    fontSize: 10,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedCell: {
    backgroundColor: '#FF3B73',
  },
  dayText: {
    color: '#3B3940',
    fontSize: 13,
    fontWeight: '700',
  },
  todayText: {
    color: '#FF3B73',
    fontWeight: '900',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  marker: {
    width: 5,
    height: 5,
    marginTop: 2,
    borderRadius: 3,
    backgroundColor: '#FF3B73',
  },
  selectedMarker: {
    backgroundColor: '#FFFFFF',
  },
});
