import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ReceitaDetalhada } from '../../domain/models/Receita';

export function ReceitaDetailsModal({visible, receita, onEdit, onDelete, onClose}:{visible:boolean;receita:ReceitaDetalhada|null;onEdit:()=>void;onDelete:()=>void;onClose:()=>void}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.overlay}><View style={s.modal}>{receita && <>
      <Text style={s.title}>DADOS DA RECEITA</Text>
      <ScrollView>
        <View style={s.card}><Row l="ID:" v={String(receita.id)}/><Row l="Nome:" v={receita.nome}/><Row l="Rendimento:" v={receita.rendimento}/></View>
        <View style={s.card}><Text style={s.section}>Ingredientes</Text>
          {receita.itens.map(i=><View key={i.id} style={s.item}><Text style={s.itemNome}>{i.produto_nome}</Text><Text>{i.quantidade_usada}</Text></View>)}
        </View>
        <View style={s.card}><Text style={s.section}>Modo de preparo</Text><Text style={s.preparo}>{receita.modo_preparo || '-'}</Text></View>
      </ScrollView>
      <View style={s.actions}><TouchableOpacity style={[s.btn,s.edit]} onPress={onEdit}><Text style={s.btnText}>Editar</Text></TouchableOpacity><TouchableOpacity style={[s.btn,s.del]} onPress={onDelete}><Text style={s.btnText}>Excluir</Text></TouchableOpacity></View>
      <TouchableOpacity style={[s.full,s.close]} onPress={onClose}><Text style={s.btnText}>Fechar</Text></TouchableOpacity>
    </>}</View></View>
  </Modal>;
}
function Row({l,v}:{l:string;v:string}){return <View style={s.row}><Text style={s.label}>{l}</Text><Text style={s.value}>{v}</Text></View>}
const s=StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,.5)',justifyContent:'center',alignItems:'center'},modal:{width:'90%',maxHeight:'90%',backgroundColor:'#fff',borderRadius:14,padding:20},
  title:{fontSize:18,fontWeight:'900',textAlign:'center',letterSpacing:1,marginBottom:14},card:{backgroundColor:'#f5f5f5',borderRadius:10,padding:12,marginBottom:12},
  row:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8},label:{fontWeight:'800'},value:{flex:1,textAlign:'right',fontWeight:'700'},section:{fontWeight:'900',marginBottom:9},
  item:{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#ddd'},itemNome:{fontWeight:'700',flex:1},preparo:{lineHeight:20,color:'#333'},
  actions:{flexDirection:'row',gap:10,marginTop:5},btn:{flex:1,padding:12,borderRadius:8,alignItems:'center'},edit:{backgroundColor:'#000'},del:{backgroundColor:'#c90000'},
  full:{padding:12,borderRadius:8,alignItems:'center',marginTop:10},close:{backgroundColor:'#aaa'},btnText:{color:'#fff',fontWeight:'bold'}
});
