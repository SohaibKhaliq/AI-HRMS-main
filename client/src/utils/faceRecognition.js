import * as faceapi from "face-api.js";

let modelsLoaded = false;

// Load face-api models
export const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    // Always use local models placed under /models in the client/public folder.
    // If models are not available, throw a helpful error instructing how to predownload them.
    const MODEL_URL = "/models";

    // Test if local models are accessible
    const testResponse = await fetch(
      `${MODEL_URL}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`
    );
    if (!testResponse.ok) {
      throw new Error(
        `Local face-api models not found at ${MODEL_URL}. Please run the predownload script: node server/scripts/predownload_face_models.js and restart the client.`
      );
    }

    console.log(
      "Loading face recognition models from local folder:",
      MODEL_URL
    );

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
      faceapi.nets.ssdMobilenetv1.loadFromUri(`${MODEL_URL}/ssd_mobilenetv1`),
    ]);

    modelsLoaded = true;
    console.log("✅ Face recognition models loaded successfully");
  } catch (error) {
    console.error("❌ Error loading face recognition models:", error);
    throw new Error(
      "Failed to load face recognition models. Please check your internet connection."
    );
  }
};

// Detect face from video stream
export const detectFaceFromVideo = async (videoElement) => {
  try {
    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
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
    console.error("Error detecting face:", error);
    return null;
  }
};

// Compare two face descriptors
export const compareFaces = (descriptor1, descriptor2, threshold = 0.6) => {
  if (!descriptor1 || !descriptor2) return false;

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
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
