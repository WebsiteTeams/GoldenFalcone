"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type StationKey = "spices" | "mentorship" | "staffing";

type StationProps = {
  id: StationKey;
  position: [number, number, number];
  scale: number;
  active: boolean;
  reduce: boolean;
  detail: number;
  onHover: (key: StationKey | null) => void;
  onSelect: (key: StationKey) => void;
};

const GOLD = "#d4a437";
const CHAMPAGNE = "#e8d5a3";
const EMERALD = "#0b5d46";

/** Deterministic pseudo-random so the layout is identical on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Gold({ rough = 0.32 }: { rough?: number }) {
  return <meshStandardMaterial color={GOLD} metalness={1} roughness={rough} />;
}

/** Shared plinth, gold rim and highlight ring for every division. */
function Plinth({ glow, rim }: { glow: React.RefObject<THREE.MeshStandardMaterial | null>; rim: number }) {
  return (
    <>
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.02, 0.18, 48]} />
        <meshStandardMaterial color={EMERALD} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.185, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.025, 12, 64]} />
        <Gold />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.08, 1.0 + rim, 64]} />
        <meshStandardMaterial ref={glow} color={GOLD} emissive={GOLD} emissiveIntensity={0.1} transparent opacity={0.85} />
      </mesh>
    </>
  );
}

function Spices({ detail }: { detail: number }) {
  const peppers = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 10 + detail * 6 }, () => {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 0.22;
      return [Math.cos(a) * d, 0.3 + (0.22 - d) * 0.8 + r() * 0.03, Math.sin(a) * d] as const;
    });
  }, [detail]);
  const bowl = useMemo(() => {
    const pts = [
      [0.0, 0.0],
      [0.18, 0.0],
      [0.3, 0.05],
      [0.4, 0.17],
      [0.42, 0.2],
      [0.39, 0.2],
      [0.0, 0.1],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 32 + detail * 8);
  }, [detail]);
  useEffect(() => () => bowl.dispose(), [bowl]);

  return (
    <group position={[0, 0.18, 0]}>
      <mesh geometry={bowl} position={[0, 0.02, 0]} castShadow>
        <meshStandardMaterial color="#a8782a" metalness={1} roughness={0.36} side={THREE.DoubleSide} />
      </mesh>
      {/* turmeric mound */}
      <mesh position={[0, 0.2, 0]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.37, 24, 12]} />
        <meshStandardMaterial color="#d8861f" roughness={0.95} />
      </mesh>
      {/* black pepper */}
      {peppers.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y - 0.02, z]} castShadow>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#1b1916" roughness={0.55} />
        </mesh>
      ))}
      {/* cinnamon sticks */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={x} position={[0.28 + x * 0.35, 0.58, -0.1 + i * 0.07]} rotation={[0.1, 0, 0.42 - i * 0.2]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.95, 14]} />
          <meshStandardMaterial color={["#8a4a1e", "#9b5a27", "#7a3f18"][i]} roughness={0.85} />
        </mesh>
      ))}
      {/* cardamom pods */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.52 + (i % 3) * 0.1, 0.06 + (i > 2 ? 0.07 : 0), 0.5 - i * 0.05]} rotation={[0, i, 0.4]} scale={[1.7, 1, 1]} castShadow>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshStandardMaterial color="#9bb374" roughness={0.7} />
        </mesh>
      ))}
      {/* cloves */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} position={[0.45 - i * 0.07, 0.04, 0.5 + (i % 2) * 0.06]} rotation={[Math.PI / 2, 0, i * 0.7]}>
          <mesh>
            <coneGeometry args={[0.022, 0.17, 8]} />
            <meshStandardMaterial color="#3b2314" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.095, 0]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshStandardMaterial color="#4a2d1a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Dimensional market-education screens. Purely illustrative; no figures or results are implied. */
function Trading() {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 320;
    const g = c.getContext("2d");
    if (!g) return null;
    g.fillStyle = "#06201a";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(232,213,163,0.12)";
    g.lineWidth = 1;
    for (let y = 40; y < 300; y += 52) {
      g.beginPath();
      g.moveTo(24, y);
      g.lineTo(488, y);
      g.stroke();
    }
    const r = seeded(7);
    let price = 190;
    for (let i = 0; i < 17; i++) {
      const open = price;
      const close = open + (r() - 0.46) * 46;
      const hi = Math.max(open, close) + r() * 18;
      const lo = Math.min(open, close) - r() * 18;
      const x = 40 + i * 27;
      const up = close >= open;
      g.strokeStyle = g.fillStyle = up ? "#d4a437" : "#5fae93";
      g.beginPath();
      g.moveTo(x, 300 - hi);
      g.lineTo(x, 300 - lo);
      g.stroke();
      g.fillRect(x - 7, 300 - Math.max(open, close), 14, Math.max(4, Math.abs(close - open)));
      price = close;
    }
    g.fillStyle = "rgba(232,213,163,0.8)";
    g.font = "600 17px sans-serif";
    g.fillText("MARKET EDUCATION", 24, 28);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <group position={[0, 0.18, 0]} rotation={[0, -0.32, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.8, 10]} />
        <Gold />
      </mesh>
      <mesh position={[0.34, 1.0, -0.22]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.45, 0.04]} />
        <meshStandardMaterial color="#0a2a22" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0.34, 1.0, -0.195]}>
        <planeGeometry args={[0.64, 0.39]} />
        <meshStandardMaterial color="#0a2a22" emissive="#1f7a60" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.05, 0.05]} castShadow>
        <boxGeometry args={[1.25, 0.8, 0.06]} />
        <meshStandardMaterial color="#0a2a22" metalness={0.9} roughness={0.3} />
      </mesh>
      {texture && (
        <mesh position={[0, 1.05, 0.085]}>
          <planeGeometry args={[1.16, 0.72]} />
          <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.55} />
        </mesh>
      )}
      {/* gold bezel */}
      {[
        [0, 1.45, 1.27, 0.025],
        [0, 0.65, 1.27, 0.025],
        [-0.625, 1.05, 0.025, 0.8],
        [0.625, 1.05, 0.025, 0.8],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.09]}>
          <boxGeometry args={[w, h, 0.03]} />
          <Gold rough={0.28} />
        </mesh>
      ))}
    </group>
  );
}

function Staffing() {
  return (
    <group position={[0, 0.18, 0]}>
      {/* oval mirror */}
      <group position={[-0.28, 0.95, -0.28]} rotation={[0, 0.25, 0]}>
        <mesh scale={[0.72, 1, 1]} castShadow>
          <torusGeometry args={[0.55, 0.035, 14, 64]} />
          <Gold rough={0.26} />
        </mesh>
        <mesh scale={[0.72, 1, 1]} position={[0, 0, -0.005]}>
          <circleGeometry args={[0.55, 48]} />
          <meshStandardMaterial color="#a9c7bd" metalness={1} roughness={0.06} />
        </mesh>
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.18, 8]} />
          <Gold />
        </mesh>
      </group>
      {/* styling chair */}
      <group position={[0.3, 0, 0.18]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.27, 0.06, 28]} />
          <Gold />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.3, 10]} />
          <Gold />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.5, 0.12, 0.46]} />
          <meshStandardMaterial color="#10231d" metalness={0.2} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.72, -0.2]} castShadow>
          <boxGeometry args={[0.5, 0.52, 0.08]} />
          <meshStandardMaterial color="#10231d" metalness={0.2} roughness={0.35} />
        </mesh>
        {[-0.28, 0.28].map((x) => (
          <mesh key={x} position={[x, 0.55, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.4]} />
            <Gold />
          </mesh>
        ))}
      </group>
      {/* scissors */}
      <group position={[-0.5, 0.2, 0.42]} rotation={[-Math.PI / 2, 0, 0.7]}>
        {[0.12, -0.12].map((a, i) => (
          <group key={i} rotation={[0, 0, a]}>
            <mesh position={[0, 0.16, 0]}>
              <boxGeometry args={[0.025, 0.34, 0.012]} />
              <meshStandardMaterial color={CHAMPAGNE} metalness={1} roughness={0.18} />
            </mesh>
            <mesh position={[i ? -0.05 : 0.05, -0.09, 0]}>
              <torusGeometry args={[0.05, 0.013, 8, 20]} />
              <Gold />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export function Station({ id, position, scale, active, reduce, detail, onHover, onSelect }: StationProps) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const level = useRef(0);

  useFrame((_, dt) => {
    level.current = THREE.MathUtils.damp(level.current, active ? 1 : 0, 4, dt);
    const a = level.current;
    group.current?.scale.setScalar(scale * (1 + 0.1 * a));
    if (glow.current) glow.current.emissiveIntensity = 0.1 + 0.9 * a;
    if (light.current) light.current.intensity = 3 + 14 * a;
    if (!reduce && group.current) group.current.position.y = position[1] + Math.sin(performance.now() / 1400 + position[0]) * 0.015 * (1 - a);
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Touch taps only highlight; the selector below handles navigation on touch devices.
        if ((e.nativeEvent as PointerEvent).pointerType === "mouse") onSelect(id);
      }}
    >
      <Plinth glow={glow} rim={0.1} />
      <pointLight ref={light} position={[0, 1.3, 1.1]} color="#ffd9a0" intensity={3} distance={5} decay={2} />
      {id === "spices" && <Spices detail={detail} />}
      {id === "mentorship" && <Trading />}
      {id === "staffing" && <Staffing />}
      {/* invisible hit area so the whole showcase is easy to target */}
      <mesh position={[0, 0.7, 0]} visible={false}>
        <cylinderGeometry args={[1, 1, 1.6, 12]} />
      </mesh>
    </group>
  );
}
