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
    >
      {carregando ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#fff"
          />
          <Text style={styles.text}>
            GERAR PDF
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#111',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
  },
});
