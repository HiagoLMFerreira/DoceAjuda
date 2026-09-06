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
import { SafeAreaView } from 'react-native-safe-area-context';
import BotoesPeriodoRapido from '../components/BotoesPeriodoRapido';
import BotaoGerarPdf from '../components/BotaoGerarPdf';
import EstadoRelatorio from '../components/EstadoRelatorio';
import SeletorFormaPagamento from '../components/SeletorFormaPagamento';
import SeletorPeriodo from '../components/SeletorPeriodo';
import VisualizacaoResultados from '../components/VisualizacaoResultados';
import {
  relatorioPdfService,
  relatorioService,
} from '../../di/relatoriosContainer';

import {
  PeriodoRelatorio,
  ResultadoRelatorio,
  StatusVisualizacaoRelatorio,
  TipoRelatorio,
} from '../../domain/models/Relatorio';

type OpcaoRelatorio = {
  tipo: TipoRelatorio;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
};

const OPCOES_RELATORIO: OpcaoRelatorio[] = [
  {
    tipo: 'VENDAS',
    titulo: 'Vendas',
    descricao: 'Faturamento, status e pagamentos',
    icone: 'cash-outline',
  },
  {
    tipo: 'COMPRAS',
    titulo: 'Compras',
    descricao: 'Entradas, valores e cancelamentos',
    icone: 'cart-outline',
  },
  {
    tipo: 'ESTOQUE',
    titulo: 'Estoque',
    descricao: 'Saldos e custo estimado',
    icone: 'cube-outline',
  },
  {
    tipo: 'CLIENTES',
    titulo: 'Clientes',
    descricao: 'Cadastro e total de compras',
    icone: 'people-outline',
  },
];

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  border: '#F1E7EA',
  borderStrong: '#FFD1DD',
};

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
          const formas = await relatorioService.listarFormasPagamento();
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

      const dados = await relatorioService.gerar({
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
      await relatorioPdfService.gerarECompartilhar(resultado);
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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.headerTituloLinha}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.headerTextArea}>
              <Text style={styles.headerTitulo}>Relatórios</Text>
              <Text style={styles.headerSubtitle}>
                Indicadores para acompanhar seu negócio
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Escolha o relatório</Text>
            <Text style={styles.secaoDescricao}>
              Selecione uma categoria para configurar a análise.
            </Text>
          </View>

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
                    color={COLORS.primary}
                  />
                </View>

                {selecionado && (
                  <View style={styles.checkSelecionado}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}

                <Text
                  style={styles.cardTitulo}
                >
                  {opcao.titulo}
                </Text>

                <Text
                  style={styles.cardDescricao}
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
                color={COLORS.primary}
              />
              <Text style={styles.filtrosTitulo}>
                Relatório de {opcaoSelecionada?.titulo}
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
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
              <Text style={styles.botaoGerarTexto}>Gerar relatório</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    minHeight: 76,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  headerTituloLinha: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerTextArea: {
    flex: 1,
  },

  headerTitulo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  conteudo: {
    paddingBottom: 32,
  },

  secaoHeader: {
    marginBottom: 12,
  },

  secaoTitulo: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },

  secaoDescricao: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  gridRelatorios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  cardRelatorio: {
    width: '48.5%',
    minHeight: 146,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
    position: 'relative',
  },

  cardRelatorioSelecionado: {
    backgroundColor: '#FFF7F9',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  iconeRelatorio: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  iconeRelatorioSelecionado: {
    backgroundColor: '#FFE5ED',
  },

  checkSelecionado: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  cardTitulo: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },

  cardDescricao: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  filtrosBox: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },

  filtrosTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },

  filtrosTitulo: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '900',
  },

  label: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },

  filtroInformacao: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 13,
    padding: 12,
    marginBottom: 14,
  },

  botaoGerar: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  botaoGerarTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
