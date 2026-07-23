import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Cliente } from '../../domain/models/Cliente';

type Props = {
  visible: boolean;
  cliente: Cliente | null;
  excluindo: boolean;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onClose: () => void;
};

export function ClienteDetailsModal({
  visible,
  cliente,
  excluindo,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModalContent}>
          <Text style={styles.modalTitle}>DADOS DO CLIENTE</Text>

          {cliente && (
            <>
              <View style={styles.detailsBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID:</Text>
                  <Text style={styles.detailValue}>{cliente.id}</Text>
                </View>

                <View style={styles.detailLine} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nome:</Text>
                  <Text style={styles.detailValue}>{cliente.nome}</Text>
                </View>

                <View style={styles.detailLine} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Telefone:</Text>
                  <Text style={styles.detailValue}>
                    {cliente.telefone?.trim() ? cliente.telefone : '-'}
                  </Text>
                </View>

                <View style={styles.detailLine} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Endereço:</Text>
                  <Text style={[styles.detailValue, styles.detailValueLong]}>
                    {cliente.endereco?.trim() ? cliente.endereco : '-'}
                  </Text>
                </View>

                <View style={styles.detailLine} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Compras:</Text>
                  <Text style={styles.detailValue}>
                    R$ {cliente.total_compras.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailButton, styles.editButton]}
                  onPress={() => onEdit(cliente)}
                  disabled={excluindo}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailButton, styles.deleteButton]}
                  onPress={() => onDelete(cliente)}
                  disabled={excluindo}
                >
                  {excluindo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Excluir</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.fullButton, styles.closeButton]}
                onPress={onClose}
                disabled={excluindo}
              >
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
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
  detailsModalContent: {
    width: '85%',
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
  detailsBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  detailValue: {
    flex: 1.4,
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'right',
  },
  detailValueLong: {
    fontSize: 12,
  },
  detailLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#c90000',
  },
  fullButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
