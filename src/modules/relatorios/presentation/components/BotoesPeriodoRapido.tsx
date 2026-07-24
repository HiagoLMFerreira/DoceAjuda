import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatDatabaseDate } from '../../../../shared/formatters/dateFormatters';
import type { PeriodoRelatorio } from '../../domain/models/Relatorio';

type Props = {
  onSelecionar: (periodo: PeriodoRelatorio) => void;
};

export default function BotoesPeriodoRapido({
  onSelecionar,
}: Props) {
  const select = (type: 'HOJE' | 'SETE_DIAS' | 'MES') => {
    const today = new Date();
    let initial = new Date(today);

    if (type === 'SETE_DIAS') {
      initial.setDate(today.getDate() - 6);
    }

    if (type === 'MES') {
      initial = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    }

    onSelecionar({
      data_inicial: formatDatabaseDate(initial),
      data_final: formatDatabaseDate(today),
    });
  };

  return (
    <View style={styles.container}>
      <Button title="Hoje" onPress={() => select('HOJE')} />
      <Button
        title="Últimos 7 dias"
        onPress={() => select('SETE_DIAS')}
      />
      <Button
        title="Este mês"
        onPress={() => select('MES')}
      />
    </View>
  );
}

function Button({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    minHeight: 38,
    borderRadius: 9,
    backgroundColor: '#e2e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  text: {
    color: '#222',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
});
