import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  loadModels,
  detectFaceFromVideo,
  getFaceDescriptor,
} from "../../utils/faceRecognition";
import { drawFaceDetection } from "../../utils/faceRecognition";

const FaceRegistration = ({ onFaceRegistered, onClose, onUnregister }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(null);
  const [faceQuality, setFaceQuality] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUnregistering, setIsUnregistering] = useState(false);

  // intentionally run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    initializeCamera();

    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Keep canvas size in sync with video
  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Use intrinsic video dimensions for drawing, but style to fit displayed size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.style.width = `${video.clientWidth}px`;
    canvas.style.height = `${video.clientHeight}px`;
  }, []);

  // Start continuous face detection function (declared before effect to avoid TDZ)
  const startContinuousDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && modelsReady && !isCapturing) {
        try {
          const detection = await detectFaceFromVideo(videoRef.current);

          if (detection) {
            setFaceDetected(true);

            // Analyze face quality
            const quality = analyzeFaceQuality(detection);
            setFaceQuality(quality);
            // show detection score
            setDetectionScore(detection.detection.score ?? null);

            // draw overlay mesh
            if (canvasRef.current) {
              syncCanvasSize();
              drawFaceDetection(canvasRef.current, detection, videoRef.current);
            }
          } else {
            setFaceDetected(false);
            setFaceQuality(null);
            setDetectionScore(null);
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              ctx &&
                ctx.clearRect(
                  0,
                  0,
                  canvasRef.current.width,
                  canvasRef.current.height
                );
            }
          }
        } catch (error) {
          // Silently handle detection errors
          console.debug("Detection error:", error);
        }
      }
    }, 500); // Check every 500ms
  }, [modelsReady, isCapturing, syncCanvasSize]);

  useEffect(() => {
    // Start continuous face detection when models are ready
    if (modelsReady && videoRef.current && !isCapturing) {
      startContinuousDetection();
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [modelsReady, isCapturing, startContinuousDetection]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera API not supported in this browser. Please use a modern browser."
        );
      }

      // Load models first
      toast.loading("Loading face detection models...", { id: "models" });
      await loadModels();
      setModelsReady(true);
      toast.success("Models loaded!", { id: "models" });

      // Request camera access with basic constraints first
      toast.loading("Requesting camera access...", { id: "camera" });

      let stream;
      try {
        // Try with simple constraints first
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (simpleError) {
        console.log(
          "Simple constraints failed, trying specific constraints:",
          simpleError
        );
        // If simple fails, try with specific constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Failed to get camera stream");
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Simple play without promise
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          // sync canvas once video metadata is available
          syncCanvasSize();
          window.addEventListener("resize", syncCanvasSize);
          setTimeout(() => {
            setIsLoading(false);
            toast.success("Camera ready!", { id: "camera" });
          }, 500);
        };
      }
    } catch (error) {
      console.error("Full camera error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      let errorMessage = "";
      let errorDetails = "";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage = "Camera permission denied.";
        errorDetails =
          "Click the camera icon in your address bar and select 'Allow'.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = "No camera found.";
        errorDetails = "Please connect a webcam and refresh the page.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage = "Camera is busy.";
        errorDetails =
          "Close other apps using the camera (Teams, Zoom, etc.) and try again.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage = "Camera doesn't meet requirements.";
        errorDetails = "Your camera may not support the required resolution.";
      } else if (error.name === "TypeError") {
        errorMessage = "Browser security restriction.";
        errorDetails =
          "Camera access requires HTTPS or localhost. Make sure you're using the correct URL.";
      } else {
        errorMessage = "Failed to access camera.";
        errorDetails =
          error.message || "Unknown error. Check browser console for details.";
      }

      setCameraError(errorMessage + " " + errorDetails);
      toast.error(errorMessage, { id: "camera" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [syncCanvasSize]);

  const analyzeFaceQuality = (detection) => {
    // Analyze detection quality
    const score = detection.detection.score;

    if (score > 0.95)
      return {
        level: "excellent",
        message: "Perfect! Face clearly visible",
        color: "text-green-500",
      };
    if (score > 0.85)
      return {
        level: "good",
        message: "Good position",
        color: "text-blue-500",
      };
    if (score > 0.7)
      return {
        level: "fair",
        message: "Try to improve lighting",
        color: "text-yellow-500",
      };
    return {
      level: "poor",
      message: "Face not clear, adjust position",
      color: "text-red-500",
    };
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFace = async () => {
    if (!videoRef.current || !modelsReady) {
      toast.error("Camera not ready");
      return;
    }

    if (!faceDetected) {
      toast.error("Please position your face in the frame first");
      return;
    }

    setIsCapturing(true);

    try {
      const detection = await detectFaceFromVideo(videoRef.current);

      if (!detection) {
        toast.error(
          "No face detected. Please position your face in the frame."
        );
        setIsCapturing(false);
        return;
      }

      // Check quality
      const quality = analyzeFaceQuality(detection);
      if (quality.level === "poor") {
        toast.error(
          "Face quality too low. Please improve lighting and try again."
        );
        setIsCapturing(false);
        return;
      }

      const descriptor = getFaceDescriptor(detection);

      if (descriptor) {
        const newDescriptors = [...capturedDescriptors, descriptor];
        setCapturedDescriptors(newDescriptors);
        setCurrentStep(newDescriptors.length + 1);
        toast.success(
          `✓ Face captured successfully! (${newDescriptors.length}/3)`
        );

        // If we have 3 captures, we're done
        if (newDescriptors.length >= 3) {
          // Start a local progress indicator while processing
          setIsProcessing(true);
          setProcessingProgress(0);

          // Average the descriptors for better accuracy
          const avgDescriptor = averageDescriptors(newDescriptors);

          // Animate progress while onFaceRegistered runs
          let progress = 0;
          const progressInterval = setInterval(() => {
            // increase progress with diminishing increments, cap at 95
            const inc = Math.floor(Math.random() * 6) + 3; // 3..8
            progress = Math.min(95, progress + inc);
            setProcessingProgress(progress);
          }, 200);

          try {
            await onFaceRegistered(avgDescriptor);
            // finish progress
            setProcessingProgress(100);
            // small delay to let UI show 100%
            await new Promise((r) => setTimeout(r, 300));
            stopCamera();
            toast.success("Face registered successfully!");
            onClose();
          } catch (error) {
            console.error("Error processing face registration:", error);
            toast.error(error?.message || "Failed to process face data");
          } finally {
            clearInterval(progressInterval);
            setIsProcessing(false);
            setProcessingProgress(0);
          }
        }
      } else {
        toast.error("Could not extract face data. Please try again.");
      }
    } catch (error) {
      console.error("Error capturing face:", error);
      toast.error("Error capturing face. Please try again.");
    }

    setIsCapturing(false);
  };

  const averageDescriptors = (descriptors) => {
    if (descriptors.length === 0) return null;

    const avgDescriptor = new Array(descriptors[0].length).fill(0);

    descriptors.forEach((descriptor) => {
      descriptor.forEach((value, index) => {
        avgDescriptor[index] += value;
      });
    });

    return avgDescriptor.map((value) => value / descriptors.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-user-plus"></i>
                Face Registration Wizard
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Step {currentStep} of 3 - Capture your face from different
                angles
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onUnregister && (
                <button
                  onClick={async () => {
                    if (!window.confirm("Unregister face for this user?"))
                      return;
                    try {
                      setIsUnregistering(true);
                      await onUnregister();
                      toast.success("Face unregistered");
                      // keep camera running so user can re-register if desired
                    } catch (err) {
                      console.error("Unregister error:", err);
                      toast.error(err?.message || "Failed to unregister");
                    } finally {
                      setIsUnregistering(false);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-3 py-2 mr-2 font-semibold text-sm shadow"
                  disabled={isUnregistering || isProcessing}
                >
                  {isUnregistering ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-user-times mr-2"></i>
                      Unregister
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(capturedDescriptors.length / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 text-center shadow-lg">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
                Processing face data... {processingProgress}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 transition-all"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {cameraError ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <i className="fas fa-video-slash text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Camera Access Issue
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                {cameraError}
              </p>

              <div className="space-y-4 text-left max-w-lg mx-auto">
                {/* Chrome Instructions */}
                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <i className="fab fa-chrome text-blue-500"></i>
                    Chrome / Edge:
                  </p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Click the camera icon (🎥) in the address bar</li>
                    <li>Select &ldquo;Always allow&rdquo; for this site</li>
                    <li>Click &ldquo;Done&rdquo; and try again</li>
                  </ol>
                </div>

                {/* Firefox Instructions */}
                <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <i className="fab fa-firefox text-orange-500"></i>
                    Firefox:
                  </p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Click the crossed-out camera icon in address bar</li>
                    <li>Click &ldquo;Allow&rdquo; when prompted</li>
                    <li>Try again below</li>
                  </ol>
                </div>

                {/* Safari Instructions */}
                <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <i className="fab fa-safari text-purple-500"></i>
                    Safari:
                  </p>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Click Safari → Settings → Websites</li>
                    <li>Select &ldquo;Camera&rdquo; from left sidebar</li>
                    <li>Set this website to &ldquo;Allow&rdquo;</li>
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-lg mt-4 max-w-lg mx-auto">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2 font-semibold">
                  <i className="fas fa-lightbulb mr-2"></i>
                  Quick Fixes:
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Make sure no other app is using your camera</li>
                  <li>
                    Try accessing from{" "}
                    <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                      http://localhost:8000
                    </code>{" "}
                    instead
                  </li>
                  <li>
                    Check Windows Settings → Privacy → Camera (allow browser
                    access)
                  </li>
                  <li>Restart your browser completely</li>
                </ul>
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={initializeCamera}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg font-semibold"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Try Again
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors shadow-lg font-semibold"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <i className="fas fa-lightbulb text-yellow-500 text-xl mt-1"></i>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Tips for best results:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Ensure good lighting on your face</li>
                      <li>• Look directly at the camera</li>
                      <li>• Remove glasses if possible</li>
                      <li>• Keep a neutral expression</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Video Container */}
              <div
                className="relative bg-black rounded-xl overflow-hidden mb-4 border-4 border-transparent"
                style={{ borderColor: faceDetected ? "#10b981" : "#6b7280" }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-10">
                    <i className="fas fa-spinner fa-spin text-white text-4xl mb-3"></i>
                    <p className="text-white font-semibold">
                      Initializing camera...
                    </p>
                  </div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ maxHeight: "450px" }}
                />

                {/* Face Detection Overlay */}
                {!isLoading && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div
                      className={`${
                        faceDetected ? "bg-green-500" : "bg-gray-500"
                      } bg-opacity-90 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2`}
                    >
                      <i
                        className={`fas ${
                          faceDetected ? "fa-check-circle" : "fa-times-circle"
                        }`}
                      ></i>
                      {faceDetected ? "Face Detected" : "No Face Detected"}
                    </div>

                    {faceQuality && (
                      <div
                        className={`${faceQuality.color} bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-semibold`}
                      >
                        <i className="fas fa-star mr-1"></i>
                        {faceQuality.message}
                      </div>
                    )}

                    {/* Detection score */}
                    {detectionScore !== null && (
                      <div className="ml-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Score: {detectionScore.toFixed(3)}
                      </div>
                    )}
                  </div>
                )}

                {/* Captured Images Thumbnails */}
                {capturedDescriptors.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center ${
                          capturedDescriptors.length >= step
                            ? "bg-green-500 border-green-400"
                            : "bg-gray-700 border-gray-600"
                        }`}
                      >
                        {capturedDescriptors.length >= step ? (
                          <i className="fas fa-check text-white text-xl"></i>
                        ) : (
                          <span className="text-white font-bold">{step}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={captureFace}
                  disabled={
                    isLoading || isCapturing || !modelsReady || !faceDetected
                  }
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
                >
                  {isCapturing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Capturing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-camera mr-2"></i>
                      Capture Face ({capturedDescriptors.length}/3)
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="bg-gray-500 dark:bg-gray-600 text-white py-4 px-8 rounded-xl font-bold hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

FaceRegistration.propTypes = {
  onFaceRegistered: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onUnregister: PropTypes.func,
};

export default FaceRegistration;
