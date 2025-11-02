import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { loadModels, detectFaceFromVideo, getFaceDescriptor } from "../../utils/faceRecognition";

const FaceRegistration = ({ onFaceRegistered, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedDescriptors, setCapturedDescriptors] = useState([]);
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    initializeCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const initializeCamera = async () => {
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
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please grant camera permissions.");
      setIsLoading(false);
    }
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

    setIsCapturing(true);

    try {
      const detection = await detectFaceFromVideo(videoRef.current);
      
      if (!detection) {
        toast.error("No face detected. Please position your face in the frame.");
        setIsCapturing(false);
        return;
      }

      const descriptor = getFaceDescriptor(detection);
      
      if (descriptor) {
        const newDescriptors = [...capturedDescriptors, descriptor];
        setCapturedDescriptors(newDescriptors);
        toast.success(`Face captured! (${newDescriptors.length}/3)`);
        
        // If we have 3 captures, we're done
        if (newDescriptors.length >= 3) {
          // Average the descriptors for better accuracy
          const avgDescriptor = averageDescriptors(newDescriptors);
          onFaceRegistered(avgDescriptor);
          stopCamera();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-secondary rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Register Your Face
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
            Position your face in the frame and capture 3 images for better accuracy.
            {capturedDescriptors.length > 0 && ` (${capturedDescriptors.length}/3 captured)`}
          </p>
        </div>

        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-white">
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
        </div>

        <div className="flex gap-3">
          <button
            onClick={captureFace}
            disabled={isLoading || isCapturing || !modelsReady}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCapturing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Capturing...
              </>
            ) : (
              <>
                <i className="fas fa-camera mr-2"></i>
                Capture Face {capturedDescriptors.length > 0 && `(${capturedDescriptors.length}/3)`}
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

export default FaceRegistration;
