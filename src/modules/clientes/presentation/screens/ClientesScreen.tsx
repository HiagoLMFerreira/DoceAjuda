import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { ClienteDetailsModal } from '../components/ClienteDetailsModal';
import { ClienteFormModal } from '../components/ClienteFormModal';
import { ClienteList } from '../components/ClienteList';
import { useClientes } from '../hooks/useClientes';
import type { Cliente } from '../../domain/models/Cliente';

export default function ClientesScreen() {
  const navigation = useNavigation();
  const clientes = useClientes();

  useFocusEffect(
    useCallback(() => {
      clientes.carregarClientes().catch((error) => {
        Alert.alert(
          'Erro',
          clientes.mensagemErro(
            error,
            'Não foi possível carregar os clientes.'
          )
        );
      });
    }, [clientes.carregarClientes, clientes.mensagemErro])
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      clientes.carregarClientes().catch((error) => {
        Alert.alert(
          'Erro',
          clientes.mensagemErro(
            error,
            'Não foi possível carregar os clientes.'
          )
        );
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [
    clientes.termoBusca,
    clientes.campoOrdenacao,
    clientes.direcaoOrdenacao,
  ]);

  const salvarCliente = async () => {
    try {
      await clientes.salvarCliente();
    } catch (error) {
      const mensagem = clientes.mensagemErro(
        error,
        'Não foi possível salvar o cliente.'
      );

      Alert.alert(
        mensagem === 'Informe o nome do cliente.' ? 'Atenção' : 'Erro',
        mensagem
      );
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
          onPress: async () => {
            try {
              await clientes.excluirCliente();
            } catch (error) {
              Alert.alert(
                'Erro',
                clientes.mensagemErro(
                  error,
                  'Não foi possível excluir o cliente.'
                )
              );
            }
          },
        },
      ]
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
          <Text style={styles.headerTitle}>CLIENTES</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nome ou ID"
        placeholderTextColor="#777"
        value={clientes.termoBusca}
        onChangeText={clientes.setTermoBusca}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={clientes.abrirCadastro}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>Novo Cliente</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        <TouchableOpacity
          style={[styles.headerColumn, { flex: 2 }]}
          onPress={() => clientes.ordenarClientes('nome')}
        >
          <Text style={styles.tableHeaderText}>
            CLIENTE{clientes.indicadorOrdenacao('nome')}
          </Text>
        </TouchableOpacity>

        <View style={[styles.headerColumn, { flex: 1.4 }]}>
          <Text style={styles.tableHeaderText}>TELEFONE</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerColumn, { flex: 1.3 }]}
          onPress={() => clientes.ordenarClientes('total_compras')}
        >
          <Text style={styles.tableHeaderText}>
            COMPRAS{clientes.indicadorOrdenacao('total_compras')}
          </Text>
        </TouchableOpacity>
      </View>

      <ClienteList
        clientes={clientes.clientes}
        onSelecionar={clientes.abrirDetalhes}
      />

      <ClienteFormModal
        visible={clientes.modalFormularioVisivel}
        clienteEditando={clientes.clienteEditando}
        formulario={clientes.formulario}
        salvando={clientes.salvando}
        onChange={clientes.alterarFormulario}
        onClose={clientes.fecharFormulario}
        onSave={salvarCliente}
      />

      <ClienteDetailsModal
        visible={clientes.modalDetalhesVisivel}
        cliente={clientes.clienteSelecionado}
        excluindo={clientes.excluindo}
        onEdit={clientes.abrirEdicao}
        onDelete={confirmarExclusaoCliente}
        onClose={clientes.fecharDetalhes}
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
});
