import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  RootStackParamList,
} from '../navigation/types';
import {
  useAuth,
} from '../../modules/auth/presentation/useAuth';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Menu'
>;

type AppRoute = Exclude<
  keyof RootStackParamList,
  'Login' | 'Dashboard' | 'Menu'
>;

type MenuItem = {
  titulo: string;
  rota: AppRoute;
  icone: keyof typeof Ionicons.glyphMap;
};

const PRIMARY = '#FF3B73';

const MENU_ITEMS: MenuItem[] = [
  {
    titulo: 'Estoque',
    rota: 'Estoque',
    icone: 'cube-outline',
  },
  {
    titulo: 'Compras',
    rota: 'Compras',
    icone: 'cart-outline',
  },
  {
    titulo: 'Receitas',
    rota: 'Receitas',
    icone: 'restaurant-outline',
  },
  {
    titulo: 'Produtos',
    rota: 'ProdutosVenda',
    icone: 'pricetags-outline',
  },
  {
    titulo: 'Orçamentos',
    rota: 'Orcamentos',
    icone: 'document-text-outline',
  },
  {
    titulo: 'Vendas',
    rota: 'Vendas',
    icone: 'bag-handle-outline',
  },
  {
    titulo: 'Agenda',
    rota: 'Agenda',
    icone: 'calendar-outline',
  },
  {
    titulo: 'Clientes',
    rota: 'Clientes',
    icone: 'people-outline',
  },
  {
    titulo: 'Relatórios',
    rota: 'Relatorios',
    icone: 'bar-chart-outline',
  },
];

export default function MenuScreen({
  navigation,
}: Props) {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.replace('Login');
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível sair da conta.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              navigation.navigate(
                'Dashboard'
              )
            }
            activeOpacity={0.78}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color={PRIMARY}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              Menu
            </Text>

            <Text style={styles.headerSubtitle}>
              Acesse os módulos do app
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleLogout}
            activeOpacity={0.78}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={PRIMARY}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.rota}
                style={styles.card}
                onPress={() =>
                  navigation.navigate(
                    item.rota
                  )
                }
                activeOpacity={0.82}
              >
                <View style={styles.iconBox}>
                  <Ionicons
                    name={item.icone}
                    size={29}
                    color={PRIMARY}
                  />
                </View>

                <Text style={styles.cardTitle}>
                  {item.titulo}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={PRIMARY}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDFE',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFDFE',
  },

  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
  },

  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  headerTitle: {
    color: '#242329',
    fontSize: 22,
    fontWeight: '900',
  },

  headerSubtitle: {
    color: '#77747B',
    fontSize: 12,
    marginTop: 3,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48.2%',
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 3,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginBottom: 10,
  },

  cardTitle: {
    color: '#242329',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 7,
  },
});
