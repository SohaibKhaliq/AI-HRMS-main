import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaClock, FaCoffee, FaPlayCircle, FaStopCircle, FaHistory } from "react-icons/fa";
import toast from "react-hot-toast";
import FaceAttendance from "../../components/face/FaceAttendance";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getActiveTimeEntry,
  getMyTimeEntries,
} from "../../services/timeEntry.service";
import { formatDate, formatTime } from "../../utils/dateUtils";

const TimeTracking = () => {
  const dispatch = useDispatch();
  const { activeEntry, myEntries, loading } = useSelector((state) => state.timeEntry);
  const { user } = useSelector((state) => state.auth);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceAction, setFaceAction] = useState(null); // 'clockIn', 'clockOut', 'breakIn', 'breakOut'
  const [project, setProject] = useState("");
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active entry and recent history on mount
  useEffect(() => {
    dispatch(getActiveTimeEntry());
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Last 7 days
    dispatch(getMyTimeEntries({ 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    }));
  }, [dispatch]);

  // Calculate worked time
  const calculateWorkedTime = () => {
    if (!activeEntry || !activeEntry.clockIn) return "00:00:00";
    
    const start = new Date(activeEntry.clockIn);
    const now = new Date();
    const diff = now - start;
    
    // Subtract break time
    let breakTime = 0;
    if (activeEntry.breaks && activeEntry.breaks.length > 0) {
      activeEntry.breaks.forEach(breakItem => {
        if (breakItem.start) {
          const breakStart = new Date(breakItem.start);
          const breakEnd = breakItem.end ? new Date(breakItem.end) : now;
          breakTime += (breakEnd - breakStart);
        }
      });
    }
    
    const totalWorked = diff - breakTime;
    const hours = Math.floor(totalWorked / (1000 * 60 * 60));
    const minutes = Math.floor((totalWorked % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalWorked % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if currently on break
  const isOnBreak = () => {
    if (!activeEntry || !activeEntry.breaks || activeEntry.breaks.length === 0) return false;
    const lastBreak = activeEntry.breaks[activeEntry.breaks.length - 1];
    return lastBreak && lastBreak.start && !lastBreak.end;
  };

  const handleClockInClick = () => {
    if (!project || !task) {
      toast.error("Please enter project and task before clocking in");
      return;
    }
    setFaceAction("clockIn");
    setShowFaceModal(true);
  };

  const handleClockOutClick = () => {
    setFaceAction("clockOut");
    setShowFaceModal(true);
  };

  const handleBreakInClick = () => {
    setFaceAction("breakIn");
    setShowFaceModal(true);
  };

  const handleBreakOutClick = () => {
    setFaceAction("breakOut");
    setShowFaceModal(true);
  };

  const handleFaceVerified = async () => {
    setShowFaceModal(false);
    
    try {
      switch (faceAction) {
        case "clockIn":
          await dispatch(clockIn({ project, task })).unwrap();
          toast.success("Clocked in successfully!");
          setProject("");
          setTask("");
          break;
          
        case "clockOut":
          await dispatch(clockOut({ notes })).unwrap();
          toast.success("Clocked out successfully!");
          setNotes("");
          break;
          
        case "breakIn":
          await dispatch(startBreak()).unwrap();
          toast.success("Break started!");
          break;
          
        case "breakOut":
          await dispatch(endBreak()).unwrap();
          toast.success("Break ended!");
          break;
          
        default:
          break;
      }
      
      // Refresh entries
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      dispatch(getMyTimeEntries({ 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      }));
    } catch (error) {
      toast.error(error || "Operation failed");
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FaClock className="text-green-600" />
            Time Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Clock in/out and manage your work time using facial recognition
          </p>
        </div>

        {/* Current Time Display */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-lg">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Status & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status Card */}
            <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Current Status
              </h2>
              
              {activeEntry ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg border-2 border-green-500">
                    <div>
                      <div className="text-green-700 dark:text-green-400 font-semibold text-lg">
                        <i className="fas fa-circle text-green-500 mr-2 animate-pulse"></i>
                        Currently Working
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Clocked in at {formatTime(activeEntry.clockIn)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {calculateWorkedTime()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Hours Worked
                      </div>
                    </div>
                  </div>

                  {isOnBreak() && (
                    <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg border border-yellow-400">
                      <FaCoffee className="text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="text-yellow-700 dark:text-yellow-400 font-semibold">
                        On Break
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Project</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {activeEntry.project || "N/A"}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-gray-500 dark:text-gray-400">Task</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {activeEntry.task || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <FaClock className="text-5xl mx-auto mb-3" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    You are not clocked in
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                Actions
              </h2>
              
              {!activeEntry ? (
                // Clock In Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      placeholder="Enter project name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Task <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="Enter task description"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
                    />
                  </div>
                  <button
                    onClick={handleClockInClick}
                    disabled={loading || !project || !task}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlayCircle />
                    Clock In with Face Recognition
                  </button>
                </div>
              ) : (
                // Clock Out & Break Buttons
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {!isOnBreak() ? (
                      <button
                        onClick={handleBreakInClick}
                        disabled={loading}
                        className="bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCoffee />
                        Start Break
                      </button>
                    ) : (
                      <button
                        onClick={handleBreakOutClick}
                        disabled={loading}
                        className="bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCoffee />
                        End Break
                      </button>
                    )}
                    
                    <button
                      onClick={handleClockOutClick}
                      disabled={loading}
                      className="bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaStopCircle />
                      Clock Out
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about your work..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
                  <i className="fas fa-info-circle mt-0.5"></i>
                  <div>
                    <strong>Facial Recognition Required:</strong> All time tracking actions require facial recognition verification for security and accuracy.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-secondary rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <FaHistory />
                  Recent History
                </h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 font-semibold"
                >
                  {showHistory ? "Hide" : "Show All"}
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myEntries && myEntries.length > 0 ? (
                  myEntries.slice(0, showHistory ? undefined : 5).map((entry) => (
                    <div
                      key={entry._id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {formatDate(entry.date)}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          entry.status === 'approved' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400'
                            : entry.status === 'rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>In:</span>
                          <span className="font-semibold">{formatTime(entry.clockIn)}</span>
                        </div>
                        {entry.clockOut && (
                          <div className="flex justify-between">
                            <span>Out:</span>
                            <span className="font-semibold">{formatTime(entry.clockOut)}</span>
                          </div>
                        )}
                        {entry.workHours !== undefined && (
                          <div className="flex justify-between">
                            <span>Hours:</span>
                            <span className="font-semibold">{entry.workHours.toFixed(2)}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    No time entries yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Face Recognition Modal */}
      {showFaceModal && (
        <FaceAttendance
          storedDescriptor={user?.faceDescriptor}
          onAttendanceMarked={handleFaceVerified}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
};

export default TimeTracking;
