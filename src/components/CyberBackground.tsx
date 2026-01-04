import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

// Bitcoin symbol made of geometry
function BitcoinSymbol({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef} position={position} scale={scale}>
        {/* Outer ring */}
        <mesh>
          <torusGeometry args={[0.8, 0.08, 16, 32]} />
          <meshBasicMaterial color="#f7931a" transparent opacity={0.8} />
        </mesh>
        {/* B vertical bars */}
        <mesh position={[-0.15, 0, 0]}>
          <boxGeometry args={[0.12, 1.2, 0.08]} />
          <meshBasicMaterial color="#f7931a" />
        </mesh>
        {/* B curves - top */}
        <mesh position={[0.15, 0.25, 0]}>
          <torusGeometry args={[0.25, 0.06, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#f7931a" />
        </mesh>
        {/* B curves - bottom */}
        <mesh position={[0.15, -0.25, 0]}>
          <torusGeometry args={[0.3, 0.06, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#f7931a" />
        </mesh>
      </group>
    </Float>
  );
}

// Ethereum diamond
function EthereumDiamond({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshBasicMaterial color="#627eea" wireframe transparent opacity={0.7} />
      </mesh>
    </Float>
  );
}

// Dollar sign
function DollarSign({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + 1) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Vertical line */}
      <mesh>
        <boxGeometry args={[0.08, 1.4, 0.05]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
      </mesh>
      {/* S curves */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Floating coin
function FloatingCoin({ position, color = "#3b82f6", delay = 0 }: { position: [number, number, number]; color?: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.PI / 2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5 + delay;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 + delay) * 0.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

// Credit card shape
function CreditCardShape({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation as any}>
      {/* Card body */}
      <mesh>
        <boxGeometry args={[1.6, 1, 0.05]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>
      {/* Card border */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.6, 1, 0.05)]} />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.8} />
      </lineSegments>
      {/* Chip */}
      <mesh position={[-0.4, 0.15, 0.03]}>
        <boxGeometry args={[0.3, 0.2, 0.02]} />
        <meshBasicMaterial color="#f7931a" />
      </mesh>
      {/* Magnetic stripe */}
      <mesh position={[0, -0.25, 0.03]}>
        <boxGeometry args={[1.4, 0.15, 0.01]} />
        <meshBasicMaterial color="#1e3a5f" />
      </mesh>
    </group>
  );
}

// Chart/trend line
function TrendLine() {
  const lineRef = useRef<THREE.Line>(null);
  
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * 8 - 4;
      const y = Math.sin(i * 0.5) * 0.5 + Math.cos(i * 0.3) * 0.3 + (i / 20) * 1.5 - 2;
      pts.push(new THREE.Vector3(x, y, -3));
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * 8 - 4;
        const y = Math.sin(i * 0.5 + state.clock.elapsedTime * 0.5) * 0.5 + 
                  Math.cos(i * 0.3 + state.clock.elapsedTime * 0.3) * 0.3 + 
                  (i / 20) * 1.5 - 2;
        positions[i * 3 + 1] = y;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#22c55e", transparent: true, opacity: 0.6 }))} ref={lineRef} />
  );
}

// Cyber globe wireframe
function CyberGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.12;
      globeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.1;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.08;
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.04;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <group ref={globeRef}>
        <mesh>
          <icosahedronGeometry args={[2.2, 2]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.3} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[2.18, 1]} />
          <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.15} />
        </mesh>
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} />
        </mesh>
      </group>

      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.8, 0.015, 16, 100]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[3.1, 0.012, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, -Math.PI / 3, 0]}>
          <torusGeometry args={[3.4, 0.008, 16, 100]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// Hexagonal shields
function HexShield({ position, scale = 1, delay = 0 }: { position: [number, number, number]; scale?: number; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.4 + delay;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.25;
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.25;
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <circleGeometry args={[0.45, 6]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Lock icon
function CyberLock({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.35}>
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[1, 0.8, 0.3]} />
        <meshBasicMaterial color="#3b82f6" wireframe />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.35, 0.08, 8, 20, Math.PI]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

// Data stream particles
function DataStream({ startPos, endPos }: { startPos: [number, number, number]; endPos: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 40;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      positions[i * 3] = startPos[0] + (endPos[0] - startPos[0]) * t;
      positions[i * 3 + 1] = startPos[1] + (endPos[1] - startPos[1]) * t;
      positions[i * 3 + 2] = startPos[2] + (endPos[2] - startPos[2]) * t;
    }
    return positions;
  }, [startPos, endPos]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const offset = (state.clock.elapsedTime * 1.5 + i * 0.08) % 1;
        positions[i * 3] = startPos[0] + (endPos[0] - startPos[0]) * offset;
        positions[i * 3 + 1] = startPos[1] + (endPos[1] - startPos[1]) * offset;
        positions[i * 3 + 2] = startPos[2] + (endPos[2] - startPos[2]) * offset;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#06b6d4" size={0.04} transparent opacity={0.7} />
    </points>
  );
}

// Particle field
function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.015;
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#60a5fa" size={0.025} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </Points>
  );
}

// Grid floor
function CyberGrid() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.3) % 1;
    }
  });

  return (
    <group position={[0, -3, 0]} rotation={[-Math.PI / 2.5, 0, 0]}>
      <gridHelper ref={gridRef} args={[30, 30, "#3b82f6", "#1e3a5f"]} />
    </group>
  );
}

// Scan line
function ScanLine() {
  const lineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 3.5;
      const opacity = 0.25 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      (lineRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <mesh ref={lineRef} position={[0, 0, 1]}>
      <planeGeometry args={[15, 0.015]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
    </mesh>
  );
}

export function CyberBackground() {
  return (
    <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.25} />
          <pointLight position={[10, 10, 10]} intensity={0.4} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={0.25} color="#06b6d4" />
          
          {/* Main cyber globe */}
          <CyberGlobe />
        
        {/* Crypto symbols */}
        <BitcoinSymbol position={[-4.5, 2, 0]} scale={0.6} />
        <EthereumDiamond position={[4.5, 1.5, -1]} scale={0.8} />
        <DollarSign position={[-3.5, -1.5, 1]} scale={0.5} />
        <DollarSign position={[3.8, -2, 0.5]} scale={0.4} />
        
        {/* Floating coins */}
        <FloatingCoin position={[-2.5, 2.5, -2]} color="#f7931a" delay={0} />
        <FloatingCoin position={[2.5, -1.5, -1.5]} color="#627eea" delay={1.5} />
        <FloatingCoin position={[0, 3, -2.5]} color="#22c55e" delay={0.8} />
        
        {/* Credit cards */}
        <CreditCardShape position={[-4, -0.5, -1.5]} rotation={[0.2, 0.5, 0.1]} />
        <CreditCardShape position={[4.2, 0.5, -2]} rotation={[-0.1, -0.4, 0.05]} />
        
        {/* Financial trend line */}
        <TrendLine />
        
        {/* Background particles */}
        <ParticleField />
        
        {/* Cyber grid floor */}
        <CyberGrid />
        
        {/* Hex shields */}
        <HexShield position={[-3, 1.5, -0.5]} scale={0.7} delay={0} />
        <HexShield position={[3.2, 2.2, -1]} scale={0.55} delay={1.2} />
        <HexShield position={[-2.5, -2, 0.5]} scale={0.45} delay={2} />
        
        {/* Data streams */}
        <DataStream startPos={[-5, 2.5, -3]} endPos={[5, -2.5, -3]} />
        <DataStream startPos={[5, 1.5, -4]} endPos={[-5, -1.5, -4]} />
        
        {/* Lock icons */}
        <CyberLock position={[-4.8, -0.5, 0.5]} />
        <CyberLock position={[4.8, 2, -0.5]} />
        
        {/* Scan line */}
        <ScanLine />
        </Suspense>
      </Canvas>
      
      {/* Gradient overlays - more transparent to show 3D graphics */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/40 pointer-events-none" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.12) 2px, rgba(59, 130, 246, 0.12) 4px)' }} 
      />
    </div>
  );
}
