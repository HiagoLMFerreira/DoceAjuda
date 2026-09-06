import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Cliente } from '../../domain/models/Cliente';

type Props = {
  visible: boolean;
  cliente: Cliente | null;
  alterandoStatus: boolean;
  onEdit: (cliente: Cliente) => void;
  onToggleStatus: (cliente: Cliente) => void;
  onClose: () => void;
};

export function ClienteDetailsModal({
  visible,
  cliente,
  alterandoStatus,
  onEdit,
  onToggleStatus,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailsModalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.headerIcon}>
              <Ionicons name="person-outline" size={22} color="#FF3B73" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.modalTitle}>Dados do cliente</Text>
              <Text style={styles.modalSubtitle}>
                Informações e histórico de compras
              </Text>
            </View>
            <TouchableOpacity
              style={styles.headerCloseButton}
              onPress={onClose}
              disabled={alterandoStatus}
            >
              <Ionicons name="close" size={22} color="#FF3B73" />
            </TouchableOpacity>
          </View>

          {cliente && (
            <>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.heroCard}>
                  <View style={styles.heroIcon}>
                    <Ionicons
                      name="person-outline"
                      size={28}
                      color="#FF3B73"
                    />
                  </View>
                  <View style={styles.heroText}>
                    <Text style={styles.clientName}>{cliente.nome}</Text>
                    <Text style={styles.clientId}>Cliente #{cliente.id}</Text>
                  </View>
                </View>

                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelArea}>
                      <Ionicons name="call-outline" size={18} color="#FF3B73" />
                      <Text style={styles.detailLabel}>Telefone</Text>
                    </View>
                    <Text style={styles.detailValue}>
                      {cliente.telefone?.trim() ? cliente.telefone : '-'}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelArea}>
                      <Ionicons name="location-outline" size={18} color="#FF3B73" />
                      <Text style={styles.detailLabel}>Endereço</Text>
                    </View>
                    <Text style={[styles.detailValue, styles.detailValueLong]}>
                      {cliente.endereco?.trim() ? cliente.endereco : '-'}
                    </Text>
                  </View>

                  <View style={styles.detailLine} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailLabelArea}>
                      <Ionicons name="bag-handle-outline" size={18} color="#FF3B73" />
                      <Text style={styles.detailLabel}>Compras</Text>
                    </View>
                    <Text style={[styles.detailValue, styles.purchaseValue]}>
                      R$ {cliente.total_compras.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.detailButton, styles.editButton]}
                  onPress={() => onEdit(cliente)}
                  disabled={alterandoStatus}
                >
                  <Ionicons name="create-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.detailButton,
                    cliente.ativo === 1 ? styles.inactivateButton : styles.reactivateButton,
                  ]}
                  onPress={() => onToggleStatus(cliente)}
                  disabled={alterandoStatus}
                >
                  {alterandoStatus ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name={cliente.ativo === 1 ? 'pause-circle-outline' : 'refresh-circle-outline'}
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text style={styles.buttonText}>
                        {cliente.ativo === 1 ? 'Inativar' : 'Reativar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.fullButton, styles.closeButton]}
                onPress={onClose}
                disabled={alterandoStatus}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
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
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 18,
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
  headerCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginLeft: 8,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  heroCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 12,
  },
  heroText: {
    flex: 1,
  },
  clientName: {
    color: '#242329',
    fontSize: 17,
    fontWeight: '900',
  },
  clientId: {
    color: '#737178',
    fontSize: 11,
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1E7EA',
  },
  detailRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  detailLabelArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#737178',
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    color: '#242329',
    textAlign: 'right',
  },
  detailValueLong: {
    lineHeight: 18,
  },
  purchaseValue: {
    color: '#FF3B73',
    fontSize: 14,
  },
  detailLine: {
    height: 1,
    backgroundColor: '#F6EDF0',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  detailButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    gap: 7,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#FF3B73',
  },
  inactivateButton: {
    backgroundColor: '#D93C56',
  },
  reactivateButton: {
    backgroundColor: '#2D9449',
  },
  fullButton: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCCFD4',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  closeButtonText: {
    color: '#242329',
    fontWeight: '900',
    fontSize: 13,
  },
});
