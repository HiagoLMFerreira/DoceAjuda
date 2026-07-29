import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import type {
  ReceitaDetalhada,
} from '../../domain/models/Receita';

type Props = {
  visible: boolean;
  receita: ReceitaDetalhada | null;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function ReceitaDetailsModal({
  visible,
  receita,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          'top',
          'right',
          'bottom',
          'left',
        ]}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {receita && (
              <>
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <Ionicons
                      name="restaurant-outline"
                      size={25}
                      color="#FF3B73"
                    />
                  </View>

                  <View style={styles.headerText}>
                    <Text style={styles.title}>
                      Dados da receita
                    </Text>

                    <Text
                      style={styles.subtitle}
                      numberOfLines={1}
                    >
                      {receita.nome}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="close"
                      size={23}
                      color="#737178"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={
                    styles.scrollContent
                  }
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                      <Ionicons
                        name="restaurant"
                        size={32}
                        color="#FF3B73"
                      />
                    </View>

                    <View style={styles.heroText}>
                      <Text
                        style={styles.recipeName}
                        numberOfLines={2}
                      >
                        {receita.nome}
                      </Text>

                      <Text
                        style={styles.recipeYield}
                      >
                        Rendimento:{' '}
                        {receita.rendimento}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <InfoRow
                      icon="key-outline"
                      label="Identificador"
                      value={String(receita.id)}
                    />

                    <InfoRow
                      icon="layers-outline"
                      label="Rendimento"
                      value={receita.rendimento}
                      last
                    />
                  </View>

                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="basket-outline"
                      size={21}
                      color="#FF3B73"
                    />

                    <Text style={styles.sectionTitle}>
                      Ingredientes
                    </Text>
                  </View>

                  <View style={styles.ingredientsCard}>
                    {receita.itens.length === 0 ? (
                      <Text style={styles.emptyText}>
                        Nenhum ingrediente cadastrado.
                      </Text>
                    ) : (
                      receita.itens.map(
                        (item, indice) => (
                          <View
                            key={item.id}
                            style={[
                              styles.ingredientRow,
                              indice ===
                                receita.itens.length -
                                  1 &&
                                styles.lastRow,
                            ]}
                          >
                            <View
                              style={styles.ingredientIcon}
                            >
                              <Ionicons
                                name="cube-outline"
                                size={18}
                                color="#FF3B73"
                              />
                            </View>

                            <Text
                              style={styles.ingredientName}
                              numberOfLines={2}
                            >
                              {item.produto_nome}
                            </Text>

                            <Text
                              style={styles.ingredientQuantity}
                            >
                              {item.quantidade_usada}
                            </Text>
                          </View>
                        )
                      )
                    )}
                  </View>

                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="document-text-outline"
                      size={21}
                      color="#FF3B73"
                    />

                    <Text style={styles.sectionTitle}>
                      Modo de preparo
                    </Text>
                  </View>

                  <View style={styles.preparationCard}>
                    <Text style={styles.preparationText}>
                      {receita.modo_preparo ||
                        'Modo de preparo não informado.'}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.footerButton,
                      styles.editButton,
                    ]}
                    onPress={onEdit}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#FF3B73"
                    />

                    <Text
                      style={styles.editButtonText}
                    >
                      Editar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.footerButton,
                      styles.deleteButton,
                    ]}
                    onPress={onDelete}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.deleteButtonText}
                    >
                      Excluir
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoRow,
        last && styles.lastRow,
      ]}
    >
      <View style={styles.infoLabelArea}>
        <View style={styles.infoIcon}>
          <Ionicons
            name={icon}
            size={18}
            color="#FF3B73"
          />
        </View>

        <Text style={styles.infoLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={styles.infoValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      'rgba(24, 16, 20, 0.48)',
  },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(24, 16, 20, 0.48)',
  },

  sheet: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: '#FFFDFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  handle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E8DDE1',
    marginTop: 10,
  },

  header: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: '#242329',
    fontSize: 20,
    fontWeight: '900',
  },

  subtitle: {
    color: '#737178',
    fontSize: 12,
    marginTop: 3,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F1F3',
    marginLeft: 10,
  },

  scroll: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 22,
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F9',
    borderWidth: 1,
    borderColor: '#FFD1DD',
    borderRadius: 18,
    padding: 15,
    marginBottom: 16,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 13,
  },

  heroText: {
    flex: 1,
  },

  recipeName: {
    color: '#242329',
    fontSize: 17,
    fontWeight: '900',
  },

  recipeYield: {
    color: '#FF3B73',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  infoRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F6EDF0',
    paddingVertical: 10,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  infoLabelArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  infoLabel: {
    color: '#737178',
    fontSize: 12,
    fontWeight: '700',
  },

  infoValue: {
    flex: 1.2,
    color: '#242329',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },

  sectionTitle: {
    color: '#242329',
    fontSize: 16,
    fontWeight: '900',
  },

  ingredientsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    paddingHorizontal: 13,
    marginBottom: 18,
  },

  ingredientRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F6EDF0',
    paddingVertical: 9,
  },

  ingredientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F4',
    marginRight: 10,
  },

  ingredientName: {
    flex: 1,
    color: '#242329',
    fontSize: 12,
    fontWeight: '800',
    paddingRight: 10,
  },

  ingredientQuantity: {
    color: '#FF3B73',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
  },

  preparationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1E7EA',
    borderRadius: 18,
    padding: 15,
  },

  preparationText: {
    color: '#4D4A50',
    fontSize: 13,
    lineHeight: 20,
  },

  emptyText: {
    color: '#737178',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 22,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1E7EA',
  },

  footerButton: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },

  editButton: {
    backgroundColor: '#FFF0F4',
    borderWidth: 1,
    borderColor: '#FFD1DD',
  },

  deleteButton: {
    backgroundColor: '#D93C56',
  },

  editButtonText: {
    color: '#FF3B73',
    fontSize: 14,
    fontWeight: '900',
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
