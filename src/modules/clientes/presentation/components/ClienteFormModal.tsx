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
import type { Cliente } from '../../domain/models/Cliente';

type FormularioCliente = {
  nome: string;
  telefone: string;
  endereco: string;
};

type Props = {
  visible: boolean;
  clienteEditando: Cliente | null;
  formulario: FormularioCliente;
  salvando: boolean;
  onChange: (
    campo: keyof FormularioCliente,
    valor: string
  ) => void;
  onClose: () => void;
  onSave: () => void;
};

export function ClienteFormModal({
  visible,
  clienteEditando,
  formulario,
  salvando,
  onChange,
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
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.formModalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="person-outline" size={22} color="#FF3B73" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.modalTitle}>
                {clienteEditando ? 'Editar cliente' : 'Novo cliente'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {clienteEditando
                  ? 'Atualize os dados do cadastro'
                  : 'Preencha os dados do novo contato'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={salvando}
            >
              <Ionicons name="close" size={22} color="#FF3B73" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

          {clienteEditando && (
            <>
              <Text style={styles.inputLabel}>ID:</Text>
              <TextInput
                style={[styles.formInput, styles.disabledInput]}
                value={String(clienteEditando.id)}
                editable={false}
              />
            </>
          )}

          <Text style={styles.inputLabel}>Nome:</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Digite o nome do cliente"
            placeholderTextColor="#888"
            value={formulario.nome}
            onChangeText={(valor) => onChange('nome', valor)}
            autoFocus
          />

          <Text style={styles.inputLabel}>Telefone:</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Digite o telefone"
            placeholderTextColor="#888"
            value={formulario.telefone}
            onChangeText={(valor) => onChange('telefone', valor)}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Endereço:</Text>
          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="Digite o endereço"
            placeholderTextColor="#888"
            value={formulario.endereco}
            onChangeText={(valor) => onChange('endereco', valor)}
            multiline
          />

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
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
    justifyContent: 'flex-end',
  },
  formModalContent: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#E8DDE1',
    marginTop: 9,
  },
  modalHeader: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7EA',
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#242329',
  },
  modalSubtitle: {
    color: '#737178',
    fontSize: 11,
    marginTop: 3,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginLeft: 8,
  },
  formContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#242329',
    marginBottom: 7,
    marginTop: 4,
  },
  formInput: {
    minHeight: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    color: '#242329',
  },
  disabledInput: {
    backgroundColor: '#F7F1F3',
    color: '#737178',
  },
  textArea: {
    minHeight: 92,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
  },
  saveButton: {
    backgroundColor: '#FF3B73',
    shadowColor: '#FF3B73',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#242329',
    fontWeight: '900',
    fontSize: 13,
  },
  saveButtonText: {
    color: '#FFFFFF',
  },
});
