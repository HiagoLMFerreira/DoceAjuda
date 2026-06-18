import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { PeriodoRelatorio } from '../../types/relatorios';

type Props = {
  periodo: PeriodoRelatorio;
  onChange: (periodo: PeriodoRelatorio) => void;
};

export default function SeletorPeriodo({ periodo, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.campo}>
        <Text style={styles.label}>Data inicial</Text>
        <TextInput
          style={styles.input}
          value={periodo.data_inicial}
          onChangeText={(valor: string) =>
            onChange({ ...periodo, data_inicial: valor })
          }
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Data final</Text>
        <TextInput
          style={styles.input}
          value={periodo.data_final}
          onChangeText={(valor: string) =>
            onChange({ ...periodo, data_final: valor })
          }
          placeholder="AAAA-MM-DD"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  campo: {
    flex: 1,
  },

  label: {
    color: '#333',
    fontWeight: '700',
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#c7c7c7',
    backgroundColor: '#fff',
    color: '#111',
    paddingHorizontal: 11,
  },
});
