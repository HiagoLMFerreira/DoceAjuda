import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  UNIDADES_MEDIDA_ESTOQUE,
  type FormularioProdutoEstoque,
  type ModoFormularioProduto,
  type ProdutoEstoque,
  type UnidadeMedidaEstoque,
} from '../../domain/models/ProdutoEstoque';

const ROTULOS: Record<UnidadeMedidaEstoque, string> = {
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalTitleRow}>
            <Ionicons
              name={modo === 'cadastro' ? 'add-circle-outline' : 'create-outline'}
              size={22}
              color="#1a1a1a"
            />
            <Text style={styles.modalTitle}>
              {modo === 'cadastro' ? 'NOVO PRODUTO' : 'EDITAR PRODUTO'}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formScrollContent}
          >
            {modo === 'edicao' && produto && (
              <>
                <Text style={styles.inputLabel}>ID:</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={String(produto.id)}
                  editable={false}
                />
              </>
            )}

            <Text style={styles.inputLabel}>Nome do produto:</Text>
            <View style={styles.inputComIconeContainer}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <TextInput
                style={styles.inputComIcone}
                placeholder="Digite o nome do produto"
                placeholderTextColor="#888"
                value={formulario.nome}
                onChangeText={(valor) => onChange('nome', valor)}
                autoCapitalize="sentences"
              />
            </View>

            <Text style={styles.inputLabel}>Código de barras:</Text>
            <View style={styles.inputComIconeContainer}>
              <TextInput
                style={styles.inputComIcone}
                placeholder="Digite ou leia o código de barras"
                placeholderTextColor="#888"
                value={formulario.codigoBarras}
                onChangeText={(valor) => onChange('codigoBarras', valor)}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.inputIconButton}
                onPress={onOpenScanner}
              >
                <Ionicons name="barcode-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.labelComIcone}>
              <Ionicons name="scale-outline" size={17} color="#1a1a1a" />
              <Text style={styles.inputLabelSemMargem}>
                Unidade de medida:
              </Text>
            </View>

            <View style={styles.unidadeContainer}>
              {UNIDADES_MEDIDA_ESTOQUE.map((unidade) => {
                const selecionada =
                  formulario.unidadeMedida === unidade;

                return (
                  <TouchableOpacity
                    key={unidade}
                    style={[
                      styles.unidadeButton,
                      selecionada && styles.unidadeButtonSelected,
                    ]}
                    onPress={() =>
                      onChange('unidadeMedida', unidade)
                    }
                  >
                    <Text
                      style={[
                        styles.unidadeButtonText,
                        selecionada &&
                          styles.unidadeButtonTextSelected,
                      ]}
                    >
                      {ROTULOS[unidade]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#444"
              />
              <Text style={styles.infoText}>
                {modo === 'cadastro'
                  ? 'O produto será criado com quantidade e preços zerados. As entradas serão registradas pelo módulo de Compras.'
                  : 'A quantidade e os preços são atualizados por compras, vendas e cancelamentos.'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
                disabled={salvando}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={onSave}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
                    <Text style={styles.buttonText}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  formScrollContent: { paddingBottom: 2 },
  inputLabel: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  inputLabelSemMargem: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 14,
    color: '#111',
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#777',
  },
  inputComIconeContainer: {
    minHeight: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 14,
  },
  inputComIcone: {
    flex: 1,
    color: '#111',
    paddingHorizontal: 8,
  },
  inputIconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  unidadeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },
  unidadeButton: {
    minWidth: 55,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  unidadeButtonSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  unidadeButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '800',
  },
  unidadeButtonTextSelected: { color: '#fff' },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ededed',
    borderRadius: 9,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    color: '#444',
    fontSize: 12,
    lineHeight: 17,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButton: { backgroundColor: '#aaa' },
  saveButton: { backgroundColor: '#111' },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
