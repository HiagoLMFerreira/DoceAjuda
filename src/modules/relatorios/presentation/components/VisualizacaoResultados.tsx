import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ResultadoRelatorio } from '../../domain/models/Relatorio';

export default function VisualizacaoResultados({
  resultado,
}: {
  resultado: ResultadoRelatorio;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {resultado.titulo}
      </Text>
      <Text style={styles.period}>
        {resultado.periodo}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
      >
        <View>
          <View style={styles.header}>
            {resultado.colunas.map((column) => (
              <Text
                key={column.chave}
                style={[
                  styles.headerCell,
                  {
                    width: column.largura ?? 120,
                    textAlign:
                      column.alinhamento ?? 'left',
                  },
                ]}
              >
                {column.titulo}
              </Text>
            ))}
          </View>

          {resultado.linhas.map((row) => (
            <View
              key={String(row.id)}
              style={styles.row}
            >
              {resultado.colunas.map((column) => (
                <Text
                  key={column.chave}
                  style={[
                    styles.cell,
                    {
                      width: column.largura ?? 120,
                      textAlign:
                        column.alinhamento ?? 'left',
                    },
                  ]}
                >
                  {String(row[column.chave] ?? '-')}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.summaryBox}>
        {resultado.resumo.map((summary) => (
          <View
            key={summary.rotulo}
            style={styles.summaryRow}
          >
            <Text style={styles.summaryLabel}>
              {summary.rotulo}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                summary.destaque &&
                  styles.summaryHighlight,
              ]}
            >
              {summary.valor}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 13,
    backgroundColor: '#fff',
    padding: 13,
  },
  title: {
    color: '#111',
    fontSize: 16,
    fontWeight: '900',
  },
  period: {
    color: '#666',
    fontSize: 11,
    marginTop: 3,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#111',
  },
  headerCell: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    color: '#333',
    fontSize: 10,
    padding: 8,
  },
  summaryBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 7,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    color: '#555',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#111',
    fontSize: 12,
    fontWeight: '800',
  },
  summaryHighlight: {
    fontSize: 14,
  },
});
