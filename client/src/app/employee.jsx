import { useDispatch } from "react-redux";
import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "../components/shared/loaders/Loader";
import NotFound from "../components/shared/error/NotFound";
import EmployeeSidebar from "../components/ui/EmployeeSidebar";
import { getEmployeeInsights } from "../services/insights.service";

const Home = lazy(() => import("../pages/home/Home"));
const Leave = lazy(() => import("../pages/leave/Leave"));
const Update = lazy(() => import("../pages/updates/Update"));
const Feedback = lazy(() => import("../pages/feedback/Feedback"));
const Complaint = lazy(() => import("../pages/complaint/Complaint"));
const Attendance = lazy(() => import("../pages/attendance/Attendance"));
const MarkAttendance = lazy(() => import("../pages/attendance/MarkAttendance"));
const Resignation = lazy(() => import("../pages/resignation/Resignation"));
const TimeTracking = lazy(() => import("../pages/timeTracking/TimeTracking"));
const LeaveBalance = lazy(() => import("../pages/leaveBalance/LeaveBalance"));
const EmployeeMeetings = lazy(() =>
  import("../pages/meetings/EmployeeMeetings")
);
const EmployeeDocuments = lazy(() =>
  import("../pages/documents/EmployeeDocuments")
);
const Payroll = lazy(() => import("../pages/payroll/Payroll"));
const CalendarView = lazy(() => import("../pages/calendar/CalendarView"));

const EmployeeApp = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getEmployeeInsights());
  }, [dispatch]);

  return (
    <div
      id="transition"
      className="min-h-screen max-h-auto text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-primary flex justify-between relative"
    >
      <EmployeeSidebar />
      <Suspense fallback={<Loader />}>
        <main
          id="overflow"
          className="w-full lg:w-[85%] lg:ml-[255px] py-1 sm:px-2 mt-[69px] lg:mt-0"
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/complaint" element={<Complaint />} />
            <Route path="/update" element={<Update />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/mark" element={<MarkAttendance />} />
            <Route path="/time-tracking" element={<TimeTracking />} />
            <Route path="/leave-balance" element={<LeaveBalance />} />
            <Route path="/meetings" element={<EmployeeMeetings />} />
            <Route path="/documents" element={<EmployeeDocuments />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/resignation" element={<Resignation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </div>
  );
};

export default EmployeeApp;
