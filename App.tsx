import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppProviders from './src/app/providers/AppProviders';
import AppNavigator from './src/app/navigation/AppNavigator';
import { initializeDatabase } from './src/core/database';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((error) => {
        console.error('Erro ao inicializar banco:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      });
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" backgroundColor="#ebebeb" />
        <Text style={styles.title}>Doce Ajuda</Text>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.text}>Preparando o aplicativo...</Text>
      </View>
    );
  }

  return (
    <AppProviders>
      <StatusBar style="dark" backgroundColor="#ebebeb" />
      <AppNavigator />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#ebebeb', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: '900', marginBottom: 24 },
  text: { marginTop: 14, color: '#555', fontWeight: '600' },
});
