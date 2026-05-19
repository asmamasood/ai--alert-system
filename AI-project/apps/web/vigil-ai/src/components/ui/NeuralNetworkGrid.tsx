import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G, Line } from 'react-native-svg';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface NeuralNetworkGridProps {
  pulseScale?: any;
}

interface NeuralNode {
  id: string;
  label: string;
  x0: number; // base x percentage
  y0: number; // base y percentage
  color: string;
  isPrimary?: boolean;
}

interface NeuralLink {
  from: string;
  to: string;
  color: string;
  speed: number;
}

// ── NEURAL AI COGNITIVE NODES ──
const NEURAL_NODES: NeuralNode[] = [
  // Primary tactical nodes matching the onboarding layout
  { id: 'critical', label: '⚠️ CRITICAL_NODE', x0: 22, y0: 22, color: DESIGN_TOKENS.colors.neonRed, isPrimary: true },
  { id: 'high_risk', label: '🔥 HIGH_RISK', x0: 72, y0: 50, color: DESIGN_TOKENS.colors.neonOrange, isPrimary: true },
  { id: 'monitored', label: '🌊 MONITORED', x0: 28, y0: 75, color: DESIGN_TOKENS.colors.neonCyan, isPrimary: true },
  
  // Secondary background AI thinking nodes (synapses / brain cells)
  { id: 'core_e', label: '🧠 COGNITION_E', x0: 50, y0: 48, color: DESIGN_TOKENS.colors.neonPurple }, // Center processor
  { id: 'core_a', label: '🛰️ SAT_LINK_A', x0: 42, y0: 28, color: DESIGN_TOKENS.colors.neonPurpleLight },
  { id: 'core_b', label: '🎛️ DATA_BUS_B', x0: 60, y0: 24, color: DESIGN_TOKENS.colors.neonBlue },
  { id: 'core_c', label: '🧬 PREDICT_C', x0: 36, y0: 58, color: DESIGN_TOKENS.colors.neonPurpleLight },
  { id: 'core_d', label: '🛡️ RISK_BUS_D', x0: 58, y0: 70, color: DESIGN_TOKENS.colors.neonBlue },
];

// ── SYNAPSE PATHWAYS CONNECTING NEURONS ──
const NEURAL_LINKS: NeuralLink[] = [
  // Sector inputs head to center cognition processor
  { from: 'critical', to: 'core_e', color: DESIGN_TOKENS.colors.neonRed, speed: 0.8 },
  { from: 'high_risk', to: 'core_e', color: DESIGN_TOKENS.colors.neonOrange, speed: 1.1 },
  { from: 'monitored', to: 'core_e', color: DESIGN_TOKENS.colors.neonCyan, speed: 0.9 },

  // Center cognition branches to secondary processing units
  { from: 'core_e', to: 'core_a', color: DESIGN_TOKENS.colors.neonPurple, speed: 1.4 },
  { from: 'core_e', to: 'core_c', color: DESIGN_TOKENS.colors.neonPurple, speed: 1.2 },
  
  // Cross-synapse processing channels
  { from: 'core_a', to: 'core_b', color: DESIGN_TOKENS.colors.neonBlue, speed: 1.6 },
  { from: 'core_c', to: 'core_d', color: DESIGN_TOKENS.colors.neonBlue, speed: 1.3 },
  { from: 'core_b', to: 'high_risk', color: DESIGN_TOKENS.colors.neonCyan, speed: 1.0 },
  { from: 'core_d', to: 'monitored', color: DESIGN_TOKENS.colors.neonPurple, speed: 1.2 },
];

export const NeuralNetworkGrid: React.FC<NeuralNetworkGridProps> = () => {
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Continuously advance time
      setTime((prev) => prev + delta);

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ── 1. Calculate Floating Positions for Neurons ──
  const nodesMap = new Map<string, { x: number; y: number }>();
  
  const floatingNodes = NEURAL_NODES.map((node, index) => {
    // Generate organic floating motion using multiple sine waves
    const frequency = 1.2;
    const amplitude = 1.8; // Floating bounds in percentage coordinate
    
    const dx = Math.sin(time * frequency + index * 1.5) * amplitude;
    const dy = Math.cos(time * (frequency * 0.9) + index * 2.2) * amplitude;
    
    const x = node.x0 + dx;
    const y = node.y0 + dy;
    
    nodesMap.set(node.id, { x, y });
    
    return {
      ...node,
      x,
      y
    };
  });

  // ── 2. Calculate Synaptic Signal Pulses ──
  const signalPulses: { px: number; py: number; color: string; size: number }[] = [];
  
  NEURAL_LINKS.forEach((link, idx) => {
    const fromNode = nodesMap.get(link.from);
    const toNode = nodesMap.get(link.to);
    
    if (fromNode && toNode) {
      // Calculate animated position (0 to 1) along the synapse line
      // speed scales progress, loop using modulo
      const baseProgress = (time * link.speed * 0.28) % 1;
      
      // Let's create multiple signal pulses traveling on each synapse line!
      const numPulsesOnLine = 2;
      for (let pIdx = 0; pIdx < numPulsesOnLine; pIdx++) {
        const offsetProgress = (baseProgress + pIdx / numPulsesOnLine) % 1;
        
        // Linear interpolation in percentage space
        const x = fromNode.x + offsetProgress * (toNode.x - fromNode.x);
        const y = fromNode.y + offsetProgress * (toNode.y - fromNode.y);
        
        // Fade in/out at extremes to prevent harsh popping
        const pulseSize = 2.0 + Math.sin(offsetProgress * Math.PI) * 1.8;
        
        signalPulses.push({
          px: x,
          py: y,
          color: link.color,
          size: pulseSize
        });
      }
    }
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {/* Neon path gradients */}
          <SvgLinearGradient id="synapseGlow" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <Stop offset="50%" stopColor="#00E5FF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#2979FF" stopOpacity="0.2" />
          </SvgLinearGradient>
        </Defs>

        {/* ── DRAW SYNAPTIC NETWORKING CONNECTIONS (Synapse pathways) ── */}
        <G strokeWidth="0.4" fill="none">
          {NEURAL_LINKS.map((link, idx) => {
            const from = nodesMap.get(link.from);
            const to = nodesMap.get(link.to);
            if (!from || !to) return null;

            // Faint breathing breathing backdrop synapse line
            const baseOpacity = 0.08 + Math.sin(time * 2 + idx) * 0.05;
            
            return (
              <G key={`link-${idx}`}>
                {/* Secondary thick glow trace */}
                <Line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={link.color}
                  strokeWidth="0.8"
                  opacity={baseOpacity * 0.6}
                />
                {/* Primary thin circuit trace */}
                <Line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={link.color}
                  strokeWidth="0.3"
                  opacity={0.15 + baseOpacity}
                  strokeDasharray={idx % 2 === 0 ? "1 2" : undefined}
                />
              </G>
            );
          })}
        </G>

        {/* ── DRAW ACTIVE NEURAL DATA SIGNALS (Synaptic Pulses) ── */}
        <G>
          {signalPulses.map((pulse, idx) => (
            <G key={`pulse-${idx}`}>
              {/* Outer halo */}
              <Circle
                cx={`${pulse.px}%`}
                cy={`${pulse.py}%`}
                r={pulse.size * 1.5}
                fill={pulse.color}
                opacity="0.16"
              />
              {/* Core beacon */}
              <Circle
                cx={`${pulse.px}%`}
                cy={`${pulse.py}%`}
                r={pulse.size * 0.7}
                fill="#FFFFFF"
                opacity="0.9"
              />
              <Circle
                cx={`${pulse.px}%`}
                cy={`${pulse.py}%`}
                r={pulse.size * 0.4}
                fill={pulse.color}
              />
            </G>
          ))}
        </G>

        {/* ── DRAW INTERNAL COGNITIVE NEURAL NODES (Synapses) ── */}
        <G>
          {floatingNodes.map((node) => {
            if (node.isPrimary) return null; // Primary nodes are rendered separately via NodeHUD for interactivity

            const breath = 1.0 + Math.sin(time * 3 + node.x) * 0.2;
            
            return (
              <G key={node.id}>
                {/* Outward shockwave ripple */}
                <Circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={1.8 * breath}
                  stroke={node.color}
                  strokeWidth="0.15"
                  fill="none"
                  opacity={0.16 - breath * 0.05}
                />
                {/* Interactive ring */}
                <Circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={1.2}
                  stroke={node.color}
                  strokeWidth="0.3"
                  fill="rgba(5, 10, 20, 0.95)"
                  opacity="0.8"
                />
                {/* Dynamic Node Core */}
                <Circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={0.5}
                  fill={node.color}
                />
              </G>
            );
          })}
        </G>
      </Svg>

      {/* Floating HUD labels overlaying coordinates inside the neural grids */}
      {floatingNodes.map((node) => {
        if (node.isPrimary) return null;

        // Hide half of background labels dynamically to avoid clutter
        const hash = node.id.charCodeAt(0) + node.id.charCodeAt(1);
        if (hash % 2 === 0) return null;

        return (
          <View
            key={`label-${node.id}`}
            style={[
              styles.floatingHudTag,
              {
                left: `${node.x}%`,
                top: `${node.y + 2.8}%`,
              }
            ]}
          >
            <Text style={[styles.hudTagText, { color: node.color }]}>
              {node.label} [ACTIVATE]
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingHudTag: {
    position: 'absolute',
    transform: [{ translateX: -40 }],
    backgroundColor: 'rgba(5, 10, 20, 0.85)',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  hudTagText: {
    fontSize: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
