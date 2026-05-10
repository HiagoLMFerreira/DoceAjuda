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
import { getDatabase, inserirMovimentacao } from '../database/database';
import { Produto } from '../types';
import { useFocusEffect } from '@react-navigation/native';

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalMov, setModalMov] = useState(false);
  const [modalAddProduto, setModalAddProduto] = useState(false);
  const [tipoMov, setTipoMov] = useState<'entrada' | 'saida'>('entrada');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [descricaoNovo, setDescricaoNovo] = useState('');

  const carregarProdutos = async () => {
    const db = await getDatabase();
    const resultado = await db.getAllAsync('SELECT * FROM produtos ORDER BY id');
    setProdutos(resultado as Produto[]);
  };

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [])
  );

  const confirmarMovimentacao = async () => {
    if (!produtoSelecionado || !quantidade.trim()) {
      Alert.alert('Erro', 'Selecione um produto e informe a quantidade.');
      return;
    }
    const qtdNum = parseFloat(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert('Erro', 'Quantidade inválida.');
      return;
    }
    await inserirMovimentacao(produtoSelecionado.id, tipoMov, qtdNum);
    setModalMov(false);
    setQuantidade('');
    setProdutoSelecionado(null);
    carregarProdutos();
  };

  const adicionarProduto = async () => {
    if (!descricaoNovo.trim()) {
      Alert.alert('Erro', 'Informe a descrição do produto.');
      return;
    }
    const db = await getDatabase();
    await db.runAsync('INSERT INTO produtos (descricao, quantidade) VALUES (?, 0)', [descricaoNovo.trim()]);
    setDescricaoNovo('');
    setModalAddProduto(false);
    carregarProdutos();
  };

  const abrirModalMov = (tipo: 'entrada' | 'saida') => {
    setTipoMov(tipo);
    setProdutoSelecionado(null);
    setQuantidade('');
    setModalMov(true);
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { flex: 1 }]}>{item.id}</Text>
      <Text style={[styles.cell, { flex: 3 }]}>{item.descricao}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{item.quantidade}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header padronizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ESTOQUE</Text>
      </View>

      {/* Botão Cadastrar Produto */}
      <TouchableOpacity
        style={styles.cadastrarButton}
        onPress={() => setModalAddProduto(true)}
      >
        <Text style={styles.cadastrarButtonText}>Cadastrar Produto</Text>
      </TouchableOpacity>

      {/* Botões Entrada e Saída lado a lado */}
      <View style={styles.movButtonsRow}>
        <TouchableOpacity
          style={[styles.movButton, styles.entradaButton]}
          onPress={() => abrirModalMov('entrada')}
        >
          <Text style={styles.movButtonText}>+ Entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.movButton, styles.saidaButton]}
          onPress={() => abrirModalMov('saida')}
        >
          <Text style={styles.movButtonText}>- Saída</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela de produtos */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>ID</Text>
        <Text style={[styles.headerCell, { flex: 3 }]}>DESCRIÇÃO</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>QUANTIDADE</Text>
      </View>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      {/* Modal de movimentação */}
      <Modal visible={modalMov} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {tipoMov === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}
            </Text>

            {/* Lista para selecionar produto */}
            <Text style={styles.modalLabel}>Produto:</Text>
            <FlatList
              data={produtos}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalMov(false)}
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

      {/* Modal de cadastro de produto */}
      <Modal visible={modalAddProduto} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição do produto"
              placeholderTextColor="#888"
              value={descricaoNovo}
              onChangeText={setDescricaoNovo}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDescricaoNovo('');
                  setModalAddProduto(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={adicionarProduto}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    textAlign: 'center',
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
    marginBottom: 20,
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
    backgroundColor: '#e00000',   // tom acastanhado para diferenciar saída
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
    fontSize: 13,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
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
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  // Modais
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
    letterSpacing: 1,
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