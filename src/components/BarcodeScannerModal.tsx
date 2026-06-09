import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from 'expo-camera';

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
  const [permissaoCamera, solicitarPermissaoCamera] = useCameraPermissions();
  const [codigoJaLido, setCodigoJaLido] = useState(false);

  const verificarPermissao = async () => {
    if (permissaoCamera?.granted) return true;

    const permissao = await solicitarPermissaoCamera();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Para ler o código de barras, permita o acesso à câmera.'
      );
      return false;
    }

    return true;
  };

  const aoLerCodigo = async (resultado: BarcodeScanningResult) => {
    if (codigoJaLido) return;

    const permitido = await verificarPermissao();
    if (!permitido) return;

    const codigo = resultado.data?.trim();
    if (!codigo) return;

    setCodigoJaLido(true);
    onCodeScanned(codigo);
  };

  const fecharScanner = () => {
    setCodigoJaLido(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onShow={() => setCodigoJaLido(false)}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={codigoJaLido ? undefined : aoLerCodigo}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'upc_a',
              'upc_e',
              'code128',
              'code39',
              'code93',
              'codabar',
              'itf14',
              'qr',
            ],
          }}
        />

        <View style={styles.overlay}>
          <Text style={styles.titulo}>Aponte para o código de barras</Text>

          <Text style={styles.subtitulo}>
            O código será preenchido automaticamente.
          </Text>

          <TouchableOpacity style={styles.botaoFechar} onPress={fecharScanner}>
            <Text style={styles.textoBotaoFechar}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },

  titulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitulo: {
    color: '#ddd',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },

  botaoFechar: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  textoBotaoFechar: {
    color: '#000',
    fontWeight: 'bold',
  },
});