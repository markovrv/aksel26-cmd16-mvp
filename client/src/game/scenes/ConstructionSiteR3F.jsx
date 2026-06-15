import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

function Worker({ startPos, targetPos, color }) {
  const [pos, setPos] = useState([...startPos]);

  useFrame((_, delta) => {
    if (!targetPos) return;
    const tx = targetPos[0], ty = targetPos[1], tz = targetPos[2];
    const dx = tx - pos[0], dy = ty - pos[1], dz = tz - pos[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.03) { setPos(targetPos); return; }
    const speed = 2.5;
    const step = Math.min(speed * delta, dist);
    setPos([pos[0] + (dx / dist) * step, pos[1] + (dy / dist) * step, pos[2] + (dz / dist) * step]);
  });

  return (
    <group position={pos}>
      <mesh position={[0, 0.65, 0]} castShadow><capsuleGeometry args={[0.15, 0.4, 4, 8]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh position={[0, 1.1, 0]} castShadow><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial color="#ffcc99" roughness={0.8} /></mesh>
      <mesh position={[0, 1.3, 0]} castShadow><coneGeometry args={[0.22, 0.12, 16]} /><meshStandardMaterial color="#ffdd00" roughness={0.5} metalness={0.3} /></mesh>
    </group>
  );
}

export default function ConstructionSiteR3F({ taskIndex = 1, highlightZones = false, emergencyMode = false, truckArrived = true, truckDeparting = false, wallsVisible = true, workerAssignments = null }) {
  const truckZ = useRef(-20);
  const [truckPos, setTruckPos] = useState(-20);
  const prevArrived = useRef(truckArrived);
  useEffect(() => { prevArrived.current = truckArrived; }, [truckArrived]);

  useFrame((_, delta) => {
    if (truckDeparting) truckZ.current = Math.max(-20, truckZ.current - delta * 6);
    else if (prevArrived.current && truckZ.current < -1) truckZ.current = Math.min(-1, truckZ.current + delta * 4);
    setTruckPos(truckZ.current);
  });

  const defaultPositions = useMemo(() => [[-4, 0, 3], [-2.8, 0, 3], [-1.6, 0, 3], [-0.4, 0, 3], [0.8, 0, 3]], []);
  const getTargetPos = (workerIndex) => {
    if (!workerAssignments) return null;
    const zones = { foundation: { x: -2, z: 0 }, walls: { x: 2, z: 0 } };
    if (workerAssignments.foundation.includes(workerIndex)) { const idx = workerAssignments.foundation.indexOf(workerIndex); const ox = (idx - (workerAssignments.foundation.length - 1) / 2) * 0.8; return [zones.foundation.x + ox, 0, zones.foundation.z]; }
    if (workerAssignments.walls.includes(workerIndex)) { const idx = workerAssignments.walls.indexOf(workerIndex); const ox = (idx - (workerAssignments.walls.length - 1) / 2) * 0.8; return [zones.walls.x + ox, 0, zones.walls.z]; }
    return null;
  };
  const workers = [{ color: "#3366cc" }, { color: "#33aa55" }, { color: "#3366cc" }, { color: "#8844aa" }, { color: "#cc6633" }];

  return (
    <group>
      {/* Основное освещение сцены */}
      <directionalLight position={[10, 15, 10]} intensity={1.2} color="#ffffff" castShadow />
      <directionalLight position={[-5, 10, -5]} intensity={0.6} color="#aaccff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}><planeGeometry args={[40, 40]} /><meshStandardMaterial color="#8a8a7a" roughness={0.9} /></mesh>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow><boxGeometry args={[6, 0.3, 4]} /><meshStandardMaterial color="#aaaaaa" roughness={0.9} /></mesh>
      {wallsVisible && [{ x: 0, z: -1.9, ry: 0 }, { x: -2.9, z: -1, ry: Math.PI / 2 }, { x: 2.9, z: -1, ry: Math.PI / 2 }].map((p, i) => (<mesh key={i} position={[p.x, 1, p.z]} rotation={[0, p.ry, 0]} castShadow receiveShadow><boxGeometry args={[6, 2, 0.25]} /><meshStandardMaterial color="#dd8866" roughness={0.7} /></mesh>))}
      <group position={[-6, 0, truckPos]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[1, 0.8, 2]} /><meshStandardMaterial color="#ee3333" roughness={0.5} metalness={0.3} emissive="#ee3333" emissiveIntensity={0.2} /></mesh>
        <mesh position={[0, 0.6, 1.2]} castShadow><boxGeometry args={[0.8, 1, 1]} /><meshStandardMaterial color="#ee3333" roughness={0.5} metalness={0.3} emissive="#ee3333" emissiveIntensity={0.2} /></mesh>
        {[[-0.5, -0.6], [0.5, -0.6], [-0.5, 0.8], [0.5, 0.8]].map(([x, z], i) => (<mesh key={i} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.3, 0.3, 0.2, 16]} /><meshStandardMaterial color="#444444" roughness={0.9} /></mesh>))}
        <mesh position={[-0.3, 0.4, 1.6]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={emergencyMode ? 1.5 : 0.5} /></mesh>
        <mesh position={[0.3, 0.4, 1.6]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={emergencyMode ? 1.5 : 0.5} /></mesh>
      </group>
      <group position={[5, 0, -2]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow><boxGeometry args={[3, 2, 2]} /><meshStandardMaterial color="#8b7355" roughness={0.8} /></mesh>
        <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[2.5, 1, 4]} /><meshStandardMaterial color="#8b7355" roughness={0.8} /></mesh>
      </group>
      {workers.map((w, i) => (<Worker key={i} startPos={defaultPositions[i]} targetPos={getTargetPos(i)} color={w.color} />))}
      {highlightZones && (<>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, 0.02, 2]}><planeGeometry args={[3, 2]} /><meshBasicMaterial color="#22c55e" wireframe transparent opacity={0.5} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, 0.02, 2]}><planeGeometry args={[4, 3]} /><meshBasicMaterial color="#2563eb" wireframe transparent opacity={0.5} /></mesh>
      </>)}
      {emergencyMode && (<>
        <mesh position={[2, 1.5, 3]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} transparent opacity={0.7} /></mesh>
        <pointLight position={[2, 1.5, 3]} intensity={2} color="#ff0000" distance={8} />
      </>)}
      {emergencyMode && Array.from({ length: 5 }).map((_, i) => (<mesh key={i} position={[2 + (i - 2) * 0.3, 0.1, 3]}><boxGeometry args={[0.08, 0.2, 0.08]} /><meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} /></mesh>))}
    </group>
  );
}