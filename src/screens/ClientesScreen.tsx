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
  const [modalBusca, setModalBusca] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [campoOrdenacao, setCampoOrdenacao] = useState<
    'id' | 'nome' | 'total_compras'
  >('id');

  const [ordemCrescente, setOrdemCrescente] = useState(true);

  const [novoNome, setNovoNome] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEndereco, setNovoEndereco] = useState('');

  const [termoBusca, setTermoBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState('');

  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(
    null
  );

  const carregarClientes = async (filtro: string = '') => {
    try {
      const resultado = await listarClientes(filtro);
      setClientes(resultado);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarClientes(filtroAtivo);
    }, [filtroAtivo])
  );

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
      carregarClientes(filtroAtivo);
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
      carregarClientes(filtroAtivo);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      Alert.alert('Erro', 'Não foi possível excluir o cliente.');
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

  const ordenarClientes = (campo: 'id' | 'nome' | 'total_compras') => {
    const mesmaColuna = campoOrdenacao === campo;
    const novaOrdemCrescente = mesmaColuna ? !ordemCrescente : true;

    const clientesOrdenados = [...clientes].sort((a, b) => {
      let comparacao = 0;

      if (campo === 'id') {
        comparacao = a.id - b.id;
      }

      if (campo === 'nome') {
        comparacao = a.nome.localeCompare(b.nome);
      }

      if (campo === 'total_compras') {
        comparacao = a.total_compras - b.total_compras;
      }

      return novaOrdemCrescente ? comparacao : -comparacao;
    });

    setCampoOrdenacao(campo);
    setOrdemCrescente(novaOrdemCrescente);
    setClientes(clientesOrdenados);
  };

  const indicadorOrdenacao = (campo: 'id' | 'nome' | 'total_compras') => {
    if (campoOrdenacao !== campo) {
      return '';
    }

    return ordemCrescente ? ' ↑' : ' ↓';
  };


  const renderItem = ({ item }: { item: Cliente }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => abrirDetalhesCliente(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.cell, { textAlign: 'center', flex: 0.7 }]}>
        {item.id}
      </Text>

      <Text style={[styles.cell, { flex: 2, textAlign: 'center' }]}>
        {item.nome}
      </Text>

      <Text style={[styles.cell, { flex: 1.4, textAlign: 'center' }]}>
        R$ {item.total_compras.toFixed(2)}
      </Text>
    </TouchableOpacity>
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

      {/* Botões principais */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={abrirModalNovoCliente}
        >
          <Text style={styles.actionLabel}>Novo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setTermoBusca(filtroAtivo);
            setModalBusca(true);
          }}
        >
          <Text style={styles.actionLabel}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {filtroAtivo.trim() ? (
        <Text style={styles.filtroTexto}>Buscando por: {filtroAtivo}</Text>
      ) : null}

      {/* Tabela */}
      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={{ flex: 0.7 }}
          onPress={() => ordenarClientes('id')}
        >
          <Text style={styles.tableHeaderText}>
            ID{indicadorOrdenacao('id')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 2 }}
          onPress={() => ordenarClientes('nome')}
        >
          <Text style={styles.tableHeaderText}>
            CLIENTE{indicadorOrdenacao('nome')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 1.4 }}
          onPress={() => ordenarClientes('total_compras')}
        >
          <Text style={styles.tableHeaderText}>
            COMPRAS{indicadorOrdenacao('total_compras')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clientes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
        }
      />

      {/* Modal de novo/editar cliente */}
      <Modal visible={modalAdd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome completo"
              value={novoNome}
              onChangeText={setNovoNome}
              autoFocus
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Telefone"
              value={novoTelefone}
              onChangeText={setNovoTelefone}
              keyboardType="phone-pad"
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Endereço"
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
                <Text style={styles.buttonText}>
                  {clienteEditando ? 'Atualizar' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalhes do cliente */}
      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalhes do Cliente</Text>

            {clienteSelecionado && (
              <>
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Nome</Text>
                  <Text style={styles.detailValue}>
                    {clienteSelecionado.nome}
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Telefone</Text>
                  <Text style={styles.detailValue}>
                    {clienteSelecionado.telefone?.trim()
                      ? clienteSelecionado.telefone
                      : 'Não informado'}
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Endereço</Text>
                  <Text style={styles.detailValue}>
                    {clienteSelecionado.endereco?.trim()
                      ? clienteSelecionado.endereco
                      : 'Não informado'}
                  </Text>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>Total em compras</Text>
                  <Text style={styles.detailValue}>
                    R$ {clienteSelecionado.total_compras.toFixed(2)}
                  </Text>
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
                  style={[styles.fullButton, styles.cancelButton]}
                  onPress={fecharModalDetalhes}
                >
                  <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
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
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
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

  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  filtroTexto: {
    marginHorizontal: 14,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#CD853F',
    textAlign: 'center',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#c8c8c8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 14,
    borderRadius: 6,
    marginBottom: 4,
    alignItems: 'center',
  },

  tableHeaderText: {
    fontSize: 11,
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

  cell: {
    fontSize: 12,
    fontWeight: '700',
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
  
  textArea: {
  minHeight: 80,
  textAlignVertical: 'top',
  },

  detailBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#777',
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
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
    backgroundColor: '#CD853F',
  },

  deleteButton: {
    backgroundColor: '#b44',
  },

  fullButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
});