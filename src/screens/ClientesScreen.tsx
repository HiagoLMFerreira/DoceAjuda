import React, { useState, useCallback, useMemo } from 'react';
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
import { Cliente } from '../types';
import {
  listarClientes,
  adicionarCliente,
  atualizarCliente,
  excluirCliente,
} from '../database/database';

export default function ClientesScreen() {
  const navigation = useNavigation();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAdd, setModalAdd] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [campoOrdenacao, setCampoOrdenacao] = useState<
    'id' | 'nome' | 'total_compras'
  >('nome');

  const [ordemCrescente, setOrdemCrescente] = useState(true);

  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');

  const [termoBusca, setTermoBusca] = useState('');

  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  const carregarClientes = async () => {
    try {
      const resultado = await listarClientes('');
      setClientes(resultado);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarClientes();
    }, [])
  );

  const clientesFiltradosEOrdenados = useMemo(() => {
    const busca = termoBusca.trim().toLowerCase();

    let lista = [...clientes];

    if (busca) {
      lista = lista.filter((cliente) => {
        const idCliente = String(cliente.id);
        const nomeCliente = cliente.nome.toLowerCase();

        return idCliente.includes(busca) || nomeCliente.includes(busca);
      });
    }

    lista.sort((a, b) => {
      let comparacao = 0;

      if (campoOrdenacao === 'id') {
        comparacao = a.id - b.id;
      }

      if (campoOrdenacao === 'nome') {
        comparacao = a.nome.localeCompare(b.nome);
      }

      if (campoOrdenacao === 'total_compras') {
        comparacao = a.total_compras - b.total_compras;
      }

      return ordemCrescente ? comparacao : -comparacao;
    });

    return lista;
  }, [clientes, termoBusca, campoOrdenacao, ordemCrescente]);

  const abrirModalNovoCliente = () => {
    setClienteEditando(null);
    setNovoNome('');
    setNovoTelefone('');
    setNovoEndereco('');
    setModalAdd(true);
  };

  const abrirDetalhesCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModalDetalhes(true);
  };

  const abrirModalEditarCliente = (cliente: Cliente) => {
    setModalDetalhes(false);
    setClienteEditando(cliente);
    setNovoNome(cliente.nome);
    setNovoTelefone(cliente.telefone || '');
    setNovoEndereco(cliente.endereco || '');
    setModalAdd(true);
  };

  const fecharModalCliente = () => {
    setModalAdd(false);
    setNovoNome('');
    setNovoTelefone('');
    setNovoEndereco('');
    setClienteEditando(null);
  };

  const fecharModalDetalhes = () => {
    setModalDetalhes(false);
    setClienteSelecionado(null);
  };

  const salvarCliente = async () => {
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do cliente.');
      return;
    }

    try {
      if (clienteEditando) {
        await atualizarCliente(
          clienteEditando.id,
          novoNome,
          novoTelefone,
          novoEndereco
        );
      } else {
        await adicionarCliente(novoNome, novoTelefone, novoEndereco);
      }

      fecharModalCliente();
      carregarClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      Alert.alert('Erro', 'Não foi possível salvar o cliente.');
    }
  };

  const confirmarExclusaoCliente = (cliente: Cliente) => {
    Alert.alert(
      'Excluir cliente',
      `Deseja realmente excluir o cliente "${cliente.nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => removerCliente(cliente.id),
        },
      ]
    );
  };

  const removerCliente = async (id: number) => {
    try {
      await excluirCliente(id);
      fecharModalDetalhes();
      carregarClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente.');
    }
  };

  const ordenarClientes = (campo: 'id' | 'nome' | 'total_compras') => {
    const mesmaColuna = campoOrdenacao === campo;
    const novaOrdemCrescente = mesmaColuna ? !ordemCrescente : true;

    setCampoOrdenacao(campo);
    setOrdemCrescente(novaOrdemCrescente);
  };

  const indicadorOrdenacao = (campo: 'id' | 'nome' | 'total_compras') => {
    if (campoOrdenacao !== campo) {
      return '';
    }

    return ordemCrescente ? ' ▲' : ' ▼';
  };

  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      style={styles.rowCard}
      onPress={() => abrirDetalhesCliente(item)}
      activeOpacity={0.75}
    >
      <Text
        style={[styles.cell, { flex: 2, textAlign: 'left' }]}
        numberOfLines={1}
      >
        {item.nome}
      </Text>

      <Text
        style={[styles.cell, { flex: 1.4, textAlign: 'center' }]}
        numberOfLines={1}
      >
        {item.telefone?.trim() ? item.telefone : '-'}
      </Text>

      <Text style={[styles.cell, { flex: 1.3, textAlign: 'right' }]}>
        R$ {item.total_compras.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

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
                <Text style={styles.headerTitle}>CLIENTES</Text>
               </View>
            </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome ou ID"
        placeholderTextColor="#777"
        value={termoBusca}
        onChangeText={setTermoBusca}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={abrirModalNovoCliente}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Novo Cliente</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={[styles.headerColumn, { flex: 2 }]}
          onPress={() => ordenarClientes('nome')}
        >
          <Text style={styles.tableHeaderText}>
            CLIENTE{indicadorOrdenacao('nome')}
          </Text>
        </TouchableOpacity>

        <View style={[styles.headerColumn, { flex: 1.4 }]}>
          <Text style={styles.tableHeaderText}>TELEFONE</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerColumn, { flex: 1.3 }]}
          onPress={() => ordenarClientes('total_compras')}
        >
          <Text style={styles.tableHeaderText}>
            COMPRAS{indicadorOrdenacao('total_compras')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clientesFiltradosEOrdenados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
        }
      />

      <Modal visible={modalAdd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.formModalContent}>
            <Text style={styles.modalTitle}>
              {clienteEditando ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
            </Text>

            {clienteEditando && (
              <>
                <Text style={styles.inputLabel}>ID:</Text>
                <TextInput
                  style={[styles.formInput, styles.disabledInput]}
                  value={String(clienteEditando.id)}
                  editable={false}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Nome:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Digite o nome do cliente"
              placeholderTextColor="#888"
              value={novoNome}
              onChangeText={setNovoNome}
              autoFocus
            />

            <Text style={styles.inputLabel}>Telefone:</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Digite o telefone"
              placeholderTextColor="#888"
              value={novoTelefone}
              onChangeText={setNovoTelefone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Endereço:</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Digite o endereço"
              placeholderTextColor="#888"
              value={novoEndereco}
              onChangeText={setNovoEndereco}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={fecharModalCliente}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarCliente}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            <Text style={styles.modalTitle}>DADOS DO CLIENTE</Text>

            {clienteSelecionado && (
              <>
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID:</Text>
                    <Text style={styles.detailValue}>
                      {clienteSelecionado.id}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Nome:</Text>
                    <Text style={styles.detailValue}>
                      {clienteSelecionado.nome}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Telefone:</Text>
                    <Text style={styles.detailValue}>
                      {clienteSelecionado.telefone?.trim()
                        ? clienteSelecionado.telefone
                        : '-'}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Endereço:</Text>
                    <Text style={[styles.detailValue, styles.detailValueLong]}>
                      {clienteSelecionado.endereco?.trim()
                        ? clienteSelecionado.endereco
                        : '-'}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Compras:</Text>
                    <Text style={styles.detailValue}>
                      R$ {clienteSelecionado.total_compras.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[styles.detailButton, styles.editButton]}
                    onPress={() => abrirModalEditarCliente(clienteSelecionado)}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.detailButton, styles.deleteButton]}
                    onPress={() =>
                      confirmarExclusaoCliente(clienteSelecionado)
                    }
                  >
                    <Text style={styles.buttonText}>Excluir</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.fullButton, styles.closeButton]}
                  onPress={fecharModalDetalhes}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
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
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 16,
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },

  tableHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerColumn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#b8b8b8',
  },

  rowCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  cell: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },

  listContent: {
    paddingBottom: 24,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#777',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  formModalContent: {
    width: '85%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  detailsModalContent: {
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
    letterSpacing: 2,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },

  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#1a1a1a',
  },

  disabledInput: {
    backgroundColor: '#eaeaea',
    color: '#777',
  },

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
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

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  detailsBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
  },

  detailLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },

  detailValue: {
    flex: 1.4,
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'right',
  },

  detailValueLong: {
    fontSize: 12,
  },

  detailLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },

  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#000',
  },

  deleteButton: {
    backgroundColor: '#c90000',
  },

  fullButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },

  closeButton: {
    backgroundColor: '#aaa',
  },
});