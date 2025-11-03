import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import { loadModels, detectFaceFromVideo, getFaceDescriptor } from "../../utils/faceRecognition";

const FaceRegistration = ({ onFaceRegistered, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceQuality, setFaceQuality] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

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
  }, [modelsReady, isCapturing]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Load models first
      toast.loading("Loading face detection models...", { id: "models" });
      await loadModels();
      setModelsReady(true);
      toast.success("Models loaded successfully", { id: "models" });

      // Start camera
      toast.loading("Requesting camera access...", { id: "camera" });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          toast.success("Camera ready!", { id: "camera" });
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Could not access camera.";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No camera found. Please connect a camera and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Camera is already in use by another application.";
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage, { id: "camera" });
      setIsLoading(false);
    }
  };

  const startContinuousDetection = () => {
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
          } else {
            setFaceDetected(false);
            setFaceQuality(null);
          }
        } catch (error) {
          // Silently handle detection errors
          console.debug("Detection error:", error);
        }
      }
    }, 500); // Check every 500ms
  };

  const analyzeFaceQuality = (detection) => {
    // Analyze detection quality
    const score = detection.detection.score;
    
    if (score > 0.95) return { level: "excellent", message: "Perfect! Face clearly visible", color: "text-green-500" };
    if (score > 0.85) return { level: "good", message: "Good position", color: "text-blue-500" };
    if (score > 0.7) return { level: "fair", message: "Try to improve lighting", color: "text-yellow-500" };
    return { level: "poor", message: "Face not clear, adjust position", color: "text-red-500" };
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
        toast.error("No face detected. Please position your face in the frame.");
        setIsCapturing(false);
        return;
      }

      // Check quality
      const quality = analyzeFaceQuality(detection);
      if (quality.level === "poor") {
        toast.error("Face quality too low. Please improve lighting and try again.");
        setIsCapturing(false);
        return;
      }

      const descriptor = getFaceDescriptor(detection);
      
      if (descriptor) {
        const newDescriptors = [...capturedDescriptors, descriptor];
        setCapturedDescriptors(newDescriptors);
        setCurrentStep(newDescriptors.length + 1);
        toast.success(`✓ Face captured successfully! (${newDescriptors.length}/3)`);
        
        // If we have 3 captures, we're done
        if (newDescriptors.length >= 3) {
          toast.loading("Processing face data...");
          // Average the descriptors for better accuracy
          const avgDescriptor = averageDescriptors(newDescriptors);
          await onFaceRegistered(avgDescriptor);
          stopCamera();
          toast.success("Face registered successfully!");
          onClose();
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <i className="fas fa-user-plus"></i>
                Face Registration Wizard
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Step {currentStep} of 3 - Capture your face from different angles
              </p>
            </div>
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
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(capturedDescriptors.length / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {cameraError ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <i className="fas fa-exclamation-circle text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Camera Access Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {cameraError}
              </p>
              <div className="space-y-3 text-left max-w-md mx-auto bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  <i className="fas fa-info-circle mr-2"></i>
                  How to enable camera:
                </p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-6">
                  <li>1. Click the camera icon in your browser's address bar</li>
                  <li>2. Select "Allow" for camera permissions</li>
                  <li>3. Reload the page</li>
                </ol>
              </div>
              <button
                onClick={initializeCamera}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </button>
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
              <div className="relative bg-black rounded-xl overflow-hidden mb-4 border-4 border-transparent" style={{ borderColor: faceDetected ? '#10b981' : '#6b7280' }}>
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-10">
                    <i className="fas fa-spinner fa-spin text-white text-4xl mb-3"></i>
                    <p className="text-white font-semibold">Initializing camera...</p>
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
                    <div className={`${faceDetected ? 'bg-green-500' : 'bg-gray-500'} bg-opacity-90 px-4 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2`}>
                      <i className={`fas ${faceDetected ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {faceDetected ? 'Face Detected' : 'No Face Detected'}
                    </div>
                    
                    {faceQuality && (
                      <div className={`${faceQuality.color} bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-semibold`}>
                        <i className="fas fa-star mr-1"></i>
                        {faceQuality.message}
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
                            ? 'bg-green-500 border-green-400'
                            : 'bg-gray-700 border-gray-600'
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
                  className="absolute top-0 left-0"
                  style={{ display: "none" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={captureFace}
                  disabled={isLoading || isCapturing || !modelsReady || !faceDetected}
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
};

export default FaceRegistration;
