import { useState, useCallback } from "react";

// Зоны стены 3×3
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

const DEFECTS = {
  "A1": { type: "crack", desc: "Трещина в кладке" },
  "B2": { type: "wideSeam", desc: "Широкий шов" },
  "C3": { type: "bloating", desc: "Вздутие поверхности" },
};

function WallZone({ zone, colWidth, rowHeight, wallH, found, flashlightOn, onZoneClick }) {
  const defect = DEFECTS[zone.id];
  const x = (zone.col - 1) * colWidth;
  const y = -(zone.row - 1) * rowHeight + wallH / 2 - rowHeight / 2;
  const z = 0.07; // передняя грань стены на Z=0.05, поднимаем выше

  const handleClick = useCallback(() => {
    if (!found && onZoneClick) onZoneClick(zone.id, !!defect, defect?.desc || "");
  }, [found, zone.id, defect, onZoneClick]);

  const highlightActive = flashlightOn && !!defect && !found;

  return (
    <group>
      {/* Кликабельная зона — перед стеной */}
      <mesh position={[x, y, z]}
        onClick={handleClick}
        onPointerOver={(e) => { e.object.scale.set(1.05, 1.05, 1); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.object.scale.set(1, 1, 1); document.body.style.cursor = "default"; }}>
        <planeGeometry args={[colWidth * 0.92, rowHeight * 0.92]} />
        <meshBasicMaterial
          color={found ? "#22c55e" : highlightActive ? "#ff4444" : "#4488ff11"}
          transparent opacity={found ? 0.3 : highlightActive ? 0.45 : 0.08}
          depthWrite={false} />
      </mesh>

      {/* Подсветка фонариком (яркая рамка с заливкой) */}
      {highlightActive && (
        <group position={[x, y, z + 0.01]}>
          <mesh>
            <planeGeometry args={[colWidth * 0.86, rowHeight * 0.86]} />
            <meshBasicMaterial color="#ff4444" wireframe transparent opacity={1.0} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[colWidth * 0.84, rowHeight * 0.84]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.15} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Метка после обнаружения */}
      {found && defect && (
        <group position={[x, y, z + 0.01]}>
          {defect.type === "crack" && (
            <mesh rotation={[0, 0, 0.3]}>
              <planeGeometry args={[0.12, 0.6]} />
              <meshBasicMaterial color="#ff4444" transparent opacity={0.8} depthWrite={false} />
            </mesh>
          )}
          {defect.type === "wideSeam" && (
            <mesh>
              <planeGeometry args={[0.7, 0.04]} />
              <meshBasicMaterial color="#ff4444" transparent opacity={0.8} depthWrite={false} />
            </mesh>
          )}
          {defect.type === "bloating" && (
            <mesh>
              <sphereGeometry args={[0.15, 16, 12]} />
              <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.4} depthWrite={false} />
            </mesh>
          )}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[colWidth * 0.85, rowHeight * 0.85]} />
            <meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.6} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* При выключенном фонаре дефектные зоны не подсвечиваются — искать наугад */}
    </group>
  );
}

// 3D-фонарик (корпус и лампа горизонтально)
function Flashlight({ on, onClick }) {
  return (
    <group position={[1.5, 0.2, 0.8]} rotation={[0, -0.3, 0]}>
      {/* Корпус (горизонтальный цилиндр — вдоль X) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.09, 0.35, 20]} />
        <meshStandardMaterial color="#555" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Головка (расширенная часть, влево = -X) */}
      <mesh position={[-0.23, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.08, 0.12, 20]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Линза */}
      <mesh position={[-0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.1, 20]} />
        <meshStandardMaterial
          color={on ? "#ffffcc" : "#666"}
          emissive={on ? "#ffffcc" : "#000"}
          emissiveIntensity={on ? 1.5 : 0}
          roughness={0.1} />
      </mesh>
      {/* Красная кнопка — сверху корпуса, кликабельная */}
      <mesh position={[-0.05, 0.1, 0]}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial
          color={on ? "#22ff22" : "#ff2222"}
          roughness={0.2} metalness={0.3}
          emissive={on ? "#22ff22" : "#ff4444"}
          emissiveIntensity={on ? 1 : 0.5} />
      </mesh>
      {/* Ободок кнопки */}
      <mesh position={[-0.05, 0.08, 0]}>
        <torusGeometry args={[0.05, 0.012, 8, 16]} />
        <meshStandardMaterial color="#777" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Луч при включении (влево) */}
      {on && (
        <mesh position={[-0.55, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.5, 8, 1]} />
          <meshBasicMaterial color="#ffffaa" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default function InspectionSiteR3F({ taskIndex = 1, onZoneClick }) {
  const wallW = 4, wallH = 3;
  const colWidth = wallW / 3, rowHeight = wallH / 3;
  const [flashlightOn, setFlashlightOn] = useState(false);

  const handleFlashlightClick = useCallback(() => {
    setFlashlightOn(prev => !prev);
  }, []);

  return (
    <group>
      {/* Пол */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
      </mesh>
      <gridHelper args={[10, 10, "#555", "#444"]} position={[0, 0, 0]} />

      {/* Стена (фон) — box толщиной 0.12, передняя грань на Z=0.05 */}
      <mesh position={[0, wallH / 2, -0.01]} castShadow receiveShadow>
        <boxGeometry args={[wallW, wallH, 0.12]} />
        <meshStandardMaterial color="#c8956a" roughness={0.8} />
      </mesh>

      {/* Кирпичная текстура (линии) — на передней грани */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`h${i}`} position={[0, i * (wallH / 6.5), 0.06]} rotation={[0, 0, 0]}>
          <planeGeometry args={[wallW - 0.1, 0.015]} />
          <meshBasicMaterial color="#9a7930" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}

      {/* Зоны стены (перед передней гранью Z=0.05, на Z=0.07) */}
      {WALL_ZONES.map(zone => (
        <WallZone key={zone.id} zone={zone}
          colWidth={colWidth} rowHeight={rowHeight} wallH={wallH}
          found={false} flashlightOn={flashlightOn} onZoneClick={onZoneClick} />
      ))}

      {/* Планшет */}
      <group position={[-1.5, 0.3, 0.8]}>
        <mesh castShadow><boxGeometry args={[0.3, 0.5, 0.03]} /><meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} /></mesh>
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[0.24, 0.44]} /><meshBasicMaterial color="#aaffcc" transparent opacity={0.5} /></mesh>
      </group>

      {/* Фонарик */}
      <Flashlight on={flashlightOn} onClick={handleFlashlightClick} />

      {flashlightOn && (
        <pointLight position={[0.8, 0.2, 0.8]} intensity={0.7} color="#ffffcc" distance={4} />
      )}

      {/* Телефон */}
      <group position={[-2.2, 1.5, -0.5]}>
        <mesh><boxGeometry args={[0.2, 0.35, 0.04]} /><meshStandardMaterial color="#222" roughness={0.2} metalness={0.6} /></mesh>
        <mesh position={[0, 0, 0.025]}><planeGeometry args={[0.16, 0.3]} /><meshStandardMaterial
          color={taskIndex === 3 ? "#ff4444" : "#2244aa"}
          emissive={taskIndex === 3 ? "#ff4444" : "#2244aa"}
          emissiveIntensity={taskIndex === 3 ? 0.8 : 0.3} /></mesh>
        {taskIndex === 3 && <pointLight intensity={1} color="#ff4444" distance={1} position={[0, 0, 0.1]} />}
      </group>

      <pointLight position={[0, 2.2, 1.5]} intensity={1.2} color="#ffeebb" distance={6} castShadow />
    </group>
  );
}