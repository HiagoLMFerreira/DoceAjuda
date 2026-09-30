import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onRequestClose: () => void;
  scrollable?: boolean;
};

export default function AppModalContainer({
  visible,
  title,
  children,
  footer,
  onRequestClose,
  scrollable = true,
}: Props) {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.body}>{content}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    color: '#111',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 15,
  },
  body: {
    flexShrink: 1,
  },
  footer: {
    marginTop: 14,
  },
});
