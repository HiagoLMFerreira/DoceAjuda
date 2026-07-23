import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDecimal } from '../../../../core/formatters';
import type { ProdutoEstoque } from '../../domain/models/ProdutoEstoque';
import {
  obterNomeProduto,
  obterRotuloUnidade,
} from '../hooks/useEstoque';

type Props = {
  visible: boolean;
  produto: ProdutoEstoque | null;
  excluindo: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ProdutoEstoqueDetailsModal({
  visible,
  produto,
  excluindo,
  onEdit,
  onDelete,
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
          {produto && (
            <>
              <View style={styles.modalTitleRow}>
                <Ionicons name="cube-outline" size={22} color="#1a1a1a" />
                <Text style={styles.detailsModalTitle}>
                  DADOS DO PRODUTO
                </Text>
              </View>

              <View style={styles.detailsCard}>
                <Detail label="ID:" value={String(produto.id)} />
                <Detail label="Nome:" value={obterNomeProduto(produto)} />
                <Detail label="Código:" value={produto.codigo_barras || '-'} />
                <Detail
                  label="Unidade:"
                  value={obterRotuloUnidade(produto.unidade_medida)}
                />
                <Detail
                  label="Quantidade:"
                  value={`${formatDecimal(produto.quantidade)} ${obterRotuloUnidade(produto.unidade_medida)}`}
                  danger={produto.quantidade <= 0}
                />
                <Detail
                  label="Última entrada:"
                  value={formatCurrency(produto.preco_ultima_entrada)}
                />
                <Detail
                  label="Preço médio:"
                  value={formatCurrency(produto.preco_medio)}
                  last
                />
              </View>

              <View style={styles.detailsButtonsRow}>
                <TouchableOpacity
                  style={[styles.detailsButton, styles.editButton]}
                  onPress={onEdit}
                  disabled={excluindo}
                >
                  <Ionicons name="create-outline" size={19} color="#fff" />
                  <Text style={styles.detailsButtonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.detailsButton, styles.deleteButton]}
                  onPress={onDelete}
                  disabled={excluindo}
                >
                  {excluindo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="trash-outline" size={19} color="#fff" />
                  )}
                  <Text style={styles.detailsButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.detailsCloseButton, styles.cancelButton]}
                onPress={onClose}
                disabled={excluindo}
              >
                <Ionicons name="close-circle-outline" size={19} color="#fff" />
                <Text style={styles.detailsButtonText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Detail({
  label,
  value,
  danger,
  last,
}: {
  label: string;
  value: string;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, danger && styles.textoZerado]}>
        {value}
      </Text>
    </View>
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
    width: '88%',
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
  detailsModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: {
    flex: 1,
    color: '#333',
    fontSize: 12,
    fontWeight: '800',
  },
  detailValue: {
    flex: 1.5,
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  textoZerado: { color: '#b00020' },
  detailsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailsButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButton: { backgroundColor: '#111' },
  deleteButton: { backgroundColor: '#c90000' },
  detailsCloseButton: {
    minHeight: 44,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelButton: { backgroundColor: '#aaa' },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
