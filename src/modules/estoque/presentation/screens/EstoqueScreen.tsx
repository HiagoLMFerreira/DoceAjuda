import React, {
  useCallback,
  useEffect,
} from 'react';
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

import AppBottomNavigation from '../../../../shared/components/AppBottomNavigation';
import BarcodeScannerModal from '../../../../shared/scanner/presentation/BarcodeScannerModal';
import { useAuth } from '../../../auth/presentation/useAuth';
import type {
  OrdenarProdutoEstoquePor,
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import { ProdutoEstoqueDetailsModal } from '../components/ProdutoEstoqueDetailsModal';
import { ProdutoEstoqueFormModal } from '../components/ProdutoEstoqueFormModal';
import { ProdutoEstoqueList } from '../components/ProdutoEstoqueList';
import {
  obterNomeProduto,
  useEstoque,
} from '../hooks/useEstoque';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  border: '#F1E7EA',
};

export default function EstoqueScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
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
    }, [
      estoque.carregar,
      estoque.mensagemErro,
    ])
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
  }, [
    estoque.busca,
    estoque.ordenarPor,
    estoque.direcao,
  ]);

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

  const confirmarExclusao = (
    produto: ProdutoEstoque
  ) => {
    Alert.alert(
      'Excluir produto',
      `Deseja realmente excluir "${obterNomeProduto(
        produto
      )}"?`,
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

  const confirmarLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível sair da conta.'
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
      onPress={() =>
        estoque.alternarOrdenacao(coluna)
      }
      activeOpacity={0.7}
    >
      <Text style={styles.headerCellText}>
        {titulo}
      </Text>

      {estoque.ordenarPor === coluna && (
        <Ionicons
          name={
            estoque.direcao === 'ASC'
              ? 'chevron-up'
              : 'chevron-down'
          }
          size={13}
          color={COLORS.primary}
        />
      )}
    </TouchableOpacity>
  );

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

          <View style={styles.headerTextArea}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View>
                <Text style={styles.headerTitle}>
                  Estoque
                </Text>

                <Text style={styles.headerSubtitle}>
                  Produtos, insumos e embalagens
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={21}
              color={COLORS.primary}
            />

            <TextInput
              style={styles.searchInput}
              placeholder="Nome, ID ou código de barras"
              placeholderTextColor="#96949A"
              value={estoque.busca}
              onChangeText={estoque.setBusca}
            />

            {estoque.busca.length > 0 && (
              <TouchableOpacity
                style={styles.inputIconButton}
                onPress={() =>
                  estoque.setBusca('')
                }
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#99969D"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.inputIconButton}
              onPress={() =>
                estoque.abrirScanner('busca')
              }
            >
              <Ionicons
                name="barcode-outline"
                size={24}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={estoque.abrirCadastro}
          activeOpacity={0.82}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            Novo produto
          </Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          {renderCabecalho(
            'NOME',
            'nome',
            styles.headerNome
          )}

          {renderCabecalho(
            'QTD',
            'quantidade',
            styles.headerQuantidade
          )}

          {renderCabecalho(
            'UNID.',
            'unidade_medida',
            styles.headerUnidade
          )}

          {renderCabecalho(
            'PREÇO',
            'preco_medio',
            styles.headerPreco
          )}
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
              confirmarExclusao(
                estoque.produtoSelecionado
              );
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
          onOpenScanner={() =>
            estoque.abrirScanner('formulario')
          }
          onClose={estoque.fecharFormulario}
          onSave={salvar}
        />

        <BarcodeScannerModal
          visible={estoque.scannerVisivel}
          onClose={estoque.fecharScanner}
          onCodeScanned={estoque.receberCodigo}
        />
      </View>

      <AppBottomNavigation
        activeItem="menu"
        onInicio={() =>
          navigation.navigate('Dashboard')
        }
        onVendas={() =>
          navigation.navigate('Vendas')
        }
        onMenu={() =>
          navigation.navigate('Menu')
        }
        onRelatorios={() =>
          navigation.navigate('Relatorios')
        }
        onSair={confirmarLogout}
      />
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

  headerTextArea: {
    flex: 1,
  },

  headerTitleRow: {
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

  searchRow: {
    marginBottom: 12,
  },

  searchInputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    gap: 9,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  inputIconButton: {
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
    backgroundColor: '#FFF0F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD5E0',
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  headerCellText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
  },

  headerNome: {
    flex: 2.1,
  },

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
