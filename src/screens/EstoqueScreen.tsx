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
} from 'react-native';
<<<<<<< Updated upstream
import {
  listarProdutos,
  cadastrarProduto,
  atualizarProduto,
  inativarProduto,
  inserirMovimentacao,
} from '../database/database';
import { Produto } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');

  // Estados para modais
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalMov, setModalMov] = useState(false);
  const [tipoMov, setTipoMov] = useState<'entrada' | 'saida'>('entrada');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  // Estados para cadastro/edição
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');

  // Produto em edição
  const [editandoProduto, setEditandoProduto] = useState<Produto | null>(null);

  // Filtro de pesquisa dentro do modal de movimentação
  const [filtroProdutoMov, setFiltroProdutoMov] = useState('');

  const carregarProdutos = useCallback(async () => {
    try {
      const resultado = await listarProdutos(filtro, true);
      setProdutos(resultado as Produto[]);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }, [filtro]);
=======
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

type ModoFormulario = 'cadastro' | 'edicao';

export default function EstoqueScreen() {
  const navigation = useNavigation<any>();

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

  const [nome, setNome] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [precoUltimaEntrada, setPrecoUltimaEntrada] = useState('');
  const [precoMedio, setPrecoMedio] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const [quantidadeMov, setQuantidadeMov] = useState('');
  const [precoEntradaMov, setPrecoEntradaMov] = useState('');
  const [buscaMovimentacao, setBuscaMovimentacao] = useState('');

  const obterNomeProduto = (produto: ProdutoEstoque) => {
    return produto.nome || produto.descricao || 'Produto sem nome';
  };
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  // --- Ações CRUD ---
  const handleCadastrar = async () => {
    if (!descricaoProduto.trim()) {
      Alert.alert('Atenção', 'Informe a descrição do produto.');
      return;
    }
    try {
      await cadastrarProduto(
        descricaoProduto.trim(),
        parseFloat(precoProduto) || 0
      );
      setDescricaoProduto('');
      setPrecoProduto('');
      setModalAdd(false);
      carregarProdutos();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível cadastrar o produto.');
    }
  };

  const abrirEdicao = (produto: Produto) => {
    setEditandoProduto(produto);
    setDescricaoProduto(produto.descricao);
    setPrecoProduto(produto.preco?.toString() || '');
    setModalEdit(true);
  };

  const handleEditar = async () => {
    if (!editandoProduto) return;
    if (!descricaoProduto.trim()) {
      Alert.alert('Atenção', 'Informe a descrição.');
      return;
    }
    try {
      await atualizarProduto(
        editandoProduto.id,
        descricaoProduto.trim(),
        parseFloat(precoProduto) || undefined
      );
      setModalEdit(false);
      setEditandoProduto(null);
      carregarProdutos();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível editar o produto.');
    }
  };

  const handleInativar = (produto: Produto) => {
    Alert.alert(
      'Inativar Produto',
      `Deseja realmente inativar "${produto.descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inativar',
          style: 'destructive',
          onPress: async () => {
            await inativarProduto(produto.id);
            carregarProdutos();
=======
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
  };

  const preencherFormulario = (produto: ProdutoEstoque) => {
    setNome(obterNomeProduto(produto));
    setCodigoBarras(produto.codigo_barras || '');
    setPrecoUltimaEntrada(String(produto.preco_ultima_entrada || 0));
    setPrecoMedio(String(produto.preco_medio || 0));
    setQuantidade(String(produto.quantidade || 0));
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

      if (!nome.trim()) {
        Alert.alert('Erro', 'Informe o nome do produto.');
        return;
      }

      if (
        Number.isNaN(precoUltimaEntradaNum) ||
        Number.isNaN(precoMedioNum) ||
        Number.isNaN(quantidadeNum)
      ) {
        Alert.alert(
          'Erro',
          'Informe apenas números válidos nos campos de preço e quantidade.'
        );
        return;
      }

      if (precoUltimaEntradaNum < 0 || precoMedioNum < 0 || quantidadeNum < 0) {
        Alert.alert('Erro', 'Preço e quantidade não podem ser negativos.');
        return;
      }

      if (modoFormulario === 'cadastro') {
        await cadastrarProduto({
          nome: nome.trim(),
          codigo_barras: codigoBarras.trim(),
          preco_ultima_entrada: precoUltimaEntradaNum,
          preco_medio: precoMedioNum,
          quantidade: quantidadeNum,
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
>>>>>>> Stashed changes
          },
        },
      ]
    );
  };

<<<<<<< Updated upstream
  // --- Movimentação ---
  const abrirModalMov = (tipo: 'entrada' | 'saida') => {
    setTipoMov(tipo);
    setProdutoSelecionado(null);
    setQuantidade('');
    setPrecoUnitario('');
    setFiltroProdutoMov('');  // limpa pesquisa ao abrir
    setModalMov(true);
  };

  const confirmarMovimentacao = async () => {
    if (!produtoSelecionado) {
      Alert.alert('Erro', 'Selecione um produto.');
      return;
    }
    const qtdNum = parseFloat(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert('Erro', 'Quantidade inválida.');
      return;
    }
    if (tipoMov === 'saida' && qtdNum > produtoSelecionado.quantidade) {
      Alert.alert('Erro', 'Quantidade insuficiente em estoque.');
      return;
    }

    const preco = tipoMov === 'entrada' ? parseFloat(precoUnitario) : undefined;
    if (tipoMov === 'entrada' && precoUnitario && (isNaN(preco!) || preco! < 0)) {
      Alert.alert('Erro', 'Preço unitário inválido.');
      return;
    }

    try {
      await inserirMovimentacao(produtoSelecionado.id, tipoMov, qtdNum, preco);
      setModalMov(false);
      carregarProdutos();
    } catch (erro: any) {
      Alert.alert('Erro', erro.message || 'Não foi possível registrar a movimentação.');
    }
  };

  // --- Renderização da tabela ---
  const renderItem = ({ item }: { item: Produto }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
      <Text style={[styles.cell, { flex: 2.5 }]} numberOfLines={1}>{item.descricao}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.quantidade}</Text>
      <Text style={[styles.cell, { flex: 1.5 }]}>
        {item.preco_medio > 0 ? `R$ ${item.preco_medio.toFixed(2)}` : '-'}
      </Text>
      <View style={styles.cellActions}>
        <TouchableOpacity onPress={() => abrirEdicao(item)} style={styles.actionIcon}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleInativar(item)} style={styles.actionIcon}>
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      {/* Campo de pesquisa (tela principal) */}
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar produto..."
        placeholderTextColor="#888"
        value={filtro}
        onChangeText={setFiltro}
      />

      {/* Botões principais */}
      <TouchableOpacity style={styles.cadastrarButton} onPress={() => setModalAdd(true)}>
        <Text style={styles.cadastrarButtonText}>Cadastrar Produto</Text>
      </TouchableOpacity>

      <View style={styles.movButtonsRow}>
        <TouchableOpacity style={[styles.movButton, styles.entradaButton]} onPress={() => abrirModalMov('entrada')}>
          <Text style={styles.movButtonText}>+ Entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.movButton, styles.saidaButton]} onPress={() => abrirModalMov('saida')}>
          <Text style={styles.movButtonText}>- Saída</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 2.5 }]}>DESCRIÇÃO</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>QTD</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>PREÇO MÉDIO</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>AÇÕES</Text>
=======
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome, código de barras ou ID"
        placeholderTextColor="#777"
        value={busca}
        onChangeText={setBusca}
      />

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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      {/* Modal de Cadastro */}
      <Modal visible={modalAdd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor="#888"
              value={descricaoProduto}
              onChangeText={setDescricaoProduto}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço de custo (opcional)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={precoProduto}
              onChangeText={setPrecoProduto}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalAdd(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleCadastrar}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
=======
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
                    <Text style={styles.detailLabel}>Código de Barras:</Text>
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
>>>>>>> Stashed changes
          </View>
        </View>
      </Modal>

<<<<<<< Updated upstream
      {/* Modal de Edição */}
      <Modal visible={modalEdit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor="#888"
              value={descricaoProduto}
              onChangeText={setDescricaoProduto}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={precoProduto}
              onChangeText={setPrecoProduto}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalEdit(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleEditar}>
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Movimentação (Entrada/Saída) COM PESQUISA */}
      <Modal visible={modalMov} transparent animationType="fade">
=======
      <Modal visible={modalFormulario} transparent animationType="fade">
>>>>>>> Stashed changes
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modoFormulario === 'cadastro' ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}
            </Text>
<<<<<<< Updated upstream
            <Text style={styles.modalLabel}>Produto:</Text>

            {/* Campo de pesquisa dentro do modal */}
            <TextInput
              style={styles.input}
              placeholder="Pesquisar produto..."
              placeholderTextColor="#888"
              value={filtroProdutoMov}
              onChangeText={setFiltroProdutoMov}
            />

            <FlatList
              data={produtos.filter(p =>
                p.descricao.toLowerCase().includes(filtroProdutoMov.toLowerCase())
              )}
              style={styles.produtoLista}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.produtoItem,
                    produtoSelecionado?.id === item.id && styles.produtoItemSelecionado,
                  ]}
                  onPress={() => setProdutoSelecionado(item)}
                >
                  <Text style={styles.produtoItemText}>
                    {item.id} - {item.descricao} (Estoque: {item.quantidade})
                  </Text>
                </TouchableOpacity>
              )}
=======

            <Modal visible={modalFormulario} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {modoFormulario === 'cadastro' ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}
      </Text>

       {modoFormulario === 'edicao' && produtoSelecionado && (
          <>
            <Text style={styles.inputLabel}>ID:</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={String(produtoSelecionado.id)}
              editable={false}
>>>>>>> Stashed changes
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
        <TextInput
          style={styles.input}
          placeholder="Digite o código de barras"
          placeholderTextColor="#888"
          value={codigoBarras}
          onChangeText={setCodigoBarras}
          keyboardType="numeric"
        />

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

        <Text style={styles.inputLabel}>Quantidade:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a quantidade"
          placeholderTextColor="#888"
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="numeric"
        />

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
      </View>
    </View>
  </Modal>
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

              <TextInput
                style={styles.searchInputMovimentacao}
                placeholder="Buscar produto por nome, código ou ID"
                placeholderTextColor="#777"
                value={buscaMovimentacao}
                onChangeText={setBuscaMovimentacao}
              />

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
<<<<<<< Updated upstream
            {tipoMov === 'entrada' && (
              <TextInput
                style={styles.input}
                placeholder="Preço unitário (opcional)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={precoUnitario}
                onChangeText={setPrecoUnitario}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalMov(false)}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={confirmarMovimentacao}>
=======

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
>>>>>>> Stashed changes
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
<<<<<<< Updated upstream
    marginBottom: 12,
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
  cadastrarButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000',
  },
  cadastrarButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
  movButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  movButton: {
    flex: 1,
=======
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    backgroundColor: '#e00000',
=======
    backgroundColor: '#c90000',
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  headerCell: {
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 2,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
=======
  headerNome: {
    flex: 2,
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#b0b0b0',
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  },
  cellActions: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    paddingHorizontal: 5,
    paddingVertical: 2,
=======
    letterSpacing: 0.4,
>>>>>>> Stashed changes
  },
  list: {
    flex: 1,
  },
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    marginBottom: 15,
=======
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
>>>>>>> Stashed changes
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 7,
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
  }
});