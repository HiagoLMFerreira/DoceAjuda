import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { formatCurrency, formatDateForDatabase, formatDateOnlyBR, maskDateBR, parseDateBR } from '../../../../core/formatters';
import { contaReceberController } from '../../di/contasReceberContainer';
import { obterStatusConta, ROTULOS_STATUS, type ContaReceber, type StatusContaReceber } from '../../domain/models/ContaReceber';
import { useContasReceber } from '../hooks/useContasReceber';

const PRIMARY = '#FF3B73';
const CORES: Record<StatusContaReceber, string> = { NAO_DEFINIDO: '#737178', A_RECEBER: '#B77717', ATRASADO: '#D64157', FINALIZADO: '#2D9449' };
const CARDS: StatusContaReceber[] = ['NAO_DEFINIDO', 'A_RECEBER', 'ATRASADO'];
const MEIOS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência'];
type Props = NativeStackScreenProps<RootStackParamList, 'ContasReceber'>;

export default function ContasReceberScreen({ navigation }: Props) {
  const dados = useContasReceber();
  const [selecionada, setSelecionada] = useState<ContaReceber | null>(null);
  const [vencimento, setVencimento] = useState('');
  const [meio, setMeio] = useState('');
  const [recebimento, setRecebimento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const trava = useRef(false);
  const abrir = (conta: ContaReceber) => {
    setSelecionada(conta);
    setVencimento(conta.data_vencimento ? formatDateOnlyBR(conta.data_vencimento) : '');
    setMeio(conta.forma_pagamento);
    setRecebimento(conta.status === 'PAGO'
      ? (conta.data_pagamento ? formatDateOnlyBR(conta.data_pagamento) : '')
      : formatDateOnlyBR(formatDateForDatabase(new Date())));
  };
  const fechar = () => { if (!trava.current) setSelecionada(null); };
  const salvar = async (baixa: boolean) => {
    if (!selecionada || trava.current) return;
    const dataVencimento = vencimento.trim() ? parseDateBR(vencimento) : '';
    if (dataVencimento === null) { Alert.alert('Atenção', 'Informe a data prevista no formato DD/MM/AAAA.'); return; }
    trava.current = true;
    setSalvando(true);
    try {
      const input = { id: selecionada.id, dataVencimento, formaPagamento: meio };
      if (baixa) await contaReceberController.baixar({ ...input, dataPagamento: parseDateBR(recebimento) ?? '' });
      else await contaReceberController.definir(input);
      setSelecionada(null);
      await dados.carregar();
      Alert.alert('Sucesso', baixa ? 'Recebimento registrado. Conta finalizada.' : 'Dados de pagamento salvos.');
    } catch (e) {
      Alert.alert('Atenção', e instanceof Error ? e.message : 'Não foi possível salvar a conta.');
    } finally { trava.current = false; setSalvando(false); }
  };
  const confirmarBaixa = () => {
    if (!selecionada || trava.current) return;
    Alert.alert('Confirmar recebimento', `Registrar o recebimento de ${formatCurrency(selecionada.valor_pendente)} de ${selecionada.cliente_nome}? Esta ação quita o saldo da conta.`, [
      { text: 'Voltar', style: 'cancel' }, { text: 'Confirmar baixa', onPress: () => void salvar(true) },
    ]);
  };
  const finalizada = selecionada?.status === 'PAGO';
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Voltar" style={styles.backButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Menu')}>
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </Pressable>
          <View style={styles.headerIcon}><Ionicons name="wallet-outline" size={24} color={PRIMARY} /></View>
          <View style={styles.flex}>
            <Text style={styles.headerTitle}>Contas a receber</Text>
            <Text style={styles.headerSubtitle}>Prazos, saldos e recebimentos</Text>
          </View>
        </View>
        <FlatList
          data={dados.filtradas} keyExtractor={item => String(item.id)} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={dados.carregando} onRefresh={() => void dados.carregar()} tintColor={PRIMARY} />}
          ListHeaderComponent={<>
            <View style={styles.cards}>
              {CARDS.map(status => {
                const ativo = dados.statuses.includes(status);
                const cor = CORES[status];
                return (
                  <Pressable
                    key={status}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    accessibilityLabel={`${ROTULOS_STATUS[status]}: ${formatCurrency(dados.totais[status])}`}
                    onPress={() => dados.alternarStatus(status)}
                    style={[styles.card, { borderColor: cor, backgroundColor: ativo ? cor : '#FFFFFF' }]}
                  >
                    <Text style={[styles.cardValue, { color: ativo ? '#FFFFFF' : cor }]}>{formatCurrency(dados.totais[status])}</Text>
                    <Text style={[styles.cardLabel, { color: ativo ? '#FFFFFF' : cor }]}>{ROTULOS_STATUS[status]}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>Toque nos cards para combinar os filtros.</Text>
            <Pressable style={styles.check} accessibilityRole="checkbox" accessibilityState={{ checked: dados.incluirFinalizados }} onPress={() => dados.setIncluirFinalizados(!dados.incluirFinalizados)}>
              <Ionicons name={dados.incluirFinalizados ? 'checkbox' : 'square-outline'} size={24} color={PRIMARY} /><Text style={styles.label}>Incluir FINALIZADO</Text>
            </Pressable>
            <View style={styles.search}>
              <Ionicons name="search-outline" size={21} color={PRIMARY} />
              <TextInput style={styles.searchInput} placeholder="Buscar cliente ou venda" placeholderTextColor="#9B98A0" value={dados.busca} onChangeText={dados.setBusca} />
              {!!dados.busca && <Pressable accessibilityLabel="Limpar busca" style={styles.clearButton} onPress={() => dados.setBusca('')}><Ionicons name="close-circle" size={21} color="#9B98A0" /></Pressable>}
            </View>
            {!!dados.erro && <Pressable onPress={() => void dados.carregar()}><Text style={styles.error}>{dados.erro} Toque para tentar novamente.</Text></Pressable>}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.nameColumn]}>CLIENTE</Text>
              <Text style={[styles.tableHeaderText, styles.statusColumn]}>STATUS</Text>
              <Text style={[styles.tableHeaderText, styles.valueColumn]}>VALOR</Text>
            </View>
          </>}
          ListEmptyComponent={!dados.carregando && !dados.erro ? <View style={styles.empty}><Ionicons name="wallet-outline" size={40} color={PRIMARY} /><Text style={styles.label}>Nenhuma conta encontrada.</Text></View> : null}
          renderItem={({ item }) => {
            const status = obterStatusConta(item, dados.hoje);
            return <Pressable accessibilityRole="button" onPress={() => abrir(item)} style={styles.row}>
              <Text style={[styles.gridName, styles.nameColumn]}>{item.cliente_nome}</Text>
              <View style={styles.statusColumn}><Text style={[styles.badge, { color: CORES[status] }]}>{ROTULOS_STATUS[status]}</Text></View>
              <Text style={[styles.gridValue, styles.valueColumn]}>{formatCurrency(item.status === 'PAGO' ? item.valor_original - item.valor_sinal : item.valor_pendente)}</Text>
            </Pressable>;
          }}
        />
      </View>
      <Modal visible={!!selecionada} transparent animationType="slide" onRequestClose={fechar}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView style={styles.modal} edges={['bottom']}>
            <View style={styles.modalHeader}><Text style={[styles.title, styles.flex]}>Venda #{selecionada?.venda_id}</Text><Pressable disabled={salvando} onPress={fechar} style={styles.icon} accessibilityLabel="Fechar"><Ionicons name="close" size={24} color={PRIMARY} /></Pressable></View>
            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <Text style={styles.customer}>{selecionada?.cliente_nome}</Text><Text style={styles.subtitle}>{selecionada?.descricao}</Text>
              <View style={styles.totals}><Text style={styles.label}>Total da venda: {formatCurrency(selecionada?.valor_original ?? 0)}</Text><Text style={styles.label}>Sinal recebido: {formatCurrency(selecionada?.valor_sinal ?? 0)}</Text><Text style={styles.amount}>Saldo {finalizada ? 'recebido' : 'a receber'}: {formatCurrency(finalizada ? selecionada!.valor_original - selecionada!.valor_sinal : selecionada?.valor_pendente ?? 0)}</Text></View>
              <Text style={styles.label}>Data prevista de pagamento</Text><TextInput editable={!finalizada && !salvando} style={styles.input} value={vencimento} onChangeText={v => setVencimento(maskDateBR(v))} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} />
              <Text style={styles.label}>Meio de pagamento do saldo</Text>
              {!finalizada && <View style={styles.options}>{MEIOS.map(item => <Pressable disabled={salvando} key={item} onPress={() => setMeio(item === meio ? '' : item)} style={[styles.option, meio === item && styles.selected]}><Text style={styles.label}>{item}</Text></Pressable>)}</View>}
              <TextInput editable={!finalizada && !salvando} style={styles.input} value={meio} onChangeText={setMeio} maxLength={80} placeholder="Selecione acima ou informe outro meio" />
              <Text style={styles.label}>Data do recebimento {finalizada ? '' : '(para dar baixa)'}</Text><TextInput editable={!finalizada && !salvando} style={styles.input} value={recebimento} onChangeText={v => setRecebimento(maskDateBR(v))} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} />
              {finalizada ? <Text style={[styles.label, { color: CORES.FINALIZADO }]}>FINALIZADO · Saldo quitado</Text> : <>
                <Text style={styles.hint}>Salve a data prevista para atualizar o status para A RECEBER ou ATRASADO. Sem data, a conta fica NÃO DEFINIDO. Para dar baixa, informe também o meio de pagamento e a data do recebimento.</Text>
                <Pressable disabled={salvando} style={[styles.button, styles.save]} onPress={() => void salvar(false)}><Text style={styles.white}>Salvar definição</Text></Pressable>
                <Pressable disabled={salvando} style={[styles.button, styles.pay]} onPress={confirmarBaixa}>{salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.white}>Dar baixa · Receber saldo</Text>}</Pressable>
              </>}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFDFE' }, page: { flex: 1, paddingHorizontal: 16, paddingTop: 12 }, flex: { flex: 1 },
  header: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, marginBottom: 14, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#F1E7EA', shadowColor: '#5A3844', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 9, elevation: 2 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0F4', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  headerIcon: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#FFF0F4', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#242329' },
  headerSubtitle: { fontSize: 11, color: '#737178', marginTop: 3 },
  icon: { padding: 10, borderRadius: 24, backgroundColor: '#FFF0F4' }, title: { fontSize: 22, fontWeight: '900', color: '#242329' }, subtitle: { color: '#737178', fontSize: 13, marginTop: 4 },
  list: { paddingBottom: 24 }, cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, card: { flex: 1, minWidth: 90, minHeight: 82, padding: 10, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  selected: { borderColor: PRIMARY, backgroundColor: '#FFF0F4' }, cardValue: { fontSize: 16, fontWeight: '900', textAlign: 'center' }, cardLabel: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  hint: { fontSize: 12, lineHeight: 18, color: '#737178', marginVertical: 10 }, check: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 }, label: { color: '#514E52', fontSize: 14, fontWeight: '600' },
  search: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 16, borderWidth: 1, borderColor: '#F1E7EA', paddingHorizontal: 14, marginBottom: 12, backgroundColor: '#FFFFFF' }, searchInput: { flex: 1, minHeight: 52, fontSize: 14, fontWeight: '500', color: '#242329' }, clearButton: { width: 34, height: 42, alignItems: 'center', justifyContent: 'center' },
  tableHeader: { minHeight: 43, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FFD5E0', backgroundColor: '#FFF0F4', marginBottom: 8 },
  tableHeaderText: { fontSize: 10, fontWeight: '900', color: '#242329' },
  nameColumn: { flex: 1.5, paddingRight: 8 }, statusColumn: { flex: 1.2, textAlign: 'center' }, valueColumn: { flex: 1.1, textAlign: 'right', paddingLeft: 6 },
  row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F1E7EA', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 14, marginBottom: 8, shadowColor: '#5A3844', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 7, elevation: 2 },
  gridName: { fontSize: 13, fontWeight: '800', color: '#242329' }, gridValue: { fontSize: 13, fontWeight: '900', color: PRIMARY },
  customer: { fontSize: 17, fontWeight: '800', color: '#242329' }, badge: { fontSize: 10, fontWeight: '900', textAlign: 'center', backgroundColor: '#FFF8FA', paddingVertical: 7, paddingHorizontal: 3, borderRadius: 10 }, amount: { fontSize: 17, fontWeight: '900', color: PRIMARY },
  empty: { alignItems: 'center', padding: 35, gap: 12 }, error: { color: '#D64157', padding: 12 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }, modal: { maxHeight: '92%', backgroundColor: '#FFFDFE', borderTopLeftRadius: 28, borderTopRightRadius: 28 }, modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#F1E7EA' }, form: { padding: 20, gap: 12, paddingBottom: 32 }, totals: { padding: 16, gap: 8, backgroundColor: '#FFF0F4', borderRadius: 16 }, input: { minHeight: 50, paddingHorizontal: 14, borderWidth: 1, borderColor: '#F1E7EA', borderRadius: 14, backgroundColor: '#fff', color: '#242329', fontSize: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, option: { padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F1E7EA' }, button: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 14 }, save: { backgroundColor: PRIMARY }, pay: { backgroundColor: '#2D9449' }, white: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
