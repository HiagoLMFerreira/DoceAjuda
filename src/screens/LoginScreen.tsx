import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Informe o login e a senha para continuar.');
      return;
    }

    try {
      await login(email.trim(), senha);
      navigation.replace('Menu');
    } catch (err: any) {
      Alert.alert(
        'Erro no login',
        'Login ou senha inválidos. Verifique os dados e tente novamente.'
      );
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DOCE AJUDA</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Login"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.buttonText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 3,
    textAlign: 'center',
  },
  form: {
    marginHorizontal: 10,
  },
  input: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#f8f8f8',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});