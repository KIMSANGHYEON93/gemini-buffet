"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useTexture, Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function ImprovedCoin() {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture("/buffett.png");

  // Fix texture orientation if needed
  texture.center.set(0.5, 0.5);
  texture.rotation = 0;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* The Gold Edge */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.2, 64, 1, true]} />
          <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.3} />
        </mesh>

        {/* Front Face */}
        <mesh position={[0, 0, 0.11]} rotation={[0, 0, 0]}>
          <circleGeometry args={[2.2, 64]} />
          <meshStandardMaterial map={texture} metalness={0.4} roughness={0.2} />
        </mesh>

        {/* Back Face */}
        <mesh position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[2.2, 64]} />
          <meshStandardMaterial map={texture} metalness={0.4} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

export default function Scene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#22c55e" />

        <Suspense fallback={null}>
          <ImprovedCoin />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="city" />
        </Suspense>

        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
      </Canvas>
    </div>
  );
}
