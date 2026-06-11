import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

function AvatarModel({ skin, hair, suit, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = 0 + Math.sin(t * 0.8) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 1.1) * 0.03;
  });
  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <RoundedBox args={[0.52, 0.30, 0.22]} radius={0.12} position={[0, -0.08, 0]} castShadow><meshStandardMaterial color={suit} roughness={0.55} metalness={0.08} /></RoundedBox>
      <RoundedBox args={[0.62, 0.13, 0.22]} radius={0.07} position={[0, 0.10, 0]} castShadow><meshStandardMaterial color={suit} roughness={0.55} metalness={0.08} /></RoundedBox>
      <RoundedBox args={[0.20, 0.08, 0.14]} radius={0.05} position={[0, 0.20, 0.05]}><meshStandardMaterial color={suit} roughness={0.5} metalness={0.15} /></RoundedBox>
      <RoundedBox args={[0.13, 0.10, 0.10]} radius={0.05} position={[0, 0.26, 0]}><meshStandardMaterial color={skin} roughness={0.5} /></RoundedBox>
      <mesh position={[0, 0.45, 0]} castShadow><sphereGeometry args={[0.22, 24, 18]} /><meshStandardMaterial color={skin} roughness={0.45} /></mesh>
      <mesh position={[0, 0.50, 0.02]} castShadow><sphereGeometry args={[0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[0, 0.48, 0.20]} rotation={[-0.15, 0, 0]}><sphereGeometry args={[0.10, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.5]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[-0.19, 0.45, 0.05]} rotation={[0, -0.5, 0.4]}><capsuleGeometry args={[0.03, 0.10, 4, 8]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[0.19, 0.45, 0.05]} rotation={[0, 0.5, -0.4]}><capsuleGeometry args={[0.03, 0.10, 4, 8]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[-0.08, 0.48, 0.24]} renderOrder={1}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#111" roughness={0.1} depthTest={false} /></mesh>
      <mesh position={[0.08, 0.48, 0.24]} renderOrder={1}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#111" roughness={0.1} depthTest={false} /></mesh>
      <mesh position={[0, 0.44, 0.25]} renderOrder={1}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[-0.05, 0.40, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[-0.025, 0.395, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0, 0.39, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0.025, 0.395, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0.05, 0.40, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
    </group>
  );
}

// Только голова + шея (для hero)
function AvatarModelHead({ skin, hair, scale = 1 }) {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = 0 + Math.sin(t * 0.8) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 1.1) * 0.03;
  });
  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Шея */}
      <RoundedBox args={[0.13, 0.10, 0.10]} radius={0.05} position={[0, 0.26, 0]}><meshStandardMaterial color={skin} roughness={0.5} /></RoundedBox>
      {/* Голова */}
      <mesh position={[0, 0.45, 0]} castShadow><sphereGeometry args={[0.22, 24, 18]} /><meshStandardMaterial color={skin} roughness={0.45} /></mesh>
      {/* Волосы */}
      <mesh position={[0, 0.50, 0.02]} castShadow><sphereGeometry args={[0.23, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[0, 0.48, 0.20]} rotation={[-0.15, 0, 0]}><sphereGeometry args={[0.10, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2.5]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[-0.19, 0.45, 0.05]} rotation={[0, -0.5, 0.4]}><capsuleGeometry args={[0.03, 0.10, 4, 8]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      <mesh position={[0.19, 0.45, 0.05]} rotation={[0, 0.5, -0.4]}><capsuleGeometry args={[0.03, 0.10, 4, 8]} /><meshStandardMaterial color={hair} roughness={0.65} /></mesh>
      {/* Лицо */}
      <mesh position={[-0.08, 0.48, 0.24]} renderOrder={1}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#111" roughness={0.1} depthTest={false} /></mesh>
      <mesh position={[0.08, 0.48, 0.24]} renderOrder={1}><sphereGeometry args={[0.025, 8, 8]} /><meshStandardMaterial color="#111" roughness={0.1} depthTest={false} /></mesh>
      <mesh position={[0, 0.44, 0.25]} renderOrder={1}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[-0.05, 0.40, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[-0.025, 0.395, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0, 0.39, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0.025, 0.395, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
      <mesh position={[0.05, 0.40, 0.24]} renderOrder={1}><sphereGeometry args={[0.014, 6, 6]} /><meshStandardMaterial color="#111" roughness={0.15} depthTest={false} /></mesh>
    </group>
  );
}

export default function Avatar3D({ avatar, scale = 1, headOnly = false }) {
  const skin = avatar?.skin || "#f0b38f";
  const hair = avatar?.hair || "#37251c";
  const suit = avatar?.suit || "#536dfe";

  return (
    <Canvas
      camera={{ position: [0, 0.12, 1.25], fov: 35 }}
      style={{ width: 175 * scale, height: 210 * scale }}
      shadows
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-2, 1, -1.5]} intensity={0.35} />
      <group position={[0, -0.35, 0]}>
        {headOnly ? (
          <AvatarModelHead skin={skin} hair={hair} scale={scale} />
        ) : (
          <AvatarModel skin={skin} hair={hair} suit={suit} scale={scale} />
        )}
      </group>
    </Canvas>
  );
}