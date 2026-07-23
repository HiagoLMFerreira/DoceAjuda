import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProdutoParaReceita } from '../../domain/models/ProdutoParaReceita';
import { UNIDADES_RECEITA, type UnidadeReceita } from '../../domain/models/Receita';
import { nomeProduto } from '../hooks/useReceitas';

export function ReceitaItemModal(props:{visible:boolean;produto:ProdutoParaReceita|null;quantidade:string;unidade:UnidadeReceita;onQuantidade:(v:string)=>void;onUnidade:(u:UnidadeReceita)=>void;onOpenProducts:()=>void;onSave:()=>void;onClose:()=>void}) {
 return <Modal visible={props.visible} transparent animationType="fade"><View style={s.overlay}><View style={s.modal}>
  <Text style={s.title}>ADICIONAR PRODUTO</Text><Text style={s.label}>Produto:</Text>
  <TouchableOpacity style={s.select} onPress={props.onOpenProducts}><Text>{props.produto?nomeProduto(props.produto):'Selecionar produto'}</Text><Ionicons name="chevron-down" size={20}/></TouchableOpacity>
  <Text style={s.label}>Quantidade usada:</Text><TextInput style={s.input} value={props.quantidade} onChangeText={props.onQuantidade} keyboardType="decimal-pad"/>
  <Text style={s.label}>Unidade:</Text><View style={s.units}>{UNIDADES_RECEITA.map(u=><TouchableOpacity key={u} style={[s.chip,props.unidade===u&&s.active]} onPress={()=>props.onUnidade(u)}><Text style={props.unidade===u?s.activeText:undefined}>{u}</Text></TouchableOpacity>)}</View>
  <View style={s.actions}><TouchableOpacity style={[s.btn,s.cancel]} onPress={props.onClose}><Text style={s.btnText}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[s.btn,s.save]} onPress={props.onSave}><Text style={s.btnText}>Salvar</Text></TouchableOpacity></View>
 </View></View></Modal>
}

export function ProdutoPickerModal(props:{visible:boolean;produtos:ProdutoParaReceita[];busca:string;onBusca:(v:string)=>void;onScan:()=>void;onSelect:(p:ProdutoParaReceita)=>void;onClose:()=>void}) {
 return <Modal visible={props.visible} transparent animationType="fade"><View style={s.overlay}><View style={s.modalPicker}>
  <Text style={s.title}>SELECIONAR PRODUTO</Text><View style={s.search}><TextInput style={{flex:1}} value={props.busca} onChangeText={props.onBusca} placeholder="Nome, ID ou código de barras"/><TouchableOpacity onPress={props.onScan}><Ionicons name="barcode-outline" size={23}/></TouchableOpacity></View>
  <FlatList data={props.produtos} keyExtractor={i=>String(i.id)} style={{maxHeight:320}} renderItem={({item})=><TouchableOpacity style={s.option} onPress={()=>props.onSelect(item)}><View><Text style={{fontWeight:'800'}}>{nomeProduto(item)}</Text><Text style={{color:'#666'}}>Estoque: {item.quantidade} {item.unidade_medida}</Text></View></TouchableOpacity>}/>
  <TouchableOpacity style={[s.btn,s.cancel,{marginTop:12}]} onPress={props.onClose}><Text style={s.btnText}>Fechar</Text></TouchableOpacity>
 </View></View></Modal>
}
const s=StyleSheet.create({
 overlay:{flex:1,backgroundColor:'rgba(0,0,0,.5)',justifyContent:'center',alignItems:'center'},modal:{width:'88%',backgroundColor:'#fff',borderRadius:14,padding:20},modalPicker:{width:'90%',backgroundColor:'#fff',borderRadius:14,padding:20},
 title:{fontSize:18,fontWeight:'900',textAlign:'center',marginBottom:14},label:{fontWeight:'800',marginBottom:6},select:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12,flexDirection:'row',justifyContent:'space-between',marginBottom:12},
 input:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12,marginBottom:12},units:{flexDirection:'row',gap:7,flexWrap:'wrap',marginBottom:15},chip:{paddingVertical:9,paddingHorizontal:13,borderWidth:1,borderColor:'#bbb',borderRadius:8},active:{backgroundColor:'#111'},activeText:{color:'#fff'},
 actions:{flexDirection:'row',gap:10},btn:{flex:1,padding:12,borderRadius:8,alignItems:'center'},cancel:{backgroundColor:'#aaa'},save:{backgroundColor:'#000'},btnText:{color:'#fff',fontWeight:'bold'},
 search:{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#ccc',borderRadius:8,paddingHorizontal:10,marginBottom:10},option:{padding:12,borderBottomWidth:1,borderBottomColor:'#ddd'}
});
