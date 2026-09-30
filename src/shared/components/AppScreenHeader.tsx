import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function AppScreenHeader({
  title,
  icon,
  onBack,
  right,
}: Props) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      <View style={styles.titleRow}>
        {icon && (
          <Ionicons name={icon} size={22} color="#111" />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#d1d1d1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
