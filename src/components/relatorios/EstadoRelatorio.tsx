import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusVisualizacaoRelatorio } from '../../types/relatorios';

type Props = {
  status: StatusVisualizacaoRelatorio;
  erro?: string;
  mensagemInicial?: string;
  onTentarNovamente?: () => void;
};

export default function EstadoRelatorio({
  status,
  erro,
  mensagemInicial = 'Selecione um relatório e aplique os filtros.',
  onTentarNovamente,
}: Props) {
  if (status === 'SUCESSO') {
    return null;
  }

  if (status === 'CARREGANDO') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.titulo}>Carregando relatório...</Text>
      </View>
    );
  }

  if (status === 'VAZIO') {
    return (
      <View style={styles.container}>
        <Ionicons name="file-tray-outline" size={42} color="#666" />
        <Text style={styles.titulo}>Nenhum resultado encontrado</Text>
        <Text style={styles.mensagem}>
          Altere os filtros e gere o relatório novamente.
        </Text>
      </View>
    );
  }

  if (status === 'ERRO') {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={42} color="#b00020" />
        <Text style={styles.titulo}>Não foi possível gerar o relatório</Text>
        <Text style={styles.mensagem}>{erro || 'Tente novamente.'}</Text>

        {!!onTentarNovamente && (
          <TouchableOpacity
            style={styles.botaoTentarNovamente}
            onPress={onTentarNovamente}
          >
            <Text style={styles.botaoTentarNovamenteTexto}>TENTAR NOVAMENTE</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="bar-chart-outline" size={42} color="#666" />
      <Text style={styles.titulo}>Relatórios</Text>
      <Text style={styles.mensagem}>{mensagemInicial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 18,
  },

  titulo: {
    color: '#222',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },

  mensagem: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },

  botaoTentarNovamente: {
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#111',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  botaoTentarNovamenteTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
