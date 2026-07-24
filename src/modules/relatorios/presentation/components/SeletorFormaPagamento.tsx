import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function SeletorFormaPagamento({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: string[];
  valor: string;
  onChange: (value: string) => void;
}) {
  const options = ['TODAS', ...opcoes.filter(
    (item) => item && item !== 'TODAS'
  )];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const selected = option === valor;

        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              selected && styles.selected,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.text,
                selected && styles.selectedText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
    paddingBottom: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  selected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  text: {
    color: '#333',
    fontSize: 11,
    fontWeight: '800',
  },
  selectedText: {
    color: '#fff',
  },
});
