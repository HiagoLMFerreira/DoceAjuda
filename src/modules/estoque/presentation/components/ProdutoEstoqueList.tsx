import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDecimal } from '../../../../core/formatters';
import type { ProdutoEstoque } from '../../domain/models/ProdutoEstoque';
import {
  obterNomeProduto,
  obterRotuloUnidade,
} from '../hooks/useEstoque';

type Props = {
  produtos: ProdutoEstoque[];
  onSelecionar: (produto: ProdutoEstoque) => void;
};

export function ProdutoEstoqueList({
  produtos,
  onSelecionar,
}: Props) {
  return (
    <FlatList
      data={produtos}
      keyExtractor={(item) => item.id.toString()}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Ionicons name="cube-outline" size={34} color="#777" />
          <Text style={styles.emptyText}>
            Nenhum produto encontrado.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const zerado = Number(item.quantidade || 0) <= 0;

        return (
          <TouchableOpacity
            style={[styles.row, zerado && styles.rowZerado]}
            onPress={() => onSelecionar(item)}
            activeOpacity={0.75}
          >
            <Text style={styles.cellNome} numberOfLines={2}>
              {obterNomeProduto(item)}
            </Text>

            <Text
              style={[
                styles.cellQuantidade,
                zerado && styles.textoZerado,
              ]}
              numberOfLines={1}
            >
              {formatDecimal(item.quantidade)}
            </Text>

            <Text style={styles.cellUnidade} numberOfLines={1}>
              {obterRotuloUnidade(item.unidade_medida)}
            </Text>

            <Text style={styles.cellPreco} numberOfLines={1}>
              {formatCurrency(item.preco_medio)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingBottom: 35 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  rowZerado: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#e0a0a0',
  },
  cellNome: {
    flex: 2.1,
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '800',
    paddingRight: 5,
  },
  cellQuantidade: {
    flex: 0.8,
    textAlign: 'center',
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '800',
  },
  cellUnidade: {
    flex: 0.8,
    textAlign: 'center',
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '800',
  },
  cellPreco: {
    flex: 1.35,
    textAlign: 'right',
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '800',
  },
  textoZerado: { color: '#b00020' },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    gap: 8,
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
    fontWeight: '700',
  },
});
