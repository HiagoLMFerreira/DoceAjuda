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
    gap: 8,
    paddingBottom: 14,
  },
  option: {
    borderWidth: 1,
    borderColor: '#F1E7EA',
    backgroundColor: '#FFFDFE',
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  selected: {
    backgroundColor: '#FFF0F4',
    borderColor: '#FF3B73',
  },
  text: {
    color: '#737178',
    fontSize: 11,
    fontWeight: '800',
  },
  selectedText: {
    color: '#D12E60',
  },
});
