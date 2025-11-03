import toast from "react-hot-toast";
import { Helmet } from "react-helmet";
import { formatDate } from "../../utils";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerFaceDescriptor,
  getFaceDescriptor,
  markAttendanceUsingFace,
} from "../../services/attendance.service";
import axiosInstance from "../../axios/axiosInstance";
import FaceRegistration from "../../components/face/FaceRegistration";
import FaceAttendance from "../../components/face/FaceAttendance";

const MarkAttendance = () => {
  const dispatch = useDispatch();

  const [currentDate, setCurrentDate] = useState(null);
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [showFaceAttendance, setShowFaceAttendance] = useState(false);

  const { loading, faceDescriptor } = useSelector((state) => state.attendance);

  useEffect(() => {
    // Fetch face descriptor on mount
    dispatch(getFaceDescriptor());
    
    async function getDateFromAPI() {
      const { data } = await axiosInstance.get("/insights/date");
      setCurrentDate(data.datetime);
    }
    getDateFromAPI();
  }, [dispatch]);

  const handleFaceAttendance = () => {
    if (!faceDescriptor) {
      toast.error("Please register your face first");
      setShowFaceRegistration(true);
    } else {
      setShowFaceAttendance(true);
    }
  };

  const handleFaceRegistered = async (descriptor) => {
    await dispatch(registerFaceDescriptor(descriptor));
    setShowFaceRegistration(false);
    // Refresh face descriptor
    dispatch(getFaceDescriptor());
  };

  const handleFaceAttendanceMarked = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        await dispatch(markAttendanceUsingFace({ latitude, longitude }));
        setShowFaceAttendance(false);
      },
      async (error) => {
        console.warn("Location not available:", error.message);
        // Mark attendance without location
        await dispatch(markAttendanceUsingFace({ latitude: null, longitude: null }));
        setShowFaceAttendance(false);
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Mark Attendance - Metro HR</title>
      </Helmet>

      <section className="h-[80vh] sm:h-[90vh] bg-gray-100 dark:bg-primary p-4">
        <main className="flex justify-center items-center h-full">
          <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Mark Attendance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {currentDate ? formatDate(currentDate) : "loading..."}
              </p>
            </div>

            <button
              disabled={loading}
              onClick={handleFaceAttendance}
              className="text-sm py-4 w-full bg-green-600 rounded-xl font-bold hover:bg-green-700 text-gray-200 shadow-lg transition-all"
            >
              <i className="fas fa-face-smile mr-2"></i>
              Mark with Face Recognition
            </button>

            {!faceDescriptor && (
              <button
                disabled={loading}
                onClick={() => setShowFaceRegistration(true)}
                className="text-sm py-4 w-full bg-purple-600 rounded-xl font-bold hover:bg-purple-700 text-gray-200 shadow-lg transition-all"
              >
                <i className="fas fa-user-plus mr-2"></i>
                Register Your Face
              </button>
            )}
          </div>
        </main>
      </section>

      {showFaceRegistration && (
        <FaceRegistration
          onFaceRegistered={handleFaceRegistered}
          onClose={() => setShowFaceRegistration(false)}
        />
      )}

      {showFaceAttendance && (
        <FaceAttendance
          storedDescriptor={faceDescriptor}
          onAttendanceMarked={handleFaceAttendanceMarked}
          onClose={() => setShowFaceAttendance(false)}
        />
      )}
    </>
  );
};

export default MarkAttendance;
