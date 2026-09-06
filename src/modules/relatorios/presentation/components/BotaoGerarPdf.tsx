import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BotaoGerarPdf({
  carregando,
  desabilitado,
  onPress,
}: {
  carregando: boolean;
  desabilitado: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        desabilitado && styles.disabled,
      ]}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.82}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Ionicons
            name="document-text-outline"
            size={21}
            color="#FFFFFF"
          />
          <Text style={styles.text}>
            Gerar e compartilhar PDF
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FF3B73',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#FF3B73',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
