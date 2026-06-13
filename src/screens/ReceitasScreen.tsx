import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  ReceitaDatabase,
  ReceitaDetalhada,
  NovoItemReceita,
  ProdutoParaReceita,
  listarReceitas,
  buscarReceitaDetalhada,
  salvarReceitaCompleta,
  editarReceitaCompleta,
  excluirReceita,
  buscarProdutosParaReceita,
  buscarProdutoPorCodigoBarras,
} from '../database/database';

import BarcodeScannerModal from '../components/BarcodeScannerModal';

type ModoFormulario = 'cadastro' | 'edicao';

type ItemReceitaLocal = NovoItemReceita & {
  produto_nome: string;
  quantidade_numero: number;
  unidade_medida: string;
};

const UNIDADES_MEDIDA = ['g', 'kg', 'ml', 'l', 'un'];

export default function ReceitasScreen() {
  const navigation = useNavigation<any>();

  const [receitas, setReceitas] = useState<ReceitaDatabase[]>([]);
  const [busca, setBusca] = useState('');

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalAdicionarProduto, setModalAdicionarProduto] = useState(false);

  const [modoFormulario, setModoFormulario] =
    useState<ModoFormulario>('cadastro');

  const [receitaSelecionada, setReceitaSelecionada] =
    useState<ReceitaDetalhada | null>(null);

  const [receitaIdEdicao, setReceitaIdEdicao] = useState<number | null>(null);

  const [nome, setNome] = useState('');
  const [rendimento, setRendimento] = useState('');
  const [modoPreparo, setModoPreparo] = useState('');

  const [itensReceita, setItensReceita] = useState<ItemReceitaLocal[]>([]);

  const [buscaProduto, setBuscaProduto] = useState('');
  const [produtosEncontrados, setProdutosEncontrados] = useState<
    ProdutoParaReceita[]
  >([]);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoParaReceita | null>(null);
  const [quantidadeUsada, setQuantidadeUsada] = useState('');
  const [unidadeMedida, setUnidadeMedida] = useState('un');

  const [scannerVisivel, setScannerVisivel] = useState(false);

  const obterNomeProduto = (produto: ProdutoParaReceita) => {
    return produto.nome || produto.descricao || 'Produto sem nome';
  };

  const formatarQuantidade = (quantidade: number, unidade: string) => {
    if (!quantidade) {
      return '';
    }

    return `${quantidade} ${unidade}`;
  };

  const extrairQuantidadeAntiga = (quantidadeTexto: string) => {
    const texto = quantidadeTexto.trim().replace(',', '.');
    const quantidadeEncontrada = texto.match(/\d+(\.\d+)?/);
    const unidadeEncontrada = texto.match(/[a-zA-Z]+/);

    const unidadeTexto = unidadeEncontrada
      ? unidadeEncontrada[0].toLowerCase()
      : 'un';

    const unidadeNormalizada = unidadeTexto.startsWith('un')
      ? 'un'
      : unidadeTexto;

    return {
      quantidade: quantidadeEncontrada ? Number(quantidadeEncontrada[0]) : 0,
      unidade: UNIDADES_MEDIDA.includes(unidadeNormalizada)
        ? unidadeNormalizada
        : 'un',
    };
  };

  const carregarReceitas = useCallback(async () => {
    try {
      const resultado = await listarReceitas();
      setReceitas(resultado);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as receitas.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarReceitas();
    }, [carregarReceitas])
  );

  const receitasFiltradas = useMemo(() => {
    const textoBusca = busca.trim().toLowerCase();

    if (!textoBusca) {
      return receitas;
    }

    return receitas.filter((receita) => {
      const id = String(receita.id);
      const nomeReceita = receita.nome.toLowerCase();
      const rendimentoReceita = receita.rendimento.toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeReceita.includes(textoBusca) ||
        rendimentoReceita.includes(textoBusca)
      );
    });
  }, [receitas, busca]);

  const limparFormulario = () => {
    setNome('');
    setRendimento('');
    setModoPreparo('');
    setItensReceita([]);
    setReceitaIdEdicao(null);
  };

  const limparModalProduto = () => {
    setBuscaProduto('');
    setProdutosEncontrados([]);
    setProdutoSelecionado(null);
    setQuantidadeUsada('');
    setUnidadeMedida('un');
  };

  const abrirCadastro = () => {
    setModoFormulario('cadastro');
    setReceitaSelecionada(null);
    limparFormulario();
    limparModalProduto();
    setModalFormulario(true);
  };

  const abrirDetalhes = async (receita: ReceitaDatabase) => {
    try {
      const resultado = await buscarReceitaDetalhada(receita.id);

      if (!resultado) {
        Alert.alert('Erro', 'Receita não encontrada.');
        return;
      }

      setReceitaSelecionada(resultado);
      setModalDetalhes(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir os detalhes da receita.');
    }
  };

  const abrirEdicao = () => {
    if (!receitaSelecionada) {
      return;
    }

    setModoFormulario('edicao');
    setReceitaIdEdicao(receitaSelecionada.id);
    setNome(receitaSelecionada.nome);
    setRendimento(receitaSelecionada.rendimento);
    setModoPreparo(receitaSelecionada.modo_preparo);

    const itensFormatados: ItemReceitaLocal[] = receitaSelecionada.itens.map(
      (item) => {
        const itemComPrecificacao = item as typeof item & {
          quantidade_numero?: number;
          unidade_medida?: string;
        };

        const quantidadeAntiga = extrairQuantidadeAntiga(item.quantidade_usada);
        const quantidadeNumero =
          itemComPrecificacao.quantidade_numero || quantidadeAntiga.quantidade;
        const unidade =
          itemComPrecificacao.unidade_medida || quantidadeAntiga.unidade;

        return {
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade_usada: formatarQuantidade(quantidadeNumero, unidade),
          quantidade_numero: quantidadeNumero,
          unidade_medida: unidade,
        };
      }
    );

    setItensReceita(itensFormatados);
    limparModalProduto();

    setModalDetalhes(false);
    setModalFormulario(true);
  };

  const abrirModalAdicionarProduto = () => {
    limparModalProduto();
    setModalAdicionarProduto(true);
  };

  const pesquisarProdutos = async (texto: string) => {
    setBuscaProduto(texto);
    setProdutoSelecionado(null);

    try {
      const resultado = await buscarProdutosParaReceita(texto);
      setProdutosEncontrados(resultado);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar os produtos.');
    }
  };

  const selecionarProduto = (produto: ProdutoParaReceita) => {
    setProdutoSelecionado(produto);
    setBuscaProduto(obterNomeProduto(produto));
    setProdutosEncontrados([]);
  };

  const abrirScanner = () => {
    setScannerVisivel(true);
  };

  const aoReceberCodigo = async (codigo: string) => {
    try {
      setScannerVisivel(false);
      setBuscaProduto(codigo);

      const produto = await buscarProdutoPorCodigoBarras(codigo);

      if (!produto) {
        Alert.alert(
          'Produto não encontrado',
          'Nenhum produto foi encontrado com esse código de barras.'
        );
        return;
      }

      setProdutoSelecionado(produto);
      setBuscaProduto(obterNomeProduto(produto));
      setProdutosEncontrados([]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o produto pelo código.');
    }
  };

  const adicionarProdutoNaReceita = () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto.');
      return;
    }

    if (!quantidadeUsada.trim()) {
      Alert.alert('Erro', 'Informe a quantidade usada.');
      return;
    }

    const quantidadeNumero = Number(quantidadeUsada.replace(',', '.'));

    if (Number.isNaN(quantidadeNumero) || quantidadeNumero <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }

    const jaExiste = itensReceita.some(
      (item) => item.produto_id === produtoSelecionado.id
    );

    if (jaExiste) {
      Alert.alert('Erro', 'Esse produto já foi adicionado à receita.');
      return;
    }

    const novoItem: ItemReceitaLocal = {
      produto_id: produtoSelecionado.id,
      produto_nome: obterNomeProduto(produtoSelecionado),
      quantidade_usada: formatarQuantidade(quantidadeNumero, unidadeMedida),
      quantidade_numero: quantidadeNumero,
      unidade_medida: unidadeMedida,
    };

    setItensReceita((itensAtuais) => [...itensAtuais, novoItem]);
    limparModalProduto();
    setModalAdicionarProduto(false);
  };

  const removerProdutoDaReceita = (produtoId: number) => {
    setItensReceita((itensAtuais) =>
      itensAtuais.filter((item) => item.produto_id !== produtoId)
    );
  };

  const salvarReceita = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert('Erro', 'Informe o nome da receita.');
        return;
      }

      if (!rendimento.trim()) {
        Alert.alert('Erro', 'Informe o rendimento da receita.');
        return;
      }

      if (itensReceita.length === 0) {
        Alert.alert('Erro', 'Adicione pelo menos um produto à receita.');
        return;
      }

      if (!modoPreparo.trim()) {
        Alert.alert('Erro', 'Informe o modo de preparo.');
        return;
      }

      const itensParaSalvar: NovoItemReceita[] = itensReceita.map((item) => ({
        produto_id: item.produto_id,
        quantidade_usada: item.quantidade_usada,
        quantidade_numero: item.quantidade_numero,
        unidade_medida: item.unidade_medida,
      }));

      if (modoFormulario === 'cadastro') {
        await salvarReceitaCompleta(
          nome.trim(),
          rendimento.trim(),
          modoPreparo.trim(),
          itensParaSalvar
        );
      } else {
        if (!receitaIdEdicao) {
          Alert.alert('Erro', 'Receita inválida.');
          return;
        }

        await editarReceitaCompleta(
          receitaIdEdicao,
          nome.trim(),
          rendimento.trim(),
          modoPreparo.trim(),
          itensParaSalvar
        );
      }

      limparFormulario();
      limparModalProduto();
      setModalFormulario(false);
      setReceitaSelecionada(null);
      carregarReceitas();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível salvar a receita.';

      Alert.alert('Erro', mensagem);
    }
  };

  const confirmarExclusao = () => {
    if (!receitaSelecionada) {
      return;
    }

    Alert.alert(
      'Excluir receita',
      `Deseja realmente excluir "${receitaSelecionada.nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirReceita(receitaSelecionada.id);
              setModalDetalhes(false);
              setReceitaSelecionada(null);
              carregarReceitas();
            } catch (error) {
              const mensagem =
                error instanceof Error
                  ? error.message
                  : 'Não foi possível excluir a receita.';

              Alert.alert('Erro', mensagem);
            }
          },
        },
      ]
    );
  };

  const renderReceita = ({ item }: { item: ReceitaDatabase }) => {
    return (
      <TouchableOpacity style={styles.row} onPress={() => abrirDetalhes(item)}>
        <Text style={styles.cellNome} numberOfLines={2}>
          {item.nome}
        </Text>

        <Text style={styles.cellRendimento} numberOfLines={2}>
          {item.rendimento}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <Text style={styles.headerTitle}>RECEITAS</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome, rendimento ou ID"
        placeholderTextColor="#888"
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirCadastro}>
          <Text style={styles.primaryButtonText}>+ Receita</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <View style={styles.headerNome}>
          <Text style={styles.headerCellText}>RECEITA</Text>
        </View>

        <View style={styles.headerRendimento}>
          <Text style={styles.headerCellText}>RENDIMENTO</Text>
        </View>
      </View>

      <FlatList
        data={receitasFiltradas}
        renderItem={renderReceita}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhuma receita encontrada.</Text>
          </View>
        }
      />

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {receitaSelecionada && (
              <>
                <Text style={styles.detailsModalTitle}>DADOS DA RECEITA</Text>

                <ScrollView
                  style={styles.detailsScroll}
                  showsVerticalScrollIndicator
                >
                  <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ID:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.id}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nome:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.nome}
                      </Text>
                    </View>

                    <View style={[styles.detailRow, styles.detailRowLast]}>
                      <Text style={styles.detailLabel}>Rendimento:</Text>
                      <Text style={styles.detailValue}>
                        {receitaSelecionada.rendimento}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailSectionTitle}>Ingredientes</Text>

                    {receitaSelecionada.itens.length === 0 ? (
                      <Text style={styles.emptyTextSmall}>
                        Nenhum produto vinculado.
                      </Text>
                    ) : (
                      receitaSelecionada.itens.map((item) => (
                        <View key={item.id} style={styles.ingredienteDetalhe}>
                          <Text style={styles.ingredienteNome}>
                            {item.produto_nome}
                          </Text>
                          <Text style={styles.ingredienteQuantidade}>
                            {item.quantidade_usada}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  <View style={styles.detailsCard}>
                    <Text style={styles.detailSectionTitle}>
                      Modo de preparo
                    </Text>
                    <Text style={styles.modoPreparoTexto}>
                      {receitaSelecionada.modo_preparo}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.detailsButtonsRow}>
                  <TouchableOpacity
                    style={[styles.detailsButton, styles.editButton]}
                    onPress={abrirEdicao}
                  >
                    <Text style={styles.detailsButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailsButton, styles.deleteButton]}
                    onPress={confirmarExclusao}
                  >
                    <Text style={styles.detailsButtonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.detailsCloseButton, styles.cancelButton]}
                  onPress={() => {
                    setModalDetalhes(false);
                    setReceitaSelecionada(null);
                  }}
                >
                  <Text style={styles.detailsButtonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={modalFormulario} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>
              {modoFormulario === 'cadastro'
                ? 'NOVA RECEITA'
                : 'EDITAR RECEITA'}
            </Text>

            <ScrollView showsVerticalScrollIndicator>
              {modoFormulario === 'edicao' && receitaIdEdicao && (
                <>
                  <Text style={styles.inputLabel}>ID:</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={String(receitaIdEdicao)}
                    editable={false}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Nome:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome da receita"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.inputLabel}>Rendimento:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 30 unidades, 12 fatias, 1 bolo..."
                placeholderTextColor="#888"
                value={rendimento}
                onChangeText={setRendimento}
              />

              <Text style={styles.inputLabel}>Produtos da receita:</Text>

              <TouchableOpacity
                style={styles.addProdutoButton}
                onPress={abrirModalAdicionarProduto}
              >
                <Ionicons name="add-circle-outline" size={22} color="#fff" />
                <Text style={styles.addProdutoButtonText}>
                  Adicionar produto
                </Text>
              </TouchableOpacity>

              <View style={styles.itensBox}>
                {itensReceita.length === 0 ? (
                  <Text style={styles.emptyTextSmall}>
                    Nenhum produto adicionado.
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.itensScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                  >
                    {itensReceita.map((item) => (
                      <View key={item.produto_id} style={styles.itemReceita}>
                        <View style={styles.itemReceitaInfo}>
                          <Text style={styles.itemReceitaNome}>
                            {item.produto_nome}
                          </Text>
                          <Text style={styles.itemReceitaQuantidade}>
                            {item.quantidade_usada}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.removeItemButton}
                          onPress={() =>
                            removerProdutoDaReceita(item.produto_id)
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Modo de preparo:</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Digite o modo de preparo da receita"
                placeholderTextColor="#888"
                value={modoPreparo}
                onChangeText={setModoPreparo}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    limparFormulario();
                    limparModalProduto();
                    setModalFormulario(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarReceita}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalAdicionarProduto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ADICIONAR PRODUTO</Text>

            <Text style={styles.inputLabel}>Produto:</Text>

            <View style={styles.inputComIconeContainer}>
              <TextInput
                style={styles.inputComIcone}
                placeholder="Buscar por nome, ID ou código de barras"
                placeholderTextColor="#888"
                value={buscaProduto}
                onChangeText={pesquisarProdutos}
              />

              <TouchableOpacity
                style={styles.botaoScannerInput}
                onPress={abrirScanner}
                activeOpacity={0.7}
              >
                <Ionicons name="barcode-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={produtosEncontrados}
              style={styles.produtoLista}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                buscaProduto.trim() ? (
                  <View style={styles.produtoListaVazia}>
                    <Text style={styles.produtoListaVaziaText}>
                      Nenhum produto encontrado.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.produtoListaVazia}>
                    <Text style={styles.produtoListaVaziaText}>
                      Digite para buscar um produto.
                    </Text>
                  </View>
                )
              }
              renderItem={({ item }) => {
                const selecionado = produtoSelecionado?.id === item.id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.produtoItem,
                      selecionado && styles.produtoItemSelecionado,
                    ]}
                    onPress={() => selecionarProduto(item)}
                  >
                    <Text style={styles.produtoItemText} numberOfLines={2}>
                      {item.id} - {obterNomeProduto(item)}
                    </Text>

                    <Text style={styles.produtoItemSubText}>
                      Código: {item.codigo_barras || '-'}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            {produtoSelecionado && (
              <View style={styles.produtoSelecionadoBox}>
                <Text style={styles.produtoSelecionadoLabel}>
                  Produto selecionado:
                </Text>
                <Text style={styles.produtoSelecionadoText}>
                  {obterNomeProduto(produtoSelecionado)}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Quantidade usada:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 500, 2, 100..."
              placeholderTextColor="#888"
              value={quantidadeUsada}
              onChangeText={setQuantidadeUsada}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Unidade de medida:</Text>
            <View style={styles.unidadeContainer}>
              {UNIDADES_MEDIDA.map((unidade) => (
                <TouchableOpacity
                  key={unidade}
                  style={[
                    styles.unidadeButton,
                    unidadeMedida === unidade && styles.unidadeButtonSelected,
                  ]}
                  onPress={() => setUnidadeMedida(unidade)}
                >
                  <Text
                    style={[
                      styles.unidadeButtonText,
                      unidadeMedida === unidade &&
                        styles.unidadeButtonTextSelected,
                    ]}
                  >
                    {unidade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  limparModalProduto();
                  setModalAdicionarProduto(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={adicionarProdutoNaReceita}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BarcodeScannerModal
        visible={scannerVisivel}
        onClose={() => setScannerVisivel(false)}
        onCodeScanned={aoReceberCodigo}
      />
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
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 36,
    marginTop: -2,
  },
  headerTextArea: {
    paddingHorizontal: 42,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  topButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    borderRadius: 8,
    marginBottom: 5,
    overflow: 'hidden',
  },
  headerNome: {
    flex: 2,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRendimento: {
    flex: 1.4,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCellText: {
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    overflow: 'hidden',
    minHeight: 56,
    alignItems: 'center',
  },
  cellNome: {
    flex: 2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'left',
    fontSize: 13,
  },
  cellRendimento: {
    flex: 1.4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emptyText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTextSmall: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  detailsModalContent: {
    width: '92%',
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 1,
  },
  detailsScroll: {
    maxHeight: 470,
  },
  detailsCard: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    gap: 10,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#333',
  },
  detailValue: {
    flex: 1.3,
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ingredienteDetalhe: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
  },
  ingredienteNome: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  ingredienteQuantidade: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginTop: 2,
  },
  modoPreparoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  detailsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  detailsCloseButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalContentLarge: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 11,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 5,
    marginLeft: 2,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#777',
  },
  textArea: {
    minHeight: 130,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 11,
  },
  addProdutoButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  addProdutoButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  itensBox: {
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 12,
  },
  itensScroll: {
    maxHeight: 210,
  },
  itemReceita: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
  },
  itemReceitaInfo: {
    flex: 1,
  },
  itemReceitaNome: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  itemReceitaQuantidade: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginTop: 2,
  },
  removeItemButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#c90000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  inputComIconeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    height: 45,
  },
  inputComIcone: {
    flex: 1,
    height: '100%',
    color: '#000',
    fontSize: 15,
  },
  botaoScannerInput: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produtoLista: {
    height: 210,
    maxHeight: 210,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  produtoListaVazia: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produtoListaVaziaText: {
    color: '#555',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  produtoItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  produtoItemSelecionado: {
    backgroundColor: '#e8e8e8',
  },
  produtoItemText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '800',
  },
  produtoItemSubText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginTop: 2,
  },
  produtoSelecionadoBox: {
    backgroundColor: '#f6f6f6',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
  },
  produtoSelecionadoLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555',
    marginBottom: 3,
  },
  produtoSelecionadoText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  unidadeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  unidadeButton: {
    flex: 1,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  unidadeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  unidadeButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  unidadeButtonTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  editButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#c90000',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});