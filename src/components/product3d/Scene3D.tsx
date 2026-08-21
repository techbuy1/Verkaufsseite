"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  forwardRef,
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { DeviceModel } from "./DeviceModel";

interface Scene3DProps {
  modelPath: string;
  /** Full device colour (frame + back + stylus + wallpaper). Omit when model is pre-coloured. */
  colorHex?: string;
  /** Selected colour, always provided — see DeviceModel's `buttonColorHex`. */
  buttonColorHex?: string;
  /** Optional wallpaper texture for the screen material. */
  screenTextureUrl?: string;
  accentColor: string;
  reducedMotion: boolean;
  onModelReady?: () => void;
  /** Kept for API compatibility — user interaction is disabled. */
  onInteract?: () => void;
  /**
   * When set, the device swaps between a front and a back view every N
   * seconds instead of continuously auto-rotating (camera stays put; the
   * model itself turns). Disables the regular auto-rotate for this instance.
   */
  viewCycleSeconds?: number;
  /** Degrees/sec-equivalent speed for the presentation auto-rotate (60/speed = seconds per full turn). */
  autoRotateSpeed?: number;
}

/** Eases the model group's yaw toward 0° (front) / 180° (back), flipping every `intervalSeconds`. */
function FrontBackCycler({
  groupRef,
  intervalSeconds,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  intervalSeconds: number;
}) {
  const startRef = useRef<number | null>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const showBack = Math.floor(elapsed / intervalSeconds) % 2 === 1;
    const target = showBack ? Math.PI : 0;
    group.rotation.y += (target - group.rotation.y) * 0.06;
  });

  return null;
}

export interface Scene3DHandle {
  /** Re-centers the camera and keeps the presentation auto-rotate running. */
  resetView: () => void;
}

/** How much of the viewer height the phone should fill (0.7–0.8). */
const VIEW_FILL = 0.76;

interface Framing {
  target: THREE.Vector3;
  position: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  shadowY: number;
}

/**
 * Places the camera so `box` fills ~VIEW_FILL of the vertical FOV,
 * accounting for canvas aspect so wide models still fit horizontally.
 */
function computeFraming(
  box: THREE.Box3,
  fovDeg: number,
  aspect: number,
): Framing {
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const fov = THREE.MathUtils.degToRad(fovDeg);
  const halfFov = fov / 2;
  const fitHeightDistance = size.y / (2 * Math.tan(halfFov) * VIEW_FILL);
  const fitWidthDistance =
    size.x / (2 * Math.tan(halfFov) * aspect * VIEW_FILL);
  // Slight padding so edges/S-Pen aren't clipped during rotation
  const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.06;

  const position = new THREE.Vector3(center.x, center.y, center.z + distance);

  return {
    target: center.clone(),
    position,
    minDistance: Math.max(distance * 0.55, size.y * 0.9),
    maxDistance: distance * 2.2,
    shadowY: box.min.y - size.y * 0.02,
  };
}

function CameraFramer({
  framing,
  controlsRef,
}: {
  framing: Framing | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, invalidate } = useThree();
  const hasFramedRef = useRef(false);

  useEffect(() => {
    if (!framing) return;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    if (!hasFramedRef.current) {
      // First model this scene ever shows — no orbit in progress yet, so
      // starting front-on (framing.position) is correct.
      camera.position.copy(framing.position);
      hasFramedRef.current = true;
    } else {
      // A later model swap (hero carousel advancing slides, colour swap,
      // etc.) — autoRotate has been spinning the camera around the old
      // target this whole time. Re-pointing it straight at framing.position
      // would snap the view back to front-on, killing the loop the user is
      // watching. Keep the camera's current orbit *direction* and only
      // rescale its distance for the new model's framing, so the rotation
      // continues seamlessly instead of resetting.
      const previousTarget = camera.userData.lastFramingTarget as THREE.Vector3 | undefined;
      const direction = camera.position
        .clone()
        .sub(previousTarget ?? framing.target)
        .normalize();
      const distance = framing.position.distanceTo(framing.target);
      camera.position.copy(framing.target.clone().addScaledVector(direction, distance));
    }
    camera.userData.lastFramingTarget = framing.target.clone();

    camera.near = Math.max(0.05, framing.minDistance * 0.05);
    camera.far = Math.max(50, framing.maxDistance * 4);
    camera.lookAt(framing.target);
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(framing.target);
      controls.minDistance = framing.minDistance;
      controls.maxDistance = framing.maxDistance;
      controls.update();
    }

    invalidate();
  }, [framing, camera, controlsRef, invalidate]);

  return null;
}

export const Scene3D = forwardRef<Scene3DHandle, Scene3DProps>(function Scene3D(
  {
    modelPath,
    colorHex,
    buttonColorHex,
    screenTextureUrl,
    reducedMotion,
    onModelReady,
    viewCycleSeconds,
    autoRotateSpeed = 2.8,
  },
  handleRef,
) {
  const [framing, setFraming] = useState<Framing | null>(null);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const framingRef = useRef<Framing | null>(null);
  const lastBoxRef = useRef<THREE.Box3 | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const { camera, size: viewSize } = useThree();

  const applyFraming = useCallback((next: Framing) => {
    framingRef.current = next;
    setFraming(next);
  }, []);

  // Re-frame when the canvas aspect changes (responsive layout / fullscreen)
  useEffect(() => {
    const box = lastBoxRef.current;
    if (!box) return;
    const perspective =
      camera instanceof THREE.PerspectiveCamera ? camera : null;
    const fov = perspective?.fov ?? 28;
    const aspect =
      perspective?.aspect ||
      (viewSize.height > 0 ? viewSize.width / viewSize.height : 0.75);
    applyFraming(computeFraming(box, fov, aspect));
  }, [viewSize.width, viewSize.height, camera, applyFraming]);

  useImperativeHandle(
    handleRef,
    () => ({
      resetView: () => {
        const saved = framingRef.current;
        const controls = orbitRef.current;
        if (saved && camera instanceof THREE.PerspectiveCamera) {
          camera.position.copy(saved.position);
          camera.lookAt(saved.target);
          camera.updateProjectionMatrix();
          if (controls) {
            controls.target.copy(saved.target);
            controls.minDistance = saved.minDistance;
            controls.maxDistance = saved.maxDistance;
            controls.update();
          }
        } else {
          controls?.reset();
        }
      },
    }),
    [camera],
  );

  function handleModelReady(box: THREE.Box3) {
    lastBoxRef.current = box.clone();
    const perspective =
      camera instanceof THREE.PerspectiveCamera ? camera : null;
    const fov = perspective?.fov ?? 28;
    const aspect =
      perspective?.aspect ||
      (viewSize.height > 0 ? viewSize.width / viewSize.height : 0.75);

    applyFraming(computeFraming(box, fov, aspect));
    onModelReady?.();
  }

  const shadowY = framing?.shadowY ?? -0.85;
  const minDistance = framing?.minDistance ?? 1.2;
  const maxDistance = framing?.maxDistance ?? 4.5;
  const target = framing
    ? ([framing.target.x, framing.target.y, framing.target.z] as [
        number,
        number,
        number,
      ])
    : ([0, 0, 0] as [number, number, number]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
      <Environment resolution={256}>
        <Lightformer intensity={2.5} color="white" position={[0, 4, 2]} scale={[8, 4, 1]} />
        <Lightformer
          intensity={1.5}
          color="white"
          position={[-4, 1, 2]}
          rotation-y={Math.PI / 2.5}
          scale={[6, 3, 1]}
        />
        <Lightformer
          intensity={1.5}
          color="white"
          position={[4, 1, 2]}
          rotation-y={-Math.PI / 2.5}
          scale={[6, 3, 1]}
        />
        <Lightformer intensity={1} color="white" position={[0, -3, 2]} scale={[8, 3, 1]} />
      </Environment>

      <CameraFramer framing={framing} controlsRef={orbitRef} />

      {viewCycleSeconds && viewCycleSeconds > 0 && !reducedMotion && (
        <FrontBackCycler groupRef={modelGroupRef} intervalSeconds={viewCycleSeconds} />
      )}

      <group ref={modelGroupRef}>
        <Suspense fallback={null}>
          <DeviceModel
            key={modelPath}
            modelPath={modelPath}
            colorHex={colorHex}
            buttonColorHex={buttonColorHex}
            screenTextureUrl={screenTextureUrl}
            onReady={handleModelReady}
          />
        </Suspense>
      </group>

      <ContactShadows
        position={[0, shadowY, 0]}
        opacity={0.45}
        blur={2.6}
        far={2.5}
        resolution={512}
      />

      {/* Presentation-only controls: auto-rotate keeps running; no user input. */}
      <OrbitControls
        ref={orbitRef}
        target={target}
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        minDistance={minDistance}
        maxDistance={maxDistance}
        autoRotate={!reducedMotion && !viewCycleSeconds}
        autoRotateSpeed={autoRotateSpeed}
      />
    </>
  );
});
