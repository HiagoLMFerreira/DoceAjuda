import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.formModalContent}>
          <Text style={styles.modalTitle}>
            {clienteEditando ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
          </Text>

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
                <Text style={styles.buttonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
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
  formModalContent: {
    width: '85%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#1a1a1a',
  },
  disabledInput: {
    backgroundColor: '#eaeaea',
    color: '#777',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  saveButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
