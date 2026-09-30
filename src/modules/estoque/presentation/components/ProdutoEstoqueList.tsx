import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  formatCurrency,
  formatDecimal,
} from '../../../../core/formatters';
import type {
  ProdutoEstoque,
} from '../../domain/models/ProdutoEstoque';
import {
  obterNomeProduto,
  obterRotuloUnidade,
} from '../hooks/useEstoque';

type Props = {
  produtos: ProdutoEstoque[];
  onSelecionar: (
    produto: ProdutoEstoque
  ) => void;
};

export function ProdutoEstoqueList({
  produtos,
  onSelecionar,
}: Props) {
  return (
    <FlatList
      data={produtos}
      keyExtractor={(item) =>
        item.id.toString()
      }
      style={styles.list}
      contentContainerStyle={
        styles.listContent
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cube-outline"
              size={34}
              color="#FF3B73"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Nenhum produto encontrado
          </Text>

          <Text style={styles.emptyText}>
            Cadastre um produto ou altere a busca.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const zerado =
          Number(item.quantidade || 0) <= 0;

        return (
          <TouchableOpacity
            style={[
              styles.row,
              zerado && styles.rowZerado,
            ]}
            onPress={() =>
              onSelecionar(item)
            }
            activeOpacity={0.78}
          >
            <Text
              style={styles.cellNome}
              numberOfLines={2}
            >
              {obterNomeProduto(item)}
            </Text>

            <Text
              style={[
                styles.cellQuantidade,
                zerado &&
                  styles.textoZerado,
              ]}
              numberOfLines={1}
            >
              {formatDecimal(
                item.quantidade
              )}
            </Text>

            <Text
              style={styles.cellUnidade}
              numberOfLines={1}
            >
              {obterRotuloUnidade(
                item.unidade_medida
              )}
            </Text>

            <Text
              style={styles.cellPreco}
              numberOfLines={1}
            >
              {formatCurrency(
                item.preco_medio
              )}
            </Text>
          </TouchableOpacity>
        );
      }}
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
    minHeight: 64,
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

  rowZerado: {
    backgroundColor: '#FFF4F6',
    borderColor: '#FFC5D3',
  },

  cellNome: {
    flex: 2.1,
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
    paddingRight: 5,
  },

  cellQuantidade: {
    flex: 0.8,
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  cellUnidade: {
    flex: 0.8,
    color: '#737178',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  cellPreco: {
    flex: 1.35,
    color: '#242329',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
  },

  textoZerado: {
    color: '#D93C56',
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
