"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false },
);

const REFINE_URL = "http://localhost:8000/refine";
const VARIANT_SPACING = 1000;
const VARIANT_MARGIN = 100;

type RefineResponse = {
  variants: { elements: Record<string, unknown>[] }[];
};

// Our backend serializes unset optional fields as explicit `null` (Pydantic's
// behavior), but Excalidraw's skeleton converter expects them omitted rather
// than present-as-null. Drop null values so only real fields remain.
function stripNulls(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null),
  );
}

export default function Canvas() {
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  function getSceneArgs() {
    if (!excalidrawAPI) return null;
    return {
      elements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
    };
  }

  function openBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  async function getExportBlob() {
    const args = getSceneArgs();
    if (!args) return null;

    const { exportToBlob } = await import("@excalidraw/excalidraw");
    return exportToBlob(args);
  }

  async function handleExportPng() {
    const blob = await getExportBlob();
    if (!blob) return;
    openBlob(blob);
  }

  async function handleExportSvg() {
    const args = getSceneArgs();
    if (!args) return;

    const { exportToSvg } = await import("@excalidraw/excalidraw");
    const svg = await exportToSvg({
      ...args,
      appState: { ...args.appState, exportBackground: false },
      exportPadding: 16,
    });

    const svgString = new XMLSerializer().serializeToString(svg);
    openBlob(new Blob([svgString], { type: "image/svg+xml" }));
  }

  async function handleRefine() {
    const blob = await getExportBlob();
    if (!blob || !excalidrawAPI) return;

    setIsRefining(true);
    setRefineError(null);

    try {
      const formData = new FormData();
      formData.append("sketch", blob, "sketch.png");

      const response = await fetch(REFINE_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Backend responded with ${response.status}`);
      }

      const data = (await response.json()) as RefineResponse;
      const { convertToExcalidrawElements, getCommonBounds } = await import(
        "@excalidraw/excalidraw"
      );

      const existingElements = excalidrawAPI.getSceneElements();
      const startX =
        existingElements.length > 0
          ? getCommonBounds(existingElements)[2] + VARIANT_MARGIN
          : 0;

      const generatedElements = data.variants.flatMap((variant, i) =>
        convertToExcalidrawElements(
          variant.elements.map((el) => {
            const cleaned = stripNulls(el);
            const x = typeof cleaned.x === "number" ? cleaned.x : 0;
            return { ...cleaned, x: startX + x + i * VARIANT_SPACING };
          }) as ExcalidrawElementSkeleton[],
        ),
      );

      excalidrawAPI.updateScene({
        elements: [...existingElements, ...generatedElements],
      });
    } catch (error) {
      setRefineError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        {refineError && (
          <p className="rounded bg-red-50 px-3 py-1 text-sm text-red-700">
            Couldn&apos;t reach the backend: {refineError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleExportPng}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white"
          >
            Export PNG
          </button>
          <button
            onClick={handleExportSvg}
            className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-white"
          >
            Export SVG
          </button>
          <button
            onClick={handleRefine}
            disabled={isRefining}
            className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {isRefining ? "Sending…" : "Refine with AI"}
          </button>
        </div>
      </div>
      <Excalidraw excalidrawAPI={(api) => setExcalidrawAPI(api)} />
    </div>
  );
}
