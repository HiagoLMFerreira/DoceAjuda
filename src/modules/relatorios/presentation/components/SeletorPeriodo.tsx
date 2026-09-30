import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PeriodoRelatorio } from '../../domain/models/Relatorio';

export default function SeletorPeriodo({
  periodo,
  onChange,
}: {
  periodo: PeriodoRelatorio;
  onChange: (periodo: PeriodoRelatorio) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Data inicial</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-clear-outline" size={17} color="#FF3B73" />
          <TextInput
            style={styles.input}
            value={periodo.data_inicial}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#A8A4A6"
            onChangeText={(value) =>
              onChange({
                ...periodo,
                data_inicial: value,
              })
            }
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Data final</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-clear-outline" size={17} color="#FF3B73" />
          <TextInput
            style={styles.input}
            value={periodo.data_final}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#A8A4A6"
            onChangeText={(value) =>
              onChange({
                ...periodo,
                data_final: value,
              })
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  field: {
    flex: 1,
  },
  label: {
    color: '#514E52',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 14,
    backgroundColor: '#FFFDFE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 0,
    color: '#242329',
    fontSize: 12,
    fontWeight: '700',
  },
});
