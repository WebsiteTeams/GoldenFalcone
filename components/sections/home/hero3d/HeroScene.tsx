"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Station, type StationKey } from "./Stations";

export type SceneProps = {
  src: string;
  active: StationKey | null;
  visible: boolean;
  reduce: boolean;
  mobile: boolean;
  /** Desktop layout: the scene occupies the right ~two thirds of a full-width canvas. */
  wide: boolean;
  pointer: MutableRefObject<{ x: number; y: number }>;
  scroll: MutableRefObject<number>;
  onHover: (key: StationKey | null) => void;
  onSelect: (key: StationKey) => void;
  onReady: () => void;
  onFail: () => void;
};

const GOLD = "#d4a437";
const EMBLEM_Y = 3.0;
const EMBLEM_SIZE = 4.1;

const stationLayout: Record<StationKey, [number, number, number]> = {
  spices: [-3.4, 0, 0.8],
  mentorship: [3.4, 0, 0.8],
  staffing: [0, 0, 4.1],
};

/** Reflection source for the metals: a neutral studio, baked once and disposed on unmount. */
function Studio({ intensity }: { intensity: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      room.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

function radialTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([at, color]) => grd.addColorStop(at, color));
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A thin gold beam between two points, used to tie every division to the emblem. */
function Beam({ from, to, y = 0.04 }: { from: THREE.Vector3; to: THREE.Vector3; y?: number }) {
  const { pos, quat, len } = useMemo(() => {
    const a = from.clone().setY(y);
    const b = to.clone().setY(y);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat, len };
  }, [from, to, y]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[0.014, 0.014, len, 6]} />
      <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} emissive={GOLD} emissiveIntensity={0.18} />
    </mesh>
  );
}

function Emblem({ src, layers, reduce }: { src: string; layers: number; reduce: boolean }) {
  const map = useLoader(THREE.TextureLoader, src);
  const { gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const sweep = useRef<THREE.PointLight>(null);

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    map.needsUpdate = true;
  }, [map, gl]);
  useEffect(() => () => map.dispose(), [map]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current && !reduce) {
      group.current.position.y = EMBLEM_Y + Math.sin(t * 0.8) * 0.06;
      group.current.rotation.y = Math.sin(t * 0.25) * 0.16;
    }
    if (sweep.current) {
      sweep.current.position.x = Math.sin(t * 0.45) * 2.6;
      sweep.current.intensity = 9 + Math.sin(t * 0.45 + 1) * 3;
    }
  });

  return (
    <>
      <group ref={group} position={[0, EMBLEM_Y, 0]}>
        {/* dark gold layers behind the face give the artwork real thickness */}
        {Array.from({ length: layers }, (_, i) => (
          <mesh key={i} position={[0, 0, -0.035 * (i + 1)]} castShadow={i === 0}>
            <planeGeometry args={[EMBLEM_SIZE, EMBLEM_SIZE]} />
            <meshStandardMaterial map={map} color="#4a3510" metalness={1} roughness={0.5} alphaTest={0.45} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh castShadow>
          <planeGeometry args={[EMBLEM_SIZE, EMBLEM_SIZE]} />
          <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={0.28} metalness={0.55} roughness={0.34} envMapIntensity={1.2} alphaTest={0.45} />
        </mesh>
        <pointLight ref={sweep} position={[0, 0.4, 1.6]} color="#ffe2a8" intensity={9} distance={7} decay={2} />
      </group>
    </>
  );
}

function Environment({ mobile }: { mobile: boolean }) {
  const glow = useMemo(() => radialTexture([[0, "rgba(255,214,140,0.9)"], [0.35, "rgba(212,164,55,0.28)"], [1, "rgba(212,164,55,0)"]]), []);
  const wall = useMemo(() => radialTexture([[0, "rgba(4,40,31,1)"], [0.72, "rgba(4,40,31,0.92)"], [1, "rgba(4,40,31,0)"]]), []);
  useEffect(() => () => glow.dispose(), [glow]);
  useEffect(() => () => wall.dispose(), [wall]);
  const seg = mobile ? 72 : 112;
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targets = useMemo(
    () => (Object.keys(stationLayout) as StationKey[]).map((k) => new THREE.Vector3(...stationLayout[k])),
    [],
  );

  return (
    <>
      {/* back wall disc and concentric architectural rings */}
      <mesh position={[0, EMBLEM_Y, -3.2]}>
        <planeGeometry args={[15, 15]} />
        <meshBasicMaterial map={wall} transparent depthWrite={false} fog={false} />
      </mesh>
      {[4.5, 5.6].map((r, i) => (
        <mesh key={r} position={[0, EMBLEM_Y, -3.15]}>
          <ringGeometry args={[r, r + (i ? 0.025 : 0.05), seg]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.35} />
        </mesh>
      ))}
      {/* framing ring behind the emblem */}
      <mesh position={[0, EMBLEM_Y, -0.55]}>
        <torusGeometry args={[2.75, 0.065, 20, seg]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, EMBLEM_Y, -1.2]}>
        <torusGeometry args={[3.5, 0.025, 12, seg]} />
        <meshStandardMaterial color="#e8d5a3" metalness={1} roughness={0.4} />
      </mesh>
      {/* warm halo */}
      <mesh position={[0, EMBLEM_Y, -0.9]}>
        <planeGeometry args={[9, 9]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.38} />
      </mesh>

      {/* floor platform */}
      <mesh position={[0, -0.2, 0.6]} receiveShadow>
        <cylinderGeometry args={[5.0, 5.2, 0.4, seg]} />
        <meshStandardMaterial color="#042e24" metalness={0.5} roughness={0.5} />
      </mesh>
      {[5.0, 3.9, 2.35].map((r, i) => (
        <mesh key={r} position={[0, 0.012 + i * 0.002, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - (i === 0 ? 0.07 : 0.03), r, seg]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.32} />
        </mesh>
      ))}

      {/* emblem pedestal */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.6, 1.8, 0.56, seg]} />
        <meshStandardMaterial color="#0b5d46" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.25, 1.35, 0.2, seg]} />
        <meshStandardMaterial color="#d4a437" metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.02, 10, seg]} />
        <meshStandardMaterial color="#e8d5a3" metalness={1} roughness={0.3} />
      </mesh>

      {/* connecting lines: emblem to every division */}
      {targets.map((t, i) => (
        <Beam key={i} from={origin} to={t} />
      ))}
    </>
  );
}

function Rig({ pointer, scroll, reduce, mobile, wide, children }: Pick<SceneProps, "pointer" | "scroll" | "reduce" | "mobile" | "wide"> & { children: React.ReactNode }) {
  const { camera, size } = useThree();
  const root = useRef<THREE.Group>(null);
  const intro = useRef(0);
  const look = useMemo(() => new THREE.Vector3(0, 1.9, 0), []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const share = wide ? 0.6 : 1;
    const fit = Math.max(8.4 / 2 / tanHalf, (mobile ? 10.2 : 12.4) / 2 / (tanHalf * aspect * share));
    intro.current = reduce ? 1 : Math.min(1, intro.current + dt / 2.8);
    const e = 1 - Math.pow(1 - intro.current, 3);
    const p = reduce ? { x: 0, y: 0 } : pointer.current;
    const s = reduce ? 0 : scroll.current;

    const tx = p.x * 0.9;
    const ty = 4.7 - p.y * 0.5 + s * 1.1;
    const tz = fit * (1.4 - 0.4 * e) + s * 2.2;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 3, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 3, dt);
    cam.position.z = THREE.MathUtils.damp(cam.position.z, tz, 2.5, dt);
    look.y = THREE.MathUtils.damp(look.y, 1.9 + s * 0.4, 3, dt);
    cam.lookAt(look);
    if (root.current) root.current.position.x = wide ? (1 - share) * tanHalf * aspect * fit : 0;
    if (root.current) root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, p.x * 0.14, 2.5, dt);
  });

  return <group ref={root}>{children}</group>;
}

function Scene({ src, active, reduce, mobile, wide, pointer, scroll, onHover, onSelect, onReady }: SceneProps) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  const detail = mobile ? 0 : 1;
  const scale = mobile ? 0.9 : 1;
  const shadows = !mobile;

  return (
    <>
      <fog attach="fog" args={["#062f25", 18, 50]} />
      <Studio intensity={mobile ? 0.35 : 0.45} />
      <ambientLight intensity={0.35} color="#9fd8c3" />
      {/* warm key */}
      <directionalLight
        position={[4, 7, 7]}
        intensity={2.4}
        color="#ffe0ae"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-3}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      {/* emerald fill and cool rim */}
      <pointLight position={[-6, 3, 4]} intensity={50} color="#1fae86" distance={16} decay={2} />
      <directionalLight position={[-3, 5, -6]} intensity={1.3} color="#cdeee0" />

      <Rig pointer={pointer} scroll={scroll} reduce={reduce} mobile={mobile} wide={wide}>
        <Environment mobile={mobile} />
        <Suspense fallback={null}>
          <Emblem src={src} layers={mobile ? 3 : 6} reduce={reduce} />
        </Suspense>
        {(Object.keys(stationLayout) as StationKey[]).map((k) => (
          <Station
            key={k}
            id={k}
            position={stationLayout[k].map((v, i) => (i === 1 ? v : v * (mobile ? 0.88 : 1))) as [number, number, number]}
            scale={scale}
            active={active === k}
            reduce={reduce}
            detail={detail}
            onHover={onHover}
            onSelect={onSelect}
          />
        ))}
      </Rig>
    </>
  );
}

export default function HeroScene(props: SceneProps) {
  const { mobile, visible, onFail } = props;
  return (
    <Canvas
      aria-hidden
      shadows={mobile ? false : "percentage"}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      frameloop={visible ? "always" : "never"}
      camera={{ fov: 32, position: [0, 4.7, 16], near: 0.5, far: 60 }}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
