import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { SUPPORTED_BARCODE_TYPES } from '../domain/BarcodeScannerTypes';
import { useBarcodeScanner } from './useBarcodeScanner';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCodeScanned: (codigo: string) => void;
};

export default function BarcodeScannerModal({
  visible,
  onClose,
  onCodeScanned,
}: Props) {
  const [permission, requestPermission] =
    useCameraPermissions();

  const scanner = useBarcodeScanner(onCodeScanned);

  const handleBarcodeScanned = async (
    result: BarcodeScanningResult
  ) => {
    if (scanner.alreadyScanned) return;

    if (!permission?.granted) {
      const requested = await requestPermission();

      if (!requested.granted) {
        Alert.alert(
          'Permissão necessária',
          'Para ler o código de barras, permita o acesso à câmera.'
        );
        return;
      }
    }

    try {
      scanner.handleCode(result.data ?? '');
    } catch (error) {
      Alert.alert(
        'Código inválido',
        error instanceof Error
          ? error.message
          : 'Não foi possível ler o código.'
      );
    }
  };

  const close = () => {
    scanner.reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={scanner.reset}
      onRequestClose={close}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={
            scanner.alreadyScanned
              ? undefined
              : handleBarcodeScanned
          }
          barcodeScannerSettings={{
            barcodeTypes: [...SUPPORTED_BARCODE_TYPES],
          }}
        />

        <View style={styles.overlay}>
          <Text style={styles.title}>
            Aponte para o código de barras
          </Text>

          <Text style={styles.subtitle}>
            O código será preenchido automaticamente.
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={close}
          >
            <Text style={styles.closeText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  closeButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
