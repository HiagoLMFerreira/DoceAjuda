import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Menu'> };

export default function MenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Header padronizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DOCE AJUDA</Text>
      </View>

      {/* Lista de opções */}
      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Estoque')}>
          <Text style={styles.menuText}>ESTOQUE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Receitas')}>
          <Text style={styles.menuText}>RECEITA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orcamentos')}>
          <Text style={styles.menuText}>ORÇAMENTOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Vendas')}>
          <Text style={styles.menuText}>VENDAS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Clientes')}>
          <Text style={styles.menuText}>CLIENTES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 3,
    textAlign: 'center',
  },
  menuList: {
    marginHorizontal: 10,
  },
  menuItem: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ccc',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
});