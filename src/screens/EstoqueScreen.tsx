import React, { useState, useCallback, useMemo } from 'react';
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
import {
  listarProdutos,
  cadastrarProduto,
  editarProduto,
  excluirProduto,
  inserirMovimentacao,
  ProdutoEstoque,
  OrdenarProdutoPor,
  DirecaoOrdenacao,
} from '../database/database';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { Ionicons } from '@expo/vector-icons';

type ModoFormulario = 'cadastro' | 'edicao';
type CampoScanner = 'busca' | 'formulario' | 'movimentacao';
type UnidadeMedidaProduto = 'g' | 'kg' | 'ml' | 'l' | 'un';

export default function EstoqueScreen() {
  const navigation = useNavigation<any>();

  const unidadesMedida: UnidadeMedidaProduto[] = ['g', 'kg', 'ml', 'l', 'un'];

  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalMovimentacao, setModalMovimentacao] = useState(false);

  const [modoFormulario, setModoFormulario] = useState<ModoFormulario>('cadastro');
  const [tipoMovimentacao, setTipoMovimentacao] = useState<'entrada' | 'saida'>(
    'entrada'
  );

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);

  const [ordenarPor, setOrdenarPor] = useState<OrdenarProdutoPor>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] =
    useState<DirecaoOrdenacao>('ASC');

  const [busca, setBusca] = useState('');
  const [buscaMovimentacao, setBuscaMovimentacao] = useState('');

  const [nome, setNome] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [precoUltimaEntrada, setPrecoUltimaEntrada] = useState('');
  const [precoMedio, setPrecoMedio] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeEmbalagem, setQuantidadeEmbalagem] = useState('1');
  const [unidadeMedida, setUnidadeMedida] = useState<UnidadeMedidaProduto>('un');

  const [quantidadeMov, setQuantidadeMov] = useState('');
  const [precoEntradaMov, setPrecoEntradaMov] = useState('');

  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [campoScanner, setCampoScanner] = useState<CampoScanner>('busca');

  const abrirScanner = (campo: CampoScanner) => {
    setCampoScanner(campo);
    setScannerVisivel(true);
  };

  const aoReceberCodigo = (codigo: string) => {
    if (campoScanner === 'busca') {
      setBusca(codigo);
    }

    if (campoScanner === 'formulario') {
      setCodigoBarras(codigo);
    }

    if (campoScanner === 'movimentacao') {
      setBuscaMovimentacao(codigo);
    }

    setScannerVisivel(false);
  };

  const obterNomeProduto = (produto: ProdutoEstoque) => {
    return produto.nome || produto.descricao || 'Produto sem nome';
  };

  const carregarProdutos = useCallback(async () => {
    try {
      const resultado = await listarProdutos(ordenarPor, direcaoOrdenacao);
      setProdutos(resultado);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    }
  }, [ordenarPor, direcaoOrdenacao]);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  const produtosFiltrados = useMemo(() => {
    const textoBusca = busca.trim().toLowerCase();

    if (!textoBusca) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const id = String(produto.id);
      const nomeProduto = obterNomeProduto(produto).toLowerCase();
      const codigo = String(produto.codigo_barras || '').toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeProduto.includes(textoBusca) ||
        codigo.includes(textoBusca)
      );
    });
  }, [produtos, busca]);

  const produtosFiltradosMovimentacao = useMemo(() => {
    const textoBusca = buscaMovimentacao.trim().toLowerCase();

    if (!textoBusca) {
      return produtos;
    }

    return produtos.filter((produto) => {
      const id = String(produto.id);
      const nomeProduto = obterNomeProduto(produto).toLowerCase();
      const codigo = String(produto.codigo_barras || '').toLowerCase();

      return (
        id.includes(textoBusca) ||
        nomeProduto.includes(textoBusca) ||
        codigo.includes(textoBusca)
      );
    });
  }, [produtos, buscaMovimentacao]);

  const formatarMoeda = (valor: number | undefined | null) => {
    const numero = Number(valor || 0);

    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const parseNumero = (valor: string) => {
    if (!valor.trim()) {
      return 0;
    }

    const numero = Number(valor.replace(',', '.'));

    return Number.isNaN(numero) ? NaN : numero;
  };

  const limparFormulario = () => {
    setNome('');
    setCodigoBarras('');
    setPrecoUltimaEntrada('');
    setPrecoMedio('');
    setQuantidade('');
    setQuantidadeEmbalagem('1');
    setUnidadeMedida('un');
  };

  const preencherFormulario = (produto: ProdutoEstoque) => {
    setNome(obterNomeProduto(produto));
    setCodigoBarras(produto.codigo_barras || '');
    setPrecoUltimaEntrada(String(produto.preco_ultima_entrada || 0));
    setPrecoMedio(String(produto.preco_medio || 0));
    setQuantidade(String(produto.quantidade || 0));
    setQuantidadeEmbalagem(String(produto.quantidade_embalagem || 1));
    setUnidadeMedida((produto.unidade_medida as UnidadeMedidaProduto) || 'un');
  };

  const abrirCadastro = () => {
    setModoFormulario('cadastro');
    setProdutoSelecionado(null);
    limparFormulario();
    setModalFormulario(true);
  };

  const abrirDetalhes = (produto: ProdutoEstoque) => {
    setProdutoSelecionado(produto);
    setModalDetalhes(true);
  };

  const abrirEdicao = () => {
    if (!produtoSelecionado) {
      return;
    }

    setModoFormulario('edicao');
    preencherFormulario(produtoSelecionado);
    setModalDetalhes(false);
    setModalFormulario(true);
  };

  const abrirMovimentacao = (tipo: 'entrada' | 'saida') => {
    setTipoMovimentacao(tipo);
    setProdutoSelecionado(null);
    setQuantidadeMov('');
    setPrecoEntradaMov('');
    setBuscaMovimentacao('');
    setModalMovimentacao(true);
  };

  const salvarProduto = async () => {
    try {
      const precoUltimaEntradaNum = parseNumero(precoUltimaEntrada);
      const precoMedioNum = parseNumero(precoMedio);
      const quantidadeNum = parseNumero(quantidade);
      const quantidadeEmbalagemNum = parseNumero(quantidadeEmbalagem);

      if (!nome.trim()) {
        Alert.alert('Erro', 'Informe o nome do produto.');
        return;
      }

      if (
        Number.isNaN(precoUltimaEntradaNum) ||
        Number.isNaN(precoMedioNum) ||
        Number.isNaN(quantidadeNum) ||
        Number.isNaN(quantidadeEmbalagemNum)
      ) {
        Alert.alert(
          'Erro',
          'Informe apenas números válidos nos campos de preço, quantidade e embalagem.'
        );
        return;
      }

      if (
        precoUltimaEntradaNum < 0 ||
        precoMedioNum < 0 ||
        quantidadeNum < 0 ||
        quantidadeEmbalagemNum < 0
      ) {
        Alert.alert('Erro', 'Preço, quantidade e embalagem não podem ser negativos.');
        return;
      }

      if (quantidadeEmbalagemNum <= 0) {
        Alert.alert('Erro', 'A quantidade da embalagem deve ser maior que zero.');
        return;
      }

      if (modoFormulario === 'cadastro') {
        await cadastrarProduto({
          nome: nome.trim(),
          codigo_barras: codigoBarras.trim(),
          preco_ultima_entrada: precoUltimaEntradaNum,
          preco_medio: precoMedioNum,
          quantidade: quantidadeNum,
          quantidade_embalagem: quantidadeEmbalagemNum,
          unidade_medida: unidadeMedida,
        });
      } else {
        if (!produtoSelecionado) {
          Alert.alert('Erro', 'Produto inválido.');
          return;
        }

        await editarProduto({
          id: produtoSelecionado.id,
          nome: nome.trim(),
          codigo_barras: codigoBarras.trim(),
          preco_ultima_entrada: precoUltimaEntradaNum,
          preco_medio: precoMedioNum,
          quantidade: quantidadeNum,
          quantidade_embalagem: quantidadeEmbalagemNum,
          unidade_medida: unidadeMedida,
        });
      }

      limparFormulario();
      setModalFormulario(false);
      setProdutoSelecionado(null);
      carregarProdutos();
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : 'Não foi possível salvar o produto.';

      Alert.alert('Erro', mensagem);
    }
  };

  const confirmarExclusao = () => {
    if (!produtoSelecionado) {
      return;
    }

    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${obterNomeProduto(produtoSelecionado)}"?`,
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
              await excluirProduto(produtoSelecionado.id);
              setModalDetalhes(false);
              setProdutoSelecionado(null);
              carregarProdutos();
            } catch (error) {
              const mensagem =
                error instanceof Error
                  ? error.message
                  : 'Não foi possível excluir o produto.';

              Alert.alert('Erro', mensagem);
            }
          },
        },
      ]
    );
  };

  const confirmarMovimentacao = async () => {
    try {
      if (!produtoSelecionado) {
        Alert.alert('Erro', 'Selecione um produto.');
        return;
      }

      const quantidadeNum = parseNumero(quantidadeMov);
      const precoEntradaNum = parseNumero(precoEntradaMov);

      if (Number.isNaN(quantidadeNum) || quantidadeNum <= 0) {
        Alert.alert('Erro', 'Informe uma quantidade maior que zero.');
        return;
      }

      if (quantidadeNum < 0) {
        Alert.alert('Erro', 'A quantidade não pode ser negativa.');
        return;
      }

      if (tipoMovimentacao === 'entrada') {
        if (Number.isNaN(precoEntradaNum)) {
          Alert.alert('Erro', 'Informe um preço válido.');
          return;
        }

        if (precoEntradaNum < 0) {
          Alert.alert('Erro', 'O preço não pode ser negativo.');
          return;
        }
      }

      await inserirMovimentacao(
        produtoSelecionado.id,
        tipoMovimentacao,
        quantidadeNum,
        tipoMovimentacao === 'entrada' ? precoEntradaNum : 0
      );

      setModalMovimentacao(false);
      setProdutoSelecionado(null);
      setQuantidadeMov('');
      setPrecoEntradaMov('');
      setBuscaMovimentacao('');
      carregarProdutos();
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível confirmar a movimentação.';

      Alert.alert('Erro', mensagem);
    }
  };

  const alternarOrdenacao = (coluna: OrdenarProdutoPor) => {
    if (ordenarPor === coluna) {
      setDirecaoOrdenacao((direcaoAtual) =>
        direcaoAtual === 'ASC' ? 'DESC' : 'ASC'
      );
    } else {
      setOrdenarPor(coluna);
      setDirecaoOrdenacao('ASC');
    }
  };

  const indicadorOrdenacao = (coluna: OrdenarProdutoPor) => {
    if (ordenarPor !== coluna) {
      return '';
    }

    return direcaoOrdenacao === 'ASC' ? ' ▲' : ' ▼';
  };

  const renderItem = ({ item }: { item: ProdutoEstoque }) => {
    const produtoZerado = Number(item.quantidade || 0) <= 0;

    return (
      <TouchableOpacity
        style={[styles.row, produtoZerado && styles.rowZerado]}
        onPress={() => abrirDetalhes(item)}
      >
        <Text style={styles.cellNome} numberOfLines={2}>
          {obterNomeProduto(item)}
        </Text>

        <Text
          style={[styles.cellQuantidade, produtoZerado && styles.textoZerado]}
          numberOfLines={1}
        >
          {produtoZerado ? 'ZERADO' : item.quantidade}
        </Text>

        <Text style={styles.cellPreco} numberOfLines={1}>
          {formatarMoeda(item.preco_medio)}
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
          <Text style={styles.headerTitle}>ESTOQUE</Text>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInputComIcone}
          placeholder="Buscar por nome, código de barras ou ID"
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />

        <TouchableOpacity
          style={styles.botaoScannerInput}
          onPress={() => abrirScanner('busca')}
          activeOpacity={0.7}
        >
          <Ionicons name="barcode-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.topButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={abrirCadastro}>
          <Text style={styles.primaryButtonText}>+ Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.entradaButton]}
          onPress={() => abrirMovimentacao('entrada')}
        >
          <Text style={styles.actionButtonText}>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saidaButton]}
          onPress={() => abrirMovimentacao('saida')}
        >
          <Text style={styles.actionButtonText}>Saída</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={styles.headerNome}
          onPress={() => alternarOrdenacao('nome')}
        >
          <Text style={styles.headerCellText}>
            NOME{indicadorOrdenacao('nome')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerQuantidade}
          onPress={() => alternarOrdenacao('quantidade')}
        >
          <Text style={styles.headerCellText}>
            QTD{indicadorOrdenacao('quantidade')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerPreco}
          onPress={() => alternarOrdenacao('preco_medio')}
        >
          <Text style={styles.headerCellText}>
            PREÇO MÉDIO{indicadorOrdenacao('preco_medio')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
          </View>
        }
      />

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {produtoSelecionado && (
              <>
                <Text style={styles.detailsModalTitle}>DADOS DO PRODUTO</Text>

                <View style={styles.detailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>{produtoSelecionado.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nome:</Text>
                    <Text style={styles.detailValue}>
                      {obterNomeProduto(produtoSelecionado)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Código:</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.codigo_barras || '-'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantidade:</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        produtoSelecionado.quantidade <= 0 && styles.textoZerado,
                      ]}
                    >
                      {produtoSelecionado.quantidade <= 0
                        ? 'Produto zerado'
                        : produtoSelecionado.quantidade}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Embalagem:</Text>
                    <Text style={styles.detailValue}>
                      {produtoSelecionado.quantidade_embalagem || 1}{' '}
                      {produtoSelecionado.unidade_medida || 'un'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Última entrada:</Text>
                    <Text style={styles.detailValue}>
                      {formatarMoeda(produtoSelecionado.preco_ultima_entrada)}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, styles.detailRowLast]}>
                    <Text style={styles.detailLabel}>Preço médio:</Text>
                    <Text style={styles.detailValue}>
                      {formatarMoeda(produtoSelecionado.preco_medio)}
                    </Text>
                  </View>
                </View>

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
                    setProdutoSelecionado(null);
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modoFormulario === 'cadastro' ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {modoFormulario === 'edicao' && produtoSelecionado && (
                <>
                  <Text style={styles.inputLabel}>ID:</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={String(produtoSelecionado.id)}
                    editable={false}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Nome:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome do produto"
                placeholderTextColor="#888"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.inputLabel}>Código de barras:</Text>
              <View style={styles.inputComIconeContainer}>
                <TextInput
                  style={styles.inputComIcone}
                  placeholder="Digite o código de barras"
                  placeholderTextColor="#888"
                  value={codigoBarras}
                  onChangeText={setCodigoBarras}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.botaoScannerInput}
                  onPress={() => abrirScanner('formulario')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="barcode-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Preço da última entrada:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o preço da última entrada"
                placeholderTextColor="#888"
                value={precoUltimaEntrada}
                onChangeText={setPrecoUltimaEntrada}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Preço médio:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o preço médio"
                placeholderTextColor="#888"
                value={precoMedio}
                onChangeText={setPrecoMedio}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Quantidade em estoque:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a quantidade em estoque"
                placeholderTextColor="#888"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Quantidade da embalagem:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 1000, 395, 1..."
                placeholderTextColor="#888"
                value={quantidadeEmbalagem}
                onChangeText={setQuantidadeEmbalagem}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Unidade de medida:</Text>
              <View style={styles.unidadeContainer}>
                {unidadesMedida.map((unidade) => {
                  const selecionada = unidadeMedida === unidade;

                  return (
                    <TouchableOpacity
                      key={unidade}
                      style={[
                        styles.unidadeButton,
                        selecionada && styles.unidadeButtonSelected,
                      ]}
                      onPress={() => setUnidadeMedida(unidade)}
                    >
                      <Text
                        style={[
                          styles.unidadeButtonText,
                          selecionada && styles.unidadeButtonTextSelected,
                        ]}
                      >
                        {unidade}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    limparFormulario();
                    setModalFormulario(false);
                    setProdutoSelecionado(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={salvarProduto}
                >
                  <Text style={styles.modalButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalMovimentacao} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>
              {tipoMovimentacao === 'entrada'
                ? 'ENTRADA DE ESTOQUE'
                : 'SAÍDA DE ESTOQUE'}
            </Text>

            <Text style={styles.modalLabel}>Produto:</Text>

            <View style={styles.inputComIconeContainer}>
              <TextInput
                style={styles.inputComIcone}
                placeholder="Buscar produto por nome, ID ou código de barras"
                placeholderTextColor="#888"
                value={buscaMovimentacao}
                onChangeText={setBuscaMovimentacao}
              />

              <TouchableOpacity
                style={styles.botaoScannerInput}
                onPress={() => abrirScanner('movimentacao')}
                activeOpacity={0.7}
              >
                <Ionicons name="barcode-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={produtosFiltradosMovimentacao}
              style={styles.produtoLista}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <View style={styles.produtoListaVazia}>
                  <Text style={styles.produtoListaVaziaText}>
                    Nenhum produto encontrado.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const selecionado = produtoSelecionado?.id === item.id;
                const zerado = item.quantidade <= 0;

                return (
                  <TouchableOpacity
                    style={[
                      styles.produtoItem,
                      selecionado && styles.produtoItemSelecionado,
                      zerado && styles.produtoItemZerado,
                    ]}
                    onPress={() => setProdutoSelecionado(item)}
                  >
                    <Text style={styles.produtoItemText} numberOfLines={2}>
                      {item.id} - {obterNomeProduto(item)}
                    </Text>

                    <Text
                      style={[
                        styles.produtoItemSubText,
                        zerado && styles.textoZerado,
                      ]}
                    >
                      Estoque: {zerado ? 'ZERADO' : item.quantidade}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={quantidadeMov}
              onChangeText={setQuantidadeMov}
            />

            {tipoMovimentacao === 'entrada' && (
              <TextInput
                style={styles.input}
                placeholder="Preço unitário da entrada"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={precoEntradaMov}
                onChangeText={setPrecoEntradaMov}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalMovimentacao(false);
                  setProdutoSelecionado(null);
                  setQuantidadeMov('');
                  setPrecoEntradaMov('');
                  setBuscaMovimentacao('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={confirmarMovimentacao}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
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
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginTop: 4,
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
    flex: 1.2,
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
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entradaButton: {
    backgroundColor: '#159900',
  },
  saidaButton: {
    backgroundColor: '#c90000',
  },
  actionButtonText: {
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
  headerQuantidade: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPreco: {
    flex: 1.35,
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
  rowZerado: {
    backgroundColor: '#fff2f2',
    borderColor: '#ffb3b3',
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
  cellQuantidade: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 13,
  },
  cellPreco: {
    flex: 1.35,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
  },
  textoZerado: {
    color: '#c90000',
    fontWeight: '900',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  detailsModalContent: {
    width: '88%',
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
  modalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 7,
  },
  searchInputMovimentacao: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  produtoLista: {
    height: 260,
    maxHeight: 260,
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
  produtoItemZerado: {
    backgroundColor: '#fff5f5',
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
  unidadeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  unidadeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  unidadeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  unidadeButtonText: {
    color: '#1a1a1a',
    fontWeight: '900',
    fontSize: 13,
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
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  searchInputComIcone: {
    flex: 1,
    height: 45,
    color: '#000',
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
});