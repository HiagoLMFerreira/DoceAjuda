import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BarcodeScannerModal from '../../../../components/BarcodeScannerModal';
import { useReceitas } from '../hooks/useReceitas';
import { ReceitaList } from '../components/ReceitaList';
import { ReceitaDetailsModal } from '../components/ReceitaDetailsModal';
import { ReceitaFormModal } from '../components/ReceitaFormModal';
import { ProdutoPickerModal, ReceitaItemModal } from '../components/ReceitaItemModal';

export default function ReceitasScreen() {
  const navigation = useNavigation<any>();
  const r = useReceitas();

  useFocusEffect(useCallback(() => {
    r.carregar().catch(e => Alert.alert('Erro', r.mensagemErro(e,'Não foi possível carregar as receitas.')));
  }, [r.carregar]));

  const executar = async (acao:()=>Promise<void>|void, fallback:string) => {
    try { await acao(); } catch(e) { Alert.alert('Erro', r.mensagemErro(e,fallback)); }
  };

  const excluir = () => {
    if (!r.detalhada) return;
    Alert.alert('Excluir receita',`Deseja realmente excluir "${r.detalhada.nome}"?`,[
      {text:'Cancelar',style:'cancel'},
      {text:'Excluir',style:'destructive',onPress:()=>executar(r.excluir,'Não foi possível excluir a receita.')}
    ]);
  };

  const icon = (campo:'nome'|'rendimento') => r.ordenarPor !== campo
    ? 'swap-vertical-outline' : r.direcao === 'ASC' ? 'arrow-up-outline' : 'arrow-down-outline';

  return <View style={s.container}>
    <View style={s.header}><TouchableOpacity style={s.back} onPress={()=>navigation.goBack()}><Ionicons name="arrow-back" size={22} color="#fff"/></TouchableOpacity><View style={s.headerArea}><Ionicons name="restaurant-outline" size={22}/><Text style={s.headerTitle}>RECEITAS</Text></View></View>
    <View style={s.search}><Ionicons name="search-outline" size={20} color="#666"/><TextInput style={{flex:1}} placeholder="Buscar por nome, rendimento ou ID" value={r.busca} onChangeText={r.setBusca}/></View>
    <TouchableOpacity style={s.primary} onPress={r.abrirCadastro}><Ionicons name="add-circle-outline" size={21} color="#fff"/><Text style={s.primaryText}>NOVA RECEITA</Text></TouchableOpacity>
    <View style={s.table}><TouchableOpacity style={s.hNome} onPress={()=>r.ordenar('nome')}><Text style={s.hText}>RECEITA</Text><Ionicons name={icon('nome')} size={15}/></TouchableOpacity><TouchableOpacity style={s.hRend} onPress={()=>r.ordenar('rendimento')}><Text style={s.hText}>RENDIMENTO</Text><Ionicons name={icon('rendimento')} size={15}/></TouchableOpacity></View>
    <ReceitaList receitas={r.receitas} onPress={id=>executar(()=>r.abrirDetalhes(id),'Não foi possível abrir os detalhes da receita.')}/>
    <ReceitaDetailsModal visible={r.modalDetalhes} receita={r.detalhada} onEdit={r.abrirEdicao} onDelete={excluir} onClose={()=>r.setModalDetalhes(false)}/>
    <ReceitaFormModal visible={r.modalFormulario} modo={r.modo} form={r.form} onChange={f=>r.setForm(a=>({...a,...f}))} onAdd={()=>executar(r.abrirNovoItem,'Não foi possível carregar os produtos.')} onEditItem={(i,idx)=>executar(()=>r.abrirEditarItem(i,idx),'Não foi possível carregar o produto.')} onRemove={r.removerItem} onSave={()=>executar(r.salvar,'Não foi possível salvar a receita.')} onClose={()=>r.setModalFormulario(false)}/>
    <ReceitaItemModal visible={r.modalItem} produto={r.produtoSelecionado} quantidade={r.quantidade} unidade={r.unidade} onQuantidade={r.setQuantidade} onUnidade={r.setUnidade} onOpenProducts={()=>executar(r.abrirProdutos,'Não foi possível carregar os produtos.')} onSave={()=>executar(r.salvarItem,'Não foi possível salvar o item.')} onClose={r.fecharItem}/>
    <ProdutoPickerModal visible={r.modalProdutos} produtos={r.produtos} busca={r.buscaProduto} onBusca={r.setBuscaProduto} onScan={()=>r.setScanner(true)} onSelect={r.selecionarProduto} onClose={()=>r.setModalProdutos(false)}/>
    <BarcodeScannerModal visible={r.scanner} onClose={()=>r.setScanner(false)} onCodeScanned={r.receberCodigo}/>
  </View>;
}
const s=StyleSheet.create({
 container:{flex:1,backgroundColor:'#ebebeb',paddingHorizontal:16,paddingTop:50},header:{minHeight:58,borderRadius:14,backgroundColor:'#d1d1d1',alignItems:'center',justifyContent:'center',marginBottom:14,position:'relative'},
 back:{position:'absolute',left:10,width:40,height:40,borderRadius:20,backgroundColor:'#111',alignItems:'center',justifyContent:'center'},headerArea:{flexDirection:'row',alignItems:'center',gap:7},headerTitle:{fontSize:20,fontWeight:'900',letterSpacing:1},
 search:{height:49,backgroundColor:'#fff',borderRadius:12,flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:12,marginBottom:12},primary:{height:49,borderRadius:12,backgroundColor:'#111',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginBottom:14},primaryText:{color:'#fff',fontWeight:'800'},
 table:{height:42,borderRadius:8,backgroundColor:'#c8c8c8',flexDirection:'row',alignItems:'center',paddingHorizontal:12,marginBottom:8},hNome:{flex:1.5,flexDirection:'row',alignItems:'center',gap:3},hRend:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'flex-end',gap:3},hText:{fontSize:11,fontWeight:'900'}
});
