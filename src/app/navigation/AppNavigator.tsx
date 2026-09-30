import React, {
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  useAuth,
} from '../../modules/auth/presentation/useAuth';
import AppBottomNavigation from '../../shared/components/AppBottomNavigation';
import {
  APP_ROUTES,
} from './routes';
import type {
  RootStackParamList,
} from './types';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

const ROTAS_SEM_BARRA: Array<
  keyof RootStackParamList
> = [
  'Login',
  'Dashboard',
  'Menu',
  'Estoque',
  'Compras',
];

function AuthLoadingScreen() {
  return (
    <View style={styles.splash}>
      <Text
        style={styles.splashTitle}
      >
        Doce Ajuda
      </Text>

      <ActivityIndicator
        size="large"
        color="#FF3B73"
      />
    </View>
  );
}

export default function AppNavigator() {
  const {
    user,
    loading,
    logout,
  } = useAuth();

  const [
    rotaAtual,
    setRotaAtual,
  ] =
    useState<
      keyof RootStackParamList
    >(
      user
        ? 'Dashboard'
        : 'Login'
    );

  const atualizarRota = () => {
    const nome =
      navigationRef
        .getCurrentRoute()
        ?.name;

    if (nome) {
      setRotaAtual(nome);
    }
  };

  const navegar = (
    rota: keyof RootStackParamList
  ) => {
    if (
      navigationRef.isReady()
    ) {
      navigationRef.navigate(
        rota as never
      );
    }
  };

  const confirmarLogout = () => {
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

              if (
                navigationRef.isReady()
              ) {
                navigationRef.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'Login',
                    },
                  ],
                });
              }
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

  if (loading) {
    return (
      <AuthLoadingScreen />
    );
  }

  const exibirBarra =
    Boolean(user) &&
    !ROTAS_SEM_BARRA.includes(
      rotaAtual
    );

  const itemAtivo =
    rotaAtual === 'Vendas'
      ? 'vendas'
      : rotaAtual ===
          'Relatorios'
        ? 'relatorios'
        : 'menu';

  return (
    <View
      style={styles.container}
    >
      <NavigationContainer
        ref={navigationRef}
        onReady={atualizarRota}
        onStateChange={
          atualizarRota
        }
      >
        <Stack.Navigator
          key={
            user
              ? 'authenticated'
              : 'anonymous'
          }
          initialRouteName={
            user
              ? 'Dashboard'
              : 'Login'
          }
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                '#FFFDFE',
            },
          }}
        >
          {APP_ROUTES.map(
            (route) => (
              <Stack.Screen
                key={route.name}
                name={route.name}
                component={
                  route.component
                }
              />
            )
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {exibirBarra && (
        <AppBottomNavigation
          activeItem={itemAtivo}
          onInicio={() =>
            navegar('Dashboard')
          }
          onVendas={() =>
            navegar('Vendas')
          }
          onMenu={() =>
            navegar('Menu')
          }
          onRelatorios={() =>
            navegar(
              'Relatorios'
            )
          }
          onSair={
            confirmarLogout
          }
        />
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#FFFDFE',
    },

    splash: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#FFFDFE',
    },

    splashTitle: {
      color: '#FF3B73',
      fontSize: 34,
      fontWeight: '900',
      letterSpacing: 2,
      marginBottom: 24,
    },
  });
