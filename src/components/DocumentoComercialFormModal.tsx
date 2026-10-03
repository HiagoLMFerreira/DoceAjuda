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
  formatDateOnlyBR,
  maskDateBR,
  parseDateBR,
} from '../core/formatters';

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
} from '../modules/documentosComerciais/application/documentosComerciaisApi';

type Props = {
  visible: boolean;
  tipo: TipoDocumentoComercial;
  documentoEdicao?: DocumentoComercialDetalhado | null;
  documentoOrigem?: DocumentoComercialDetalhado | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

const FORMAS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão', 'Outro'] as const;

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9A979E',
  border: '#F1E7EA',
  borderStrong: '#FFD1DD',
  danger: '#D93C56',
};

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
  const [dataEncomenda, setDataEncomenda] = useState('');
  const [finalidade, setFinalidade] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [sinalPagamento, setSinalPagamento] = useState('');
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
        ativo: 1,
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
      setDataEncomenda(
        documentoBase.data_encomenda
          ? formatDateOnlyBR(documentoBase.data_encomenda)
          : ''
      );
      setFinalidade(documentoBase.finalidade ?? '');
      setFormaPagamento(
        tipo === 'VENDA' ? documentoEdicao?.forma_pagamento ?? '' : ''
      );
      setSinalPagamento(
        tipo === 'VENDA' && documentoEdicao?.sinal_pagamento
          ? numeroParaTexto(documentoEdicao.sinal_pagamento)
          : ''
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
    setDataEncomenda('');
    setFinalidade('');
    setFormaPagamento('');
    setSinalPagamento('');
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
        ativo: 1,
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

    const encomendaOpcionalPreenchida = Boolean(
      dataEncomenda.trim() || finalidade.trim()
    );
    const exigeDadosEncomenda =
      tipo === 'ORCAMENTO' ||
      Boolean(documentoOrigem) ||
      encomendaOpcionalPreenchida;
    const dataEncomendaNormalizada = dataEncomenda
      ? parseDateBR(dataEncomenda)
      : null;

    if (exigeDadosEncomenda && !dataEncomendaNormalizada) {
      Alert.alert('Atenção', 'Informe uma data de encomenda válida no formato DD/MM/AAAA.');
      return;
    }

    if (exigeDadosEncomenda && !finalidade.trim()) {
      Alert.alert('Atenção', 'Informe a finalidade da encomenda.');
      return;
    }

    const sinalPagamentoNumero = textoParaNumero(sinalPagamento);
    if (sinalPagamento.trim() && (sinalPagamentoNumero < 0 || sinalPagamentoNumero > total)) {
      Alert.alert('Atenção', 'O sinal deve estar entre zero e o valor total da venda.');
      return;
    }

    try {
      setSalvando(true);

      const documento: NovoDocumentoComercial = {
        tipo,
        cliente_id: clienteSelecionado.id,
        observacoes: observacoes.trim(),
        data_validade: tipo === 'ORCAMENTO' ? dataValidade.trim() : '',
        data_encomenda: dataEncomendaNormalizada ?? '',
        finalidade: finalidade.trim(),
        forma_pagamento: tipo === 'VENDA' ? formaPagamento.trim() : '',
        sinal_pagamento:
          tipo === 'VENDA' ? sinalPagamentoNumero : 0,
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
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{titulo}</Text>
            <Pressable style={styles.botaoFechar} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
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
              <Ionicons name="chevron-down" size={21} color={COLORS.primary} />
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

            {(tipo === 'ORCAMENTO' || tipo === 'VENDA') && (
              <View style={styles.encomendaCard}>
                <View style={styles.encomendaTituloLinha}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.encomendaTitulo}>
                    DADOS DA ENCOMENDA{tipo === 'VENDA' && !documentoOrigem ? ' (OPCIONAL)' : ''}
                  </Text>
                </View>

                <Text style={styles.label}>
                  Data da encomenda{tipo === 'VENDA' && !documentoOrigem ? '' : ' *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#888"
                  value={dataEncomenda}
                  onChangeText={(valor) => setDataEncomenda(maskDateBR(valor))}
                  keyboardType="number-pad"
                  maxLength={10}
                />

                <Text style={styles.label}>
                  Finalidade{tipo === 'VENDA' && !documentoOrigem ? '' : ' *'}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: aniversário, casamento"
                  placeholderTextColor="#888"
                  value={finalidade}
                  onChangeText={setFinalidade}
                  maxLength={80}
                />
              </View>
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

                {!documentoEdicao && (
                  <>
                    <Text style={styles.label}>Sinal de pagamento (opcional)</Text>
                    {!documentoOrigem && <Text style={styles.saldoPreviewLabel}>Informe o sinal para lançar o restante em contas a receber. Em branco, a venda é considerada paga integralmente.</Text>}
                    <TextInput
                      style={styles.input}
                      placeholder="R$ 0,00"
                      placeholderTextColor="#888"
                      value={sinalPagamento}
                      onChangeText={setSinalPagamento}
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                    />
                    <View style={styles.saldoPreview}>
                      <Text style={styles.saldoPreviewLabel}>Saldo a receber</Text>
                      <Text style={styles.saldoPreviewValor}>
                        {formatarMoeda(!documentoOrigem && textoParaNumero(sinalPagamento) <= 0 ? 0 : Math.max(0, total - textoParaNumero(sinalPagamento)))}
                      </Text>
                    </View>
                  </>
                )}
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
                <Ionicons name="basket-outline" size={38} color={COLORS.primary} />
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
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SELECIONAR CLIENTE</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalClientes(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.buscaContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.primary} />
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
              <ActivityIndicator style={styles.loading} color={COLORS.primary} />
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
                      <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.opcaoTextoContainer}>
                      <Text style={styles.opcaoTitulo}>{item.nome}</Text>
                      <Text style={styles.opcaoSubtitulo}>Cliente #{item.id}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NOVO CLIENTE</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalNovoCliente(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.primary} />
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADICIONAR PRODUTO</Text>
              <Pressable
                style={styles.botaoFechar}
                onPress={() => setModalProdutos(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.buscaContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.buscaInput}
                placeholder="Buscar produto por nome ou ID"
                placeholderTextColor="#888"
                value={buscaProduto}
                onChangeText={setBuscaProduto}
              />
            </View>

            {carregandoProdutos ? (
              <ActivityIndicator style={styles.loading} color={COLORS.primary} />
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
                      <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.opcaoTextoContainer}>
                      <Text style={styles.opcaoTitulo}>{item.nome}</Text>
                      <Text style={styles.opcaoSubtitulo} numberOfLines={1}>
                        #{item.id} · {formatarMoeda(item.preco_venda)}
                      </Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
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
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
    justifyContent: 'flex-end',
  },
  overlaySecundario: {
    flex: 1,
    backgroundColor: 'rgba(24, 16, 20, 0.58)',
    justifyContent: 'flex-end',
  },
  modalPrincipal: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalSelecao: {
    width: '100%',
    height: '86%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  modalCadastroCliente: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },
  modalHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#E8DDE1',
    marginTop: 9,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  botaoFechar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 7,
    marginTop: 10,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  inputObservacoes: {
    minHeight: 90,
    paddingTop: 12,
  },
  campoSelecao: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  campoSelecaoTextoContainer: {
    flex: 1,
  },
  campoSelecaoTexto: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  encomendaCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: '#FFF8FA',
  },
  encomendaTituloLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  encomendaTitulo: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '900',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formaPagamentoBotaoSelecionado: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  formaPagamentoTexto: {
    color: COLORS.textSecondary,
    fontWeight: '800',
  },
  formaPagamentoTextoSelecionado: {
    color: '#fff',
  },
  saldoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    marginBottom: 8,
  },
  saldoPreviewLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  saldoPreviewValor: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
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
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  botaoAdicionarProduto: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 13,
    borderRadius: 12,
  },
  botaoAdicionarProdutoTexto: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  estadoVazio: {
    minHeight: 115,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  estadoVazioTexto: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
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
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  botaoRemover: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#FFF0F3',
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
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginBottom: 5,
  },
  itemInput: {
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 11,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  subtotalLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F6EDF0',
  },
  subtotalLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  subtotalValor: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  totalCard: {
    minHeight: 70,
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 12,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 15,
  },
  totalValor: {
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 22,
  },
  rodapeAcoes: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  botaoRodape: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCancelar: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DCCFD4',
  },
  botaoSalvar: {
    backgroundColor: COLORS.primary,
  },
  botaoCancelarTexto: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  botaoSalvarTexto: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  buscaContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 10,
  },
  buscaInput: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  botaoNovoCliente: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    marginBottom: 10,
  },
  botaoNovoClienteTexto: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  listaSelecao: {
    paddingBottom: 8,
  },
  opcaoSelecao: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 12,
    marginBottom: 8,
  },
  opcaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  opcaoTextoContainer: {
    flex: 1,
  },
  opcaoTitulo: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  opcaoSubtitulo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  listaVaziaTexto: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    paddingVertical: 28,
  },
  loading: {
    marginVertical: 30,
  },
  botaoSalvarCliente: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
});
