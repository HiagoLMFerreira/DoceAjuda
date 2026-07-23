import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Cliente } from '../../domain/models/Cliente';

type Props = {
  clientes: Cliente[];
  onSelecionar: (cliente: Cliente) => void;
};

export function ClienteList({ clientes, onSelecionar }: Props) {
  return (
    <FlatList
      data={clientes}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.rowCard}
          onPress={() => onSelecionar(item)}
          activeOpacity={0.75}
        >
          <Text
            style={[styles.cell, styles.cellNome]}
            numberOfLines={1}
          >
            {item.nome}
          </Text>

          <Text
            style={[styles.cell, styles.cellTelefone]}
            numberOfLines={1}
          >
            {item.telefone?.trim() ? item.telefone : '-'}
          </Text>

          <Text style={[styles.cell, styles.cellCompras]}>
            R$ {item.total_compras.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#777',
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cell: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  cellNome: {
    flex: 2,
    textAlign: 'left',
  },
  cellTelefone: {
    flex: 1.4,
    textAlign: 'center',
  },
  cellCompras: {
    flex: 1.3,
    textAlign: 'right',
  },
});
