import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/useAuth';

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Menu'> };

type MenuItem = {
  titulo: string;
  rota: keyof RootStackParamList;
  icone: keyof typeof Ionicons.glyphMap;
};

export default function MenuScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
    }
  };

  const menuItems: MenuItem[] = [
    { titulo: 'ESTOQUE', rota: 'Estoque', icone: 'cube-outline' },
    { titulo: 'RECEITAS', rota: 'Receitas', icone: 'restaurant-outline' },
    { titulo: 'PRODUTOS', rota: 'ProdutosVenda', icone: 'pricetags-outline' },
    { titulo: 'ORÇAMENTOS', rota: 'Orcamentos', icone: 'document-text-outline' },
    { titulo: 'VENDAS', rota: 'Vendas', icone: 'cash-outline' },
    { titulo: 'CLIENTES', rota: 'Clientes', icone: 'people-outline' },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>SAIR</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>DOCE AJUDA</Text>
        <Text style={styles.headerSubtitle}>Escolha uma opção para continuar</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.titulo}
            style={styles.card}
            onPress={() => navigation.navigate(item.rota as any)}
            activeOpacity={0.85}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icone} size={30} color="#000" />
            </View>

            <Text style={styles.cardText}>{item.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: '#c40000',
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    zIndex: 10,
  },

  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },

  headerTitle: {
    fontSize: 31,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 5,
    textAlign: 'center',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#d6d6d6',
    minHeight: 130,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cardText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
});