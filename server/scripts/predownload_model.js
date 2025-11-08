import { preDownloadModel } from "../src/services/analysisService.js";

async function run() {
  console.log("Starting model pre-download...");
  try {
    await preDownloadModel((msg) => console.log("[predownload]", msg));
    console.log("Model pre-download completed successfully.");
  } catch (err) {
    console.error(
      "Model pre-download failed:",
      err && err.message ? err.message : err
    );
    process.exit(1);
  }
}

run();
