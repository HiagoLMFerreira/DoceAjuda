import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import BarcodeScannerModal from '../../../../components/BarcodeScannerModal';
import type {
  OrdenarProdutoEstoquePor,
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import { ProdutoEstoqueDetailsModal } from '../components/ProdutoEstoqueDetailsModal';
import { ProdutoEstoqueFormModal } from '../components/ProdutoEstoqueFormModal';
import { ProdutoEstoqueList } from '../components/ProdutoEstoqueList';
import { obterNomeProduto, useEstoque } from '../hooks/useEstoque';

export default function EstoqueScreen() {
  const navigation = useNavigation<any>();
  const estoque = useEstoque();

  useFocusEffect(
    useCallback(() => {
      estoque.carregar().catch((error) => {
        Alert.alert(
          'Erro',
          estoque.mensagemErro(
            error,
            'Não foi possível carregar os produtos.'
          )
        );
      });
    }, [estoque.carregar, estoque.mensagemErro])
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      estoque.carregar().catch((error) => {
        Alert.alert(
          'Erro',
          estoque.mensagemErro(
            error,
            'Não foi possível carregar os produtos.'
          )
        );
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [estoque.busca, estoque.ordenarPor, estoque.direcao]);

  const salvar = async () => {
    try {
      await estoque.salvar();
    } catch (error) {
      Alert.alert(
        'Erro',
        estoque.mensagemErro(
          error,
          'Não foi possível salvar o produto.'
        )
      );
    }
  };

  const confirmarExclusao = (produto: ProdutoEstoque) => {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${obterNomeProduto(produto)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await estoque.excluir();
            } catch (error) {
              Alert.alert(
                'Erro',
                estoque.mensagemErro(
                  error,
                  'Não foi possível excluir o produto.'
                )
              );
            }
          },
        },
      ]
    );
  };

  const renderCabecalho = (
    titulo: string,
    coluna: OrdenarProdutoEstoquePor,
    estilo: object
  ) => (
    <TouchableOpacity
      style={[styles.headerCell, estilo]}
      onPress={() => estoque.alternarOrdenacao(coluna)}
      activeOpacity={0.7}
    >
      <Text style={styles.headerCellText}>{titulo}</Text>
      {estoque.ordenarPor === coluna && (
        <Ionicons
          name={
            estoque.direcao === 'ASC'
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={13}
          color="#1a1a1a"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="cube-outline" size={23} color="#1a1a1a" />
            <Text style={styles.headerTitle}>ESTOQUE</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInputComIcone}
          placeholder="Buscar por nome, código de barras ou ID"
          placeholderTextColor="#888"
          value={estoque.busca}
          onChangeText={estoque.setBusca}
        />

        {estoque.busca.length > 0 && (
          <TouchableOpacity
            style={styles.inputIconButton}
            onPress={() => estoque.setBusca('')}
          >
            <Ionicons name="close-circle" size={21} color="#777" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.inputIconButton}
          onPress={() => estoque.abrirScanner('busca')}
        >
          <Ionicons name="barcode-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={estoque.abrirCadastro}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={21} color="#fff" />
        <Text style={styles.primaryButtonText}>Novo Produto</Text>
      </TouchableOpacity>

      <View style={styles.tableHeader}>
        {renderCabecalho('NOME', 'nome', styles.headerNome)}
        {renderCabecalho('QTD', 'quantidade', styles.headerQuantidade)}
        {renderCabecalho('UNID.', 'unidade_medida', styles.headerUnidade)}
        {renderCabecalho('PREÇO MÉDIO', 'preco_medio', styles.headerPreco)}
      </View>

      <ProdutoEstoqueList
        produtos={estoque.produtos}
        onSelecionar={estoque.abrirDetalhes}
      />

      <ProdutoEstoqueDetailsModal
        visible={estoque.modalDetalhes}
        produto={estoque.produtoSelecionado}
        excluindo={estoque.excluindo}
        onEdit={estoque.abrirEdicao}
        onDelete={() => {
          if (estoque.produtoSelecionado) {
            confirmarExclusao(estoque.produtoSelecionado);
          }
        }}
        onClose={estoque.fecharDetalhes}
      />

      <ProdutoEstoqueFormModal
        visible={estoque.modalFormulario}
        modo={estoque.modoFormulario}
        produto={estoque.produtoSelecionado}
        formulario={estoque.formulario}
        salvando={estoque.salvando}
        onChange={estoque.alterarFormulario}
        onOpenScanner={() => estoque.abrirScanner('formulario')}
        onClose={estoque.fecharFormulario}
        onSave={salvar}
      />

      <BarcodeScannerModal
        visible={estoque.scannerVisivel}
        onClose={estoque.fecharScanner}
        onCodeScanned={estoque.receberCodigo}
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
    backgroundColor: '#d1d1d1',
    borderRadius: 14,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextArea: { alignItems: 'center' },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  searchInputContainer: {
    minHeight: 49,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 12,
  },
  searchInputComIcone: {
    flex: 1,
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
  },
  inputIconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  tableHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c8c8c8',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerCellText: {
    color: '#1a1a1a',
    fontSize: 10,
    fontWeight: '900',
  },
  headerNome: { flex: 2.1 },
  headerQuantidade: {
    flex: 0.8,
    justifyContent: 'center',
  },
  headerUnidade: {
    flex: 0.8,
    justifyContent: 'center',
  },
  headerPreco: {
    flex: 1.35,
    justifyContent: 'flex-end',
  },
});
