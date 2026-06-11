import { useMemo } from "react";
import * as THREE from "three";

// Canvas-текстура монитора
function Monitor({ position, rotation }) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 90;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0f1a";
    ctx.fillRect(0, 0, 128, 90);
    ctx.strokeStyle = "#44ff88";
    ctx.lineWidth = 1.5;
    // график
    for (let x = 0; x <= 128; x += 8) {
      const y = 30 + Math.sin(x * 0.06 + Date.now() * 0.001) * 18 + Math.random() * 4;
      if (x > 0) {
        ctx.beginPath();
        ctx.moveTo(x - 8, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      // eslint-disable-next-line no-unused-vars
      var prevY = y;
    }
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.55, 0.38]} />
      <meshStandardMaterial map={canvas} emissive="#44ff88" emissiveIntensity={0.4} />
    </mesh>
  );
}

export default function DispatchRoomR3F({ taskIndex = 1, emergencyMode = false }) {
  return (
    <group>
      {/* Пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>

      {/* Потолок */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#0f0f23" roughness={0.9} />
      </mesh>

      {/* Стена дальняя (по Z = -2) */}
      <mesh position={[0, 1.75, -2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[8, 3.5]} />
        <meshStandardMaterial color="#161630" roughness={0.7} />
      </mesh>

      {/* Стена левая */}
      <mesh position={[-3.5, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 3.5]} />
        <meshStandardMaterial color="#131328" roughness={0.7} />
      </mesh>

      {/* Главный щиток */}
      <group position={[0, 0, -1.8]}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 1.6, 0.12]} />
          <meshStandardMaterial color="#2a2a4a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Подстанции-индикаторы */}
        {[
          { x: -0.7, label: "ПС №1", load: 0.5, color: "#44ff88" },
          { x: 0, label: "ПС №2", load: taskIndex === 1 && emergencyMode ? 0.78 : 0.45, color: taskIndex === 1 && emergencyMode ? "#ff4444" : "#ffaa44" },
          { x: 0.7, label: "ПС №3", load: 0.35, color: "#44ff88" },
        ].map((ps, i) => (
          <group key={i} position={[ps.x, -0.1, 0.08]}>
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color={ps.color} emissive={ps.color} emissiveIntensity={ps.load} roughness={0.2} />
            </mesh>
            <pointLight intensity={ps.load * 2} color={ps.color} distance={1.5} />
          </group>
        ))}
      </group>

      {/* Мониторы */}
      <Monitor position={[-1.8, 1.4, -0.8]} rotation={[0, 0.5, 0]} />
      <Monitor position={[1.8, 1.4, -0.8]} rotation={[0, -0.5, 0]} />
      <Monitor position={[0, 1.4, -0.7]} rotation={[0, 0, 0]} />

      {/* Схема электросети (упрощённая — линии сетки) */}
      <group position={[0, 2.5, -1.9]}>
        <mesh>
          <planeGeometry args={[3, 2]} />
          <meshBasicMaterial color="#4488ff" wireframe transparent opacity={0.25} />
        </mesh>
      </group>

      {/* Аварийная сирена */}
      {emergencyMode && (
        <group position={[1.5, 2, -0.5]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.1, 0.3, 12]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} />
          </mesh>
          <pointLight intensity={3} color="#ff0000" distance={6} />
        </group>
      )}

      {/* Освещение */}
      <pointLight position={[0, 1.8, 0]} intensity={0.4} color="#aaccff" distance={8} />
      <pointLight position={[-2, 1.5, -1]} intensity={0.3} color="#ffcc88" distance={4} />
    </group>
  );
}