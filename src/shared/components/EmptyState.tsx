import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ message, icon = 'information-circle-outline' }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={38} color="#777" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  text: {
    color: '#777',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
