import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BotoesPeriodoRapido from '../components/relatorios/BotoesPeriodoRapido';
import BotaoGerarPdf from '../components/relatorios/BotaoGerarPdf';
import EstadoRelatorio from '../components/relatorios/EstadoRelatorio';
import SeletorFormaPagamento from '../components/relatorios/SeletorFormaPagamento';
import SeletorPeriodo from '../components/relatorios/SeletorPeriodo';
import VisualizacaoResultados from '../components/relatorios/VisualizacaoResultados';
import {
  gerarRelatorio,
  listarFormasPagamentoRelatorio,
} from '../database/database';
import { gerarECompartilharPdfRelatorio } from '../services/relatoriosPdf';
import {
  PeriodoRelatorio,
  ResultadoRelatorio,
  StatusVisualizacaoRelatorio,
  TipoRelatorio,
} from '../types/relatorios';

type OpcaoRelatorio = {
  tipo: TipoRelatorio;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
};

const OPCOES_RELATORIO: OpcaoRelatorio[] = [
  {
    tipo: 'VENDAS',
    titulo: 'VENDAS',
    descricao: 'Faturamento, status e pagamentos',
    icone: 'cash-outline',
  },
  {
    tipo: 'COMPRAS',
    titulo: 'COMPRAS',
    descricao: 'Entradas, valores e cancelamentos',
    icone: 'cart-outline',
  },
  {
    tipo: 'ESTOQUE',
    titulo: 'ESTOQUE',
    descricao: 'Saldos e custo estimado',
    icone: 'cube-outline',
  },
  {
    tipo: 'CLIENTES',
    titulo: 'CLIENTES',
    descricao: 'Cadastro e total de compras',
    icone: 'people-outline',
  },
];

function formatarDataBanco(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function periodoMesAtual(): PeriodoRelatorio {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  return {
    data_inicial: formatarDataBanco(primeiroDia),
    data_final: formatarDataBanco(hoje),
  };
}

export default function RelatoriosScreen() {
  const navigation = useNavigation<any>();

  const [tipoSelecionado, setTipoSelecionado] =
    useState<TipoRelatorio | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>(periodoMesAtual());
  const [formaPagamento, setFormaPagamento] = useState('TODAS');
  const [formasPagamento, setFormasPagamento] = useState<string[]>([]);
  const [status, setStatus] =
    useState<StatusVisualizacaoRelatorio>('INICIAL');
  const [resultado, setResultado] = useState<ResultadoRelatorio | null>(null);
  const [mensagemErro, setMensagemErro] = useState('');
  const [gerandoPdf, setGerandoPdf] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let telaAtiva = true;

      const carregarFormasPagamento = async () => {
        try {
          const formas = await listarFormasPagamentoRelatorio();
          if (telaAtiva) setFormasPagamento(formas);
        } catch {
          if (telaAtiva) setFormasPagamento([]);
        }
      };

      carregarFormasPagamento();

      return () => {
        telaAtiva = false;
      };
    }, []),
  );

  const opcaoSelecionada = useMemo(
    () => OPCOES_RELATORIO.find((opcao) => opcao.tipo === tipoSelecionado),
    [tipoSelecionado],
  );

  const usaPeriodo =
    tipoSelecionado === 'VENDAS' || tipoSelecionado === 'COMPRAS';
  const usaFormaPagamento = tipoSelecionado === 'VENDAS';

  const selecionarTipo = (tipo: TipoRelatorio) => {
    setTipoSelecionado(tipo);
    setFormaPagamento('TODAS');
    setResultado(null);
    setMensagemErro('');
    setStatus('INICIAL');
  };

  const executarRelatorio = async () => {
    if (!tipoSelecionado) {
      Alert.alert('Atenção', 'Selecione o tipo de relatório.');
      return;
    }

    try {
      setStatus('CARREGANDO');
      setMensagemErro('');
      setResultado(null);

      const dados = await gerarRelatorio({
        tipo: tipoSelecionado,
        data_inicial: periodo.data_inicial,
        data_final: periodo.data_final,
        forma_pagamento: usaFormaPagamento ? formaPagamento : 'TODAS',
      });

      setResultado(dados);
      setStatus(dados.linhas.length ? 'SUCESSO' : 'VAZIO');
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar o relatório.';

      setMensagemErro(mensagem);
      setStatus('ERRO');
    }
  };

  const gerarPdf = async () => {
    if (!resultado?.linhas.length) return;

    try {
      setGerandoPdf(true);
      await gerarECompartilharPdfRelatorio(resultado);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar o documento.',
      );
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTituloLinha}>
          <Ionicons name="bar-chart-outline" size={22} color="#111" />
          <Text style={styles.headerTitulo}>RELATÓRIOS</Text>
        </View>

        <View style={styles.espacoHeader} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.secaoTitulo}>ESCOLHA O RELATÓRIO</Text>

        <View style={styles.gridRelatorios}>
          {OPCOES_RELATORIO.map((opcao) => {
            const selecionado = opcao.tipo === tipoSelecionado;

            return (
              <TouchableOpacity
                key={opcao.tipo}
                style={[
                  styles.cardRelatorio,
                  selecionado && styles.cardRelatorioSelecionado,
                ]}
                onPress={() => selecionarTipo(opcao.tipo)}
                activeOpacity={0.85}
              >
                <View
                  style={[
                    styles.iconeRelatorio,
                    selecionado && styles.iconeRelatorioSelecionado,
                  ]}
                >
                  <Ionicons
                    name={opcao.icone}
                    size={25}
                    color={selecionado ? '#fff' : '#111'}
                  />
                </View>

                <Text
                  style={[
                    styles.cardTitulo,
                    selecionado && styles.cardTextoSelecionado,
                  ]}
                >
                  {opcao.titulo}
                </Text>

                <Text
                  style={[
                    styles.cardDescricao,
                    selecionado && styles.cardDescricaoSelecionada,
                  ]}
                >
                  {opcao.descricao}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!!tipoSelecionado && (
          <View style={styles.filtrosBox}>
            <View style={styles.filtrosTituloLinha}>
              <Ionicons
                name={opcaoSelecionada?.icone ?? 'options-outline'}
                size={21}
                color="#111"
              />
              <Text style={styles.filtrosTitulo}>
                RELATÓRIO DE {opcaoSelecionada?.titulo}
              </Text>
            </View>

            {usaPeriodo && (
              <>
                <Text style={styles.label}>Período rápido</Text>
                <BotoesPeriodoRapido onSelecionar={setPeriodo} />
                <SeletorPeriodo periodo={periodo} onChange={setPeriodo} />
              </>
            )}

            {usaFormaPagamento && (
              <>
                <Text style={styles.label}>Forma de pagamento</Text>
                <SeletorFormaPagamento
                  opcoes={formasPagamento}
                  valor={formaPagamento}
                  onChange={setFormaPagamento}
                />
              </>
            )}

            {!usaPeriodo && (
              <Text style={styles.filtroInformacao}>
                Este relatório utiliza a situação atual dos dados cadastrados.
              </Text>
            )}

            <TouchableOpacity
              style={styles.botaoGerar}
              onPress={executarRelatorio}
              disabled={status === 'CARREGANDO'}
              activeOpacity={0.85}
            >
              <Ionicons name="search-outline" size={20} color="#fff" />
              <Text style={styles.botaoGerarTexto}>GERAR RELATÓRIO</Text>
            </TouchableOpacity>
          </View>
        )}

        <EstadoRelatorio
          status={status}
          erro={mensagemErro}
          mensagemInicial={
            tipoSelecionado
              ? 'Ajuste os filtros e toque em gerar relatório.'
              : 'Selecione Vendas, Compras, Estoque ou Clientes.'
          }
          onTentarNovamente={tipoSelecionado ? executarRelatorio : undefined}
        />

        {status === 'SUCESSO' && resultado && (
          <>
            <VisualizacaoResultados resultado={resultado} />
            <BotaoGerarPdf
              carregando={gerandoPdf}
              desabilitado={!resultado.linhas.length}
              onPress={gerarPdf}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    paddingHorizontal: 16,
    paddingTop: 50,
  },

  header: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#d1d1d1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  headerTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },

  espacoHeader: {
    width: 40,
  },

  conteudo: {
    paddingBottom: 50,
  },

  secaoTitulo: {
    color: '#333',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 9,
  },

  gridRelatorios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  cardRelatorio: {
    width: '48.5%',
    minHeight: 142,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#d5d5d5',
    backgroundColor: '#fff',
    padding: 13,
    marginBottom: 10,
  },

  cardRelatorioSelecionado: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  iconeRelatorio: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#ededed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  iconeRelatorioSelecionado: {
    backgroundColor: '#333',
  },

  cardTitulo: {
    color: '#111',
    fontSize: 13,
    fontWeight: '900',
  },

  cardTextoSelecionado: {
    color: '#fff',
  },

  cardDescricao: {
    color: '#666',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  cardDescricaoSelecionada: {
    color: '#d4d4d4',
  },

  filtrosBox: {
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    padding: 14,
    marginBottom: 12,
  },

  filtrosTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },

  filtrosTitulo: {
    flex: 1,
    color: '#111',
    fontSize: 14,
    fontWeight: '900',
  },

  label: {
    color: '#333',
    fontWeight: '700',
    marginBottom: 7,
  },

  filtroInformacao: {
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  botaoGerar: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  botaoGerarTexto: {
    color: '#fff',
    fontWeight: '800',
  },
});
