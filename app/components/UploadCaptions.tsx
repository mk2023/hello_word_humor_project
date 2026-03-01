"use client";

import { useRef, useState } from "react";
import {
  generatePresignedUrl,
  registerImage,
  generateCaptions,
} from "@/app/actions/pipeline";

const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

type PipelineCaption = {
  id?: string;
  content?: string;
  caption?: string;
  image_id?: string;
  created_datetime_utc?: string;
};

type StepKey =
  | "idle"
  | "token"
  | "presign"
  | "put"
  | "register"
  | "captions"
  | "done"
  | "error";

const STEP_ORDER: StepKey[] = ["presign", "put", "register", "captions"];

const BOXES: Array<{ key: StepKey; label: string; num: number }> = [
  { key: "presign", label: "Presign URL", num: 1 },
  { key: "put", label: "Upload bytes", num: 2 },
  { key: "register", label: "Register image", num: 3 },
  { key: "captions", label: "Generate captions", num: 4 },
];

export default function UploadCaptions() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [captions, setCaptions] = useState<PipelineCaption[]>([]);
  const [cdnUrl, setCdnUrl] = useState<string>("");
  const [imageId, setImageId] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<StepKey>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanupPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const onPickFile = (f: File | null) => {
    setFile(f);
    setCaptions([]);
    setErrorText("");
    setStep("idle");
    setCdnUrl("");
    setImageId("");

    cleanupPreview();
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  };

  const retry = () => {
    if(busy) return;
    setCaptions([]);
    setErrorText("");
    setStep("idle");
    setCdnUrl("");
    setImageId("");
  };

  const chooseDifferentImage = () => {
    if(busy) return;
    setBusy(false);
    setStep("idle");
    setErrorText("");
    setCaptions([]);
    setCdnUrl("");
    setImageId("");
    setFile(null);

    cleanupPreview();
    setPreviewUrl("");
    setFileInputKey((k) => k + 1);
  };

  const readErrorText = async (resp: Response) => {
    try {
      return await resp.text();
    } catch {
      return "";
    }
  };

  const stepIndex = (k: StepKey) => STEP_ORDER.indexOf(k);
  const currentIdx = stepIndex(step);

  const runPipeline = async () => {
    if (!file) {
      setErrorText("Pick an image first.");
      return;
    }
    if (!SUPPORTED_TYPES.has(file.type)) {
      setErrorText(`Unsupported image type: ${file.type}`);
      return;
    }

    setBusy(true);
    setErrorText("");
    setCaptions([]);
    setCdnUrl("");
    setImageId("");
    setStep("token");

    try {
      // Step 1  (pull function from server): generate presigned URL
      setStep("presign");
      const presign = await generatePresignedUrl(file.type);
      if ("error" in presign) throw new Error(presign.error);

      const { presignedUrl, cdnUrl } = presign.data;
      setCdnUrl(cdnUrl);

      // Step 2 (from client side): Upload Image bytes to presignedURL
      setStep("put");
      const putResp = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!putResp.ok) {
        throw new Error(`Upload failed (${putResp.status}): ${await readErrorText(putResp)}`);
      }

      // Step 3 (from server): register image
      setStep("register");
      const reg = await registerImage(cdnUrl);
      if ("error" in reg) throw new Error(reg.error);

      const imageId = reg.data.imageId;
      setImageId(imageId);

      // Step 4 (from server): generate captions (api automatically saves it)
      setStep("captions");
      const caps = await generateCaptions(imageId);
      if ("error" in caps) throw new Error(caps.error);

      const arr = Array.isArray(caps.data) ? caps.data : [];
      setCaptions(arr);

      setStep("done");
    } catch (err: any) {
      setStep("error");
      setErrorText(err?.message ?? "Pipeline failed.");
    } finally {
      setBusy(false);
    }
  };

  const boxState = (k: StepKey) => {
    if (step === "idle" || step === "token") return "idle";
    if (step === "done") return "done";
    if (step === "error") return "error";
    const idx = stepIndex(k);
    if (idx < 0) return "idle";
    if (idx < currentIdx) return "done";
    if (idx === currentIdx) return "current";
    return "idle";
  };

  const showResults = step === "done" && captions.length > 0;

  return (
    <div className="card">
      <style jsx>{`
        .card {
          width: min(900px, 100%);
          margin: 1rem auto 0 auto;
          background: #fff;
          border: 2px solid #111;
          border-radius: 22px;
          padding: 1.25rem;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
        .headerActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .fileRow {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
          margin-top: 14px;
        }
        .fileBox {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 0.85rem 0.95rem;
          border-radius: 16px;
          border: 2px dashed #111;
          background: #f7f7f7;
          min-height: 56px;
          min-width: 0;
        }
        .fileMeta { min-width: 0; }
        .fileName {
          font-weight: 1000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fileSub {
          font-size: 12px;
          opacity: 0.75;
          font-weight: 700;
        }
        .progressWrap { margin-top: 16px; }
        .boxes { display: flex; gap: 10px; flex-wrap: wrap; }
        .box {
          flex: 1 1 180px;
          padding: 0.8rem 0.9rem;
          border-radius: 16px;
          border: 2px solid #111;
          background: #fff;
        }
        .resultsGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: minmax(240px, 320px) 1fr;
          gap: 14px;
          align-items: start;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 900;
          padding: 0.35rem 0.55rem;
          border-radius: 999px;
          border: 2px solid #111;
          background: #f7f7f7;
          max-width: 100%;
          word-break: break-all;
        }
        @media (max-width: 720px) {
          .fileRow { grid-template-columns: 1fr; }
          .resultsGrid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            {showResults ? "Captions generated!" : "Upload an image"}
          </div>

          {(cdnUrl || imageId) && (
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {cdnUrl && <span className="pill">cdnUrl: {cdnUrl}</span>}
              {imageId && <span className="pill">imageId: {imageId}</span>}
            </div>
          )}

          {errorText && (
            <div style={{ marginTop: 10, fontWeight: 900 }}>
              ⚠️ <span style={{ fontWeight: 700 }}>{errorText}</span>
            </div>
          )}
        </div>

        <div className="headerActions">
          <button onClick={chooseDifferentImage} disabled={busy}
            style={{ padding:"0.55rem 0.85rem", borderRadius:14, border:"2px solid #111", background:"#fff", fontWeight:900, height:44, cursor: busy ? "not-allowed" : "pointer", opacity: busy? 0.5: 1, }}>
            Choose different image
          </button>
          <button onClick={retry} disabled={busy || !file}
            style={{ padding:"0.55rem 0.85rem", borderRadius:14, border:"2px solid #111", background:"#fff", fontWeight:900, height:44, opacity: busy||!file ? 0.5 : 1, cursor: busy ||!file? "not-allowed": "pointer", }}>
            Retry
          </button>
        </div>
      </div>

      {!showResults && (
        <div className="fileRow">
          <div className="fileBox">
            <input
              key={fileInputKey}
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              disabled={busy}
              style={{ display: "none" }}
            />
            <button onClick={() => fileInputRef.current?.click()} disabled={busy}
              style={{ padding:"0.55rem 0.85rem", borderRadius:14, border:"2px solid #111", background:"#fff", fontWeight:900, height:44 }}>
              Choose image
            </button>

            <div className="fileMeta">
              <div className="fileName">{file ? file.name : "No file selected"}</div>
              <div className="fileSub">
                {file ? `${file.type} • ${(file.size / 1024 / 1024).toFixed(2)} MB` : "JPEG/PNG/WebP/GIF/HEIC"}
              </div>
            </div>
          </div>

          <button onClick={runPipeline} disabled={busy || !file}
            style={{
              padding:"0.9rem 1.1rem",
              borderRadius:16,
              border:"2px solid #111",
              background: busy ? "#111" : (!file ? "#eee" : "#111"),
              color: busy ? "#fff" : (!file ? "#777" : "#fff"),
              fontWeight:1000,
              minHeight:56,
              minWidth:220,
              width:"100%",
              cursor: busy || !file ? "not-allowed" : "pointer",
            }}>
            {busy ? "Working..." : file ? "Upload & Generate" : "Pick a file first"}
          </button>
        </div>
      )}

      {!showResults && (
        <div className="progressWrap">
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Progress</div>
          <div className="boxes">
            {BOXES.map((b) => {
              const st = boxState(b.key);
              const bg =
                st === "done" ? "#e8ffe8" :
                st === "current" ? "#e6f0ff" :
                st === "error" ? "#ffecec" : "#fff";
              const badge = st === "done" ? "✅" : st === "current" ? "⏳" : st === "error" ? "⚠️" : "";

              return (
                <div key={b.key} className="box" style={{ background: bg, opacity: step === "idle" ? 0.75 : 1 }}>
                  <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 900 }}>Step {b.num}/4</div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 1000 }}>{b.label}</div>
                    <div style={{ fontWeight: 1000 }}>{badge}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showResults && (
        <div className="resultsGrid">
          <div style={{ background:"#f2f2f2", borderRadius:20, padding:"0.9rem", border:"2px solid #111" }}>
            <div style={{ fontWeight: 1000, marginBottom: 8 }}>Image</div>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" style={{ width: "100%", borderRadius: 16, display: "block" }} />
            ) : (
              <div style={{ opacity: 0.7, fontWeight: 700 }}>Preview not available.</div>
            )}
          </div>

          <div style={{ background:"#fff", borderRadius:20, border:"2px solid #111", padding:"1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div style={{ fontSize: 18, fontWeight: 1000 }}>Generated Captions</div>
              <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 800 }}>{captions.length} captions</div>
            </div>

            <ol style={{ margin: "0.75rem 0 0 0", paddingLeft: "1.2rem" }}>
              {captions.map((c, idx) => (
                <li key={c.id ?? idx}
                    style={{ margin:"0.5rem 0", padding:"0.6rem 0.75rem", background:"#f7f7f7", border:"2px solid #111", borderRadius:14, fontWeight:800 }}>
                  {c.content ?? c.caption ?? JSON.stringify(c)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}