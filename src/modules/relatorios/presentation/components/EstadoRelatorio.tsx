import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StatusVisualizacaoRelatorio } from '../../domain/models/Relatorio';

export default function EstadoRelatorio({
  status,
  erro,
  mensagemInicial,
  onTentarNovamente,
}: {
  status: StatusVisualizacaoRelatorio;
  erro: string;
  mensagemInicial: string;
  onTentarNovamente?: () => void;
}) {
  if (status === 'SUCESSO') return null;

  return (
    <View style={styles.container}>
      {status === 'CARREGANDO' && (
        <>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.text}>
            Gerando relatório...
          </Text>
        </>
      )}

      {status === 'INICIAL' && (
        <Text style={styles.text}>
          {mensagemInicial}
        </Text>
      )}

      {status === 'VAZIO' && (
        <Text style={styles.text}>
          Nenhum registro foi encontrado.
        </Text>
      )}

      {status === 'ERRO' && (
        <>
          <Text style={styles.error}>
            {erro || 'Não foi possível gerar o relatório.'}
          </Text>

          {onTentarNovamente && (
            <TouchableOpacity
              style={styles.retry}
              onPress={onTentarNovamente}
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 105,
    borderRadius: 13,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  text: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
  error: {
    color: '#b00020',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  retry: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  retryText: {
    color: '#fff',
    fontWeight: '800',
  },
});
