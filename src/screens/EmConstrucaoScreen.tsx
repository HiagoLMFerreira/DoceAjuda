import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  // Título opcional (ex: "CALCULADORA DE CUSTO")
  titulo?: string;
};

export default function EmConstrucaoScreen({ titulo }: Props) {
  return (
    <View style={styles.container}>
      {titulo && <Text style={styles.titulo}>{titulo}</Text>}
      <View style={styles.content}>
        <Text style={styles.icone}>🚧</Text>
        <Text style={styles.mensagem}>Em Construção</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC', // mesmo fundo do Menu e Estoque
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  icone: {
    fontSize: 64,
    marginBottom: 20,
  },
  mensagem: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#CD853F',
    letterSpacing: 2,
  },
});