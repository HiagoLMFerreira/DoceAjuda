import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlinhamentoColunaRelatorio,
  ResultadoRelatorio,
} from '../../types/relatorios';

type Props = {
  resultado: ResultadoRelatorio;
};

function alinhamentoTexto(
  alinhamento: AlinhamentoColunaRelatorio = 'left',
): 'left' | 'center' | 'right' {
  return alinhamento;
}

export default function VisualizacaoResultados({ resultado }: Props) {
  const larguraTabela = resultado.colunas.reduce(
    (total, coluna) => total + (coluna.largura ?? 130),
    0,
  );

  return (
    <View>
      <View style={styles.tituloArea}>
        <Text style={styles.titulo}>{resultado.titulo}</Text>
        {!!resultado.periodo && (
          <Text style={styles.periodo}>{resultado.periodo}</Text>
        )}
      </View>

      <View style={styles.resumoGrid}>
        {resultado.resumo.map((item) => (
          <View
            key={item.rotulo}
            style={[styles.resumoCard, item.destaque && styles.resumoDestaque]}
          >
            <Text
              style={[
                styles.resumoRotulo,
                item.destaque && styles.resumoTextoDestaque,
              ]}
            >
              {item.rotulo}
            </Text>
            <Text
              style={[
                styles.resumoValor,
                item.destaque && styles.resumoTextoDestaque,
              ]}
            >
              {item.valor}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={{ minWidth: larguraTabela }}
      >
        <View style={[styles.tabela, { width: larguraTabela }]}>
          <View style={styles.cabecalho}>
            {resultado.colunas.map((coluna) => (
              <View
                key={coluna.chave}
                style={[styles.celula, { width: coluna.largura ?? 130 }]}
              >
                <Text
                  style={[
                    styles.cabecalhoTexto,
                    { textAlign: alinhamentoTexto(coluna.alinhamento) },
                  ]}
                >
                  {coluna.titulo}
                </Text>
              </View>
            ))}
          </View>

          {resultado.linhas.map((linha, indice) => (
            <View
              key={`${linha.id}-${indice}`}
              style={[styles.linha, indice % 2 === 1 && styles.linhaAlternada]}
            >
              {resultado.colunas.map((coluna) => (
                <View
                  key={`${linha.id}-${coluna.chave}`}
                  style={[styles.celula, { width: coluna.largura ?? 130 }]}
                >
                  <Text
                    style={[
                      styles.celulaTexto,
                      { textAlign: alinhamentoTexto(coluna.alinhamento) },
                    ]}
                  >
                    {String(linha[coluna.chave] ?? '')}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.geradoEm}>Gerado em {resultado.gerado_em}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tituloArea: {
    marginTop: 4,
    marginBottom: 10,
  },

  titulo: {
    color: '#111',
    fontSize: 18,
    fontWeight: '900',
  },

  periodo: {
    color: '#666',
    fontSize: 12,
    marginTop: 3,
  },

  resumoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  resumoCard: {
    minWidth: '47%',
    flexGrow: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
  },

  resumoDestaque: {
    backgroundColor: '#111',
  },

  resumoRotulo: {
    color: '#666',
    fontSize: 11,
    fontWeight: '700',
  },

  resumoValor: {
    color: '#111',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },

  resumoTextoDestaque: {
    color: '#fff',
  },

  tabela: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  cabecalho: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cfcfcf',
  },

  linha: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
  },

  linhaAlternada: {
    backgroundColor: '#f6f6f6',
  },

  celula: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },

  cabecalhoTexto: {
    color: '#222',
    fontSize: 11,
    fontWeight: '900',
  },

  celulaTexto: {
    color: '#222',
    fontSize: 12,
  },

  geradoEm: {
    color: '#777',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 8,
  },
});
