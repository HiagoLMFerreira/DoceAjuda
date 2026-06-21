import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PeriodoRelatorio } from '../../types/relatorios';

type Props = {
  onSelecionar: (periodo: PeriodoRelatorio) => void;
};

type PeriodoRapido = {
  titulo: string;
  calcular: () => PeriodoRelatorio;
};

function formatarDataBanco(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function criarPeriodoDias(dias: number): PeriodoRelatorio {
  const dataFinal = new Date();
  const dataInicial = new Date();
  dataInicial.setDate(dataInicial.getDate() - (dias - 1));

  return {
    data_inicial: formatarDataBanco(dataInicial),
    data_final: formatarDataBanco(dataFinal),
  };
}

function criarPeriodoMesAtual(): PeriodoRelatorio {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return {
    data_inicial: formatarDataBanco(primeiroDia),
    data_final: formatarDataBanco(hoje),
  };
}

const PERIODOS: PeriodoRapido[] = [
  { titulo: 'HOJE', calcular: () => criarPeriodoDias(1) },
  { titulo: '7 DIAS', calcular: () => criarPeriodoDias(7) },
  { titulo: '30 DIAS', calcular: () => criarPeriodoDias(30) },
  { titulo: 'MÊS ATUAL', calcular: criarPeriodoMesAtual },
];

export default function BotoesPeriodoRapido({ onSelecionar }: Props) {
  return (
    <View style={styles.container}>
      {PERIODOS.map((periodo) => (
        <TouchableOpacity
          key={periodo.titulo}
          style={styles.botao}
          onPress={() => onSelecionar(periodo.calcular())}
          activeOpacity={0.8}
        >
          <Text style={styles.texto}>{periodo.titulo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  botao: {
    minHeight: 37,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  texto: {
    color: '#222',
    fontSize: 11,
    fontWeight: '800',
  },
});
