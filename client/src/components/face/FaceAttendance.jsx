import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import {
  loadModels,
  detectFaceFromVideo,
  getFaceDescriptor,
  compareFaces,
} from "../../utils/faceRecognition";
import { drawFaceDetection, faceDistance } from "../../utils/faceRecognition";

const FaceAttendance = ({ storedDescriptor, onAttendanceMarked, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastDetectionRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [detectionScore, setDetectionScore] = useState(null);
  const [verifyDistance, setVerifyDistance] = useState(null);

  // Keep canvas size in sync with video element
  const syncCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.style.width = `${video.clientWidth}px`;
    canvas.style.height = `${video.clientHeight}px`;
  }, []);

  const startContinuousDetection = useCallback(() => {
    // Check for face every 500ms
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && modelsReady && !isVerifying) {
        const detection = await detectFaceFromVideo(videoRef.current);
        lastDetectionRef.current = detection || null;
        setFaceDetected(!!detection);
        if (detection) {
          setDetectionScore(detection.detection.score ?? null);
          if (canvasRef.current) {
            syncCanvasSize();
            drawFaceDetection(canvasRef.current, detection, videoRef.current);
          }
        } else {
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
      }
    }, 500);
  }, [modelsReady, isVerifying, syncCanvasSize]);

  const initializeCamera = useCallback(async () => {
    try {
      // Start camera immediately so user can position their face while models load
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          // startContinuousDetection will be triggered once modelsReady becomes true
          syncCanvasSize();
          window.addEventListener("resize", syncCanvasSize);
        };
      }

      // Load models in background but don't block camera display
      loadModels()
        .then(() => {
          setModelsReady(true);
          // start detection once models are ready
          startContinuousDetection();
        })
        .catch((err) => {
          console.error("Model load error:", err);
          toast.error(
            "Failed to load face models. Please check console for details."
          );
        });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please grant camera permissions.");
      setIsLoading(false);
    }
  }, [startContinuousDetection, syncCanvasSize]);

  useEffect(() => {
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [syncCanvasSize]);

  useEffect(() => {
    initializeCamera();

    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [initializeCamera]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const verifyFace = async () => {
    if (!videoRef.current) {
      toast.error("Camera not ready");
      return;
    }

    if (!storedDescriptor) {
      toast.error("No face registered. Please register your face first.");
      return;
    }

    // If models are not ready, wait a short time for them to finish loading
    if (!modelsReady) {
      setIsVerifying(true);
      try {
        await Promise.race([
          loadModels(),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("models-timeout")), 5000)
          ),
        ]);
        setModelsReady(true);
      } catch {
        toast.error(
          "Models still loading. Please wait a few seconds and try again."
        );
        setIsVerifying(false);
        return;
      }
    }

    setIsVerifying(true);

    const verificationTimeoutMs = 8000; // fail fast if verification takes too long

    const verifyWork = (async () => {
      // Use last continuous detection if available to avoid race conditions
      let detection = lastDetectionRef.current;

      // If no cached detection, sample a few frames quickly (up to ~6 attempts)
      if (!detection) {
        const attempts = 6;
        for (let i = 0; i < attempts && !detection; i++) {
          detection = await detectFaceFromVideo(videoRef.current);
          if (detection) break;
          // small delay between attempts
          await new Promise((r) => setTimeout(r, 250));
        }
      }

      if (!detection) {
        throw new Error("no-face-detected");
      }

      const currentDescriptor = getFaceDescriptor(detection);

      if (!currentDescriptor) {
        throw new Error("no-descriptor");
      }

      // compute distance for debug and UI
      try {
        const dist = faceDistance(storedDescriptor, currentDescriptor);
        setVerifyDistance(dist);
      } catch {
        setVerifyDistance(null);
      }

      const isMatch = compareFaces(storedDescriptor, currentDescriptor, 0.6);
      return isMatch;
    })();

    try {
      const isMatch = await Promise.race([
        verifyWork,
        new Promise((_, rej) =>
          setTimeout(
            () => rej(new Error("verification-timeout")),
            verificationTimeoutMs
          )
        ),
      ]);

      if (isMatch) {
        toast.success("Face verified successfully!");
        stopCamera();
        onAttendanceMarked();
      } else {
        toast.error("Face does not match. Please try again.");
      }
    } catch (err) {
      if (err.message === "no-face-detected") {
        toast.error(
          "No face detected. Please position your face in the frame."
        );
      } else if (err.message === "no-descriptor") {
        toast.error("Could not extract face data. Please try again.");
      } else if (err.message === "verification-timeout") {
        console.warn("Verification timed out");
        toast.error(
          "Verification timed out. Try again with better lighting or move closer to the camera."
        );
      } else {
        console.error("Error verifying face:", err);
        toast.error("Error verifying face. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Mark Attendance with Face Recognition
          </h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Position your face in the frame and click verify to mark your
            attendance.
          </p>
          {faceDetected && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <i className="fas fa-check-circle mr-2"></i>
                <span className="text-sm font-semibold">Face detected</span>
              </div>
              {detectionScore !== null && (
                <div className="text-sm bg-black bg-opacity-60 text-white px-3 py-1 rounded-full">
                  Score: {detectionScore.toFixed(3)}
                </div>
              )}
            </div>
          )}
          {!faceDetected && !isLoading && (
            <div className="mt-2 flex items-center text-yellow-600 dark:text-yellow-400">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span className="text-sm">No face detected</span>
            </div>
          )}

          {/* Show verification distance when available */}
          {verifyDistance !== null && (
            <div className="mt-2 text-sm">
              <span className="font-semibold">Descriptor distance:</span>{" "}
              <span className="ml-1 bg-black bg-opacity-60 text-white px-2 py-1 rounded">
                {verifyDistance.toFixed(3)} (threshold 0.6)
              </span>
            </div>
          )}
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
              <div className="text-white text-center">
                <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p>Loading camera...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
            style={{ maxHeight: "400px" }}
          />

          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0"
            style={{ display: "none" }}
          />

          {/* Face detection indicator */}
          {faceDetected && !isLoading && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              <i className="fas fa-user-check mr-1"></i>
              Face Detected
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={verifyFace}
            disabled={isLoading || isVerifying || !modelsReady || !faceDetected}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Verifying...
              </>
            ) : (
              <>
                <i className="fas fa-fingerprint mr-2"></i>
                Verify & Mark Attendance
              </>
            )}
          </button>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

FaceAttendance.propTypes = {
  storedDescriptor: PropTypes.array,
  onAttendanceMarked: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FaceAttendance;
