import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type {
  Receita,
} from '../../domain/models/Receita';

type Props = {
  receitas: Receita[];
  onPress: (id: number) => void;
};

export function ReceitaList({
  receitas,
  onPress,
}: Props) {
  return (
    <FlatList
      data={receitas}
      keyExtractor={(item) =>
        String(item.id)
      }
      style={styles.list}
      contentContainerStyle={
        styles.listContent
      }
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="restaurant-outline"
              size={34}
              color="#FF3B73"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Nenhuma receita encontrada
          </Text>

          <Text style={styles.emptyText}>
            Cadastre uma receita ou altere a busca.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            onPress(item.id)
          }
          activeOpacity={0.78}
        >
          <View style={styles.recipeIcon}>
            <Ionicons
              name="restaurant-outline"
              size={20}
              color="#FF3B73"
            />
          </View>

          <Text
            style={styles.cellName}
            numberOfLines={2}
          >
            {item.nome}
          </Text>

          <Text
            style={styles.cellYield}
            numberOfLines={2}
          >
            {item.rendimento}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#FF3B73"
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 18,
  },

  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    paddingHorizontal: 10,
    marginBottom: 8,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  recipeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  cellName: {
    flex: 1.5,
    color: '#242329',
    fontSize: 13,
    fontWeight: '800',
    paddingRight: 8,
  },

  cellYield: {
    flex: 1,
    color: '#737178',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    paddingRight: 6,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginBottom: 14,
  },

  emptyTitle: {
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyText: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
});
