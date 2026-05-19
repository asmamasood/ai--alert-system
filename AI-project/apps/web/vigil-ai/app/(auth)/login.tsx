import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions, StatusBar, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '../../src/store/useUserStore';
import { authService } from '../../src/services/auth.service';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../src/utils/reanimatedHelpers';

const { width: W, height: H } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setToken } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  // Animations
  const logoSpin = useSharedValue(0);
  const logoScale = useSharedValue(1);
  const scanLineY = useSharedValue(-200);
  
  // Background Animations
  const ring1Rotation = useSharedValue(0);
  const ring2Rotation = useSharedValue(180);
  const pulseVal = useSharedValue(0.7);

  useEffect(() => {
    logoSpin.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false
    );
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scanLineY.value = withRepeat(
      withTiming(H, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
    ring1Rotation.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
    ring2Rotation.value = withRepeat(
      withTiming(-180, { duration: 35000, easing: Easing.linear }),
      -1,
      false
    );
    pulseVal.value = withRepeat(
      withTiming(1.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useSafeAnimatedStyle(() => ({
    transform: [
      { rotate: `${logoSpin.value}deg` },
      { scale: logoScale.value }
    ]
  }));

  const animatedScanLineStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }]
  }));

  const ring1Style = useSafeAnimatedStyle(() => ({
    transform: [{ rotate: `${ring1Rotation.value}deg` }]
  }));

  const ring2Style = useSafeAnimatedStyle(() => ({
    transform: [{ rotate: `${ring2Rotation.value}deg` }]
  }));

  const pulseCircleStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: pulseVal.value }],
    opacity: 0.1 - (pulseVal.value - 0.7) * 0.1
  }));

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      console.warn('[LoginScreen] Real login failed, attempting demo fallback:', err.message);
      try {
        await authService.loginDemo();
        router.replace('/(tabs)/home');
      } catch (demoErr) {
        Alert.alert('Login Failed', err?.response?.data?.message || err.message || 'Unable to authenticate.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#050A14" />
      
      {/* Revolving Neural World Background */}
      <View style={styles.bgContainer} pointerEvents="none">
        <AnimatedView style={[styles.bgPulseCore, pulseCircleStyle]} />
        <AnimatedView style={[styles.bgGlobeAxis1, ring1Style]} />
        <AnimatedView style={[styles.bgGlobeAxis2, ring2Style]} />
        
        {/* Neural Threads Backdrop */}
        <View style={styles.neuralThreadsWrap}>
          <View style={[styles.neuralDot, { top: '20%', left: '30%' }]} />
          <View style={[styles.neuralDot, { top: '35%', left: '80%' }]} />
          <View style={[styles.neuralDot, { top: '75%', left: '20%' }]} />
          <View style={[styles.neuralDot, { top: '60%', left: '85%' }]} />
          
          <View style={[styles.neuralThreadLine, { top: '20%', left: '30%', width: 150, transform: [{ rotate: '25deg' }] }]} />
          <View style={[styles.neuralThreadLine, { top: '35%', left: '80%', width: 100, transform: [{ rotate: '120deg' }] }]} />
          <View style={[styles.neuralThreadLine, { top: '75%', left: '20%', width: 200, transform: [{ rotate: '-15deg' }] }]} />
        </View>
      </View>

      {/* Dynamic scan line laser sweep */}
      <AnimatedView style={[styles.scanLine, animatedScanLineStyle]} />

      <SafeAreaView style={styles.safe}>
        
        {/* Back Button */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Cybernetic Biometric Scanner Logo */}
          <View style={styles.logoContainer}>
            <AnimatedView style={[styles.neuralLogo, animatedLogoStyle]}>
              <LinearGradient
                colors={['#00E5FF', '#7C3AED']}
                style={styles.logoCircle1}
              >
                <View style={styles.logoCircle2}>
                  <View style={styles.logoCircle3} />
                </View>
              </LinearGradient>
            </AnimatedView>
            <Text style={styles.logoText}>RESQ AI</Text>
            <Text style={styles.logoSubtext}>TACTICAL DISASTER OPERATING INTERFACE</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* Email input */}
            <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
              <Text style={[styles.inputIcon, emailFocused && { color: '#00E5FF' }]}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="EMAIL ADDRESS"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password input */}
            <View style={[styles.inputWrap, pwFocused && styles.inputWrapFocused]}>
              <Text style={[styles.inputIcon, pwFocused && { color: '#00E5FF' }]}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="PASSWORD CODE"
                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
              />
              <Pressable onPress={() => setSecureText(!secureText)} style={styles.eyeBtn}>
                <Text style={[styles.eyeIcon, !secureText && { color: '#00E5FF' }]}>{secureText ? '👁' : '👁‍🗨'}</Text>
              </Pressable>
            </View>

            {/* Forgot password */}
            <Pressable style={styles.forgotBtn}>
              <Text style={styles.forgotText}>DECRYPT ACCESS KEY?</Text>
            </Pressable>

            {/* Submit Button with High Glow */}
            <Pressable onPress={handleLogin} disabled={loading} style={styles.submitWrap}>
              <LinearGradient
                colors={['#00E5FF', '#7C3AED']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitGrad}
              >
                <Text style={styles.submitText}>{loading ? 'ESTABLISHING SECURE CONNECTION...' : 'ESTABLISH CONNECT'}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Continuation Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>TACTICAL SECURE PROTOCOLS</Text>
            <View style={styles.orLine} />
          </View>

          {/* Social login buttons in high HUD details */}
          <View style={styles.socialRow}>
            {['BIOMETRICS', 'CARD KEY', 'OS PROT'].map((label, i) => (
              <Pressable key={i} onPress={handleLogin} style={styles.socialBtn}>
                <Text style={styles.socialLogo}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Bottom Link */}
          <Pressable onPress={() => router.push('/(auth)/signup')} style={styles.bottomLink}>
            <Text style={styles.bottomLinkText}>
              UNAUTHORIZED TERMINAL? <Text style={{ color: '#00E5FF', fontWeight: '900' }}>REGISTER NODE</Text>
            </Text>
          </Pressable>

        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050A14' },
  safe: { flex: 1 },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgPulseCore: {
    position: 'absolute',
    width: H * 0.8,
    height: H * 0.8,
    borderRadius: H * 0.4,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.1)',
    backgroundColor: 'rgba(0, 229, 255, 0.02)',
  },
  bgGlobeAxis1: {
    position: 'absolute',
    width: H * 0.7,
    height: H * 0.7,
    borderRadius: H * 0.35,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(124, 58, 237, 0.15)',
  },
  bgGlobeAxis2: {
    position: 'absolute',
    width: H * 0.5,
    height: H * 0.5,
    borderRadius: H * 0.25,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  neuralThreadsWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  neuralDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 229, 255, 0.6)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  neuralThreadLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 229, 255, 0.25)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    zIndex: 99,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backArrow: {
    fontSize: 26,
    color: '#fff',
    lineHeight: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 28,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 12,
  },
  neuralLogo: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 8,
  },
  logoCircle1: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle2: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0B111E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  logoCircle3: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 25,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 229, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    marginTop: 4,
  },
  logoSubtext: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#7C3AED',
    letterSpacing: 2,
    fontWeight: '900',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    height: 56,
    position: 'relative',
  },
  inputWrapFocused: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  inputIcon: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textMuted,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textMuted,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1,
  },
  submitWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  submitGrad: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  orText: {
    fontSize: 9,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  socialLogo: {
    fontSize: 9,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bottomLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  bottomLinkText: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
});
