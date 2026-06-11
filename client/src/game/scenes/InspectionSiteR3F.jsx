import { useState } from "react";
import { RoundedBox } from "@react-three/drei";

// Зоны стены 3×3 (кликабельные)
const WALL_ZONES = [
  { id: "A1", row: 0, col: 0 },
  { id: "A2", row: 0, col: 1 },
  { id: "A3", row: 0, col: 2 },
  { id: "B1", row: 1, col: 0 },
  { id: "B2", row: 1, col: 1 },
  { id: "B3", row: 1, col: 2 },
  { id: "C1", row: 2, col: 0 },
  { id: "C2", row: 2, col: 1 },
  { id: "C3", row: 2, col: 2 },
];

// Дефекты: трещина (line), широкий шов (plane), вздутие (sphere)
const DEFECTS = {
  "A1": { type: "crack", desc: "Трещина в кладке" },
  "B2": { type: "wideSeam", desc: "Широкий шов" },
  "C3": { type: "bloating", desc: "Вздутие поверхности" },
};

function WallZone({ zone, colWidth, rowHeight, wallW, wallH, onFound }) {
  const [found, setFound] = useState(false);
  const defect = DEFECTS[zone.id];

  const x = (zone.col - 1) * colWidth;
  const y = -(zone.row - 1) * rowHeight + wallH / 2 - rowHeight / 2;
  const z = 0.02;

  const handleClick = () => {
    if (!found && defect && onFound) {
      setFound(true);
      onFound(zone.id, defect.desc);
    }
  };

  return (
    <group>
      {/* Кликабельная зона */}
      <mesh position={[x, y, z]} onClick={handleClick}>
        <planeGeometry args={[colWidth * 0.9, rowHeight * 0.9]} />
        <meshBasicMaterial color={found ? "#22c55e" : defect ? "#ff444422" : "#ffffff08"} transparent opacity={found ? 0.4 : 0.15} />
      </mesh>

      {/* Метка дефекта */}
      {found && defect && (
        <group position={[x, y, 0.04]}>
          {defect.type === "crack" && (
            <mesh rotation={[0, 0, 0.3]}>
              <planeGeometry args={[0.12, 0.6]} />
              <meshBasicMaterial color="#ff4444" transparent opacity={0.7} />
            </mesh>
          )}
          {defect.type === "wideSeam" && (
            <mesh>
              <planeGeometry args={[0.7, 0.04]} />
              <meshBasicMaterial color="#ff4444" transparent opacity={0.7} />
            </mesh>
          )}
          {defect.type === "bloating" && (
            <mesh>
              <sphereGeometry args={[0.15, 16, 12]} />
              <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.4} />
            </mesh>
          )}
        </group>
      )}

      {/* Подсказка (рамка) для необследованных дефектных зон */}
      {!found && defect && (
        <mesh position={[x, y, 0.03]}>
          <planeGeometry args={[colWidth * 0.9, rowHeight * 0.9]} />
          <meshBasicMaterial color="#ffaa44" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export default function InspectionSiteR3F({ taskIndex = 1, onDefectFound }) {
  const wallW = 4;
  const wallH = 3;
  const colWidth = wallW / 3;
  const rowHeight = wallH / 3;

  return (
    <group>
      {/* Пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* GridHelper */}
      <gridHelper args={[10, 10, "#444", "#333"]} position={[0, 0, 0]} />

      {/* Стена (фон) */}
      <mesh position={[0, wallH / 2, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[wallW, wallH, 0.12]} />
        <meshStandardMaterial color="#b8845a" roughness={0.8} />
      </mesh>

      {/* Кирпичная текстура (линии) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`h${i}`} position={[0, i * (wallH / 6.5), 0.06]}>
          <planeGeometry args={[wallW - 0.1, 0.015]} />
          <meshBasicMaterial color="#8b6914" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Зоны */}

      {/* Дефектные зоны */}
      {WALL_ZONES.map(zone => (
        <WallZone
          key={zone.id}
          zone={zone}
          colWidth={colWidth}
          rowHeight={rowHeight}
          wallW={wallW}
          wallH={wallH}
          onFound={onDefectFound}
        />
      ))}

      {/* Инструменты (декор) */}
      {/* Планшет */}
      <group position={[-1.5, 0.3, 0.8]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.5, 0.03]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[0.24, 0.44]} />
          <meshBasicMaterial color="#aaffcc" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Рулетка */}
      <mesh position={[1.5, 0.1, 0.8]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.25]} />
        <meshStandardMaterial color="#ffdd44" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Телефон */}
      <group position={[-2.2, 1.5, -0.5]}>
        <mesh>
          <boxGeometry args={[0.2, 0.35, 0.04]} />
          <meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.16, 0.3]} />
          <meshStandardMaterial
            color={taskIndex === 3 ? "#ff4444" : "#2244aa"}
            emissive={taskIndex === 3 ? "#ff4444" : "#2244aa"}
            emissiveIntensity={taskIndex === 3 ? 0.8 : 0.3}
          />
        </mesh>
        {taskIndex === 3 && (
          <pointLight intensity={1} color="#ff4444" distance={1} position={[0, 0, 0.1]} />
        )}
      </group>

      {/* Лампа */}
      <pointLight position={[0, 2, 1.5]} intensity={0.8} color="#ffeebb" distance={6} castShadow />
    </group>
  );
}