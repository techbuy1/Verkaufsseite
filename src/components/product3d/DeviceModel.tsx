"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import {
  isColorableHousingPart,
  isProtectedPart,
  isScreenPart,
} from "./constants";

interface DeviceModelProps {
  modelPath: string;
  /**
   * Full device colour (frame + back cover + stylus + wallpaper wash).
   * Omit when the GLB at `modelPath` is already the correct colour.
   */
  colorHex?: string;
  /**
   * Selected colour, always provided regardless of whether the rest of the
   * model is dynamically tinted — used to correct the small handful of parts
   * (e.g. the Camera Control button) that pre-coloured exports sometimes
   * leave in their default colour. Falls back to `colorHex` when omitted.
   */
  buttonColorHex?: string;
  /** Optional dedicated wallpaper texture URL for the screen material. */
  screenTextureUrl?: string;
  /** Reports the model's local-space bounding box once, after centering/normalizing. */
  onReady?: (box: THREE.Box3) => void;
}

/** Canonical model height in world units after normalize.
 * Scene3D then frames the camera so this fills ~76% of the viewer height. */
const TARGET_HEIGHT = 1.65;

/**
 * Applies a complete colour variant to the device's housing:
 * - Frame / side rails
 * - Glass back / rear cover
 * - S Pen / pens
 *
 * The screen is deliberately left alone here — see applyNeutralScreen.
 *
 * Previously only meshes matching "frame" were tinted because "Glass back"
 * was excluded by a bare "glass" non-housing hint.
 */
/** Some device GLBs ship a separate "screen off" mesh layered over the real screen. */
function isOffStateMaterial(materialName: string): boolean {
  return materialName.toLowerCase().includes("off");
}

function applyDeviceColorVariant(root: THREE.Object3D, colorHex: string) {
  const color = new THREE.Color(colorHex);
  const accent = color.clone().lerp(new THREE.Color("#ffffff"), 0.12);
  const depth = color.clone().lerp(new THREE.Color("#000000"), 0.22);

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) continue;

      const materialName = "name" in material ? String(material.name ?? "") : "";
      const standardMaterial = material as THREE.MeshStandardMaterial;
      if (!("color" in standardMaterial) || !standardMaterial.color) continue;

      if (isProtectedPart(child.name, materialName)) continue;

      // Screen material is handled by applyNeutralScreen — a colour wash on
      // the baked-in wallpaper photo reads as a mismatched tint, not a
      // deliberate colour, so the screen always stays neutral regardless of
      // the housing colour.
      if (isScreenPart(child.name, materialName)) continue;

      if (isColorableHousingPart(child.name, materialName)) {
        const combined = `${child.name} ${materialName}`.toLowerCase();
        const isSecondary =
          combined.includes(".001") ||
          combined.includes("frame (") && combined.includes(").001");

        standardMaterial.color.copy(isSecondary ? depth : accent);
        // Solid colour covers must not keep a conflicting albedo map
        if (combined.includes("glass back") && standardMaterial.map) {
          standardMaterial.map = null;
        }
        standardMaterial.needsUpdate = true;
      }
    }
  });
}

/**
 * The iPhone 17 Pro's Camera Control button and Apple logo cutout share one
 * untextured material ("PaletteMaterial001" in every export, plus "Glass
 * tint" on other devices) with no baseColorFactor baked in, so it renders
 * default white/grey and is matched by neither isColorableHousingPart nor
 * isProtectedPart — visibly wrong (a pale button) on every per-colour export,
 * including the pre-coloured ones that got everything else right. Runs as
 * its own always-on pass, independent of whether the rest of the model is
 * being dynamically tinted or is already pre-coloured.
 */
function applyCameraControlButtonColor(root: THREE.Object3D, colorHex: string) {
  const accent = new THREE.Color(colorHex).lerp(new THREE.Color("#ffffff"), 0.12);

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) continue;
      const materialName = "name" in material ? String(material.name ?? "") : "";
      if (!/glass tint|palettematerial001/i.test(materialName)) continue;
      const standardMaterial = material as THREE.MeshStandardMaterial;
      if ("color" in standardMaterial && standardMaterial.color) {
        standardMaterial.color.copy(accent);
        standardMaterial.needsUpdate = true;
      }
    }
  });
}

/**
 * Every device GLB bakes its own busy marketing-shot wallpaper into the
 * screen material, in whatever colour that particular photo happened to be
 * (e.g. the Cosmic Orange export's screen art is blue) — never the selected
 * housing colour, and never a plain neutral look. Strips that baked image
 * and the "screen off" overlay mesh, leaving a flat, neutral dark panel that
 * reads as a real (asleep) display regardless of which colour is active.
 */
function applyNeutralScreen(root: THREE.Object3D, screenTexture?: THREE.Texture | null) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (!material) continue;
      const materialName = "name" in material ? String(material.name ?? "") : "";
      if (!isScreenPart(child.name, materialName)) continue;

      if (isOffStateMaterial(materialName)) {
        child.visible = false;
        continue;
      }

      const standardMaterial = material as THREE.MeshStandardMaterial;
      if (screenTexture) {
        standardMaterial.map = screenTexture;
        screenTexture.colorSpace = THREE.SRGBColorSpace;
        screenTexture.needsUpdate = true;
        brightenScreenMaterial(standardMaterial, screenTexture);
        if ("color" in standardMaterial && standardMaterial.color) {
          standardMaterial.color.set("#ffffff");
        }
      } else {
        standardMaterial.map = null;
        if ("emissiveMap" in standardMaterial) standardMaterial.emissiveMap = null;
        if ("emissive" in standardMaterial) standardMaterial.emissive.set("#000000");
        if ("color" in standardMaterial && standardMaterial.color) {
          standardMaterial.color.set("#1c1c1e");
        }
      }
      standardMaterial.needsUpdate = true;
    }
  });
}

/**
 * Deep-clones every mesh's material too. `Object3D.clone(true)` only clones
 * the scene graph — materials stay shared by reference with the cached
 * source scene. Without this, tinting one on-page viewer (e.g. the homepage
 * highlight card) mutates the SAME material another simultaneously-mounted
 * viewer (e.g. the premium banner) is using, and vice versa.
 */
function cloneMaterialsDeep(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = Array.isArray(child.material)
      ? child.material.map((material) => material.clone())
      : child.material.clone();
  });
}

/**
 * Many product GLBs ship a second copy (".001") — front + back laid out
 * side-by-side. Measuring both makes the bounding box huge and the phone
 * appears tiny after normalize. Keep only the primary device.
 */
function pruneDuplicateDevices(root: THREE.Object3D) {
  const toRemove: THREE.Object3D[] = [];
  for (const child of root.children) {
    if (/\.001$/.test(child.name)) {
      toRemove.push(child);
    }
  }
  for (const child of toRemove) {
    root.remove(child);
  }
}

/**
 * Some exports (seen on the iPad Pro 13 model) bake an identical non-identity
 * rotation into every individual mesh node instead of a single root/scene
 * transform — the usual root-level Z-up fix below does nothing to them since
 * the root itself is untouched. Detect a rotation shared by every mesh and
 * counter it at the root, which cancels out identically for every child.
 */
function correctUniformChildRotation(root: THREE.Object3D) {
  const state: { shared: THREE.Quaternion | null; uniform: boolean; meshCount: number } = {
    shared: null,
    uniform: true,
    meshCount: 0,
  };

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !state.uniform) return;
    state.meshCount += 1;
    if (!state.shared) {
      state.shared = child.quaternion.clone();
      return;
    }
    const q = child.quaternion;
    const ref = state.shared;
    if (
      Math.abs(q.x - ref.x) > 1e-4 ||
      Math.abs(q.y - ref.y) > 1e-4 ||
      Math.abs(q.z - ref.z) > 1e-4 ||
      Math.abs(q.w - ref.w) > 1e-4
    ) {
      state.uniform = false;
    }
  });

  if (state.uniform && state.shared && state.meshCount > 1 && Math.abs(state.shared.w) < 0.999) {
    root.quaternion.copy(state.shared).invert();
    root.updateMatrixWorld(true);
  }
}

/**
 * Centers the model at the origin and scales it so its longest screen-facing
 * dimension (prefer Y/height, else max axis) becomes `targetHeight`.
 */
function normalizeToTarget(root: THREE.Object3D, targetHeight: number): THREE.Box3 {
  pruneDuplicateDevices(root);

  // Reset any previous normalize so re-entry is idempotent
  root.position.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  root.rotation.set(0, 0, 0);
  root.updateMatrixWorld(true);

  correctUniformChildRotation(root);

  const initialBox = new THREE.Box3().setFromObject(root);
  const initialSize = new THREE.Vector3();
  initialBox.getSize(initialSize);

  // Some source GLBs are exported Z-up (their "height" sits on the Z axis,
  // not Y) — the device then renders lying on its side. Detect that case
  // (height clearly dominant on Z rather than Y) and rotate it upright
  // before the rest of this function's Y-up assumptions apply.
  if (initialSize.z > initialSize.y * 1.5 && initialSize.z >= initialSize.x * 0.6) {
    root.rotation.x = Math.PI / 2;
    root.updateMatrixWorld(true);
  }

  const uprightBox = new THREE.Box3().setFromObject(root);
  const uprightSize = new THREE.Vector3();
  uprightBox.getSize(uprightSize);

  // Prefer height; if the mesh is oriented flat, fall back to the longest axis
  const primary =
    uprightSize.y >= uprightSize.x * 0.6
      ? uprightSize.y
      : Math.max(uprightSize.x, uprightSize.y, uprightSize.z);
  const extent = primary > 1e-6 ? primary : 1;
  const scale = targetHeight / extent;
  root.scale.setScalar(scale);
  root.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  root.position.sub(center);
  root.updateMatrixWorld(true);

  return new THREE.Box3().setFromObject(root);
}

export function DeviceModel({
  modelPath,
  colorHex,
  buttonColorHex,
  screenTextureUrl,
  onReady,
}: DeviceModelProps) {
  const resolvedButtonColorHex = buttonColorHex ?? colorHex;
  const { scene } = useGLTF(modelPath);

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    cloneMaterialsDeep(clone);
    return clone;
  }, [scene]);

  // useLayoutEffect (not useEffect) so the model is already scaled/centered
  // before the browser paints the first frame — otherwise the very first
  // frame renders the raw, unscaled (real-world-scale) model, which appears
  // as a tiny fragment in the corner of the frame until the next frame.
  useLayoutEffect(() => {
    const box = normalizeToTarget(cloned, TARGET_HEIGHT);
    onReady?.(box);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloned]);

  useLayoutEffect(() => {
    let cancelled = false;
    let loadedTexture: THREE.Texture | null = null;

    const apply = (texture?: THREE.Texture | null) => {
      if (cancelled) return;
      if (colorHex) {
        applyDeviceColorVariant(cloned, colorHex);
      }
      // Always neutral, whether the housing is dynamically tinted or a
      // pre-coloured export — see applyNeutralScreen.
      applyNeutralScreen(cloned, texture);
      // Always runs, even when the rest of the model is a pre-coloured
      // export (colorHex omitted) — see applyCameraControlButtonColor.
      if (resolvedButtonColorHex) {
        applyCameraControlButtonColor(cloned, resolvedButtonColorHex);
      }
    };

    if (screenTextureUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(
        screenTextureUrl,
        (texture) => {
          loadedTexture = texture;
          apply(texture);
        },
        undefined,
        () => apply(null),
      );
    } else {
      apply(null);
    }

    return () => {
      cancelled = true;
      loadedTexture?.dispose();
    };
  }, [cloned, colorHex, resolvedButtonColorHex, screenTextureUrl]);

  return <primitive object={cloned} />;
}

/**
 * Lights the wallpaper texture from within (emissive) so it reads as a bright,
 * lit-up screen regardless of scene lighting or how dark the source image is —
 * a plain albedo map alone stays as dim as the ambient/directional lights hitting it.
 */
function brightenScreenMaterial(material: THREE.MeshStandardMaterial, texture: THREE.Texture) {
  if (!("emissiveMap" in material)) return;
  material.emissiveMap = texture;
  material.emissive.set("#ffffff");
  material.emissiveIntensity = 0.55;
  material.needsUpdate = true;
}

