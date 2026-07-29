import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
  FormularioReceita,
  ItemReceitaFormulario,
  ModoFormularioReceita,
} from '../../domain/models/Receita';

type Props = {
  visible: boolean;
  modo: ModoFormularioReceita;
  form: FormularioReceita;
  onChange: (
    campos: Partial<FormularioReceita>
  ) => void;
  onAdd: () => void;
  onEditItem: (
    item: ItemReceitaFormulario,
    indice: number
  ) => void;
  onRemove: (indice: number) => void;
  onSave: () => void;
  onClose: () => void;
};

export function ReceitaFormModal({
  visible,
  modo,
  form,
  onChange,
  onAdd,
  onEditItem,
  onRemove,
  onSave,
  onClose,
}: Props) {
  const cadastro =
    modo === 'cadastro';

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
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <Ionicons
                    name={
                      cadastro
                        ? 'add-circle-outline'
                        : 'create-outline'
                    }
                    size={25}
                    color="#FF3B73"
                  />
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    {cadastro
                      ? 'Nova receita'
                      : 'Editar receita'}
                  </Text>

                  <Text style={styles.subtitle}>
                    Informe os dados e ingredientes
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

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={
                  styles.scrollContent
                }
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Nome da receita
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="restaurant-outline"
                      size={21}
                      color="#FF3B73"
                    />

                    <TextInput
                      style={styles.input}
                      value={form.nome}
                      onChangeText={(valor) =>
                        onChange({
                          nome: valor,
                        })
                      }
                      placeholder="Ex.: Brigadeiro tradicional"
                      placeholderTextColor="#9A979E"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Rendimento
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="layers-outline"
                      size={21}
                      color="#FF3B73"
                    />

                    <TextInput
                      style={styles.input}
                      value={form.rendimento}
                      onChangeText={(valor) =>
                        onChange({
                          rendimento: valor,
                        })
                      }
                      placeholder="Ex.: 20 unidades"
                      placeholderTextColor="#9A979E"
                    />
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Ingredientes
                    </Text>

                    <Text style={styles.sectionSubtitle}>
                      Produtos utilizados na receita
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={onAdd}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.addButtonText}
                    >
                      Adicionar
                    </Text>
                  </TouchableOpacity>
                </View>

                {form.itens.length === 0 ? (
                  <View style={styles.emptyIngredients}>
                    <Ionicons
                      name="basket-outline"
                      size={29}
                      color="#FF3B73"
                    />

                    <Text
                      style={styles.emptyIngredientsTitle}
                    >
                      Nenhum ingrediente adicionado
                    </Text>

                    <Text
                      style={styles.emptyIngredientsText}
                    >
                      Toque em Adicionar para selecionar um produto.
                    </Text>
                  </View>
                ) : (
                  form.itens.map(
                    (item, indice) => (
                      <View
                        key={`${item.produto_id}-${indice}`}
                        style={styles.ingredientCard}
                      >
                        <View
                          style={styles.ingredientIcon}
                        >
                          <Ionicons
                            name="cube-outline"
                            size={20}
                            color="#FF3B73"
                          />
                        </View>

                        <View
                          style={styles.ingredientContent}
                        >
                          <Text
                            style={styles.ingredientName}
                            numberOfLines={2}
                          >
                            {item.produto_nome}
                          </Text>

                          <Text
                            style={styles.ingredientQuantity}
                          >
                            {item.quantidade_usada}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.itemAction}
                          onPress={() =>
                            onEditItem(
                              item,
                              indice
                            )
                          }
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color="#FF3B73"
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.itemAction,
                            styles.deleteAction,
                          ]}
                          onPress={() =>
                            onRemove(indice)
                          }
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#D93C56"
                          />
                        </TouchableOpacity>
                      </View>
                    )
                  )
                )}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Modo de preparo
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      styles.textAreaContainer,
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={21}
                      color="#FF3B73"
                      style={styles.textAreaIcon}
                    />

                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                      ]}
                      value={form.modoPreparo}
                      onChangeText={(valor) =>
                        onChange({
                          modoPreparo: valor,
                        })
                      }
                      multiline
                      placeholder="Descreva o preparo da receita (opcional)"
                      placeholderTextColor="#9A979E"
                    />
                  </View>
                </View>
              </ScrollView>

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

  sheet: {
    width: '100%',
    maxHeight: '94%',
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

  scroll: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  label: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
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
  },

  input: {
    flex: 1,
    minHeight: 54,
    color: '#242329',
    fontSize: 14,
    fontWeight: '500',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },

  sectionTitle: {
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: '#737178',
    fontSize: 11,
    marginTop: 3,
  },

  addButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FF3B73',
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  emptyIngredients: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },

  emptyIngredientsTitle: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 9,
  },

  emptyIngredientsText: {
    color: '#737178',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
  },

  ingredientCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 15,
    padding: 11,
    marginBottom: 9,
  },

  ingredientIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  ingredientContent: {
    flex: 1,
  },

  ingredientName: {
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
  },

  ingredientQuantity: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  itemAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginLeft: 6,
  },

  deleteAction: {
    backgroundColor: '#FFF0F3',
  },

  textAreaContainer: {
    minHeight: 120,
    alignItems: 'flex-start',
  },

  textAreaIcon: {
    marginTop: 17,
  },

  textArea: {
    minHeight: 118,
    paddingTop: 16,
    textAlignVertical: 'top',
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
    shadowColor: '#FF3B73',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 4,
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
});
