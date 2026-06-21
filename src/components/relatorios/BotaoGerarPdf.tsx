import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  carregando: boolean;
  desabilitado?: boolean;
  onPress: () => void;
};

export default function BotaoGerarPdf({
  carregando,
  desabilitado = false,
  onPress,
}: Props) {
  const bloqueado = carregando || desabilitado;

  return (
    <TouchableOpacity
      style={[styles.botao, bloqueado && styles.botaoDesabilitado]}
      onPress={onPress}
      disabled={bloqueado}
      activeOpacity={0.85}
    >
      {carregando ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="document-text-outline" size={20} color="#fff" />
      )}

      <Text style={styles.texto}>
        {carregando ? 'GERANDO DOCUMENTO...' : 'GERAR E COMPARTILHAR PDF'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },

  botaoDesabilitado: {
    opacity: 0.55,
  },

  texto: {
    color: '#fff',
    fontWeight: '800',
  },
});
