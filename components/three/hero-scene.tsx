"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Environment, Float, Line, PerspectiveCamera, Sparkles, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const cyan = new THREE.Color("#22f6ff");
const blue = new THREE.Color("#4382df");
const purple = new THREE.Color("#8b5cff");

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.35]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 2.1, 8.2]} fov={48} />
      <color attach="background" args={["#02030a"]} />
      <fog attach="fog" args={["#050715", 7.5, 18]} />
      <Suspense fallback={null}>
        <SceneRig />
        <Environment preset="night" />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.82} luminanceThreshold={0.12} luminanceSmoothing={0.34} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}

function SceneRig() {
  useCameraFlight();

  return (
    <>
      <ambientLight intensity={0.36} />
      <pointLight color="#22f6ff" intensity={52} position={[-4, 3.4, 3.5]} distance={12} />
      <pointLight color="#8b5cff" intensity={58} position={[4, 2.5, 1.2]} distance={12} />
      <spotLight color="#4382df" intensity={48} position={[0, 6, 4]} angle={0.42} penumbra={0.72} distance={16} />
      <ParticleField />
      <EnergyPortal />
      <FuturisticWorkstation />
      <DigitalGlobe position={[3.15, 1.35, -1.35]} />
      <CircuitFloor />
      <FloatingCodeWindows />
      <CrystalField />
      <LightBeams />
      <Sparkles count={42} scale={[10, 6, 8]} size={1.9} speed={0.12} color="#7deeff" opacity={0.34} />
    </>
  );
}

function useCameraFlight() {
  const { camera, pointer } = useThree();
  const start = useRef(performance.now());
  const target = useMemo(() => new THREE.Vector3(0, 0.8, 0), []);

  useFrame(() => {
    const elapsed = Math.min((performance.now() - start.current) / 3600, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3);
    const finalX = pointer.x * 0.55;
    const finalY = 2.1 + pointer.y * 0.28;
    const finalZ = 8.2;
    const introZ = THREE.MathUtils.lerp(15, finalZ, ease);
    const introY = THREE.MathUtils.lerp(0.8, finalY, ease);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, introY, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, introZ, 0.05);
    camera.lookAt(target.x + pointer.x * 0.24, target.y + pointer.y * 0.18, target.z);
  });
}

function FuturisticWorkstation() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
  });

  return (
    <group ref={group} position={[0.4, -0.35, -0.55]} rotation={[0, -0.18, 0]}>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[3.45, 0.18, 1.7]} />
        <meshStandardMaterial color="#071125" metalness={0.74} roughness={0.24} emissive="#101a45" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[0, -0.57, 0.87]}>
        <boxGeometry args={[3.25, 0.035, 0.05]} />
        <meshStandardMaterial color="#22f6ff" emissive="#22f6ff" emissiveIntensity={2.8} />
      </mesh>
      <mesh position={[0, 0.18, -0.58]} rotation={[-0.34, 0, 0]}>
        <boxGeometry args={[2.75, 1.55, 0.08]} />
        <meshStandardMaterial
          color="#0c1638"
          metalness={0.55}
          roughness={0.16}
          emissive="#172d74"
          emissiveIntensity={0.72}
        />
      </mesh>
      <mesh position={[0, 0.19, -0.62]} rotation={[-0.34, 0, 0]}>
        <planeGeometry args={[2.5, 1.3]} />
        <meshBasicMaterial color="#22f6ff" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      <ScreenLines />
      <Keyboard />
      <Float speed={1.2} rotationIntensity={0.28} floatIntensity={0.18}>
        <Text
          position={[0, 1.15, -0.7]}
          rotation={[-0.23, 0, 0]}
          fontSize={0.18}
          color="#eaf2ff"
          anchorX="center"
          anchorY="middle"
        >
          PANEL REXX OS
        </Text>
      </Float>
    </group>
  );
}

function ScreenLines() {
  const lineData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => ({
        y: 0.64 - index * 0.17,
        width: 0.82 + ((index * 37) % 90) / 100
      })),
    []
  );

  return (
    <group position={[-0.92, 0.36, -0.76]} rotation={[-0.34, 0, 0]}>
      {lineData.map((line, index) => (
        <mesh key={line.y} position={[line.width * 0.34, line.y, 0.01]}>
          <boxGeometry args={[line.width, 0.018, 0.01]} />
          <meshBasicMaterial color={index % 2 ? "#4382df" : "#22f6ff"} transparent opacity={0.72} />
        </mesh>
      ))}
      <mesh position={[1.28, 0.16, 0.015]}>
        <ringGeometry args={[0.22, 0.235, 48]} />
        <meshBasicMaterial color="#8b5cff" transparent opacity={0.86} />
      </mesh>
    </group>
  );
}

function Keyboard() {
  const keys = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        x: -1.2 + (index % 12) * 0.22,
        z: -0.02 + Math.floor(index / 12) * 0.18,
        glow: index % 5 === 0
      })),
    []
  );

  return (
    <group position={[0, -0.47, 0.24]}>
      {keys.map((key) => (
        <mesh key={`${key.x}-${key.z}`} position={[key.x, 0.02, key.z]}>
          <boxGeometry args={[0.14, 0.025, 0.09]} />
          <meshStandardMaterial
            color={key.glow ? "#22f6ff" : "#111d3d"}
            emissive={key.glow ? "#22f6ff" : "#061431"}
            emissiveIntensity={key.glow ? 1.6 : 0.28}
            metalness={0.35}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function DigitalGlobe({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const result: THREE.Vector3[] = [];
    const count = 180;

    for (let i = 0; i < count; i += 1) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 0.82;
      result.push(
        new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi) * radius,
          Math.cos(phi) * radius,
          Math.sin(theta) * Math.sin(phi) * radius
        )
      );
    }

    return result;
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.32) * 0.1;
    }
  });

  return (
    <Float speed={1.1} rotationIntensity={0.22} floatIntensity={0.32}>
      <group ref={group} position={position}>
        <mesh>
          <sphereGeometry args={[0.84, 48, 48]} />
          <meshBasicMaterial color="#4382df" transparent opacity={0.07} wireframe />
        </mesh>
        {points.map((point, index) => (
          <mesh key={index} position={point}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color={index % 3 === 0 ? "#22f6ff" : "#8b5cff"} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.006, 8, 96]} />
          <meshBasicMaterial color="#22f6ff" transparent opacity={0.72} />
        </mesh>
        <mesh rotation={[0.6, 0.2, 0.4]}>
          <torusGeometry args={[1.1, 0.005, 8, 96]} />
          <meshBasicMaterial color="#8b5cff" transparent opacity={0.52} />
        </mesh>
      </group>
    </Float>
  );
}

function EnergyPortal() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.z = state.clock.elapsedTime * 0.08;
    group.current.children.forEach((child, index) => {
      child.rotation.z += (index % 2 ? -0.002 : 0.003) * (index + 1);
    });
  });

  return (
    <group ref={group} position={[0.1, 1.0, -2.6]}>
      {[1.2, 1.62, 2.05].map((radius, index) => (
        <mesh key={radius} rotation={[Math.PI / 2.25, 0.08 * index, 0.28 * index]}>
          <torusGeometry args={[radius, 0.012 + index * 0.004, 12, 140]} />
          <meshBasicMaterial color={index === 1 ? "#4382df" : index === 2 ? "#8b5cff" : "#22f6ff"} transparent opacity={0.56} />
        </mesh>
      ))}
      <mesh>
        <circleGeometry args={[1.05, 96]} />
        <meshBasicMaterial color="#4382df" transparent opacity={0.045} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const count = 700;
    const positionsArray = new Float32Array(count * 3);
    const colorsArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positionsArray[i3] = (Math.random() - 0.5) * 11;
      positionsArray[i3 + 1] = (Math.random() - 0.5) * 6;
      positionsArray[i3 + 2] = (Math.random() - 0.5) * 10 - 1.6;

      const color = i % 3 === 0 ? cyan : i % 3 === 1 ? blue : purple;
      colorsArray[i3] = color.r;
      colorsArray[i3 + 1] = color.g;
      colorsArray[i3 + 2] = color.b;
    }

    return { positions: positionsArray, colors: colorsArray };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.025 + state.pointer.x * 0.08;
      pointsRef.current.rotation.x = state.pointer.y * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.022} vertexColors transparent opacity={0.76} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function CircuitFloor() {
  const group = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const result: [THREE.Vector3, THREE.Vector3, string][] = [];

    for (let i = -8; i <= 8; i += 1) {
      result.push([new THREE.Vector3(i * 0.55, -1.02, -5), new THREE.Vector3(i * 0.55, -1.02, 5), i % 3 === 0 ? "#22f6ff" : "#4382df"]);
      result.push([new THREE.Vector3(-5, -1.02, i * 0.55), new THREE.Vector3(5, -1.02, i * 0.55), i % 3 === 0 ? "#8b5cff" : "#4382df"]);
    }

    return result;
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.position.z = ((state.clock.elapsedTime * 0.22) % 0.55) - 0.28;
    }
  });

  return (
    <group ref={group}>
      {lines.map(([start, end, color], index) => (
        <Line key={index} points={[start, end]} color={color} transparent opacity={0.24} lineWidth={1} />
      ))}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#020713" metalness={0.25} roughness={0.55} transparent opacity={0.54} />
      </mesh>
    </group>
  );
}

function FloatingCodeWindows() {
  const windows = useMemo(
    () => [
      { position: [-3.15, 1.5, -1.2] as [number, number, number], rotation: [0.1, 0.48, -0.05] as [number, number, number], label: "const future = build();" },
      { position: [-2.9, 0.3, 0.2] as [number, number, number], rotation: [-0.04, 0.74, 0.04] as [number, number, number], label: "<PanelRexx />" },
      { position: [2.7, 0.0, 0.32] as [number, number, number], rotation: [0.02, -0.74, 0.02] as [number, number, number], label: "system.scan(profile)" }
    ],
    []
  );

  return (
    <>
      {windows.map((item, index) => (
        <Float key={item.label} speed={1 + index * 0.15} rotationIntensity={0.18} floatIntensity={0.24}>
          <group position={item.position} rotation={item.rotation}>
            <mesh>
              <planeGeometry args={[1.7, 0.78]} />
              <meshBasicMaterial color="#071125" transparent opacity={0.54} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.28, 0.006]}>
              <boxGeometry args={[1.5, 0.018, 0.01]} />
              <meshBasicMaterial color={index === 1 ? "#8b5cff" : "#22f6ff"} transparent opacity={0.78} />
            </mesh>
            <Text position={[0, -0.03, 0.012]} fontSize={0.08} color="#eaf2ff" anchorX="center" anchorY="middle">
              {item.label}
            </Text>
          </group>
        </Float>
      ))}
    </>
  );
}

function CrystalField() {
  const crystals = useMemo(
    () => [
      [-3.4, -0.52, -2.1],
      [-2.2, -0.76, 1.1],
      [2.4, -0.72, -2.0],
      [3.5, -0.58, 1.0],
      [0.9, -0.78, -3.0]
    ] as [number, number, number][],
    []
  );

  return (
    <>
      {crystals.map((position, index) => (
        <Float key={position.join("-")} speed={1.2 + index * 0.1} rotationIntensity={0.45} floatIntensity={0.28}>
          <mesh position={position} rotation={[0.2 * index, 0.55 * index, 0.18]}>
            <octahedronGeometry args={[0.22 + (index % 2) * 0.08, 0]} />
            <meshStandardMaterial
              color={index % 2 ? "#4382df" : "#8b5cff"}
              emissive={index % 2 ? "#4382df" : "#8b5cff"}
              emissiveIntensity={0.92}
              metalness={0.18}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function LightBeams() {
  const beams = useMemo(
    () => [
      { x: -2.8, z: -2.7, color: "#22f6ff" },
      { x: 2.7, z: -2.2, color: "#8b5cff" },
      { x: 0.4, z: -3.5, color: "#4382df" }
    ],
    []
  );

  return (
    <>
      {beams.map((beam) => (
        <mesh key={`${beam.x}-${beam.z}`} position={[beam.x, 0.65, beam.z]} rotation={[0, 0, Math.PI / 18]}>
          <cylinderGeometry args={[0.025, 0.16, 3.4, 24, 1, true]} />
          <meshBasicMaterial color={beam.color} transparent opacity={0.14} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  );
}
