import React from 'react';
import {
  ActivityIndicator,
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

import {
  UNIDADES_MEDIDA_ESTOQUE,
  type FormularioProdutoEstoque,
  type ModoFormularioProduto,
  type ProdutoEstoque,
  type UnidadeMedidaEstoque,
} from '../../domain/models/ProdutoEstoque';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  placeholder: '#9A979E',
  border: '#F1E7EA',
  danger: '#D93C56',
};

const ROTULOS: Record<
  UnidadeMedidaEstoque,
  string
> = {
  un: 'un',
  kg: 'kg',
  g: 'g',
  l: 'L',
  ml: 'ml',
  caixa: 'caixa',
  pacote: 'pacote',
  duzia: 'dúzia',
};

type Props = {
  visible: boolean;
  modo: ModoFormularioProduto;
  produto: ProdutoEstoque | null;
  formulario: FormularioProdutoEstoque;
  salvando: boolean;
  onChange: (
    campo: keyof FormularioProdutoEstoque,
    valor: string
  ) => void;
  onOpenScanner: () => void;
  onClose: () => void;
  onSave: () => void;
};

export function ProdutoEstoqueFormModal({
  visible,
  modo,
  produto,
  formulario,
  salvando,
  onChange,
  onOpenScanner,
  onClose,
  onSave,
}: Props) {
  const cadastro = modo === 'cadastro';

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
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.title}>
                    {cadastro
                      ? 'Novo produto'
                      : 'Editar produto'}
                  </Text>

                  <Text style={styles.subtitle}>
                    {cadastro
                      ? 'Cadastre um novo item no estoque'
                      : 'Atualize os dados do produto'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={salvando}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={COLORS.textSecondary}
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
                {modo === 'edicao' && produto && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>
                      Identificador
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        styles.inputDisabled,
                      ]}
                    >
                      <Ionicons
                        name="key-outline"
                        size={20}
                        color={COLORS.textSecondary}
                      />

                      <TextInput
                        style={[
                          styles.input,
                          styles.disabledText,
                        ]}
                        value={String(produto.id)}
                        editable={false}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Nome do produto
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="cube-outline"
                      size={21}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Ex.: Leite condensado"
                      placeholderTextColor={
                        COLORS.placeholder
                      }
                      value={formulario.nome}
                      onChangeText={(valor) =>
                        onChange('nome', valor)
                      }
                      autoCapitalize="sentences"
                      editable={!salvando}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Código de barras
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="barcode-outline"
                      size={22}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Digite ou leia o código"
                      placeholderTextColor={
                        COLORS.placeholder
                      }
                      value={
                        formulario.codigoBarras
                      }
                      onChangeText={(valor) =>
                        onChange(
                          'codigoBarras',
                          valor
                        )
                      }
                      keyboardType="numeric"
                      editable={!salvando}
                    />

                    <TouchableOpacity
                      style={styles.scannerButton}
                      onPress={onOpenScanner}
                      disabled={salvando}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name="scan-outline"
                        size={22}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Quantidade mínima (opcional)
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={21}
                      color={COLORS.primary}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Ex.: 5"
                      placeholderTextColor={COLORS.placeholder}
                      value={formulario.quantidadeMinima}
                      onChangeText={(valor) => onChange('quantidadeMinima', valor)}
                      keyboardType="decimal-pad"
                      editable={!salvando}
                    />
                  </View>
                  <Text style={styles.fieldHint}>
                    Usada nos alertas e relatórios de estoque baixo.
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons
                      name="scale-outline"
                      size={18}
                      color={COLORS.primary}
                    />

                    <Text style={styles.label}>
                      Unidade de medida
                    </Text>
                  </View>

                  <View style={styles.unitGrid}>
                    {UNIDADES_MEDIDA_ESTOQUE.map(
                      (unidade) => {
                        const selecionada =
                          formulario.unidadeMedida ===
                          unidade;

                        return (
                          <TouchableOpacity
                            key={unidade}
                            style={[
                              styles.unitButton,
                              selecionada &&
                                styles.unitButtonSelected,
                            ]}
                            onPress={() =>
                              onChange(
                                'unidadeMedida',
                                unidade
                              )
                            }
                            disabled={salvando}
                            activeOpacity={0.75}
                          >
                            <Text
                              style={[
                                styles.unitButtonText,
                                selecionada &&
                                  styles.unitButtonTextSelected,
                              ]}
                            >
                              {ROTULOS[unidade]}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="information-circle-outline"
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text style={styles.infoText}>
                    {cadastro
                      ? 'O produto será criado com quantidade e preços zerados. As entradas serão registradas pelo módulo de Compras.'
                      : 'A quantidade e os preços são atualizados por compras, vendas e cancelamentos.'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    styles.secondaryButton,
                  ]}
                  onPress={onClose}
                  disabled={salvando}
                  activeOpacity={0.8}
                >
                  <Text
                    style={styles.secondaryButtonText}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    styles.primaryButton,
                    salvando &&
                      styles.buttonDisabled,
                  ]}
                  onPress={onSave}
                  disabled={salvando}
                  activeOpacity={0.82}
                >
                  {salvando ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={21}
                        color="#FFFFFF"
                      />

                      <Text
                        style={styles.primaryButtonText}
                      >
                        Salvar
                      </Text>
                    </>
                  )}
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
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
  },

  keyboardContainer: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
  },

  sheet: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: COLORS.background,
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
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },

  subtitle: {
    color: COLORS.textSecondary,
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
    paddingBottom: 22,
  },

  fieldGroup: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },

  label: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },

  fieldHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 10,
  },

  inputDisabled: {
    backgroundColor: '#F6F1F3',
  },

  input: {
    flex: 1,
    minHeight: 54,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  disabledText: {
    color: COLORS.textSecondary,
  },

  scannerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },

  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  unitButton: {
    minWidth: 68,
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  unitButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  unitButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },

  unitButtonTextSelected: {
    color: '#FFFFFF',
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 16,
    padding: 14,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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

  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DCCFD4',
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 4,
  },

  secondaryButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
