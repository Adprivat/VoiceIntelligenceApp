/**
 * Export / Save file utility.
 * Uses Tauri dialog + fs plugins when running as desktop app,
 * falls back to browser download trick otherwise.
 */
export async function exportFile(
  content: string,
  defaultFilename: string,
  filters: { name: string; extensions: string[] }[]
): Promise<void> {
  const isTauri =
    typeof window !== "undefined" &&
    ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);

  if (isTauri) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");

    const filePath = await save({
      defaultPath: defaultFilename,
      filters,
    });

    if (filePath) {
      await writeTextFile(filePath, content);
    }
    return;
  }

  // Browser fallback
  const mimeType = defaultFilename.endsWith(".md")
    ? "text/markdown;charset=utf-8"
    : "text/plain;charset=utf-8";
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
