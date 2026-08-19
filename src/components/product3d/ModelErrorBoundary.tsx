"use client";

import { Component, type ReactNode } from "react";

interface ModelErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface ModelErrorBoundaryState {
  hasError: boolean;
}

/** Catches GLTF load failures (e.g. missing/broken model file) so the shop can fall back to the product photo instead of crashing. */
export class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  state: ModelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.();
    if (process.env.NODE_ENV !== "production") {
      console.warn("3D-Modell konnte nicht geladen werden, zeige Produktbild-Fallback:", error);
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
