import React, { useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import BarcodeScannerModal from '../../../../shared/scanner/presentation/BarcodeScannerModal';
import { ReceitaDetailsModal } from '../components/ReceitaDetailsModal';
import { ReceitaFormModal } from '../components/ReceitaFormModal';
import {
  ProdutoPickerModal,
  ReceitaItemModal,
} from '../components/ReceitaItemModal';
import { ReceitaList } from '../components/ReceitaList';
import { useReceitas } from '../hooks/useReceitas';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  border: '#F1E7EA',
};

export default function ReceitasScreen() {
  const navigation = useNavigation<any>();
  const receitas = useReceitas();

  useFocusEffect(
    useCallback(() => {
      receitas.carregar().catch((error) => {
        Alert.alert(
          'Erro',
          receitas.mensagemErro(
            error,
            'Não foi possível carregar as receitas.'
          )
        );
      });
    }, [
      receitas.carregar,
      receitas.mensagemErro,
    ])
  );

  const executar = async (
    acao: () => Promise<void> | void,
    fallback: string
  ) => {
    try {
      await acao();
    } catch (error) {
      Alert.alert(
        'Erro',
        receitas.mensagemErro(
          error,
          fallback
        )
      );
    }
  };

  const excluir = () => {
    if (!receitas.detalhada) {
      return;
    }

    Alert.alert(
      'Excluir receita',
      `Deseja realmente excluir "${receitas.detalhada.nome}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            executar(
              receitas.excluir,
              'Não foi possível excluir a receita.'
            ),
        },
      ]
    );
  };

  const obterIconeOrdenacao = (
    campo: 'nome' | 'rendimento'
  ) => {
    if (receitas.ordenarPor !== campo) {
      return 'swap-vertical-outline';
    }

    return receitas.direcao === 'ASC'
      ? 'chevron-up'
      : 'chevron-down';
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'left',
        'right',
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
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
                name="restaurant-outline"
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.headerTitle}>
                Receitas
              </Text>

              <Text style={styles.headerSubtitle}>
                Fichas técnicas e ingredientes
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
            placeholder="Buscar por nome, rendimento ou ID"
            placeholderTextColor="#96949A"
            value={receitas.busca}
            onChangeText={receitas.setBusca}
          />

          {receitas.busca.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() =>
                receitas.setBusca('')
              }
              activeOpacity={0.75}
            >
              <Ionicons
                name="close-circle"
                size={21}
                color="#99969D"
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={receitas.abrirCadastro}
          activeOpacity={0.82}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text
            style={styles.primaryButtonText}
          >
            Nova receita
          </Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          <TouchableOpacity
            style={styles.nameHeader}
            onPress={() =>
              receitas.ordenar('nome')
            }
            activeOpacity={0.7}
          >
            <Text
              style={styles.tableHeaderText}
            >
              RECEITA
            </Text>

            <Ionicons
              name={obterIconeOrdenacao(
                'nome'
              )}
              size={14}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.yieldHeader}
            onPress={() =>
              receitas.ordenar(
                'rendimento'
              )
            }
            activeOpacity={0.7}
          >
            <Text
              style={styles.tableHeaderText}
            >
              RENDIMENTO
            </Text>

            <Ionicons
              name={obterIconeOrdenacao(
                'rendimento'
              )}
              size={14}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <ReceitaList
          receitas={receitas.receitas}
          onPress={(id) =>
            executar(
              () =>
                receitas.abrirDetalhes(id),
              'Não foi possível abrir os detalhes da receita.'
            )
          }
        />

        <ReceitaDetailsModal
          visible={receitas.modalDetalhes}
          receita={receitas.detalhada}
          onEdit={receitas.abrirEdicao}
          onDelete={excluir}
          onClose={() =>
            receitas.setModalDetalhes(
              false
            )
          }
        />

        <ReceitaFormModal
          visible={
            receitas.modalFormulario
          }
          modo={receitas.modo}
          form={receitas.form}
          onChange={(campos) =>
            receitas.setForm(
              (atual) => ({
                ...atual,
                ...campos,
              })
            )
          }
          onAdd={() =>
            executar(
              receitas.abrirNovoItem,
              'Não foi possível carregar os produtos.'
            )
          }
          onEditItem={(item, indice) =>
            executar(
              () =>
                receitas.abrirEditarItem(
                  item,
                  indice
                ),
              'Não foi possível carregar o produto.'
            )
          }
          onRemove={receitas.removerItem}
          onSave={() =>
            executar(
              receitas.salvar,
              'Não foi possível salvar a receita.'
            )
          }
          onClose={() =>
            receitas.setModalFormulario(
              false
            )
          }
        />

        <ReceitaItemModal
          visible={receitas.modalItem}
          produto={
            receitas.produtoSelecionado
          }
          quantidade={receitas.quantidade}
          unidade={receitas.unidade}
          onQuantidade={
            receitas.setQuantidade
          }
          onUnidade={receitas.setUnidade}
          onOpenProducts={() =>
            executar(
              receitas.abrirProdutos,
              'Não foi possível carregar os produtos.'
            )
          }
          onSave={() =>
            executar(
              receitas.salvarItem,
              'Não foi possível salvar o item.'
            )
          }
          onClose={receitas.fecharItem}
        />

        <ProdutoPickerModal
          visible={receitas.modalProdutos}
          produtos={receitas.produtos}
          busca={receitas.buscaProduto}
          onBusca={
            receitas.setBuscaProduto
          }
          onScan={() =>
            receitas.setScanner(true)
          }
          onSelect={
            receitas.selecionarProduto
          }
          onClose={() =>
            receitas.setModalProdutos(
              false
            )
          }
        />

        <BarcodeScannerModal
          visible={receitas.scanner}
          onClose={() =>
            receitas.setScanner(false)
          }
          onCodeScanned={
            receitas.receberCodigo
          }
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },

  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
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
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  clearButton: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    gap: 8,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.23,
    shadowRadius: 10,
    elevation: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  tableHeader: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD5E0',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  nameHeader: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  yieldHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },

  tableHeaderText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },
});
