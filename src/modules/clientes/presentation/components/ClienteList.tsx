import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="people-outline"
              size={34}
              color="#FF3B73"
            />
          </View>
          <Text style={styles.emptyTitle}>Nenhum cliente encontrado</Text>
          <Text style={styles.emptyText}>
            Cadastre um cliente ou altere a busca.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.rowCard}
          onPress={() => onSelecionar(item)}
          activeOpacity={0.75}
        >
          <View style={styles.cellNome}>
            <View style={styles.clientIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#FF3B73"
              />
            </View>
            <Text style={styles.clientName} numberOfLines={2}>
              {item.nome}
            </Text>
          </View>

          <Text
            style={[styles.cell, styles.cellTelefone]}
            numberOfLines={1}
          >
            {item.telefone?.trim() ? item.telefone : '-'}
          </Text>

          <Text style={[styles.cell, styles.cellCompras]}>
            R$ {item.total_compras.toFixed(2)}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={17}
            color="#FF3B73"
          />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 18,
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
  rowCard: {
    minHeight: 68,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    alignItems: 'center',
    shadowColor: '#5A3844',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },
  cell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#737178',
  },
  cellNome: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },
  clientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 8,
  },
  clientName: {
    flex: 1,
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
  },
  cellTelefone: {
    flex: 1.4,
    textAlign: 'center',
  },
  cellCompras: {
    flex: 1.3,
    textAlign: 'right',
    color: '#FF3B73',
    fontWeight: '900',
    paddingRight: 5,
  },
});
