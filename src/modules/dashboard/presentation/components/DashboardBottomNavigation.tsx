import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onInicio: () => void;
  onVendas: () => void;
  onMenu: () => void;
  onRelatorios: () => void;
  onSair: () => void;
};

type ItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress: () => void;
};

const PRIMARY = '#FF3B73';
const NAVIGATION_CONTENT_HEIGHT = 74;

function NavigationItem({
  label,
  icon,
  active = false,
  onPress,
}: ItemProps) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Ionicons
        name={icon}
        size={23}
        color={active ? PRIMARY : '#777680'}
      />

      <Text
        style={[
          styles.label,
          active && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function DashboardBottomNavigation({
  onInicio,
  onVendas,
  onMenu,
  onRelatorios,
  onSair,
}: Props) {
  const insets = useSafeAreaInsets();

  const bottomSpacing = Math.max(
    insets.bottom,
    8
  );

  return (
    <View
      style={[
        styles.container,
        {
          minHeight:
            NAVIGATION_CONTENT_HEIGHT +
            bottomSpacing,
          paddingBottom: bottomSpacing,
        },
      ]}
    >
      <NavigationItem
        label="Início"
        icon="home-outline"
        active
        onPress={onInicio}
      />

      <NavigationItem
        label="Vendas"
        icon="bag-handle-outline"
        onPress={onVendas}
      />

      <View style={styles.centralSlot}>
        <TouchableOpacity
          style={styles.centralButton}
          onPress={onMenu}
          activeOpacity={0.82}
        >
          <Ionicons
            name="grid-outline"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.centralLabel}>
          Menu
        </Text>
      </View>

      <NavigationItem
        label="Relatórios"
        icon="bar-chart-outline"
        onPress={onRelatorios}
      />

      <NavigationItem
        label="Sair"
        icon="log-out-outline"
        onPress={onSair}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1E7EA',
    paddingHorizontal: 8,
    paddingTop: 4,
    shadowColor: '#5A3844',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },

  item: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  label: {
    color: '#777680',
    fontSize: 10,
    fontWeight: '600',
  },

  labelActive: {
    color: PRIMARY,
    fontWeight: '800',
  },

  centralSlot: {
    flex: 1,
    height: NAVIGATION_CONTENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  centralButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    marginTop: -20,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  centralLabel: {
    color: '#777680',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
});
