import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  adicionarCliente,
  atualizarDocumentoComercialCompleto,
  buscarProdutosVendaParaDocumento,
  ClienteDatabase,
  converterOrcamentoEmVenda,
  DocumentoComercialDetalhado,
  DocumentoComercialItemInput,
  formatarMoeda,
  listarClientes,
  NovoDocumentoComercial,
  ProdutoVendaParaDocumento,
  salvarDocumentoComercialCompleto,
  TipoDocumentoComercial,
} from '../database/database';

type Props = {
  visible: boolean;
  tipo: TipoDocumentoComercial;
  documentoEdicao?: DocumentoComercialDetalhado | null;
  documentoOrigem?: DocumentoComercialDetalhado | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

const FORMAS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão', 'Outro'] as const;

type ItemFormulario = {
  produto_venda_id: number;
  produto_nome: string;
  quantidade: string;
  valor_unitario: string;
};

function numeroParaTexto(valor: number): string {
  return String(valor).replace('.', ',');
}

function textoParaNumero(valor: string): number {
  const normalizado = valor.replace(/\s/g, '').replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function arredondarMoeda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export default function DocumentoComercialFormModal({
  visible,
  tipo,
  documentoEdicao,
  documentoOrigem,
  onClose,
  onSaved,
}: Props) {
  const [clienteSelecionado, setClienteSelecionado] =
    useState<ClienteDatabase | null>(null);
  const [itens, setItens] = useState<ItemFormulario[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [modalClientes, setModalClientes] = useState(false);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clientes, setClientes] = useState<ClienteDatabase[]>([]);
  const [carregandoClientes, setCarregandoClientes] = useState(false);

  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteTelefone, setNovoClienteTelefone] = useState('');
  const [novoClienteEndereco, setNovoClienteEndereco] = useState('');
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  const [modalProdutos, setModalProdutos] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtos, setProdutos] = useState<ProdutoVendaParaDocumento[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  const documentoBase = documentoEdicao ?? documentoOrigem;

  const titulo = documentoOrigem
    ? 'REALIZAR VENDA'
    : documentoEdicao
      ? tipo === 'ORCAMENTO'
        ? 'EDITAR ORÇAMENTO'
        : 'EDITAR VENDA'
      : tipo === 'ORCAMENTO'
        ? 'NOVO ORÇAMENTO'
        : 'NOVA VENDA';

  const total = useMemo(
    () =>
      arredondarMoeda(
        itens.reduce((acumulado, item) => {
          const quantidade = textoParaNumero(item.quantidade);
          const valorUnitario = textoParaNumero(item.valor_unitario);
          return acumulado + quantidade * valorUnitario;
        }, 0)
      ),
    [itens]
  );

  useEffect(() => {
    if (!visible) return;

    if (documentoBase) {
      setClienteSelecionado({
        id: documentoBase.cliente_id,
        nome: documentoBase.cliente_nome,
        telefone: '',
        endereco: '',
        total_compras: 0,
      });

      setItens(
        documentoBase.itens.map((item) => ({
          produto_venda_id: item.produto_venda_id,
          produto_nome: item.produto_nome,
          quantidade: numeroParaTexto(item.quantidade),
          valor_unitario: numeroParaTexto(item.valor_unitario),
        }))
      );
      setObservacoes(documentoBase.observacoes ?? '');
      setDataValidade(documentoBase.data_validade ?? '');
      setFormaPagamento(
        tipo === 'VENDA' ? documentoEdicao?.forma_pagamento ?? '' : ''
      );
      return;
    }

    limparFormulario();
  }, [visible, documentoBase, documentoEdicao, tipo]);

  useEffect(() => {
    if (!modalClientes) return;

    const timeout = setTimeout(() => {
      void carregarClientes();
    }, 250);

    return () => clearTimeout(timeout);
  }, [modalClientes, buscaCliente]);

  useEffect(() => {
    if (!modalProdutos) return;

    const timeout = setTimeout(() => {
      void carregarProdutos();
    }, 250);

    return () => clearTimeout(timeout);
  }, [modalProdutos, buscaProduto]);

  function limparFormulario() {
    setClienteSelecionado(null);
    setItens([]);
    setObservacoes('');
    setDataValidade('');
    setFormaPagamento('');
    setBuscaCliente('');
    setBuscaProduto('');
  }

  async function carregarClientes() {
    try {
      setCarregandoClientes(true);
      const resultado = await listarClientes(buscaCliente, 'nome', 'ASC');
      setClientes(resultado);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível carregar os clientes.'
      );
    } finally {
      setCarregandoClientes(false);
    }
  }

  async function carregarProdutos() {
    try {
      setCarregandoProdutos(true);
      const resultado = await buscarProdutosVendaParaDocumento(buscaProduto);
      setProdutos(resultado);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível carregar os produtos.'
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }

  function selecionarCliente(cliente: ClienteDatabase) {
    setClienteSelecionado(cliente);
    setModalClientes(false);
    setBuscaCliente('');
  }

  async function cadastrarClienteRapido() {
    try {
      setSalvandoCliente(true);
      const clienteId = await adicionarCliente(
        novoClienteNome,
        novoClienteTelefone,
        novoClienteEndereco
      );

      const clienteCriado: ClienteDatabase = {
        id: clienteId,
        nome: novoClienteNome.trim(),
        telefone: novoClienteTelefone.trim(),
        endereco: novoClienteEndereco.trim(),
        total_compras: 0,
      };

      setClienteSelecionado(clienteCriado);
      setNovoClienteNome('');
      setNovoClienteTelefone('');
      setNovoClienteEndereco('');
      setModalNovoCliente(false);
      setModalClientes(false);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível cadastrar o cliente.'
      );
    } finally {
      setSalvandoCliente(false);
    }
  }

  function adicionarProduto(produto: ProdutoVendaParaDocumento) {
    const jaExiste = itens.some(
      (item) => item.produto_venda_id === produto.id
    );

    if (jaExiste) {
      Alert.alert(
        'Produto já adicionado',
        'Altere a quantidade do item que já está no orçamento.'
      );
      return;
    }

    setItens((anteriores) => [
      ...anteriores,
      {
        produto_venda_id: produto.id,
        produto_nome: produto.nome,
        quantidade: '1',
        valor_unitario: numeroParaTexto(produto.preco_venda),
      },
    ]);

    setModalProdutos(false);
    setBuscaProduto('');
  }

  function atualizarItem(
    produtoVendaId: number,
    campo: 'quantidade' | 'valor_unitario',
    valor: string
  ) {
    setItens((anteriores) =>
      anteriores.map((item) =>
        item.produto_venda_id === produtoVendaId
          ? { ...item, [campo]: valor }
          : item
      )
    );
  }

  function removerItem(produtoVendaId: number) {
    setItens((anteriores) =>
      anteriores.filter((item) => item.produto_venda_id !== produtoVendaId)
    );
  }

  async function salvar() {
    if (!clienteSelecionado) {
      Alert.alert('Atenção', 'Selecione um cliente.');
      return;
    }

    if (!itens.length) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto.');
      return;
    }

    const itensPreparados: DocumentoComercialItemInput[] = itens.map((item) => ({
      produto_venda_id: item.produto_venda_id,
      quantidade: textoParaNumero(item.quantidade),
      valor_unitario: textoParaNumero(item.valor_unitario),
    }));

    const itemInvalido = itensPreparados.some(
      (item) => item.quantidade <= 0 || (item.valor_unitario ?? 0) <= 0
    );

    if (itemInvalido) {
      Alert.alert(
        'Atenção',
        'Confira as quantidades e os valores dos produtos.'
      );
      return;
    }

    if (tipo === 'VENDA' && !formaPagamento.trim()) {
      Alert.alert('Atenção', 'Selecione a forma de pagamento.');
      return;
    }

    try {
      setSalvando(true);

      const documento: NovoDocumentoComercial = {
        tipo,
        cliente_id: clienteSelecionado.id,
        observacoes: observacoes.trim(),
        data_validade: tipo === 'ORCAMENTO' ? dataValidade.trim() : '',
        forma_pagamento: tipo === 'VENDA' ? formaPagamento.trim() : '',
        status: documentoEdicao?.status,
        orcamento_origem_id:
          documentoOrigem?.id ??
          documentoEdicao?.orcamento_origem_id ??
          null,
        itens: itensPreparados,
      };

      if (documentoOrigem) {
        await converterOrcamentoEmVenda(documentoOrigem.id, documento);
      } else if (documentoEdicao) {
        await atualizarDocumentoComercialCompleto(documentoEdicao.id, documento);
      } else {
        await salvarDocumentoComercialCompleto(documento);
      }

      await onSaved();
      limparFormulario();
      onClose();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível salvar o documento.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalPrincipal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{titulo}</Text>
            <Pressable style={styles.botaoFechar} onPress={onClose}>
              <Ionicons name="close" size={24} color="#111" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Cliente</Text>
            <Pressable
              style={styles.campoSelecao}
              onPress={() => setModalClientes(true)}
            >
              <View style={styles.campoSelecaoTextoContainer}>
                <Text
                  style={
                    clienteSelecionado
                      ? styles.campoSelecaoTexto
                      : styles.placeholder
                  }
                  numberOfLines={1}
                >
                  {clienteSelecionado
                    ? `#${clienteSelecionado.id} - ${clienteSelecionado.nome}`
                    : 'Selecionar cliente'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={21} color="#555" />
            </Pressable>

            {tipo === 'ORCAMENTO' && (
              <>
                <Text style={styles.label}>Validade do orçamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 30/06/2026"
                  placeholderTextColor="#888"
                  value={dataValidade}
                  onChangeText={setDataValidade}
                />
              </>
            )}

            {tipo === 'VENDA' && (
              <>
                <Text style={styles.label}>Forma de pagamento</Text>
                <View style={styles.formasPagamentoContainer}>
                  {FORMAS_PAGAMENTO.map((forma) => {
                    const selecionada = formaPagamento === forma;

                    return (
                      <Pressable
                        key={forma}
                        style={[
                          styles.formaPagamentoBotao,
                          selecionada &&
                            styles.formaPagamentoBotaoSelecionado,
                        ]}
                        onPress={() => setFormaPagamento(forma)}
                      >
                        <Text
                          style={[
                            styles.formaPagamentoTexto,
                            selecionada &&
                              styles.formaPagamentoTextoSelecionado,
                          ]}
                        >
                          {forma}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.tituloSecaoLinha}>
              <Text style={styles.tituloSecao}>PRODUTOS</Text>
              <Pressable
                style={styles.botaoAdicionarProduto}
                onPress={() => setModalProdutos(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.botaoAdicionarProdutoTexto}>Adicionar</Text>
              </Pressable>
            </View>

            {itens.length === 0 ? (
              <View style={styles.estadoVazio}>
                <Ionicons name="basket-outline" size={38} color="#777" />
                <Text style={styles.estadoVazioTexto}>
                  Nenhum produto adicionado.
                </Text>
              </View>
            ) : (
              itens.map((item) => {
                const quantidade = textoParaNumero(item.quantidade);
                const valorUnitario = textoParaNumero(item.valor_unitario);
                const subtotal = arredondarMoeda(quantidade * valorUnitario);

                return (
                  <View key={item.produto_venda_id} style={styles.itemCard}>
                    <View style={styles.itemTopo}>
                      <Text style={styles.itemNome}>{item.produto_nome}</Text>
                      <Pressable
                        style={styles.botaoRemover}
                        onPress={() => removerItem(item.produto_venda_id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#c62828" />
                      </Pressable>
                    </View>

                    <View style={styles.itemCamposLinha}>
                      <View style={styles.itemCampoQuantidade}>
                        <Text style={styles.itemLabel}>Quantidade</Text>
                        <TextInput
                          style={styles.itemInput}
                          value={item.quantidade}
                          onChangeText={(valor) =>
                            atualizarItem(
                              item.produto_venda_id,
                              'quantidade',
                              valor
                            )
                          }
                          keyboardType="decimal-pad"
                          selectTextOnFocus
                        />
                      </View>

                      <View style={styles.itemCampoValor}>
                        <Text style={styles.itemLabel}>Valor unitário</Text>
                        <TextInput
                          style={styles.itemInput}
                          value={item.valor_unitario}
                          onChangeText={(valor) =>
                            atualizarItem(
                              item.produto_venda_id,
                              'valor_unitario',
                              valor
                            )
                          }
                          keyboardType="decimal-pad"
                          selectTextOnFocus
                        />
                      </View>
                    </View>

                    <View style={styles.subtotalLinha}>
                      <Text style={styles.subtotalLabel}>Subtotal</Text>
                      <Text style={styles.subtotalValor}>
                        {formatarMoeda(subtotal)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.inputObservacoes]}
              placeholder="Informações adicionais do orçamento"
              placeholderTextColor="#888"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValor}>{formatarMoeda(total)}</Text>
            </View>
          </ScrollView>

          <View style={styles.rodapeAcoes}>
            <Pressable
              style={[styles.botaoRodape, styles.botaoCancelar]}
              onPress={onClose}
              disabled={salvando}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.botaoRodape, styles.botaoSalvar]}
              onPress={() => void salvar()}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>
                  {documentoOrigem ? 'Confirmar venda' : 'Salvar'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={modalClientes}
        transparent
        animationType="fade"
        onRequestClose={() => setModalClientes(false)}
      >
        <View style={styles.overlaySecundario}>
          <View style={styles.modalSelecao}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECIONAR CLIENTE</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalClientes(false)}
              >
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <View style={styles.buscaContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.buscaInput}
                placeholder="Buscar por nome ou ID"
                placeholderTextColor="#888"
                value={buscaCliente}
                onChangeText={setBuscaCliente}
              />
            </View>

            <Pressable
              style={styles.botaoNovoCliente}
              onPress={() => setModalNovoCliente(true)}
            >
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <Text style={styles.botaoNovoClienteTexto}>Novo cliente</Text>
            </Pressable>

            {carregandoClientes ? (
              <ActivityIndicator style={styles.loading} color="#111" />
            ) : (
              <FlatList
                data={clientes}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listaSelecao}
                ListEmptyComponent={
                  <Text style={styles.listaVaziaTexto}>Nenhum cliente encontrado.</Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.opcaoSelecao}
                    onPress={() => selecionarCliente(item)}
                  >
                    <View style={styles.opcaoIcone}>
                      <Ionicons name="person-outline" size={20} color="#111" />
                    </View>
                    <View style={styles.opcaoTextoContainer}>
                      <Text style={styles.opcaoTitulo}>{item.nome}</Text>
                      <Text style={styles.opcaoSubtitulo}>Cliente #{item.id}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#777" />
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalNovoCliente}
        transparent
        animationType="fade"
        onRequestClose={() => setModalNovoCliente(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlaySecundario}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCadastroCliente}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NOVO CLIENTE</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalNovoCliente(false)}
              >
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome do cliente"
              placeholderTextColor="#888"
              value={novoClienteNome}
              onChangeText={setNovoClienteNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefone"
              placeholderTextColor="#888"
              value={novoClienteTelefone}
              onChangeText={setNovoClienteTelefone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              placeholderTextColor="#888"
              value={novoClienteEndereco}
              onChangeText={setNovoClienteEndereco}
            />

            <Pressable
              style={styles.botaoSalvarCliente}
              onPress={() => void cadastrarClienteRapido()}
              disabled={salvandoCliente}
            >
              {salvandoCliente ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoSalvarTexto}>Cadastrar e selecionar</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={modalProdutos}
        transparent
        animationType="fade"
        onRequestClose={() => setModalProdutos(false)}
      >
        <View style={styles.overlaySecundario}>
          <View style={styles.modalSelecao}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADICIONAR PRODUTO</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalProdutos(false)}
              >
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <View style={styles.buscaContainer}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.buscaInput}
                placeholder="Buscar produto por nome ou ID"
                placeholderTextColor="#888"
                value={buscaProduto}
                onChangeText={setBuscaProduto}
              />
            </View>

            {carregandoProdutos ? (
              <ActivityIndicator style={styles.loading} color="#111" />
            ) : (
              <FlatList
                data={produtos}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listaSelecao}
                ListEmptyComponent={
                  <Text style={styles.listaVaziaTexto}>Nenhum produto encontrado.</Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.opcaoSelecao}
                    onPress={() => adicionarProduto(item)}
                  >
                    <View style={styles.opcaoIcone}>
                      <Ionicons name="cube-outline" size={20} color="#111" />
                    </View>
                    <View style={styles.opcaoTextoContainer}>
                      <Text style={styles.opcaoTitulo}>{item.nome}</Text>
                      <Text style={styles.opcaoSubtitulo} numberOfLines={1}>
                        #{item.id} · {formatarMoeda(item.preco_venda)}
                      </Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color="#111" />
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  overlaySecundario: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 18,
  },
  modalPrincipal: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#ebebeb',
    borderRadius: 22,
    overflow: 'hidden',
  },
  modalSelecao: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: '#ebebeb',
    borderRadius: 22,
    padding: 16,
  },
  modalCadastroCliente: {
    width: '100%',
    backgroundColor: '#ebebeb',
    borderRadius: 22,
    padding: 18,
  },
  modalHeader: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
    marginLeft: 38,
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d8d8d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 13,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111',
    marginBottom: 8,
  },
  inputObservacoes: {
    minHeight: 90,
    paddingTop: 12,
  },
  campoSelecao: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 13,
    paddingHorizontal: 14,
  },
  campoSelecaoTextoContainer: {
    flex: 1,
  },
  campoSelecaoTexto: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    color: '#888',
    fontSize: 15,
  },
  formasPagamentoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  formaPagamentoBotao: {
    width: '48%',
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c9c9c9',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formaPagamentoBotaoSelecionado: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  formaPagamentoTexto: {
    color: '#333',
    fontWeight: '700',
  },
  formaPagamentoTextoSelecionado: {
    color: '#fff',
  },
  tituloSecaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },
  botaoAdicionarProduto: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111',
    paddingHorizontal: 13,
    borderRadius: 11,
  },
  botaoAdicionarProdutoTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  estadoVazio: {
    minHeight: 115,
    backgroundColor: '#dedede',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  estadoVazioTexto: {
    marginTop: 8,
    color: '#666',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
  },
  itemTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },
  botaoRemover: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#fde8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCamposLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  itemCampoQuantidade: {
    flex: 0.8,
  },
  itemCampoValor: {
    flex: 1.2,
  },
  itemLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    marginBottom: 5,
  },
  itemInput: {
    height: 44,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingHorizontal: 11,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  subtotalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ededed',
  },
  subtotalLabel: {
    color: '#555',
    fontWeight: '600',
  },
  subtotalValor: {
    color: '#111',
    fontWeight: '800',
  },
  totalCard: {
    minHeight: 70,
    backgroundColor: '#111',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 12,
  },
  totalLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  totalValor: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 22,
  },
  rodapeAcoes: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#d3d3d3',
    backgroundColor: '#ebebeb',
  },
  botaoRodape: {
    flex: 1,
    height: 50,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#d6d6d6',
  },
  botaoSalvar: {
    backgroundColor: '#111',
  },
  botaoCancelarTexto: {
    color: '#111',
    fontWeight: '800',
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontWeight: '800',
  },
  buscaContainer: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 10,
  },
  buscaInput: {
    flex: 1,
    height: '100%',
    color: '#111',
    fontSize: 15,
  },
  botaoNovoCliente: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 13,
    marginBottom: 10,
  },
  botaoNovoClienteTexto: {
    color: '#fff',
    fontWeight: '800',
  },
  listaSelecao: {
    paddingBottom: 8,
  },
  opcaoSelecao: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 11,
    marginBottom: 8,
  },
  opcaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e4e4e4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  opcaoTextoContainer: {
    flex: 1,
  },
  opcaoTitulo: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111',
  },
  opcaoSubtitulo: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  listaVaziaTexto: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 28,
  },
  loading: {
    marginVertical: 30,
  },
  botaoSalvarCliente: {
    height: 50,
    backgroundColor: '#111',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
});
