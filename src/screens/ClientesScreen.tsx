import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDatabase } from '../database/database';
import { Cliente } from '../types';

export default function ClientesScreen() {
  const navigation = useNavigation();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalBusca, setModalBusca] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  const carregarClientes = async (filtro: string = '') => {
    try {
      const db = await getDatabase();
      if (filtro.trim()) {
        const resultado = await db.getAllAsync(
          'SELECT * FROM clientes WHERE nome LIKE ?',
          [`%${filtro}%`]
        );
        setClientes(resultado as Cliente[]);
      } else {
        const resultado = await db.getAllAsync('SELECT * FROM clientes');
        setClientes(resultado as Cliente[]);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarClientes(filtroAtivo);
    }, [filtroAtivo])
  );

  const adicionarCliente = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do cliente.');
      return;
    }
    try {
      const db = await getDatabase();
      await db.runAsync(
        'INSERT INTO clientes (nome, total_compras) VALUES (?, 0)',
        [novoNome.trim()]
      );
      setNovoNome('');
      setModalAdd(false);
      carregarClientes(filtroAtivo);
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o cliente.');
    }
  };

  const aplicarBusca = () => {
    setFiltroAtivo(termoBusca);
    setModalBusca(false);
  };

  const limparBusca = () => {
    setTermoBusca('');
    setFiltroAtivo('');
    setModalBusca(false);
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { textAlign: 'center', flex: 1 }]}>
        {item.id}
      </Text>
      <Text style={[styles.cell, { flex: 2, textAlign: 'center' }]}>
        {item.nome}
      </Text>
      <Text style={[styles.cell, { flex: 1.5, textAlign: 'center' }]}>
        R$ {item.total_compras.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 24, color: '#1a1a1a' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CLIENTES</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Botões de ação */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setModalAdd(true)}
        >
          <Text style={styles.actionLabel}>Novo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setTermoBusca(filtroAtivo); // preenche com o filtro atual
            setModalBusca(true);
          }}
        >
          <Text style={styles.actionLabel}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabela */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>ID</Text>
        <Text style={[styles.tableHeaderText, { flex: 2 }]}>CLIENTE</Text>
        <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>COMPRAS</Text>
      </View>
      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Modal de novo cliente */}
      <Modal visible={modalAdd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Cliente</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome completo"
              value={novoNome}
              onChangeText={setNovoNome}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalAdd(false);
                  setNovoNome('');
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={adicionarCliente}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de busca */}
      <Modal visible={modalBusca} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Buscar Cliente</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Digite o nome"
              value={termoBusca}
              onChangeText={setTermoBusca}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={limparBusca}
              >
                <Text style={styles.buttonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={aplicarBusca}
              >
                <Text style={styles.buttonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos seguindo exatamente o bloco enviado, acrescidos dos novos elementos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    margin: 14,
    borderRadius: 12,
  },
  backBtn: { marginRight: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cell: { fontSize: 12, fontWeight: '700', color: '#1a1a1a' },

  // Estilos para modais (adicionais, seguindo a mesma paleta)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
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
    backgroundColor: '#CD853F',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});