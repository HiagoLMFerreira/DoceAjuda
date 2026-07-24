import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onBarcodePress?: () => void;
};

export default function AppSearchInput({
  value,
  placeholder,
  onChangeText,
  onBarcodePress,
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#888"
        onChangeText={onChangeText}
      />

      {!!value && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => onChangeText('')}
        >
          <Ionicons
            name="close-circle"
            size={21}
            color="#777"
          />
        </TouchableOpacity>
      )}

      {onBarcodePress && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBarcodePress}
        >
          <Ionicons
            name="barcode-outline"
            size={23}
            color="#111"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 49,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: '#111',
    fontSize: 14,
  },
  iconButton: {
    padding: 5,
  },
});
