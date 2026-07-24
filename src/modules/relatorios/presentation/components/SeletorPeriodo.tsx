import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
        <TextInput
          style={styles.input}
          value={periodo.data_inicial}
          placeholder="AAAA-MM-DD"
          onChangeText={(value) =>
            onChange({
              ...periodo,
              data_inicial: value,
            })
          }
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Data final</Text>
        <TextInput
          style={styles.input}
          value={periodo.data_final}
          placeholder="AAAA-MM-DD"
          onChangeText={(value) =>
            onChange({
              ...periodo,
              data_final: value,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 9,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    color: '#111',
  },
});
