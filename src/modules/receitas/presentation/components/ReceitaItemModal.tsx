import React from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  ProdutoParaReceita,
} from '../../domain/models/ProdutoParaReceita';
import {
  UNIDADES_RECEITA,
  type UnidadeReceita,
} from '../../domain/models/Receita';
import {
  nomeProduto,
} from '../hooks/useReceitas';

type ReceitaItemModalProps = {
  visible: boolean;
  produto: ProdutoParaReceita | null;
  quantidade: string;
  unidade: UnidadeReceita;
  onQuantidade: (valor: string) => void;
  onUnidade: (
    unidade: UnidadeReceita
  ) => void;
  onOpenProducts: () => void;
  onSave: () => void;
  onClose: () => void;
};

export function ReceitaItemModal({
  visible,
  produto,
  quantidade,
  unidade,
  onQuantidade,
  onUnidade,
  onOpenProducts,
  onSave,
  onClose,
}: ReceitaItemModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          'top',
          'right',
          'bottom',
          'left',
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View style={styles.overlay}>
            <View style={styles.itemSheet}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Ionicons
                    name="basket-outline"
                    size={24}
                    color="#FF3B73"
                  />
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    Ingrediente
                  </Text>

                  <Text style={styles.subtitle}>
                    Selecione o produto e a quantidade
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color="#737178"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.formContent}>
                <Text style={styles.label}>
                  Produto
                </Text>

                <TouchableOpacity
                  style={styles.select}
                  onPress={onOpenProducts}
                  activeOpacity={0.78}
                >
                  <View style={styles.selectIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color="#FF3B73"
                    />
                  </View>

                  <Text
                    style={[
                      styles.selectText,
                      !produto &&
                        styles.placeholderText,
                    ]}
                    numberOfLines={2}
                  >
                    {produto
                      ? nomeProduto(produto)
                      : 'Selecionar produto'}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#FF3B73"
                  />
                </TouchableOpacity>

                <Text style={styles.label}>
                  Quantidade usada
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calculator-outline"
                    size={20}
                    color="#FF3B73"
                  />

                  <TextInput
                    style={styles.input}
                    value={quantidade}
                    onChangeText={onQuantidade}
                    keyboardType="decimal-pad"
                    placeholder="Ex.: 250"
                    placeholderTextColor="#9A979E"
                  />
                </View>

                <Text style={styles.label}>
                  Unidade
                </Text>

                <View style={styles.units}>
                  {UNIDADES_RECEITA.map(
                    (item) => {
                      const ativa =
                        unidade === item;

                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.unitChip,
                            ativa &&
                              styles.unitChipActive,
                          ]}
                          onPress={() =>
                            onUnidade(item)
                          }
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.unitChipText,
                              ativa &&
                                styles.unitChipTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    styles.cancelButton,
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.cancelButtonText}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    styles.saveButton,
                  ]}
                  onPress={onSave}
                  activeOpacity={0.82}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.saveButtonText}
                  >
                    Salvar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

type ProdutoPickerModalProps = {
  visible: boolean;
  produtos: ProdutoParaReceita[];
  busca: string;
  onBusca: (valor: string) => void;
  onScan: () => void;
  onSelect: (
    produto: ProdutoParaReceita
  ) => void;
  onClose: () => void;
};

export function ProdutoPickerModal({
  visible,
  produtos,
  busca,
  onBusca,
  onScan,
  onSelect,
  onClose,
}: ProdutoPickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          'top',
          'right',
          'bottom',
          'left',
        ]}
      >
        <View style={styles.overlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color="#FF3B73"
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Selecionar produto
                </Text>

                <Text style={styles.subtitle}>
                  Escolha um item do estoque
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#737178"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={21}
                color="#FF3B73"
              />

              <TextInput
                style={styles.searchInput}
                value={busca}
                onChangeText={onBusca}
                placeholder="Nome, ID ou código de barras"
                placeholderTextColor="#9A979E"
              />

              {busca.length > 0 && (
                <TouchableOpacity
                  style={styles.searchAction}
                  onPress={() => onBusca('')}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="close-circle"
                    size={21}
                    color="#99969D"
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.scannerButton}
                onPress={onScan}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="barcode-outline"
                  size={23}
                  color="#FF3B73"
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={produtos}
              keyExtractor={(item) =>
                String(item.id)
              }
              style={styles.productList}
              contentContainerStyle={
                styles.productListContent
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyProducts}>
                  <Ionicons
                    name="cube-outline"
                    size={34}
                    color="#FF3B73"
                  />

                  <Text
                    style={styles.emptyProductsTitle}
                  >
                    Nenhum produto encontrado
                  </Text>

                  <Text
                    style={styles.emptyProductsText}
                  >
                    Altere a busca ou leia o código de barras.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.productOption}
                  onPress={() =>
                    onSelect(item)
                  }
                  activeOpacity={0.78}
                >
                  <View
                    style={styles.productOptionIcon}
                  >
                    <Ionicons
                      name="cube-outline"
                      size={21}
                      color="#FF3B73"
                    />
                  </View>

                  <View
                    style={styles.productOptionContent}
                  >
                    <Text
                      style={styles.productOptionName}
                      numberOfLines={2}
                    >
                      {nomeProduto(item)}
                    </Text>

                    <Text
                      style={styles.productOptionStock}
                    >
                      Estoque: {item.quantidade}{' '}
                      {item.unidade_medida}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#FF3B73"
                  />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      'rgba(24, 16, 20, 0.48)',
  },

  keyboardContainer: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(24, 16, 20, 0.48)',
  },

  itemSheet: {
    width: '100%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  pickerSheet: {
    width: '100%',
    height: '88%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  handle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8DDE1',
    marginTop: 10,
  },

  header: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
  },

  subtitle: {
    color: '#737178',
    fontSize: 12,
    marginTop: 3,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F1F3',
    marginLeft: 10,
  },

  formContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
  },

  label: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },

  select: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 18,
  },

  selectIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  selectText: {
    flex: 1,
    color: '#242329',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },

  placeholderText: {
    color: '#9A979E',
    fontWeight: '500',
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    minHeight: 54,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
  },

  units: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  unitChip: {
    minWidth: 62,
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 13,
    paddingHorizontal: 12,
  },

  unitChipActive: {
    backgroundColor: '#FF3B73',
    borderColor: '#FF3B73',
  },

  unitChipText: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '800',
  },

  unitChipTextActive: {
    color: '#FFFFFF',
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1E7EA',
  },

  footerButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },

  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
  },

  saveButton: {
    backgroundColor: '#FF3B73',
  },

  cancelButtonText: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '800',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  searchContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 8,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    minHeight: 52,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
  },

  searchAction: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scannerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
  },

  productList: {
    flex: 1,
  },

  productListContent: {
    paddingHorizontal: 18,
    paddingBottom: 22,
  },

  productOption: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 15,
    paddingHorizontal: 12,
    marginBottom: 9,
  },

  productOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  productOptionContent: {
    flex: 1,
  },

  productOptionName: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
  },

  productOptionStock: {
    color: '#737178',
    fontSize: 11,
    marginTop: 4,
  },

  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },

  emptyProductsTitle: {
    color: '#242329',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 12,
  },

  emptyProductsText: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 5,
  },
});
