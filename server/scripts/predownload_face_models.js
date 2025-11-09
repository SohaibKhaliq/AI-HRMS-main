#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Node 18+ has global fetch. If not available, user should run with newer node.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_MODELS_DIR = path.join(
  __dirname,
  "..",
  "..",
  "client",
  "public",
  "models"
);

const CDN_BASE = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";

const MODELS = [
  {
    name: "tiny_face_detector",
    manifest: "tiny_face_detector_model-weights_manifest.json",
  },
  {
    name: "face_landmark_68",
    manifest: "face_landmark_68_model-weights_manifest.json",
  },
  {
    name: "face_recognition",
    manifest: "face_recognition_model-weights_manifest.json",
  },
  {
    name: "ssd_mobilenetv1",
    manifest: "ssd_mobilenetv1_model-weights_manifest.json",
  },
];

async function downloadUrl(url, dest) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  await fs.promises.writeFile(dest, Buffer.from(buffer));
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) await fs.promises.mkdir(dir, { recursive: true });
}

async function run() {
  console.log("Predownloading face-api models to", CLIENT_MODELS_DIR);
  await ensureDir(CLIENT_MODELS_DIR);

  for (const m of MODELS) {
    const modelDir = path.join(CLIENT_MODELS_DIR, m.name);
    await ensureDir(modelDir);
    const manifestUrl = `${CDN_BASE}/${m.name}/${m.manifest}`;
    const manifestDest = path.join(modelDir, m.manifest);
    try {
      console.log("Downloading manifest:", manifestUrl);
      await downloadUrl(manifestUrl, manifestDest);
    } catch (err) {
      console.error(
        "Failed to download manifest for",
        m.name,
        err.message || err
      );
      throw err;
    }

    // Read manifest and download listed weight files
    let manifest;
    try {
      const txt = await fs.promises.readFile(manifestDest, "utf8");
      manifest = JSON.parse(txt);
    } catch (err) {
      console.error("Failed to parse manifest for", m.name, err.message || err);
      throw err;
    }

    // manifest is an array of groups; each group has weights array with paths
    const weightFiles = new Set();
    for (const group of manifest) {
      if (Array.isArray(group.weights)) {
        for (const w of group.weights) {
          if (w && w.data) weightFiles.add(w.data);
        }
      }
      if (Array.isArray(group.weightManifest)) {
        for (const w of group.weightManifest) {
          if (w && w.paths) for (const p of w.paths) weightFiles.add(p);
        }
      }
    }

    for (const wf of weightFiles) {
      const srcUrl = `${CDN_BASE}/${m.name}/${wf}`;
      const dst = path.join(modelDir, wf);
      try {
        if (fs.existsSync(dst)) {
          console.log("Already downloaded", dst);
          continue;
        }
        console.log("Downloading weight file:", srcUrl);
        await downloadUrl(srcUrl, dst);
      } catch (err) {
        console.error(
          "Failed to download weight file",
          srcUrl,
          err.message || err
        );
        throw err;
      }
    }
  }

  console.log("All face-api models downloaded to client/public/models.");
  console.log(
    "You can now run the client dev server and the app will load models locally from /models."
  );
}

run().catch((err) => {
  console.error("Predownload failed:", err && err.message ? err.message : err);
  process.exit(1);
});
