import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface RevolvingGlobeProps {
  size?: number;
  interactive?: boolean;
}

// ── LANDMASS CENTER BOUNDS FOR procedural dot matrix ──
const LAND_CENTERS = [
  { lat: 40, lon: -100, rad: 26 },   // North America
  { lat: 58, lon: -95, rad: 20 },    // Canada / NA North
  { lat: -20, lon: -60, rad: 22 },   // South America
  { lat: -5, lon: -60, rad: 15 },    // SA North
  { lat: 8, lon: 20, rad: 22 },      // Africa North
  { lat: -22, lon: 24, rad: 16 },    // Africa South
  { lat: 50, lon: 15, rad: 16 },     // Europe
  { lat: 58, lon: 85, rad: 28 },     // Russia / Central Asia
  { lat: 36, lon: 112, rad: 22 },    // China / East Asia
  { lat: 18, lon: 80, rad: 13 },     // India
  { lat: -25, lon: 135, rad: 17 },   // Australia
  { lat: 72, lon: -40, rad: 12 },    // Greenland
  { lat: 5, lon: 105, rad: 7 },      // Sumatra/Malaysia
  { lat: -5, lon: 120, rad: 7 },     // Indonesia
  { lat: 36, lon: 138, rad: 5 },     // Japan
  { lat: 62, lon: 130, rad: 10 },    // Northeast Russia
];

// Pre-generate unit points for performance
const generateLandPoints = () => {
  const points: { lat: number; lon: number }[] = [];
  // Spaced coordinates on sphere surface
  for (let lat = -75; lat <= 75; lat += 5) {
    const latRad = (lat * Math.PI) / 180;
    // Adjust longitude counts based on latitude to maintain uniform density on sphere
    const numLon = Math.max(4, Math.round(72 * Math.cos(latRad)));
    for (let i = 0; i < numLon; i++) {
      const lon = -180 + (360 * i) / numLon;
      
      const isLand = LAND_CENTERS.some(center => {
        let dLon = Math.abs(lon - center.lon);
        if (dLon > 180) dLon = 360 - dLon;
        const d = Math.sqrt((lat - center.lat) ** 2 + dLon ** 2);
        return d < center.rad;
      });
      
      if (isLand) {
        points.push({ lat, lon });
      }
    }
  }
  return points;
};

const LAND_POINTS = generateLandPoints();

// ── TACTICAL EMERGENCY HOTSPOTS ──
const HOT_SPOTS = [
  { id: 'NY_SEC', label: 'NY_COGNITIVE', lat: 40.7, lon: -74, color: DESIGN_TOKENS.colors.neonRed },
  { id: 'LDN_SEC', label: 'LDN_SECTOR', lat: 51.5, lon: -0.1, color: DESIGN_TOKENS.colors.neonOrange },
  { id: 'TKY_SEC', label: 'TKY_CORE', lat: 35.6, lon: 139.7, color: DESIGN_TOKENS.colors.neonRed },
  { id: 'SYD_SEC', label: 'SYD_MONITOR', lat: -33.8, lon: 151.2, color: DESIGN_TOKENS.colors.neonCyan },
];

export const RevolvingGlobe: React.FC<RevolvingGlobeProps> = ({ size = 220, interactive = true }) => {
  const [spin, setSpin] = useState(0);
  const [pulse, setPulse] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Constants for projection
  const cx = 110;
  const cy = 110;
  const R = 82; // Sphere radius inside 220 viewBox
  const pitch = 0.38; // Tilt angle in radians (~22 degrees)

  useEffect(() => {
    let lastTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Rotate continuously
      setSpin((prev) => (prev + delta * 0.16) % (Math.PI * 2));
      
      // Pulse effects for ripples
      setPulse((prev) => (prev + delta * 1.5) % 1);

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ── 1. Calculate Grid Paths ──
  const parallelsPaths: { front: string; back: string }[] = [];
  const meridiansPaths: { front: string; back: string }[] = [];

  // Parallel latitudes
  const latSteps = [-60, -40, -20, 0, 20, 40, 60];
  latSteps.forEach((latVal) => {
    const latRad = (latVal * Math.PI) / 180;
    const points = [];
    
    // Draw circles using 72 points for smoothness
    for (let step = 0; step <= 72; step++) {
      const lonRad = (step * 360 * Math.PI) / (72 * 180);
      const rotatedLonRad = lonRad + spin;

      // 3D coords
      const x = R * Math.cos(latRad) * Math.sin(rotatedLonRad);
      const y = R * Math.sin(latRad);
      const z = R * Math.cos(latRad) * Math.cos(rotatedLonRad);

      // Pitch (X-rotation)
      const y2 = y * Math.cos(pitch) - z * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z * Math.cos(pitch);

      points.push({ px: cx + x, py: cy + y2, z: z2 });
    }

    // Build front and back path commands
    let frontPath = '';
    let backPath = '';
    let inFront = false;
    let inBack = false;

    points.forEach((p) => {
      if (p.z > 0) {
        if (!inFront) {
          frontPath += ` M ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
          inFront = true;
        } else {
          frontPath += ` L ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
        }
        inBack = false;
      } else {
        if (!inBack) {
          backPath += ` M ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
          inBack = true;
        } else {
          backPath += ` L ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
        }
        inFront = false;
      }
    });

    parallelsPaths.push({ front: frontPath, back: backPath });
  });

  // Meridian longitudes
  const lonSteps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  lonSteps.forEach((lonVal) => {
    const lonRad = (lonVal * Math.PI) / 180;
    const points = [];

    // Draw longitude arch using 36 points from pole to pole
    for (let step = -18; step <= 18; step++) {
      const latRad = (step * 90 * Math.PI) / (18 * 180);
      const rotatedLonRad = lonRad + spin;

      const x = R * Math.cos(latRad) * Math.sin(rotatedLonRad);
      const y = R * Math.sin(latRad);
      const z = R * Math.cos(latRad) * Math.cos(rotatedLonRad);

      const y2 = y * Math.cos(pitch) - z * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z * Math.cos(pitch);

      points.push({ px: cx + x, py: cy + y2, z: z2 });
    }

    let frontPath = '';
    let backPath = '';
    let inFront = false;
    let inBack = false;

    points.forEach((p) => {
      if (p.z > 0) {
        if (!inFront) {
          frontPath += ` M ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
          inFront = true;
        } else {
          frontPath += ` L ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
        }
        inBack = false;
      } else {
        if (!inBack) {
          backPath += ` M ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
          inBack = true;
        } else {
          backPath += ` L ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
        }
        inFront = false;
      }
    });

    meridiansPaths.push({ front: frontPath, back: backPath });
  });

  // ── 2. Project Landmass Points ──
  const projectedLandDots: { px: number; py: number; r: number; opacity: number; z: number }[] = [];
  LAND_POINTS.forEach((lp) => {
    const latRad = (lp.lat * Math.PI) / 180;
    const lonRad = (lp.lon * Math.PI) / 180;
    const rotatedLonRad = lonRad + spin;

    const x = R * Math.cos(latRad) * Math.sin(rotatedLonRad);
    const y = R * Math.sin(latRad);
    const z = R * Math.cos(latRad) * Math.cos(rotatedLonRad);

    const y2 = y * Math.cos(pitch) - z * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z * Math.cos(pitch);

    // Fade and size based on depth (z coordinate)
    // z ranges from -R to +R
    const depthPct = (z2 + R) / (2 * R); // 0 (far back) to 1 (front)
    
    // Front hemisphere dots get drawn
    if (z2 > -10) {
      projectedLandDots.push({
        px: cx + x,
        py: cy + y2,
        r: 1.1 + depthPct * 0.9, // 1.1px to 2px
        opacity: 0.15 + depthPct * 0.75, // faint to highly visible
        z: z2
      });
    }
  });

  // Sort land dots by depth so front dots draw on top of back dots
  projectedLandDots.sort((a, b) => a.z - b.z);

  // ── 3. Project Hot Spots ──
  const projectedHotspots: { id: string; label: string; px: number; py: number; visible: boolean; color: string }[] = [];
  HOT_SPOTS.forEach((spot) => {
    const latRad = (spot.lat * Math.PI) / 180;
    const lonRad = (spot.lon * Math.PI) / 180;
    const rotatedLonRad = lonRad + spin;

    const x = R * Math.cos(latRad) * Math.sin(rotatedLonRad);
    const y = R * Math.sin(latRad);
    const z = R * Math.cos(latRad) * Math.cos(rotatedLonRad);

    const y2 = y * Math.cos(pitch) - z * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z * Math.cos(pitch);

    projectedHotspots.push({
      id: spot.id,
      label: spot.label,
      px: cx + x,
      py: cy + y2,
      visible: z2 > 10, // only show on front hemisphere
      color: spot.color,
    });
  });

  // ── 4. Project Orbiting Satellite ──
  const satOrbitRad = R * 1.25;
  const satAngle = spin * 1.8; // Satellite orbits faster than earth revolves
  const satLat = Math.sin(satAngle) * 35; // Oscillation in latitude (inclination)
  const satLon = satAngle * (180 / Math.PI); // Continuous longitude spin

  const satLatRad = (satLat * Math.PI) / 180;
  const satLonRad = (satLon * Math.PI) / 180;
  const sx = satOrbitRad * Math.cos(satLatRad) * Math.sin(satLonRad);
  const sy = satOrbitRad * Math.sin(satLatRad);
  const sz = satOrbitRad * Math.cos(satLatRad) * Math.cos(satLonRad);

  const sy2 = sy * Math.cos(pitch) - sz * Math.sin(pitch);
  const sz2 = sy * Math.sin(pitch) + sz * Math.cos(pitch);

  const spx = cx + sx;
  const spy = cy + sy2;
  const satVisible = sz2 > 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 220 220">
        <Defs>
          {/* Neon blue and cyan gradients for sci-fi theme */}
          <SvgLinearGradient id="globeAtmosphere" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.28" />
            <Stop offset="50%" stopColor="#2979FF" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
          </SvgLinearGradient>
          <SvgLinearGradient id="radarScan" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
          </SvgLinearGradient>
        </Defs>

        {/* Outer Scanner Tech Ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={R * 1.3}
          stroke="rgba(0, 229, 255, 0.06)"
          strokeWidth="0.8"
          strokeDasharray="4 6"
        />

        {/* Compass Ticks outside the sphere */}
        <G opacity={0.35}>
          {/* North Tick */}
          <Path d={`M ${cx} ${cy - R * 1.15} L ${cx} ${cy - R * 1.15 + 6}`} stroke="#00E5FF" strokeWidth="1.5" />
          {/* South Tick */}
          <Path d={`M ${cx} ${cy + R * 1.15} L ${cx} ${cy + R * 1.15 - 6}`} stroke="#00E5FF" strokeWidth="1.5" />
          {/* West Tick */}
          <Path d={`M ${cx - R * 1.15} ${cy} L ${cx - R * 1.15 + 6} ${cy}`} stroke="#00E5FF" strokeWidth="1.5" />
          {/* East Tick */}
          <Path d={`M ${cx + R * 1.15} ${cy} L ${cx + R * 1.15 - 6} ${cy}`} stroke="#00E5FF" strokeWidth="1.5" />
        </G>

        {/* Atmosphere / Sphere Boundary */}
        <Circle
          cx={cx}
          cy={cy}
          r={R}
          fill="url(#globeAtmosphere)"
          stroke="rgba(0, 229, 255, 0.28)"
          strokeWidth="1.2"
        />

        {/* ── DRAW BACK GRID LINES (Translucent) ── */}
        <G stroke="rgba(0, 229, 255, 0.04)" strokeWidth="0.8" fill="none">
          {parallelsPaths.map((path, idx) => (
            path.back ? <Path key={`p-back-${idx}`} d={path.back} strokeDasharray="2 3" /> : null
          ))}
          {meridiansPaths.map((path, idx) => (
            path.back ? <Path key={`m-back-${idx}`} d={path.back} strokeDasharray="2 3" /> : null
          ))}
        </G>

        {/* ── DRAW BACK PART OF SATELLITE ORBIT ── */}
        {!satVisible && (
          <G>
            {/* Blinking back satellite */}
            <Circle
              cx={spx}
              cy={spy}
              r={2.5}
              fill="rgba(0, 229, 255, 0.4)"
            />
            {/* Orbital line trail dot */}
            <Circle
              cx={spx}
              cy={spy}
              r={7}
              stroke="rgba(0, 229, 255, 0.15)"
              strokeWidth="0.8"
            />
          </G>
        )}

        {/* ── DRAW LANDMASSES (Holographic Dots) ── */}
        <G fill="#00E5FF">
          {projectedLandDots.map((dot, idx) => (
            <Circle
              key={`land-${idx}`}
              cx={dot.px}
              cy={dot.py}
              r={dot.r}
              opacity={dot.opacity}
            />
          ))}
        </G>

        {/* ── DRAW FRONT GRID LINES (Glowing Neon) ── */}
        <G stroke="rgba(0, 229, 255, 0.14)" strokeWidth="1.0" fill="none">
          {parallelsPaths.map((path, idx) => (
            path.front ? <Path key={`p-front-${idx}`} d={path.front} /> : null
          ))}
          {meridiansPaths.map((path, idx) => (
            path.front ? <Path key={`m-front-${idx}`} d={path.front} /> : null
          ))}
        </G>

        {/* ── DRAW FRONT PART OF SATELLITE ORBIT & BEACON ── */}
        {satVisible && (
          <G>
            {/* Connection Link line to center of Earth */}
            <Path
              d={`M ${spx.toFixed(1)} ${spy.toFixed(1)} L ${cx} ${cy}`}
              stroke="rgba(0, 229, 255, 0.15)"
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
            {/* Glow ring */}
            <Circle
              cx={spx}
              cy={spy}
              r={4 + Math.sin(pulse * Math.PI * 2) * 2}
              stroke="#00E5FF"
              strokeWidth="0.8"
              opacity={0.6}
              fill="none"
            />
            {/* Blinking glowing satellite center */}
            <Circle
              cx={spx}
              cy={spy}
              r={3}
              fill="#FFFFFF"
            />
            <Circle
              cx={spx}
              cy={spy}
              r={1.8}
              fill="#00E5FF"
            />

            {/* Orbit text telemetry */}
            {spx > cx - 20 && spx < cx + 90 && (
              <G opacity={0.65}>
                {/* Horizontal lead line */}
                <Path
                  d={`M ${spx} ${spy} L ${spx + 12} ${spy - 10} L ${spx + 36} ${spy - 10}`}
                  stroke="#00E5FF"
                  strokeWidth="0.6"
                  fill="none"
                />
                {/* Small indicator circle */}
                <Circle cx={spx + 36} cy={spy - 10} r={1.5} fill="#00E5FF" />
              </G>
            )}
          </G>
        )}

        {/* ── DRAW PULSING TACTICAL INCIDENT NODES ── */}
        {projectedHotspots.map((spot) => {
          if (!spot.visible) return null;
          
          const currentPulse = pulse; // 0 to 1
          
          return (
            <G key={spot.id}>
              {/* Ripple Ring 1 */}
              <Circle
                cx={spot.px}
                cy={spot.py}
                r={4 + currentPulse * 16}
                stroke={spot.color}
                strokeWidth="1.2"
                fill="none"
                opacity={1 - currentPulse}
              />
              
              {/* Ripple Ring 2 (delayed offset) */}
              <Circle
                cx={spot.px}
                cy={spot.py}
                r={4 + ((currentPulse + 0.5) % 1) * 16}
                stroke={spot.color}
                strokeWidth="0.8"
                fill="none"
                opacity={1 - ((currentPulse + 0.5) % 1)}
              />

              {/* Main Glowing Target Node */}
              <Circle
                cx={spot.px}
                cy={spot.py}
                r={4}
                fill={spot.color}
              />
              <Circle
                cx={spot.px}
                cy={spot.py}
                r={1.5}
                fill="#FFFFFF"
              />

              {/* Holographic Tactical Tag */}
              {spot.px > cx - 40 && spot.px < cx + 70 && (
                <G opacity={0.8}>
                  {/* Lead line */}
                  <Path
                    d={`M ${spot.px} ${spot.py} L ${spot.px + 15} ${spot.py - 12} L ${spot.px + 45} ${spot.py - 12}`}
                    stroke={spot.color}
                    strokeWidth="0.8"
                    fill="none"
                  />
                  {/* Led indicator dot */}
                  <Circle cx={spot.px + 45} cy={spot.py - 12} r={1.5} fill={spot.color} />
                </G>
              )}
            </G>
          );
        })}

        {/* Inner Glare Arc for Glass Effect */}
        <Path
          d={`M ${cx - R * 0.7} ${cy - R * 0.5} A ${R} ${R} 0 0 1 ${cx + R * 0.7} ${cy - R * 0.5}`}
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.5"
          fill="none"
        />
      </Svg>

      {/* Floating HUD Telemetry Readouts overlay */}
      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.readoutLeft}>
          <Text style={styles.hudMiniText}>SYS: SAT_ORBITAL_LINK</Text>
          <Text style={styles.hudMiniText}>TEL: {(satAngle * 180 / Math.PI % 360).toFixed(0)}°_INCL</Text>
        </View>
        <View style={styles.readoutRight}>
          <Text style={styles.hudMiniText}>GRID: ONLINE</Text>
          <Text style={styles.hudMiniText}>FPS: 60_REFRESH</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 6,
  },
  readoutLeft: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    opacity: 0.5,
  },
  readoutRight: {
    position: 'absolute',
    bottom: -15,
    right: -20,
    opacity: 0.5,
    alignItems: 'flex-end',
  },
  hudMiniText: {
    fontSize: 7,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 0.5,
    lineHeight: 10,
  },
});
