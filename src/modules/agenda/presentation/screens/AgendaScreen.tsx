import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../../app/navigation/types';
import {
  formatCurrency,
  formatDateForDatabase,
  formatDateOnlyBR,
  formatDecimal,
} from '../../../../core/formatters';
import MonthCalendar from '../../../../shared/components/MonthCalendar';
import { agendaPdfService } from '../../di/agendaContainer';
import type {
  AgendaEncomenda,
  AgendaEncomendaDetalhada,
} from '../../domain/models/Agenda';
import { useAgenda } from '../hooks/useAgenda';

type Props = NativeStackScreenProps<RootStackParamList, 'Agenda'>;
type ViewMode = 'LIST' | 'CALENDAR';

const COLORS = {
  primary: '#FF3B73',
  primarySoft: '#FFF0F4',
  background: '#FFFDFE',
  surface: '#FFFFFF',
  textPrimary: '#242329',
  textSecondary: '#737178',
  textMuted: '#9B98A0',
  border: '#F1E7EA',
  success: '#2D9449',
};

function OrderCard({
  item,
  onPress,
}: {
  item: AgendaEncomenda;
  onPress: () => void;
}) {
  const isSale = item.tipo === 'VENDA';

  return (
    <Pressable style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderDateBox}>
        <Text style={styles.orderDay}>{item.dataEncomenda.slice(-2)}</Text>
        <Text style={styles.orderMonth}>
          {formatDateOnlyBR(item.dataEncomenda).slice(3, 5)}
        </Text>
      </View>

      <View style={styles.orderContent}>
        <Text style={styles.customerName} numberOfLines={1}>{item.clienteNome}</Text>
        <View style={styles.purposeRow}>
          <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
          <Text style={styles.purposeText} numberOfLines={2}>{item.finalidade}</Text>
        </View>
        <Text style={styles.orderValue}>{formatCurrency(item.valorTotal)}</Text>
      </View>

      <View style={[styles.typeBadge, isSale ? styles.saleBadge : styles.quoteBadge]}>
        <Text style={[styles.typeBadgeText, isSale ? styles.saleBadgeText : styles.quoteBadgeText]}>
          {isSale ? 'VENDA' : 'ORÇAMENTO'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

export default function AgendaScreen({ navigation, route }: Props) {
  const initialDate = route.params?.dataSelecionada;
  const [mode, setMode] = useState<ViewMode>(initialDate ? 'CALENDAR' : 'LIST');
  const [selectedDate, setSelectedDate] = useState(
    initialDate ?? formatDateForDatabase(new Date())
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedDetails, setSelectedDetails] =
    useState<AgendaEncomendaDetalhada | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [exportingOrder, setExportingOrder] = useState(false);
  const [exportingDay, setExportingDay] = useState(false);
  const {
    encomendas,
    carregando,
    erro,
    carregar,
    buscarDetalhes,
    calcularNecessidadesEncomenda,
    calcularNecessidadesDia,
  } = useAgenda();

  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar])
  );

  const markedDates = useMemo(
    () => Array.from(new Set(encomendas.map((item) => item.dataEncomenda))),
    [encomendas]
  );
  const selectedOrders = useMemo(
    () => encomendas.filter((item) => item.dataEncomenda === selectedDate),
    [encomendas, selectedDate]
  );
  const displayedOrders = mode === 'CALENDAR' ? selectedOrders : encomendas;

  const openDetails = async (item: AgendaEncomenda) => {
    try {
      setSelectedDetails(null);
      setDetailsVisible(true);
      setLoadingDetails(true);
      const details = await buscarDetalhes(item.id);
      if (!details) {
        setDetailsVisible(false);
        Alert.alert('Encomenda não encontrada', 'Atualize a agenda e tente novamente.');
        return;
      }
      setSelectedDetails(details);
    } catch (error) {
      setDetailsVisible(false);
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível abrir a encomenda.'
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const exportOrderNeeds = async () => {
    if (!selectedDetails || exportingOrder) return;
    try {
      setExportingOrder(true);
      const needs = await calcularNecessidadesEncomenda(selectedDetails.id);
      if (!needs.length) {
        Alert.alert(
          'Nenhuma necessidade encontrada',
          'Verifique se os produtos da encomenda possuem composição cadastrada.'
        );
        return;
      }
      await agendaPdfService.exportarEncomenda(selectedDetails, needs);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível exportar as necessidades.'
      );
    } finally {
      setExportingOrder(false);
    }
  };

  const exportDayNeeds = async () => {
    if (exportingDay) return;
    if (!selectedOrders.length) {
      Alert.alert('Agenda livre', 'Não há encomendas para exportar neste dia.');
      return;
    }
    try {
      setExportingDay(true);
      const needs = await calcularNecessidadesDia(selectedDate);
      if (!needs.length) {
        Alert.alert(
          'Nenhuma necessidade encontrada',
          'Verifique se os produtos das encomendas possuem composição cadastrada.'
        );
        return;
      }
      await agendaPdfService.exportarDia(selectedDate, selectedOrders.length, needs);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível exportar as necessidades do dia.'
      );
    } finally {
      setExportingDay(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={navigation.goBack}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          </Pressable>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Agenda</Text>
            <Text style={styles.subtitle}>Pedidos e encomendas organizados</Text>
          </View>
        </View>

        <View style={styles.segmentedControl}>
          <Pressable
            style={[styles.segment, mode === 'LIST' && styles.activeSegment]}
            onPress={() => setMode('LIST')}
          >
            <Ionicons name="list-outline" size={19} color={mode === 'LIST' ? '#FFFFFF' : COLORS.primary} />
            <Text style={[styles.segmentText, mode === 'LIST' && styles.activeSegmentText]}>Lista</Text>
          </Pressable>
          <Pressable
            style={[styles.segment, mode === 'CALENDAR' && styles.activeSegment]}
            onPress={() => setMode('CALENDAR')}
          >
            <Ionicons name="calendar-number-outline" size={19} color={mode === 'CALENDAR' ? '#FFFFFF' : COLORS.primary} />
            <Text style={[styles.segmentText, mode === 'CALENDAR' && styles.activeSegmentText]}>Calendário</Text>
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.stateText}>Organizando sua agenda...</Text>
          </View>
        ) : erro ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle-outline" size={42} color={COLORS.primary} />
            <Text style={styles.stateTitle}>Não foi possível abrir a agenda</Text>
            <Text style={styles.stateText}>{erro}</Text>
            <Pressable style={styles.retryButton} onPress={() => void carregar()}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={displayedOrders}
            keyExtractor={(item) => `${item.tipo}-${item.id}`}
            renderItem={({ item }) => (
              <OrderCard item={item} onPress={() => void openDetails(item)} />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={() => void carregar()} colors={[COLORS.primary]} />
            }
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              mode === 'CALENDAR' ? (
                <View>
                  <MonthCalendar
                    markedDates={markedDates}
                    selectedDate={selectedDate}
                    initialMonth={selectedDate}
                    onSelectDate={setSelectedDate}
                  />
                  <View style={styles.selectedDateHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Encomendas do dia</Text>
                      <Text style={styles.selectedDateText}>{formatDateOnlyBR(selectedDate)}</Text>
                    </View>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{selectedOrders.length}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.exportDayButton}
                    onPress={() => void exportDayNeeds()}
                    disabled={exportingDay}
                  >
                    {exportingDay ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="download-outline" size={19} color="#FFFFFF" />
                    )}
                    <Text style={styles.exportDayButtonText}>
                      {exportingDay ? 'Preparando PDF...' : 'Exportar necessidades do dia'}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.listSummary}>
                  <View>
                    <Text style={styles.sectionTitle}>Todas as encomendas</Text>
                    <Text style={styles.summaryText}>Em ordem de entrega</Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{encomendas.length}</Text>
                  </View>
                </View>
              )
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="calendar-clear-outline" size={36} color={COLORS.primary} />
                </View>
                <Text style={styles.stateTitle}>
                  {mode === 'CALENDAR' ? 'Nenhuma encomenda neste dia' : 'Agenda livre'}
                </Text>
                <Text style={styles.stateText}>
                  As encomendas aparecem aqui após o cadastro do orçamento.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={detailsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            <View style={styles.modalHandle} />
            <View style={styles.detailsHeader}>
              <View style={styles.detailsHeaderText}>
                <Text style={styles.detailsTitle}>
                  ENCOMENDA #{selectedDetails?.id ?? ''}
                </Text>
                {!!selectedDetails && (
                  <Text style={styles.detailsSubtitle}>
                    {selectedDetails.tipo === 'VENDA' ? 'Venda confirmada' : 'Orçamento pendente'}
                  </Text>
                )}
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setDetailsVisible(false)}
              >
                <Ionicons name="close" size={23} color={COLORS.primary} />
              </Pressable>
            </View>

            {loadingDetails || !selectedDetails ? (
              <View style={styles.detailsLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.detailsContent}
                >
                  <View style={styles.customerCard}>
                    <View style={styles.customerIcon}>
                      <Ionicons name="person-outline" size={23} color={COLORS.primary} />
                    </View>
                    <View style={styles.customerContent}>
                      <Text style={styles.detailsCustomer}>{selectedDetails.clienteNome}</Text>
                      <Text style={styles.detailsPurpose}>{selectedDetails.finalidade}</Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Data da encomenda</Text>
                        <Text style={styles.infoValue}>{formatDateOnlyBR(selectedDetails.dataEncomenda)}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.infoRow,
                        !selectedDetails.clienteTelefone && styles.infoRowLast,
                      ]}
                    >
                      <Ionicons name="location-outline" size={18} color={COLORS.primary} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Endereço</Text>
                        <Text style={styles.infoValue}>
                          {selectedDetails.clienteEndereco || 'Não informado'}
                        </Text>
                      </View>
                    </View>
                    {!!selectedDetails.clienteTelefone && (
                      <View style={[styles.infoRow, styles.infoRowLast]}>
                        <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Telefone</Text>
                          <Text style={styles.infoValue}>{selectedDetails.clienteTelefone}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <Text style={styles.detailsSectionTitle}>PRODUTOS</Text>
                  {selectedDetails.itens.map((item) => (
                    <View key={item.id} style={styles.productRow}>
                      <View style={styles.productContent}>
                        <Text style={styles.productName} numberOfLines={2}>{item.produtoNome}</Text>
                        <Text style={styles.productQuantity}>
                          {formatDecimal(item.quantidade)} × {formatCurrency(item.valorUnitario)}
                        </Text>
                      </View>
                      <Text style={styles.productSubtotal}>{formatCurrency(item.subtotal)}</Text>
                    </View>
                  ))}

                  <Text style={styles.detailsSectionTitle}>PAGAMENTO</Text>
                  <View style={styles.financialGrid}>
                    <View style={styles.financialCard}>
                      <Text style={styles.financialLabel}>Total</Text>
                      <Text style={styles.financialValue}>{formatCurrency(selectedDetails.valorTotal)}</Text>
                    </View>
                    <View style={[styles.financialCard, styles.paidCard]}>
                      <Text style={styles.financialLabel}>Pago</Text>
                      <Text style={[styles.financialValue, styles.paidValue]}>
                        {formatCurrency(selectedDetails.valorPago)}
                      </Text>
                    </View>
                    <View style={[styles.financialCard, styles.receivableCard]}>
                      <Text style={styles.financialLabel}>A receber</Text>
                      <Text style={[styles.financialValue, styles.receivableValue]}>
                        {formatCurrency(selectedDetails.valorReceber)}
                      </Text>
                    </View>
                  </View>

                  {!!selectedDetails.formaPagamento && (
                    <Text style={styles.paymentMethod}>
                      Forma de pagamento: {selectedDetails.formaPagamento}
                    </Text>
                  )}

                  {!!selectedDetails.observacoes && (
                    <View style={styles.notesCard}>
                      <Text style={styles.notesTitle}>Observações</Text>
                      <Text style={styles.notesText}>{selectedDetails.observacoes}</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.detailsFooter}>
                  <Pressable
                    style={styles.exportOrderButton}
                    onPress={() => void exportOrderNeeds()}
                    disabled={exportingOrder}
                  >
                    {exportingOrder ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="download-outline" size={19} color="#FFFFFF" />
                    )}
                    <Text style={styles.exportOrderButtonText}>
                      {exportingOrder ? 'Preparando...' : 'Exportar necessidades'}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: COLORS.background },
  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 10,
  },
  headerText: { flex: 1 },
  title: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' },
  subtitle: { color: COLORS.textSecondary, fontSize: 11, marginTop: 3 },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    marginVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
  },
  segment: {
    flex: 1,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
  },
  activeSegment: { backgroundColor: COLORS.primary },
  segmentText: { color: COLORS.primary, fontSize: 13, fontWeight: '900' },
  activeSegmentText: { color: '#FFFFFF' },
  listContent: { paddingBottom: 28 },
  listSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  summaryText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 3 },
  selectedDateText: { color: COLORS.primary, fontSize: 12, fontWeight: '800', marginTop: 3 },
  exportDayButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginBottom: 13,
  },
  exportDayButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  countBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  countText: { color: COLORS.primary, fontWeight: '900' },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderDateBox: {
    width: 48,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    marginRight: 12,
  },
  orderDay: { color: COLORS.primary, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  orderMonth: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '800' },
  orderContent: { flex: 1 },
  customerName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '900' },
  purposeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  purposeText: { flex: 1, color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  orderValue: { color: COLORS.primary, fontSize: 12, fontWeight: '900', marginTop: 6 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    marginLeft: 6,
    marginRight: 2,
  },
  quoteBadge: { backgroundColor: '#FFF5E8' },
  saleBadge: { backgroundColor: '#EDF8EE' },
  typeBadgeText: { fontSize: 9, fontWeight: '900' },
  quoteBadgeText: { color: '#DF8514' },
  saleBadgeText: { color: COLORS.success },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emptyState: { alignItems: 'center', padding: 36 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginBottom: 14,
  },
  stateTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  stateText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 7 },
  retryButton: { marginTop: 16, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 13, backgroundColor: COLORS.primary },
  retryText: { color: '#FFFFFF', fontWeight: '900' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(35, 24, 29, 0.48)',
  },
  detailsModal: {
    height: '91%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8DCE0',
    marginTop: 9,
  },
  detailsHeader: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 17,
  },
  detailsHeaderText: { flex: 1 },
  detailsTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  detailsSubtitle: { color: COLORS.textSecondary, fontSize: 11, marginTop: 3 },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
  },
  detailsLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  detailsContent: { padding: 16, paddingBottom: 24 },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    padding: 14,
    marginBottom: 12,
  },
  customerIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 11,
  },
  customerContent: { flex: 1 },
  detailsCustomer: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '900' },
  detailsPurpose: { color: COLORS.primary, fontSize: 12, fontWeight: '800', marginTop: 4 },
  infoCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 61,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F7EEF1',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoContent: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  infoValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', marginTop: 3 },
  detailsSectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginTop: 20,
    marginBottom: 9,
  },
  productRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    padding: 12,
    marginBottom: 8,
  },
  productContent: { flex: 1, paddingRight: 8 },
  productName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '900' },
  productQuantity: { color: COLORS.textSecondary, fontSize: 11, marginTop: 4 },
  productSubtotal: { color: COLORS.primary, fontSize: 12, fontWeight: '900' },
  financialGrid: { flexDirection: 'row', gap: 7 },
  financialCard: {
    flex: 1,
    minHeight: 76,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    padding: 9,
  },
  paidCard: { borderColor: '#CFEAD4', backgroundColor: '#F5FBF6' },
  receivableCard: { borderColor: '#FFD1DD', backgroundColor: COLORS.primarySoft },
  financialLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  financialValue: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '900', marginTop: 5 },
  paidValue: { color: COLORS.success },
  receivableValue: { color: COLORS.primary },
  paymentMethod: { color: COLORS.textSecondary, fontSize: 11, marginTop: 10 },
  notesCard: {
    borderRadius: 15,
    backgroundColor: '#FFF9FA',
    padding: 13,
    marginTop: 15,
  },
  notesTitle: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '900' },
  notesText: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },
  exportOrderButton: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
  },
  exportOrderButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});
