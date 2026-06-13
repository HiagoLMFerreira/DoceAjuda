import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import do hook de autenticação
import { useAuth } from '../contexts/useAuth';

// Imports das telas do app
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import EstoqueScreen from '../screens/EstoqueScreen';
import ReceitasScreen from '../screens/ReceitasScreen';
import OrcamentosScreen from '../screens/OrcamentosScreen';
import VendasScreen from '../screens/VendasScreen';
import ClientesScreen from '../screens/ClientesScreen';
import ProdutosVendaScreen  from '../screens/ProdutosVendaScreen';
import { ProviderId } from 'firebase/auth';

const Stack = createStackNavigator<RootStackParamList>();

// Componente interno que consome o contexto
function AppNavigatorContent() {
  const { user, loading } = useAuth();

  // Enquanto carrega, exibe a splash screen
  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>Doce Ajuda</Text>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Após carregar, define a rota inicial baseada no estado de autenticação
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Menu' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Estoque" component={EstoqueScreen} />
        <Stack.Screen name="Receitas" component={ReceitasScreen} />
        <Stack.Screen name="Orcamentos" component={OrcamentosScreen} />
        <Stack.Screen name="Vendas" component={VendasScreen} />
        <Stack.Screen name="Clientes" component={ClientesScreen} />
        <Stack.Screen name="ProdutosVenda" component={ProdutosVendaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Componente principal exportado sem props
export default function AppNavigator() {
  return <AppNavigatorContent />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebebeb',   // paleta padrão
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 3,
    marginBottom: 30,
  },
});