import React, { useState, useCallback } from 'react';
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

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

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
          },
        },
      ]
    );
  };

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ESTOQUE</Text>
      </View>

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
      </View>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

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
          </View>
        </View>
      </Modal>

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tipoMov === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}
            </Text>
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
            />

            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
            />
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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  entradaButton: {
    backgroundColor: '#12dd00',
    marginRight: 10,
  },
  saidaButton: {
    backgroundColor: '#e00000',
  },
  movButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
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
    alignItems: 'center',
  },
  cell: {
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    fontSize: 12,
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
  },
  list: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  produtoLista: {
    maxHeight: 200,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  produtoItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  produtoItemSelecionado: {
    backgroundColor: '#f0f0f0',
  },
  produtoItemText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});