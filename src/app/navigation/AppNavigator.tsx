import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../../modules/auth/presentation/useAuth';
import { APP_ROUTES } from './routes';
import type { RootStackParamList } from './types';

const Stack =
  createStackNavigator<RootStackParamList>();

function AuthLoadingScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashTitle}>Doce Ajuda</Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={user ? 'authenticated' : 'anonymous'}
        initialRouteName={user ? 'Menu' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        {APP_ROUTES.map((route) => (
          <Stack.Screen
            key={route.name}
            name={route.name}
            component={route.component}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ebebeb',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 3,
    marginBottom: 30,
  },
});
