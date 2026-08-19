/** Encode public asset paths that contain spaces or special characters. */
export function assetPath(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, "");
  return `/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
