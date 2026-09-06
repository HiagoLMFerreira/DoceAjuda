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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClienteDetailsModal } from '../components/ClienteDetailsModal';
import { ClienteFormModal } from '../components/ClienteFormModal';
import { ClienteList } from '../components/ClienteList';
import { useClientes } from '../hooks/useClientes';
import type { Cliente } from '../../domain/models/Cliente';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9B98A0',
  border: '#F1E7EA',
};

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
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="people-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.headerTitle}>Clientes</Text>
              <Text style={styles.headerSubtitle}>
                Contatos e histórico de compras
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={21}
            color={COLORS.primary}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou ID"
            placeholderTextColor={COLORS.textMuted}
            value={clientes.termoBusca}
            onChangeText={clientes.setTermoBusca}
          />

          {clientes.termoBusca.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => clientes.setTermoBusca('')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={clientes.abrirCadastro}
          activeOpacity={0.82}
        >
          <Ionicons
            name="person-add-outline"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Novo cliente</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTextArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },
  searchContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 9,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  clearButton: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  tableHeader: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD5E0',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerColumn: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
