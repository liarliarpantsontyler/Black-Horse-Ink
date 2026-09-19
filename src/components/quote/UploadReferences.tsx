"use client";

import Image from "next/image";
import { useRef } from "react";
import { trackEvent } from "@/lib/analytics";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
};

export function UploadReferences({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) break;
      if (file.size > MAX_BYTES) continue;
      if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) && file.type) {
        continue;
      }
      next.push(file);
    }
    if (next.length > files.length) trackEvent("reference_uploaded");
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-elevated/50 px-4 text-sm text-muted"
        onClick={() => inputRef.current?.click()}
      >
        Tap to upload photos
        <span className="mt-1 text-xs">Up to {MAX_FILES} images</span>
      </button>
      {files.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={URL.createObjectURL(file)}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-background/80 px-2 py-0.5 text-xs"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
