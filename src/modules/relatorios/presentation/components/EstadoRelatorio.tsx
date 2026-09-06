import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
          <View style={styles.iconBox}>
            <ActivityIndicator size="small" color="#FF3B73" />
          </View>
          <Text style={styles.title}>Preparando os indicadores</Text>
          <Text style={styles.text}>
            Gerando relatório...
          </Text>
        </>
      )}

      {status === 'INICIAL' && (
        <>
          <View style={styles.iconBox}>
            <Ionicons name="analytics-outline" size={25} color="#FF3B73" />
          </View>
          <Text style={styles.title}>Tudo pronto para analisar</Text>
          <Text style={styles.text}>{mensagemInicial}</Text>
        </>
      )}

      {status === 'VAZIO' && (
        <>
          <View style={styles.iconBox}>
            <Ionicons name="file-tray-outline" size={25} color="#FF3B73" />
          </View>
          <Text style={styles.title}>Nenhum resultado</Text>
          <Text style={styles.text}>Nenhum registro foi encontrado neste período.</Text>
        </>
      )}

      {status === 'ERRO' && (
        <>
          <View style={[styles.iconBox, styles.errorIconBox]}>
            <Ionicons name="alert-circle-outline" size={25} color="#D93C56" />
          </View>
          <Text style={styles.title}>Não foi possível concluir</Text>
          <Text style={styles.error}>
            {erro || 'Não foi possível gerar o relatório.'}
          </Text>

          {onTentarNovamente && (
            <TouchableOpacity
              style={styles.retry}
              onPress={onTentarNovamente}
              activeOpacity={0.8}
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
    minHeight: 170,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1E7EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    gap: 7,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  errorIconBox: {
    backgroundColor: '#FFF1F3',
  },
  title: {
    color: '#242329',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    color: '#737178',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  error: {
    color: '#A9344B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  retry: {
    backgroundColor: '#FF3B73',
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 17,
    marginTop: 4,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
