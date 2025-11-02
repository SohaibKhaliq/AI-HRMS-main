import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { loadModels, detectFaceFromVideo, getFaceDescriptor, compareFaces } from "../../utils/faceRecognition";

const FaceAttendance = ({ storedDescriptor, onAttendanceMarked, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const startContinuousDetection = useCallback(() => {
    // Check for face every 500ms
    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && modelsReady && !isVerifying) {
        const detection = await detectFaceFromVideo(videoRef.current);
        setFaceDetected(!!detection);
      }
    }, 500);
  }, [modelsReady, isVerifying]);

  const initializeCamera = useCallback(async () => {
    try {
      // Load models first
      await loadModels();
      setModelsReady(true);

      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: "user" 
        },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          startContinuousDetection();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please grant camera permissions.");
      setIsLoading(false);
    }
  }, [startContinuousDetection]);

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
    if (!videoRef.current || !modelsReady) {
      toast.error("Camera not ready");
      return;
    }

    if (!storedDescriptor) {
      toast.error("No face registered. Please register your face first.");
      return;
    }

    setIsVerifying(true);

    try {
      const detection = await detectFaceFromVideo(videoRef.current);
      
      if (!detection) {
        toast.error("No face detected. Please position your face in the frame.");
        setIsVerifying(false);
        return;
      }

      const currentDescriptor = getFaceDescriptor(detection);
      
      if (currentDescriptor) {
        // Compare with stored descriptor
        const isMatch = compareFaces(storedDescriptor, currentDescriptor, 0.6);
        
        if (isMatch) {
          toast.success("Face verified successfully!");
          stopCamera();
          onAttendanceMarked();
        } else {
          toast.error("Face does not match. Please try again.");
        }
      } else {
        toast.error("Could not extract face data. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying face:", error);
      toast.error("Error verifying face. Please try again.");
    }

    setIsVerifying(false);
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
            Position your face in the frame and click verify to mark your attendance.
          </p>
          {faceDetected && (
            <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
              <i className="fas fa-check-circle mr-2"></i>
              <span className="text-sm font-semibold">Face detected</span>
            </div>
          )}
          {!faceDetected && !isLoading && (
            <div className="mt-2 flex items-center text-yellow-600 dark:text-yellow-400">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              <span className="text-sm">No face detected</span>
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
