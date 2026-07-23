import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FormularioReceita, ItemReceitaFormulario, ModoFormularioReceita } from '../../domain/models/Receita';

export function ReceitaFormModal({visible,modo,form,onChange,onAdd,onEditItem,onRemove,onSave,onClose}:{visible:boolean;modo:ModoFormularioReceita;form:FormularioReceita;onChange:(f:Partial<FormularioReceita>)=>void;onAdd:()=>void;onEditItem:(i:ItemReceitaFormulario,idx:number)=>void;onRemove:(idx:number)=>void;onSave:()=>void;onClose:()=>void}) {
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={s.overlay}><View style={s.modal}>
  <ScrollView showsVerticalScrollIndicator={false}><Text style={s.title}>{modo==='cadastro'?'NOVA RECEITA':'EDITAR RECEITA'}</Text>
   <Text style={s.label}>Nome:</Text><TextInput style={s.input} value={form.nome} onChangeText={v=>onChange({nome:v})} placeholder="Digite o nome da receita"/>
   <Text style={s.label}>Rendimento:</Text><TextInput style={s.input} value={form.rendimento} onChangeText={v=>onChange({rendimento:v})} placeholder="Ex.: 20 unidades"/>
   <TouchableOpacity style={s.add} onPress={onAdd}><Ionicons name="add-circle-outline" size={20}/><Text style={s.addText}>ADICIONAR PRODUTO</Text></TouchableOpacity>
   {form.itens.map((i,idx)=><View key={`${i.produto_id}-${idx}`} style={s.item}><View style={{flex:1}}><Text style={s.itemName}>{i.produto_nome}</Text><Text>{i.quantidade_usada}</Text></View><TouchableOpacity onPress={()=>onEditItem(i,idx)}><Ionicons name="create-outline" size={22}/></TouchableOpacity><TouchableOpacity onPress={()=>onRemove(idx)}><Ionicons name="trash-outline" size={22} color="#b00020"/></TouchableOpacity></View>)}
   <Text style={s.label}>Modo de preparo:</Text><TextInput style={[s.input,s.area]} value={form.modoPreparo} onChangeText={v=>onChange({modoPreparo:v})} multiline placeholder="Opcional"/>
   <View style={s.actions}><TouchableOpacity style={[s.btn,s.cancel]} onPress={onClose}><Text style={s.btnText}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={[s.btn,s.save]} onPress={onSave}><Text style={s.btnText}>Salvar</Text></TouchableOpacity></View>
  </ScrollView>
 </View></View></Modal>
}
const s=StyleSheet.create({
 overlay:{flex:1,backgroundColor:'rgba(0,0,0,.5)',justifyContent:'center',alignItems:'center'},modal:{width:'90%',maxHeight:'92%',backgroundColor:'#fff',borderRadius:14,padding:20},
 title:{fontSize:18,fontWeight:'900',textAlign:'center',letterSpacing:1,marginBottom:14},label:{fontWeight:'800',marginBottom:6},input:{backgroundColor:'#f5f5f5',borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12,marginBottom:13},
 area:{minHeight:100,textAlignVertical:'top'},add:{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:6,borderWidth:1,borderColor:'#bbb',borderRadius:9,padding:12,marginBottom:12},addText:{fontWeight:'800'},
 item:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'#f4f4f4',borderRadius:9,padding:12,marginBottom:8},itemName:{fontWeight:'800',marginBottom:3},
 actions:{flexDirection:'row',gap:10,marginTop:5},btn:{flex:1,padding:12,borderRadius:8,alignItems:'center'},cancel:{backgroundColor:'#aaa'},save:{backgroundColor:'#000'},btnText:{color:'#fff',fontWeight:'bold'}
});
