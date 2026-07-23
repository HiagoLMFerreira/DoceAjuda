import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Receita } from '../../domain/models/Receita';

export function ReceitaList({ receitas, onPress }: { receitas: Receita[]; onPress: (id:number)=>void }) {
  return <FlatList
    data={receitas}
    keyExtractor={i => String(i.id)}
    style={styles.list}
    contentContainerStyle={styles.listContent}
    ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Nenhuma receita encontrada.</Text></View>}
    renderItem={({item}) => <TouchableOpacity style={styles.row} onPress={() => onPress(item.id)}>
      <Text style={styles.cellNome} numberOfLines={2}>{item.nome}</Text>
      <Text style={styles.cellRendimento} numberOfLines={2}>{item.rendimento}</Text>
    </TouchableOpacity>}
  />;
}
const styles=StyleSheet.create({
  list:{flex:1}, listContent:{paddingBottom:30}, row:{flexDirection:'row',backgroundColor:'#fff',borderRadius:10,minHeight:58,alignItems:'center',paddingHorizontal:12,marginBottom:8},
  cellNome:{flex:1.5,fontSize:13,fontWeight:'800',color:'#111'}, cellRendimento:{flex:1,fontSize:12,fontWeight:'700',color:'#444',textAlign:'right'},
  emptyBox:{paddingVertical:35,alignItems:'center'}, emptyText:{color:'#777',fontWeight:'700'}
});
