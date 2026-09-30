import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ResultadoRelatorio } from '../../domain/models/Relatorio';

export default function VisualizacaoResultados({
  resultado,
}: {
  resultado: ResultadoRelatorio;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <Ionicons name="stats-chart" size={22} color="#FF3B73" />
        </View>
        <View style={styles.reportTitleArea}>
          <Text style={styles.eyebrow}>RELATÓRIO GERADO</Text>
          <Text style={styles.title}>{resultado.titulo}</Text>
          <View style={styles.periodRow}>
            <Ionicons name="calendar-outline" size={13} color="#737178" />
            <Text style={styles.period}>{resultado.periodo}</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countValue}>{resultado.linhas.length}</Text>
          <Text style={styles.countLabel}>
            {resultado.linhas.length === 1 ? 'registro' : 'registros'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Resumo</Text>
      <View style={styles.summaryGrid}>
        {resultado.resumo.map((summary) => (
          <View
            key={summary.rotulo}
            style={[
              styles.summaryCard,
              summary.destaque && styles.summaryCardHighlight,
            ]}
          >
            <Text
              style={[
                styles.summaryLabel,
                summary.destaque && styles.summaryLabelHighlight,
              ]}
            >
              {summary.rotulo}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                summary.destaque && styles.summaryValueHighlight,
              ]}
              numberOfLines={1}
            >
              {summary.valor}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.tableTitleRow}>
        <Text style={styles.sectionLabel}>Detalhamento</Text>
        <Ionicons name="swap-horizontal" size={16} color="#A29EA1" />
      </View>

      <View style={styles.tableContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
                      textAlign: column.alinhamento ?? 'left',
                    },
                  ]}
                >
                  {column.titulo}
                </Text>
              ))}
            </View>

            {resultado.linhas.map((row, index) => (
              <View
                key={String(row.id)}
                style={[styles.row, index % 2 !== 0 && styles.alternateRow]}
              >
                {resultado.colunas.map((column) => (
                  <Text
                    key={column.chave}
                    style={[
                      styles.cell,
                      {
                        width: column.largura ?? 120,
                        textAlign: column.alinhamento ?? 'left',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {String(row[column.chave] ?? '-')}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7EA',
    paddingBottom: 15,
    marginBottom: 16,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  reportTitleArea: {
    flex: 1,
  },
  eyebrow: {
    color: '#FF3B73',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    color: '#242329',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  period: {
    color: '#737178',
    fontSize: 11,
  },
  countBadge: {
    minWidth: 57,
    borderRadius: 14,
    backgroundColor: '#FFF7F9',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 7,
    marginLeft: 8,
  },
  countValue: {
    color: '#D12E60',
    fontSize: 16,
    fontWeight: '900',
  },
  countLabel: {
    color: '#8C7780',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  sectionLabel: {
    color: '#514E52',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
    marginBottom: 18,
  },
  summaryCard: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    backgroundColor: '#FFFDFE',
    padding: 11,
  },
  summaryCardHighlight: {
    borderColor: '#FFD1DD',
    backgroundColor: '#FFF0F4',
  },
  summaryLabel: {
    color: '#737178',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabelHighlight: {
    color: '#B9345A',
  },
  summaryValue: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
  },
  summaryValueHighlight: {
    color: '#D12E60',
    fontSize: 16,
  },
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#FF3B73',
  },
  headerCell: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    paddingVertical: 11,
    paddingHorizontal: 9,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3EBED',
    backgroundColor: '#FFFFFF',
  },
  alternateRow: {
    backgroundColor: '#FFF9FA',
  },
  cell: {
    color: '#514E52',
    fontSize: 10,
    lineHeight: 14,
    paddingVertical: 10,
    paddingHorizontal: 9,
  },
});
