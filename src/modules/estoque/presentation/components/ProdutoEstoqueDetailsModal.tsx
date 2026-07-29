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
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  formatCurrency,
  formatDecimal,
} from '../../../../core/formatters';
import type {
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import {
  obterNomeProduto,
  obterRotuloUnidade,
} from '../hooks/useEstoque';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  border: '#F1E7EA',
  danger: '#D93C56',
  dangerSoft: '#FFF0F3',
};

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
  const zerado =
    Number(produto?.quantidade ?? 0) <= 0;

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
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {produto && (
              <>
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={25}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={styles.headerText}>
                    <Text style={styles.title}>
                      Dados do produto
                    </Text>

                    <Text
                      style={styles.subtitle}
                      numberOfLines={1}
                    >
                      {obterNomeProduto(produto)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    disabled={excluindo}
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
                >
                  <View style={styles.productHero}>
                    <View style={styles.productIcon}>
                      <Ionicons
                        name="cube"
                        size={32}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={styles.productHeroText}>
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {obterNomeProduto(produto)}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          zerado
                            ? styles.statusBadgeDanger
                            : styles.statusBadgeSuccess,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            zerado
                              ? styles.statusTextDanger
                              : styles.statusTextSuccess,
                          ]}
                        >
                          {zerado
                            ? 'Sem estoque'
                            : 'Em estoque'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailsCard}>
                    <Detail
                      icon="key-outline"
                      label="Identificador"
                      value={String(produto.id)}
                    />

                    <Detail
                      icon="barcode-outline"
                      label="Código de barras"
                      value={
                        produto.codigo_barras ||
                        'Não informado'
                      }
                    />

                    <Detail
                      icon="scale-outline"
                      label="Unidade"
                      value={obterRotuloUnidade(
                        produto.unidade_medida
                      )}
                    />

                    <Detail
                      icon="layers-outline"
                      label="Quantidade"
                      value={`${formatDecimal(
                        produto.quantidade
                      )} ${obterRotuloUnidade(
                        produto.unidade_medida
                      )}`}
                      danger={zerado}
                    />

                    <Detail
                      icon="receipt-outline"
                      label="Última entrada"
                      value={formatCurrency(
                        produto.preco_ultima_entrada
                      )}
                    />

                    <Detail
                      icon="cash-outline"
                      label="Preço médio"
                      value={formatCurrency(
                        produto.preco_medio
                      )}
                      last
                    />
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.footerButton,
                      styles.secondaryButton,
                    ]}
                    onPress={onEdit}
                    disabled={excluindo}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={COLORS.primary}
                    />

                    <Text
                      style={styles.secondaryButtonText}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.footerButton,
                      styles.deleteButton,
                    ]}
                    onPress={onDelete}
                    disabled={excluindo}
                    activeOpacity={0.8}
                  >
                    {excluindo ? (
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}

                    <Text
                      style={styles.deleteButtonText}
                    >
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Detail({
  icon,
  label,
  value,
  danger = false,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.detailRowLast,
      ]}
    >
      <View style={styles.detailLabelArea}>
        <View style={styles.detailIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.detailValue,
          danger && styles.detailValueDanger,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(24, 16, 20, 0.48)',
  },

  sheet: {
    width: '100%',
    maxHeight: '90%',
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

  productHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },

  productIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 13,
  },

  productHeroText: {
    flex: 1,
    alignItems: 'flex-start',
  },

  productName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 7,
  },

  statusBadgeSuccess: {
    backgroundColor: '#EDF8EE',
  },

  statusBadgeDanger: {
    backgroundColor: COLORS.dangerSoft,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },

  statusTextSuccess: {
    color: '#2D9449',
  },

  statusTextDanger: {
    color: COLORS.danger,
  },

  detailsCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  detailRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6EDF0',
    paddingVertical: 11,
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailLabelArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },

  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  detailValue: {
    flex: 1.2,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  detailValueDanger: {
    color: COLORS.danger,
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
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#FFD1DD',
  },

  deleteButton: {
    backgroundColor: COLORS.danger,
  },

  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '900',
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
