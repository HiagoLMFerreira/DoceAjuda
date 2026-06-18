import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  opcoes: string[];
  valor: string;
  onChange: (valor: string) => void;
};

export default function SeletorFormaPagamento({
  opcoes,
  valor,
  onChange,
}: Props) {
  const formas = ['TODAS', ...opcoes.filter((opcao) => opcao !== 'TODAS')];

  return (
    <View style={styles.container}>
      {formas.map((forma) => {
        const selecionada = forma === valor;

        return (
          <TouchableOpacity
            key={forma}
            style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
            onPress={() => onChange(forma)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.opcaoTexto,
                selecionada && styles.opcaoTextoSelecionado,
              ]}
            >
              {forma === 'TODAS' ? 'TODAS' : forma.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },

  opcao: {
    minHeight: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#fff',
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  opcaoSelecionada: {
    backgroundColor: '#111',
    borderColor: '#111',
  },

  opcaoTexto: {
    color: '#333',
    fontSize: 11,
    fontWeight: '800',
  },

  opcaoTextoSelecionado: {
    color: '#fff',
  },
});
