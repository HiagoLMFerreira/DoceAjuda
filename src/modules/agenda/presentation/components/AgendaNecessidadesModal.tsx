import React from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDecimal } from '../../../../core/formatters';
import type { AgendaNecessidade } from '../../domain/models/Agenda';

type Props = {
  visible: boolean;
  subtitle: string;
  necessidades: AgendaNecessidade[];
  exporting: boolean;
  onClose: () => void;
  onExport: () => void;
};

export default function AgendaNecessidadesModal({ visible, subtitle, necessidades, exporting, onClose, onExport }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modal} edges={['bottom', 'left', 'right']}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <Text style={styles.title}>LISTA DE NECESSIDADES</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Pressable accessibilityLabel="Fechar necessidades" style={styles.close} onPress={onClose}>
              <Ionicons name="close" size={23} color="#FF3B73" />
            </Pressable>
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryItem}><Text style={styles.summaryValue}>{necessidades.length}</Text><Text style={styles.label}>Itens</Text></View>
            <View style={styles.summaryItem}><Text style={[styles.summaryValue, styles.missing]}>{necessidades.filter(item => !item.estoqueSuficiente).length}</Text><Text style={styles.label}>Em falta</Text></View>
          </View>
          <Text style={styles.notice}>Esta consulta não movimenta o estoque.</Text>
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={necessidades}
            keyExtractor={item => String(item.produtoId)}
            ListEmptyComponent={<View style={styles.empty}><Ionicons name="checkmark-circle-outline" size={42} color="#2D9449" /><Text style={styles.title}>Nenhuma necessidade encontrada</Text><Text style={styles.subtitle}>Verifique se os produtos das encomendas possuem composição cadastrada.</Text></View>}
            renderItem={({ item }) => (
              <View style={[styles.card, !item.estoqueSuficiente && styles.cardMissing]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.produtoNome}</Text>
                  <Text style={[styles.badge, item.estoqueSuficiente ? styles.badgeOk : styles.badgeMissing]}>{item.estoqueSuficiente ? 'SUFICIENTE' : 'EM FALTA'}</Text>
                </View>
                <View style={styles.grid}>
                  {[
                    { label: 'Necessário', value: item.quantidadeNecessaria },
                    { label: 'Em estoque', value: item.quantidadeEstoque },
                    { label: 'Faltante', value: item.quantidadeFaltante },
                  ].map(dado => <View key={dado.label} style={styles.data}><Text style={styles.label}>{dado.label}</Text><Text style={[styles.value, dado.label === 'Faltante' && !item.estoqueSuficiente && styles.missing]}>{formatDecimal(dado.value)} {item.unidadeMedida}</Text></View>)}
                </View>
              </View>
            )}
          />
          <View style={styles.footer}>
            <Pressable style={[styles.export, (!necessidades.length || exporting) && styles.disabled]} disabled={!necessidades.length || exporting} onPress={onExport}>
              {exporting ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="download-outline" size={19} color="#FFFFFF" />}
              <Text style={styles.exportText}>{exporting ? 'Preparando PDF...' : 'Exportar necessidades'}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(35,24,29,0.48)' },
  modal: { height: '90%', backgroundColor: '#FFFDFE', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle: { alignSelf: 'center', width: 46, height: 5, borderRadius: 3, backgroundColor: '#E8DCE0', marginTop: 9 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 17, borderBottomWidth: 1, borderBottomColor: '#F1E7EA' },
  titleArea: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900', color: '#242329' },
  subtitle: { fontSize: 12, color: '#737178', marginTop: 4 },
  close: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF0F4', justifyContent: 'center', alignItems: 'center' },
  summary: { flexDirection: 'row', margin: 15, padding: 13, borderRadius: 17, backgroundColor: '#FFF0F4' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 21, fontWeight: '900', color: '#FF3B73' },
  notice: { textAlign: 'center', color: '#737178', fontSize: 11, marginBottom: 12 },
  list: { flex: 1, minHeight: 0 },
  listContent: { paddingHorizontal: 15, paddingBottom: 14 },
  card: { borderWidth: 1, borderColor: '#F1E7EA', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, marginBottom: 9 },
  cardMissing: { borderColor: '#FFC8D7' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  name: { flex: 1, fontSize: 15, fontWeight: '900', color: '#242329' },
  badge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, fontSize: 9, fontWeight: '900' },
  badgeOk: { backgroundColor: '#EDF8EE', color: '#2D9449' },
  badgeMissing: { backgroundColor: '#FFF0F4', color: '#D83B59' },
  grid: { flexDirection: 'row', gap: 7 },
  data: { flex: 1, minWidth: 0, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 6, backgroundColor: '#FFF0F4', borderRadius: 9 },
  label: { color: '#737178', fontSize: 11, fontWeight: '700' },
  value: { color: '#242329', fontSize: 13, fontWeight: '900', marginTop: 4, textAlign: 'center' },
  missing: { color: '#D83B59' },
  empty: { padding: 25, alignItems: 'center', gap: 10 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F1E7EA', flexShrink: 0 },
  export: { minHeight: 49, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF3B73', borderRadius: 15 },
  exportText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  disabled: { opacity: 0.5 },
});
