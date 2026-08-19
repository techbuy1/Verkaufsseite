"use client";

import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { LoadingOverlay3D } from "./LoadingOverlay3D";
import { Scene3D, type Scene3DHandle } from "./Scene3D";

interface DeviceViewer3DProps {
  modelPath: string;
  colorHex: string;
  accentColor: string;
  fallbackImage: string;
  fallbackImageAlt: string;
  className?: string;
  /**
   * Optional colour-exact GLB (e.g. a dedicated per-colour export). When it
   * loads successfully it's used as-is with no housing tint; if it 404s or
   * isn't provided, `modelPath` is used instead with the runtime tint.
   */
  colorModelPath?: string;
  /** Optional wallpaper texture applied to the screen material for this colour. */
  screenTextureUrl?: string;
  /**
   * When set, the device swaps between a front and a back view every N
   * seconds instead of continuously auto-rotating.
   */
  viewCycleSeconds?: number;
  /** Hide the built-in "In 3D ansehen" button. */
  hideControls?: boolean;
  /**
   * Bump this number to open the fullscreen view from a parent CTA that lives
   * outside this component (e.g. a text-panel button). Plain-prop signal
   * instead of relying on the imperative ref handle, since refs are not
   * guaranteed to cross a next/dynamic-loaded component boundary.
   */
  openSignal?: number;
}

export interface DeviceViewer3DHandle {
  openFullscreen: () => void;
  resetView: () => void;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function CanvasScene({
  modelPath,
  colorHex,
  buttonColorHex,
  screenTextureUrl,
  accentColor,
  reducedMotion,
  controlsRef,
  onModelReady,
  viewCycleSeconds,
}: {
  modelPath: string;
  colorHex?: string;
  buttonColorHex?: string;
  screenTextureUrl?: string;
  accentColor: string;
  reducedMotion: boolean;
  controlsRef: React.RefObject<Scene3DHandle | null>;
  onModelReady: () => void;
  viewCycleSeconds?: number;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 2.4], fov: 28, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      shadows={false}
      // Presentation-only: let page scroll / clicks pass through the canvas.
      style={{ pointerEvents: "none", touchAction: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.style.pointerEvents = "none";
        gl.domElement.style.touchAction = "none";
      }}
    >
      <Scene3D
        ref={controlsRef}
        modelPath={modelPath}
        colorHex={colorHex}
        buttonColorHex={buttonColorHex}
        screenTextureUrl={screenTextureUrl}
        accentColor={accentColor}
        reducedMotion={reducedMotion}
        onModelReady={onModelReady}
        viewCycleSeconds={viewCycleSeconds}
      />
    </Canvas>
  );
}

export const DeviceViewer3D = forwardRef<DeviceViewer3DHandle, DeviceViewer3DProps>(
  function DeviceViewer3D(
    {
      modelPath,
      colorHex,
      accentColor,
      fallbackImage,
      fallbackImageAlt,
      className = "",
      colorModelPath,
      screenTextureUrl,
      viewCycleSeconds,
      hideControls = false,
      openSignal,
    },
    handleRef,
  ) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [resolvedModelPath, setResolvedModelPath] = useState<string | null>(null);
  const [useTint, setUseTint] = useState(true);
  const [modelFailed, setModelFailed] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const controlsRef = useRef<Scene3DHandle | null>(null);
  const fullscreenControlsRef = useRef<Scene3DHandle | null>(null);
  const lastOpenSignal = useRef(openSignal);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  useEffect(() => {
    if (openSignal !== undefined && openSignal !== lastOpenSignal.current) {
      lastOpenSignal.current = openSignal;
      setFullscreenOpen(true);
    }
  }, [openSignal]);

  useEffect(() => {
    let cancelled = false;

    async function headOk(path: string): Promise<boolean> {
      try {
        const response = await fetch(path, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    }

    async function resolve() {
      setResolvedModelPath(null);
      setModelFailed(false);
      setModelLoaded(false);

      if (colorModelPath) {
        const ok = await headOk(colorModelPath);
        if (cancelled) return;
        if (ok) {
          setResolvedModelPath(colorModelPath);
          setUseTint(false);
          return;
        }
      }

      const baseOk = await headOk(modelPath);
      if (cancelled) return;
      if (baseOk) {
        setResolvedModelPath(modelPath);
        setUseTint(true);
      } else {
        setResolvedModelPath(null);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [modelPath, colorModelPath]);

  const use3D = webglOk === true && resolvedModelPath !== null && !modelFailed;

  useImperativeHandle(
    handleRef,
    () => ({
      openFullscreen: () => setFullscreenOpen(true),
      resetView: () => controlsRef.current?.resetView(),
    }),
    [],
  );

  useEffect(() => {
    if (!fullscreenOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreenOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreenOpen]);

  const renderFallbackImage = () => (
    <Image
      src={fallbackImage}
      alt={fallbackImageAlt}
      fill
      sizes="(max-width: 768px) 90vw, 480px"
      className="shop-image-seamless object-contain object-center"
      priority
    />
  );

  const showInlineCanvas = use3D && !fullscreenOpen;

  return (
    <>
      <div className={`relative ${className}`}>
        {showInlineCanvas ? (
          <ModelErrorBoundary fallback={renderFallbackImage()} onError={() => setModelFailed(true)}>
            <div className="relative h-full w-full">
              <CanvasScene
                modelPath={resolvedModelPath as string}
                colorHex={useTint ? colorHex : undefined}
                buttonColorHex={colorHex}
                screenTextureUrl={screenTextureUrl}
                accentColor={accentColor}
                reducedMotion={prefersReducedMotion}
                controlsRef={controlsRef}
                onModelReady={() => setModelLoaded(true)}
                viewCycleSeconds={viewCycleSeconds}
              />
              {!modelLoaded && <LoadingOverlay3D />}

              {!hideControls && (
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFullscreenOpen(true)}
                    className="tap-feedback rounded-full border border-border bg-white/90 px-3 py-1.5 text-[12px] font-medium text-text-secondary shadow-sm backdrop-blur-sm transition-colors hover:text-text-primary"
                  >
                    In 3D ansehen
                  </button>
                </div>
              )}
            </div>
          </ModelErrorBoundary>
        ) : (
          renderFallbackImage()
        )}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {fullscreenOpen && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm md:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setFullscreenOpen(false)}
              >
                <motion.div
                  className="relative flex h-full max-h-[680px] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 6 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <p className="text-[15px] font-semibold text-text-primary">360°-Ansicht</p>
                    <button
                      type="button"
                      onClick={() => setFullscreenOpen(false)}
                      aria-label="Schließen"
                      className="tap-feedback flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="relative flex-1">
                    {use3D ? (
                      <ModelErrorBoundary
                        fallback={renderFallbackImage()}
                        onError={() => setModelFailed(true)}
                      >
                        <CanvasScene
                          modelPath={resolvedModelPath as string}
                          colorHex={useTint ? colorHex : undefined}
                          buttonColorHex={colorHex}
                          screenTextureUrl={screenTextureUrl}
                          accentColor={accentColor}
                          reducedMotion={prefersReducedMotion}
                          controlsRef={fullscreenControlsRef}
                          onModelReady={() => {}}
                          viewCycleSeconds={viewCycleSeconds}
                        />
                      </ModelErrorBoundary>
                    ) : (
                      renderFallbackImage()
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
  },
);
