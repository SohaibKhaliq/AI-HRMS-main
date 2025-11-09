import * as faceapi from "face-api.js";

let modelsLoaded = false;

// Load face-api models (fast local-only loader)
export const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = "/models";

    // Probe model manifest with a short timeout to avoid long hangs
    const manifestUrl = `${MODEL_URL}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`;
    const controller = new AbortController();
    const probeTimeout = setTimeout(() => controller.abort(), 8000);
    const testResponse = await fetch(manifestUrl, {
      signal: controller.signal,
    });
    clearTimeout(probeTimeout);

    if (!testResponse.ok) {
      throw new Error(
        `Local face-api models not found at ${MODEL_URL}. Please run the predownload script: node server/scripts/predownload_face_models.js and restart the client.`
      );
    }

    console.log(
      "Loading face recognition models from local folder:",
      MODEL_URL
    );

    // Load only the nets we need (tiny detector + landmarks + recognition)
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(
        `${MODEL_URL}/tiny_face_detector`
      ),
      faceapi.nets.faceLandmark68Net.loadFromUri(
        `${MODEL_URL}/face_landmark_68`
      ),
      faceapi.nets.faceRecognitionNet.loadFromUri(
        `${MODEL_URL}/face_recognition`
      ),
    ]);

    modelsLoaded = true;
    console.log("✅ Face recognition models loaded successfully");
  } catch (error) {
    console.error("❌ Error loading face recognition models:", error);
    throw new Error(
      "Failed to load face recognition models. Please check your setup."
    );
  }
};

// Detect face from video stream (fast)
export const detectFaceFromVideo = async (videoElement) => {
  try {
    const tinyOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5,
    });

    const detection = await faceapi
      .detectSingleFace(videoElement, tinyOptions)
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  } catch (error) {
    console.error("Error detecting face:", error);
    return null;
  }
};

// Detect face from image
export const detectFaceFromImage = async (imageElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection;
  } catch (error) {
    console.error("Error detecting face from image:", error);
    return null;
  }
};

// Compare two face descriptors
export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  if (!descriptor1 || !descriptor2) return false;

  const d1 =
    descriptor1 instanceof Float32Array
      ? descriptor1
      : new Float32Array(descriptor1);
  const d2 =
    descriptor2 instanceof Float32Array
      ? descriptor2
      : new Float32Array(descriptor2);

  const distance = faceapi.euclideanDistance(d1, d2);
  try {
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      console.debug("Face distance:", distance);
    }
  } catch {
    // ignore
  }
  return distance < threshold;
};

// Get face descriptor from detection
export const getFaceDescriptor = (detection) => {
  if (!detection || !detection.descriptor) return null;
  return Array.from(detection.descriptor);
};

// Draw face detection on canvas
export const drawFaceDetection = (canvas, detection, videoElement) => {
  if (!detection) return;

  const displaySize = {
    width: videoElement.videoWidth,
    height: videoElement.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);
  const resizedDetection = faceapi.resizeResults(detection, displaySize);

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resizedDetection);
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);
};

// Return numeric Euclidean distance between two descriptors
export const faceDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) return Number.POSITIVE_INFINITY;

  const d1 =
    descriptor1 instanceof Float32Array
      ? descriptor1
      : new Float32Array(descriptor1);
  const d2 =
    descriptor2 instanceof Float32Array
      ? descriptor2
      : new Float32Array(descriptor2);

  return faceapi.euclideanDistance(d1, d2);
};
