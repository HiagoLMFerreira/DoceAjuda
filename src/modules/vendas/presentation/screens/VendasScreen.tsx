import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import DocumentoComercialFormModal from '../../../../components/DocumentoComercialFormModal';
import { formatDateOnlyBR } from '../../../../core/formatters/date';
import {
  buscarDocumentoComercialPorId,
  cancelarVenda,
  DirecaoOrdenacao,
  DocumentoComercialDatabase,
  DocumentoComercialDetalhado,
  formatarMoeda,
  listarVendas,
  OrdenarDocumentoComercialPor,
} from '../../application/vendasApi';

type Props = {
  navigation: {
    goBack: () => void;
    addListener?: (evento: string, callback: () => void) => () => void;
  };
};

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9B98A0',
  border: '#F1E7EA',
  borderStrong: '#FFD1DD',
  success: '#2D9449',
  danger: '#D93C56',
};

function formatarData(data: string): string {
  if (!data) return '-';

  const normalizada = data.includes('T') ? data : data.replace(' ', 'T');
  const objetoData = new Date(normalizada);

  if (Number.isNaN(objetoData.getTime())) {
    return data;
  }

  return objetoData.toLocaleDateString('pt-BR');
}

function obterTextoStatus(status: DocumentoComercialDatabase['status']): string {
  switch (status) {
    case 'CONCLUIDA':
      return 'Concluída';
    case 'CANCELADA':
      return 'Cancelada';
    default:
      return status;
  }
}

export default function VendasScreen({ navigation }: Props) {
  const [vendas, setVendas] = useState<DocumentoComercialDatabase[]>([]);
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<{
    campo: OrdenarDocumentoComercialPor;
    direcao: DirecaoOrdenacao;
  }>({ campo: 'created_at', direcao: 'DESC' });
  const [carregando, setCarregando] = useState(true);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] =
    useState<DocumentoComercialDetalhado | null>(null);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [cancelandoVenda, setCancelandoVenda] = useState(false);

  const carregarVendas = useCallback(async () => {
    try {
      setCarregando(true);
      const resultado = await listarVendas(
        busca,
        ordenacao.campo,
        ordenacao.direcao
      );
      setVendas(resultado);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as vendas.'
      );
    } finally {
      setCarregando(false);
    }
  }, [busca, ordenacao]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void carregarVendas();
    }, 250);

    return () => clearTimeout(timeout);
  }, [carregarVendas]);

  useEffect(() => {
    if (!navigation.addListener) return;

    const removerListener = navigation.addListener('focus', () => {
      void carregarVendas();
    });

    return removerListener;
  }, [navigation, carregarVendas]);

  function alternarOrdenacao(campo: OrdenarDocumentoComercialPor) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return {
          campo,
          direcao: atual.direcao === 'ASC' ? 'DESC' : 'ASC',
        };
      }

      return {
        campo,
        direcao: campo === 'cliente_nome' ? 'ASC' : 'DESC',
      };
    });
  }

  function iconeOrdenacao(campo: OrdenarDocumentoComercialPor) {
    if (ordenacao.campo !== campo) {
      return 'swap-vertical-outline' as const;
    }

    return ordenacao.direcao === 'ASC'
      ? ('arrow-up-outline' as const)
      : ('arrow-down-outline' as const);
  }

  async function abrirDetalhes(id: number) {
    try {
      setCarregandoDetalhes(true);
      const detalhes = await buscarDocumentoComercialPorId(id);

      if (!detalhes || detalhes.tipo !== 'VENDA') {
        Alert.alert('Erro', 'Venda não encontrada.');
        return;
      }

      setVendaSelecionada(detalhes);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir a venda.'
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  function solicitarCancelamento() {
    if (!vendaSelecionada || vendaSelecionada.status !== 'CONCLUIDA') {
      return;
    }

    Alert.alert(
      'Cancelar venda',
      `Deseja cancelar a venda #${vendaSelecionada.id}? As quantidades descontadas serão devolvidas ao estoque.`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => void confirmarCancelamento(),
        },
      ]
    );
  }

  async function confirmarCancelamento() {
    if (!vendaSelecionada || cancelandoVenda) {
      return;
    }

    try {
      setCancelandoVenda(true);
      await cancelarVenda(vendaSelecionada.id);

      const vendaAtualizada = await buscarDocumentoComercialPorId(
        vendaSelecionada.id
      );

      if (vendaAtualizada?.tipo === 'VENDA') {
        setVendaSelecionada(vendaAtualizada);
      }

      await carregarVendas();
      Alert.alert(
        'Venda cancelada',
        'A venda foi cancelada e as quantidades foram devolvidas ao estoque.'
      );
    } catch (error) {
      Alert.alert(
        'Não foi possível cancelar',
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao cancelar a venda.'
      );
    } finally {
      setCancelandoVenda(false);
    }
  }

  async function aposSalvar() {
    setModalFormulario(false);
    setVendaSelecionada(null);
    await carregarVendas();
    Alert.alert('Venda concluída', 'A venda foi registrada com sucesso.');
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.botaoVoltar} onPress={navigation.goBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="bag-handle-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.titulo}>Vendas</Text>
              <Text style={styles.headerSubtitle}>
                Pedidos, pagamentos e estoque
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buscaLinha}>
          <View style={styles.buscaContainer}>
            <Ionicons
              name="search-outline"
              size={21}
              color={COLORS.primary}
            />
            <TextInput
              style={styles.buscaInput}
              placeholder="Buscar por cliente, ID, status ou pagamento"
              placeholderTextColor={COLORS.textMuted}
              value={busca}
              onChangeText={setBusca}
            />
            {!!busca && (
              <Pressable onPress={() => setBusca('')}>
                <Ionicons
                  name="close-circle"
                  size={21}
                  color={COLORS.textMuted}
                />
              </Pressable>
            )}
          </View>
        </View>

        <Pressable
          style={styles.botaoNovo}
          onPress={() => setModalFormulario(true)}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.botaoNovoTexto}>Nova Venda</Text>
        </Pressable>

        <View style={styles.cabecalhoLista}>
          <Pressable
            style={[styles.cabecalhoBotao, styles.colunaCliente]}
            onPress={() => alternarOrdenacao('cliente_nome')}
          >
            <Text style={styles.cabecalhoTexto}>CLIENTE</Text>
            <Ionicons
              name={iconeOrdenacao('cliente_nome')}
              size={14}
              color={
                ordenacao.campo === 'cliente_nome'
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
            />
          </Pressable>

          <Pressable
            style={[
              styles.cabecalhoBotao,
              styles.cabecalhoBotaoCentralizado,
              styles.colunaData,
            ]}
            onPress={() => alternarOrdenacao('created_at')}
          >
            <Text style={styles.cabecalhoTexto}>DATA</Text>
            <Ionicons
              name={iconeOrdenacao('created_at')}
              size={14}
              color={
                ordenacao.campo === 'created_at'
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
            />
          </Pressable>

          <Pressable
            style={[
              styles.cabecalhoBotao,
              styles.cabecalhoBotaoDireita,
              styles.colunaTotal,
            ]}
            onPress={() => alternarOrdenacao('valor_total')}
          >
            <Text style={styles.cabecalhoTexto}>TOTAL</Text>
            <Ionicons
              name={iconeOrdenacao('valor_total')}
              size={14}
              color={
                ordenacao.campo === 'valor_total'
                  ? COLORS.primary
                  : COLORS.textSecondary
              }
            />
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={vendas}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            ListEmptyComponent={
              <View style={styles.estadoVazio}>
                <View style={styles.estadoVazioIcone}>
                  <Ionicons
                    name="bag-handle-outline"
                    size={34}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.estadoVazioTitulo}>Nenhuma venda encontrada</Text>
                <Text style={styles.estadoVazioTexto}>
                  Registre uma venda direta ou converta um orçamento.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() => void abrirDetalhes(item.id)}
              >
                <View style={styles.cardLinhaPrincipal}>
                  <View style={styles.colunaCliente}>
                    <Text style={styles.cardCliente} numberOfLines={1}>
                      {item.cliente_nome}
                    </Text>
                    <Text style={styles.cardId}>#{item.id}</Text>
                  </View>

                  <Text style={[styles.cardTexto, styles.colunaData]}>
                    {formatarData(item.created_at)}
                  </Text>

                  <Text style={[styles.cardTotal, styles.colunaTotal]}>
                    {formatarMoeda(item.valor_total)}
                  </Text>
                </View>

                <View style={styles.cardRodape}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'CONCLUIDA'
                        ? styles.statusConcluida
                        : styles.statusCancelada,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTexto,
                        item.status === 'CONCLUIDA'
                          ? styles.statusTextoConcluida
                          : styles.statusTextoCancelada,
                      ]}
                    >
                      {obterTextoStatus(item.status)}
                    </Text>
                  </View>

                  <View style={styles.cardRodapeDireita}>
                    <Text style={styles.formaPagamentoCard} numberOfLines={1}>
                      {item.forma_pagamento || '-'}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

      <Modal
        visible={modalDetalhes}
        transparent
        animationType="fade"
        onRequestClose={() => setModalDetalhes(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDetalhes}>
            <View style={styles.modalHandle} />
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>
                VENDA #{vendaSelecionada?.id ?? ''}
              </Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalDetalhes(false)}
              >
                <Ionicons name="close" size={23} color={COLORS.primary} />
              </Pressable>
            </View>

            {carregandoDetalhes || !vendaSelecionada ? (
              <ActivityIndicator
                style={styles.loadingDetalhes}
                color={COLORS.primary}
              />
            ) : (
              <FlatList
                data={vendaSelecionada.itens}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detalhesContent}
                ListHeaderComponent={
                  <View>
                    <View style={styles.infoCard}>
                      <View style={styles.infoLinha}>
                        <Text style={styles.infoLabel}>Cliente</Text>
                        <Text style={styles.infoValor}>
                          {vendaSelecionada.cliente_nome}
                        </Text>
                      </View>
                      <View style={styles.infoLinha}>
                        <Text style={styles.infoLabel}>Data</Text>
                        <Text style={styles.infoValor}>
                          {formatarData(vendaSelecionada.created_at)}
                        </Text>
                      </View>
                      <View style={styles.infoLinha}>
                        <Text style={styles.infoLabel}>Pagamento</Text>
                        <Text style={styles.infoValor}>
                          {vendaSelecionada.forma_pagamento || '-'}
                        </Text>
                      </View>
                      {!!vendaSelecionada.data_encomenda && (
                        <View style={styles.infoLinha}>
                          <Text style={styles.infoLabel}>Data da encomenda</Text>
                          <Text style={styles.infoValor}>
                            {formatDateOnlyBR(vendaSelecionada.data_encomenda)}
                          </Text>
                        </View>
                      )}
                      {!!vendaSelecionada.finalidade && (
                        <View style={styles.infoLinha}>
                          <Text style={styles.infoLabel}>Finalidade</Text>
                          <Text style={styles.infoValor}>
                            {vendaSelecionada.finalidade}
                          </Text>
                        </View>
                      )}
                      {vendaSelecionada.sinal_pagamento > 0 && (
                        <View style={styles.infoLinha}>
                          <Text style={styles.infoLabel}>Sinal recebido</Text>
                          <Text style={styles.infoValor}>
                            {formatarMoeda(vendaSelecionada.sinal_pagamento)}
                          </Text>
                        </View>
                      )}
                      {!!vendaSelecionada.orcamento_origem_id && (
                        <View style={styles.infoLinha}>
                          <Text style={styles.infoLabel}>Saldo a receber</Text>
                          <Text style={styles.infoValor}>
                            {formatarMoeda(
                              Math.max(
                                0,
                                vendaSelecionada.valor_total -
                                  vendaSelecionada.sinal_pagamento
                              )
                            )}
                          </Text>
                        </View>
                      )}
                      {!!vendaSelecionada.orcamento_origem_id && (
                        <View style={styles.infoLinha}>
                          <Text style={styles.infoLabel}>Orçamento de origem</Text>
                          <Text style={styles.infoValor}>
                            #{vendaSelecionada.orcamento_origem_id}
                          </Text>
                        </View>
                      )}
                      <View
                        style={
                          vendaSelecionada.canceled_at
                            ? styles.infoLinha
                            : styles.infoLinhaSemBorda
                        }
                      >
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={styles.infoValor}>
                          {obterTextoStatus(vendaSelecionada.status)}
                        </Text>
                      </View>

                      {!!vendaSelecionada.canceled_at && (
                        <View style={styles.infoLinhaSemBorda}>
                          <Text style={styles.infoLabel}>Cancelada em</Text>
                          <Text style={styles.infoValor}>
                            {formatarData(vendaSelecionada.canceled_at)}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.detalhesSecaoTitulo}>ITENS</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.detalheItemCard}>
                    <Text style={styles.detalheItemNome}>{item.produto_nome}</Text>
                    <View style={styles.detalheItemLinha}>
                      <Text style={styles.detalheItemTexto}>
                        {item.quantidade} × {formatarMoeda(item.valor_unitario)}
                      </Text>
                      <Text style={styles.detalheItemSubtotal}>
                        {formatarMoeda(item.subtotal)}
                      </Text>
                    </View>
                  </View>
                )}
                ListFooterComponent={
                  <View>
                    {!!vendaSelecionada.observacoes && (
                      <View style={styles.observacoesCard}>
                        <Text style={styles.observacoesTitulo}>Observações</Text>
                        <Text style={styles.observacoesTexto}>
                          {vendaSelecionada.observacoes}
                        </Text>
                      </View>
                    )}

                    <View style={styles.totalDetalhesCard}>
                      <Text style={styles.totalDetalhesLabel}>TOTAL</Text>
                      <Text style={styles.totalDetalhesValor}>
                        {formatarMoeda(vendaSelecionada.valor_total)}
                      </Text>
                    </View>

                    {vendaSelecionada.status === 'CONCLUIDA' && (
                      <Pressable
                        style={[
                          styles.botaoCancelarVenda,
                          cancelandoVenda && styles.botaoDesabilitado,
                        ]}
                        onPress={solicitarCancelamento}
                        disabled={cancelandoVenda}
                      >
                        {cancelandoVenda ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Ionicons
                            name="close-circle-outline"
                            size={21}
                            color="#fff"
                          />
                        )}
                        <Text style={styles.botaoCancelarVendaTexto}>
                          {cancelandoVenda ? 'Cancelando...' : 'Cancelar Venda'}
                        </Text>
                      </Pressable>
                    )}

                    {vendaSelecionada.status === 'CANCELADA' && (
                      <View style={styles.avisoVendaCancelada}>
                        <Ionicons
                          name="information-circle-outline"
                          size={21}
                          color={COLORS.danger}
                        />
                        <Text style={styles.avisoVendaCanceladaTexto}>
                          Esta venda permanece disponível apenas para consulta.
                        </Text>
                      </View>
                    )}
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <DocumentoComercialFormModal
        visible={modalFormulario}
        tipo="VENDA"
        onClose={() => setModalFormulario(false)}
        onSaved={aposSalvar}
      />
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
    backgroundColor: COLORS.surface,
    borderRadius: 18,
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },
  headerTextArea: {
    flex: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  buscaLinha: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 12,
  },
  buscaContainer: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  buscaInput: {
    flex: 1,
    minHeight: 52,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  botaoNovo: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 5,
  },
  botaoNovoTexto: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  cabecalhoLista: {
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD5E0',
  },
  cabecalhoBotao: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cabecalhoBotaoCentralizado: {
    justifyContent: 'center',
  },
  cabecalhoBotaoDireita: {
    justifyContent: 'flex-end',
  },
  cabecalhoTexto: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  colunaCliente: {
    flex: 1.5,
  },
  colunaData: {
    flex: 0.8,
  },
  colunaTotal: {
    flex: 1,
  },
  listaContent: {
    paddingBottom: 35,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },
  cardLinhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCliente: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  cardId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  cardTexto: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cardTotal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'right',
  },
  cardRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F6EDF0',
  },
  cardRodapeDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '58%',
  },
  formaPagamentoCard: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusConcluida: {
    backgroundColor: '#EDF8EE',
  },
  statusCancelada: {
    backgroundColor: '#FFF0F3',
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: '900',
  },
  statusTextoConcluida: {
    color: COLORS.success,
  },
  statusTextoCancelada: {
    color: COLORS.danger,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  estadoVazioIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  estadoVazioTitulo: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 11,
  },
  estadoVazioTexto: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
    justifyContent: 'flex-end',
  },
  modalTitulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  modalDetalhes: {
    maxHeight: '90%',
    width: '100%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#E8DDE1',
    marginTop: 9,
  },
  detalhesHeader: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botaoFechar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalhesContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  infoLinha: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F6EDF0',
  },
  infoLinhaSemBorda: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValor: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 12,
  },
  detalhesSecaoTitulo: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 8,
  },
  detalheItemCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  detalheItemNome: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 7,
  },
  detalheItemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detalheItemTexto: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  detalheItemSubtotal: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  observacoesCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 5,
  },
  observacoesTitulo: {
    color: COLORS.textPrimary,
    fontWeight: '900',
    marginBottom: 5,
  },
  observacoesTexto: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
  totalDetalhesCard: {
    minHeight: 68,
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 11,
  },
  totalDetalhesLabel: {
    color: COLORS.textSecondary,
    fontWeight: '800',
  },
  totalDetalhesValor: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 21,
  },
  botaoCancelarVenda: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 11,
  },
  botaoCancelarVendaTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  botaoDesabilitado: {
    opacity: 0.65,
  },
  avisoVendaCancelada: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFC8D7',
    backgroundColor: '#FFF0F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    marginTop: 11,
  },
  avisoVendaCanceladaTexto: {
    flex: 1,
    color: COLORS.danger,
    fontWeight: '700',
    lineHeight: 18,
  },
  loadingDetalhes: {
    marginVertical: 45,
  },
});
