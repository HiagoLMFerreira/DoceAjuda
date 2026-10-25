import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAuth } from '../useAuth';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;

const COLORS = {
  primary: '#FF3B73',
  primaryPressed: '#E92F63',
  primarySoft: '#FFF0F4',

  background: '#FFFCFD',
  surface: '#FFFFFF',

  textPrimary: '#25242A',
  textSecondary: '#76747A',
  placeholder: '#96949A',

  border: '#EDE4E7',
  shadow: '#6B3C4C',
};

export default function LoginScreen({
  navigation,
}: Props) {
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tamanhoLogo = Math.min(240, Math.max(140, height * 0.28), width - 48);
  const scrollRef = useRef<ScrollView>(null);
  const emailRef = useRef<TextInput>(null);
  const senhaRef = useRef<TextInput>(null);
  const campoAtivo = useRef<TextInput | null>(null);
  const tecladoVisivel = useRef(false);
  const frameRolagem = useRef<number | null>(null);

  const mostrarCampoAtivo = useCallback(() => {
    if (!tecladoVisivel.current) return;
    if (frameRolagem.current !== null) cancelAnimationFrame(frameRolagem.current);
    frameRolagem.current = requestAnimationFrame(() => {
      frameRolagem.current = null;
      if (tecladoVisivel.current && campoAtivo.current) {
        scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(campoAtivo.current, 24, true);
      }
    });
  }, []);

  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => {
      tecladoVisivel.current = true;
      mostrarCampoAtivo();
    });
    const ocultar = Keyboard.addListener('keyboardDidHide', () => {
      tecladoVisivel.current = false;
    });
    return () => {
      mostrar.remove();
      ocultar.remove();
      if (frameRolagem.current !== null) cancelAnimationFrame(frameRolagem.current);
    };
  }, [mostrarCampoAtivo]);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] =
    useState(false);
  const [carregando, setCarregando] =
    useState(false);

  const handleLogin = async () => {
    const emailFormatado = email.trim();

    if (!emailFormatado || !senha.trim()) {
      Alert.alert(
        'Atenção',
        'Informe o e-mail e a senha para continuar.'
      );

      return;
    }

    try {
      setCarregando(true);

      await login(emailFormatado, senha);

      navigation.replace('Dashboard');
    } catch {
      Alert.alert(
        'Erro no login',
        'E-mail ou senha inválidos. Verifique os dados e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >
      <ScrollView
        ref={scrollRef}
        onLayout={mostrarCampoAtivo}
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: Math.max(insets.top, 16) + 16, paddingBottom: Math.max(insets.bottom, 16) },
        ]}
        bounces={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.decorationLarge} />
        <View style={styles.decorationSmall} />
        <View style={styles.sprinkleOne} />
        <View style={styles.sprinkleTwo} />
        <View style={styles.sprinkleThree} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../../../../assets/doce-ajuda-logo-transparente.png')}
            style={[styles.brandLogo, { width: tamanhoLogo, height: tamanhoLogo }]}
            resizeMode="contain"
            accessible
            accessibilityRole="image"
            accessibilityLabel="DoceAjuda: cupcake com coração, lista e gráfico"
          />
        </View>

        <View style={styles.brandContainer}>
          <Text style={styles.subtitle}>
            Sua confeitaria organizada,
          </Text>

          <Text style={styles.subtitle}>
            seu negócio crescendo.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="mail-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <TextInput
              ref={emailRef}
              onFocus={() => {
                campoAtivo.current = emailRef.current;
                mostrarCampoAtivo();
              }}
              onSubmitEditing={() => senhaRef.current?.focus()}
              submitBehavior="submit"
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={
                COLORS.placeholder
              }
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              editable={!carregando}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color={COLORS.primary}
              />
            </View>

            <TextInput
              ref={senhaRef}
              onFocus={() => {
                campoAtivo.current = senhaRef.current;
                mostrarCampoAtivo();
              }}
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={
                COLORS.placeholder
              }
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVisivel}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              editable={!carregando}
            />

            <TouchableOpacity
              style={styles.passwordButton}
              onPress={() =>
                setSenhaVisivel(
                  (valorAtual) => !valorAtual
                )
              }
              activeOpacity={0.7}
              disabled={carregando}
            >
              <Ionicons
                name={
                  senhaVisivel
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={25}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              carregando &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.loginButtonText}>
                ENTRAR
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Ionicons
            name="heart"
            size={16}
            color={COLORS.primary}
          />

          <Text style={styles.footerText}>
            Feito com amor para confeiteiras
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  decorationLarge: {
    position: 'absolute',
    top: -90,
    left: -80,
    width: 360,
    height: 250,
    borderRadius: 180,
    backgroundColor: '#FFDCE7',
    opacity: 0.7,
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  decorationSmall: {
    position: 'absolute',
    top: 30,
    left: -100,
    width: 330,
    height: 170,
    borderRadius: 170,
    backgroundColor: '#FFF0F4',
    opacity: 0.9,
    transform: [
      {
        rotate: '-8deg',
      },
    ],
  },

  sprinkleOne: {
    position: 'absolute',
    top: 110,
    left: 62,
    width: 5,
    height: 14,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    transform: [
      {
        rotate: '38deg',
      },
    ],
  },

  sprinkleTwo: {
    position: 'absolute',
    top: 150,
    left: 118,
    width: 5,
    height: 13,
    borderRadius: 5,
    backgroundColor: '#FFA4BD',
    transform: [
      {
        rotate: '-30deg',
      },
    ],
  },

  sprinkleThree: {
    position: 'absolute',
    top: 95,
    left: 170,
    width: 5,
    height: 12,
    borderRadius: 5,
    backgroundColor: '#FFB9CC',
    transform: [
      {
        rotate: '20deg',
      },
    ],
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },

  brandLogo: {
    flexShrink: 0,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '400',
    textAlign: 'center',
  },

  form: {
    width: '100%',
  },

  inputContainer: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    marginRight: 12,
  },

  input: {
    flex: 1,
    minHeight: 58,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '400',
  },

  passwordButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 17,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 7,
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 7,
  },

  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
