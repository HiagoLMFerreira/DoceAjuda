import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import DocumentoComercialFormModal from '../components/DocumentoComercialFormModal';
import {
  buscarDocumentoComercialPorId,
  cancelarVenda,
  DirecaoOrdenacao,
  DocumentoComercialDatabase,
  DocumentoComercialDetalhado,
  formatarMoeda,
  listarVendas,
  OrdenarDocumentoComercialPor,
} from '../database/database';

type Props = {
  navigation: {
    goBack: () => void;
    addListener?: (evento: string, callback: () => void) => () => void;
  };
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.botaoVoltar} onPress={navigation.goBack}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.titulo}>VENDAS</Text>
          <View style={styles.espacoHeader} />
        </View>

        <View style={styles.buscaLinha}>
          <View style={styles.buscaContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.buscaInput}
              placeholder="Buscar por cliente, ID, status ou pagamento"
              placeholderTextColor="#888"
              value={busca}
              onChangeText={setBusca}
            />
            {!!busca && (
              <Pressable onPress={() => setBusca('')}>
                <Ionicons name="close-circle" size={20} color="#777" />
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
              color={ordenacao.campo === 'cliente_nome' ? '#111' : '#777'}
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
              color={ordenacao.campo === 'created_at' ? '#111' : '#777'}
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
              color={ordenacao.campo === 'valor_total' ? '#111' : '#777'}
            />
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111" />
          </View>
        ) : (
          <FlatList
            data={vendas}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listaContent}
            ListEmptyComponent={
              <View style={styles.estadoVazio}>
                <Ionicons name="cart-outline" size={48} color="#777" />
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
                    <Text style={styles.statusTexto}>
                      {obterTextoStatus(item.status)}
                    </Text>
                  </View>

                  <View style={styles.cardRodapeDireita}>
                    <Text style={styles.formaPagamentoCard} numberOfLines={1}>
                      {item.forma_pagamento || '-'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#777" />
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
            <View style={styles.detalhesHeader}>
              <Text style={styles.modalTitulo}>
                VENDA #{vendaSelecionada?.id ?? ''}
              </Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalDetalhes(false)}
              >
                <Ionicons name="close" size={23} color="#111" />
              </Pressable>
            </View>

            {carregandoDetalhes || !vendaSelecionada ? (
              <ActivityIndicator style={styles.loadingDetalhes} color="#111" />
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
                          color="#7a1d1d"
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
    backgroundColor: '#ebebeb',
  },
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    height: 58,
    backgroundColor: '#d7d7d7',
    borderRadius: 18,
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
  titulo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
  },
  espacoHeader: {
    width: 40,
  },
  buscaLinha: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 11,
  },
  buscaContainer: {
    flex: 1,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 13,
  },
  buscaInput: {
    flex: 1,
    height: '100%',
    color: '#111',
    fontSize: 15,
  },
  botaoNovo: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  botaoNovoTexto: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  cabecalhoLista: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: '#d2d2d2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 8,
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
    fontSize: 11,
    fontWeight: '900',
    color: '#333',
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
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 9,
  },
  cardLinhaPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCliente: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  cardId: {
    fontSize: 11,
    color: '#777',
    marginTop: 3,
  },
  cardTexto: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  cardTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111',
    textAlign: 'right',
  },
  cardRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#ededed',
  },
  cardRodapeDireita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '58%',
  },
  formaPagamentoCard: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusConcluida: {
    backgroundColor: '#d9ead3',
  },
  statusCancelada: {
    backgroundColor: '#f4cccc',
  },
  statusTexto: {
    fontSize: 11,
    fontWeight: '800',
    color: '#333',
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
  estadoVazioTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
    marginTop: 11,
  },
  estadoVazioTexto: {
    textAlign: 'center',
    color: '#777',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.58)',
    justifyContent: 'center',
    padding: 18,
  },
  modalTitulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
    color: '#111',
    marginBottom: 13,
  },
  modalDetalhes: {
    maxHeight: '90%',
    backgroundColor: '#ebebeb',
    borderRadius: 22,
    overflow: 'hidden',
  },
  detalhesHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detalhesContent: {
    paddingHorizontal: 15,
    paddingBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 15,
  },
  infoLinha: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ededed',
  },
  infoLinhaSemBorda: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#666',
    fontWeight: '600',
  },
  infoValor: {
    flex: 1,
    textAlign: 'right',
    color: '#111',
    fontWeight: '800',
    marginLeft: 12,
  },
  detalhesSecaoTitulo: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111',
    marginBottom: 8,
  },
  detalheItemCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
  },
  detalheItemNome: {
    color: '#111',
    fontWeight: '800',
    marginBottom: 7,
  },
  detalheItemLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detalheItemTexto: {
    color: '#666',
  },
  detalheItemSubtotal: {
    color: '#111',
    fontWeight: '800',
  },
  observacoesCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 13,
    marginTop: 5,
  },
  observacoesTitulo: {
    color: '#111',
    fontWeight: '800',
    marginBottom: 5,
  },
  observacoesTexto: {
    color: '#555',
    lineHeight: 20,
  },
  totalDetalhesCard: {
    minHeight: 68,
    backgroundColor: '#111',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 11,
  },
  totalDetalhesLabel: {
    color: '#fff',
    fontWeight: '800',
  },
  totalDetalhesValor: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 21,
  },
  botaoCancelarVenda: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#b3261e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 11,
  },
  botaoCancelarVendaTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  botaoDesabilitado: {
    opacity: 0.65,
  },
  avisoVendaCancelada: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#f4cccc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    marginTop: 11,
  },
  avisoVendaCanceladaTexto: {
    flex: 1,
    color: '#7a1d1d',
    fontWeight: '700',
    lineHeight: 18,
  },
  loadingDetalhes: {
    marginVertical: 45,
  },
});
