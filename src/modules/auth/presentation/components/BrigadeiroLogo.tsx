import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function BrigadeiroLogo() {
  return (
    <Image
      source={require('../../../../../assets/brigadeiro-login.png')}
      style={styles.logo}
      resizeMode="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Brigadeiro rosa Doce Ajuda"
    />
  );
}

const styles = StyleSheet.create({
  logo: { width: 84, height: 84 },
});
