import { useDispatch } from "react-redux";
import Sidebar from "../components/ui/Sidebar";
import Topbar from "../components/ui/Topbar";
import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { getRoles } from "../services/role.service";
import Loader from "../components/shared/loaders/Loader";
import NotFound from "../components/shared/error/NotFound";
import { getInsights } from "../services/insights.service";
import { getDepartments } from "../services/department.service";
import { getDesignations } from "../services/designation.service";

const Dashboard = lazy(() => import("../admin/dashboard/Dashboard"));
const Employee = lazy(() => import("../admin/employee/Employee"));
const AddEmployee = lazy(() => import("../admin/employee/CreateEmployee"));
const EditEmployee = lazy(() => import("../admin/employee/UpdateEmployee"));
const ViewEmployee = lazy(() => import("../admin/employee/ViewEmployee"));
const Department = lazy(() => import("../admin/department/Department"));
const Designation = lazy(() => import("../admin/designation/Designation"));
const DocumentTypes = lazy(() => import("../admin/documentType/DocumentType"));
const RoleManagement = lazy(() => import("../admin/role/Role"));
const AdminDocuments = lazy(() => import("../admin/document/AdminDocuments"));
const Promotion = lazy(() => import("../admin/promotion/Promotion"));
const Resignation = lazy(() => import("../admin/resignation/Resignation"));
const Termination = lazy(() => import("../admin/termination/Termination"));
const Attendance = lazy(() => import("../admin/attendance/Attendance"));
const CheckAttendance = lazy(() =>
  import("../admin/attendance/CheckAttendance")
);
const Feedback = lazy(() => import("../admin/feedback/Feedback"));
const LeaveRequest = lazy(() => import("../admin/leave/LeaveRequest"));
const EmployeeOnLeave = lazy(() => import("../admin/leave/EmployeeOnLeave"));
const Complaint = lazy(() => import("../admin/complaint/Complaint"));
const Holiday = lazy(() => import("../admin/holiday/Holiday"));
const Announcement = lazy(() => import("../admin/announcement/Announcement"));
const JobApplications = lazy(() =>
  import("../admin/recruitment/JobApplications")
);
const JobOpenings = lazy(() => import("../admin/recruitment/JobOpenings"));
const PostJob = lazy(() => import("../admin/recruitment/PostJob"));
const JobRequisitions = lazy(() =>
  import("../admin/recruitment/JobRequisitions")
);
const JobCategories = lazy(() => import("../admin/recruitment/JobCategories"));
const JobTypes = lazy(() => import("../admin/recruitment/JobTypes"));
const Performance = lazy(() => import("../admin/performance/Performance"));
const Report = lazy(() => import("../admin/report/Report"));
const Payroll = lazy(() => import("../admin/payroll/Payroll"));
const Shift = lazy(() => import("../admin/shift/Shift"));
const Meeting = lazy(() => import("../admin/meeting/Meeting"));
const LeaveType = lazy(() => import("../admin/leaveType/LeaveType"));
const AssignLeaveBalance = lazy(() =>
  import("../admin/leave/AssignLeaveBalance")
);
const DocumentCategory = lazy(() =>
  import("../admin/documentCategory/DocumentCategory")
);
const AdminTimeTracking = lazy(() =>
  import("../admin/timeTracking/AdminTimeTracking")
);
const CalendarView = lazy(() => import("../pages/calendar/CalendarView"));
const SubstituteAnalysisPage = lazy(() =>
  import("../admin/analysis/SubstituteAnalysisPage")
);
const Trainings = lazy(() => import("../admin/training/Trainings"));
const ViewTraining = lazy(() => import("../admin/training/ViewTraining"));
const CreateTraining = lazy(() => import("../admin/training/CreateTraining"));
const Notifications = lazy(() =>
  import("../pages/notifications/Notifications")
);

const AdminApp = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getRoles());
    dispatch(getInsights());
    dispatch(getDepartments());
    dispatch(getDesignations());
  }, [dispatch]);

  return (
    <div
      id="transition"
      className="text-gray-800 bg-gray-200 dark:text-gray-200 dark:bg-primary flex justify-between relative"
    >
      <Sidebar />
      <Topbar />
      <Suspense fallback={<Loader />}>
        <main
          id="overflow"
          className="w-full lg:w-[85%] lg:ml-[255px] py-1 sm:px-2 mt-[69px] lg:mt-[70px]"
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/employee/:id" element={<ViewEmployee />} />
            <Route path="/employee/create" element={<AddEmployee />} />
            <Route path="/employee/update/:id" element={<EditEmployee />} />
            <Route path="/department" element={<Department />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/designations" element={<Designation />} />
            <Route path="/document-types" element={<DocumentTypes />} />
            <Route path="/employee-documents" element={<AdminDocuments />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/promotions" element={<Promotion />} />
            <Route path="/resignations" element={<Resignation />} />
            <Route path="/terminations" element={<Termination />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/check" element={<CheckAttendance />} />
            <Route path="/leaves" element={<LeaveRequest />} />
            <Route path="/leave/active" element={<EmployeeOnLeave />} />
            <Route path="/performances" element={<Performance />} />
            <Route path="/recruitments" element={<JobOpenings />} />
            <Route
              path="/recruitment/requisitions"
              element={<JobRequisitions />}
            />
            <Route
              path="/recruitment/requisitions/add"
              element={<JobRequisitions />}
            />
            <Route path="/applications/:id" element={<JobApplications />} />
            <Route path="/recruitment/create" element={<PostJob />} />
            <Route path="/recruitment/categories" element={<JobCategories />} />
            <Route path="/recruitment/types" element={<JobTypes />} />
            <Route path="/recruitment/requisitions" element={<PostJob />} />
            <Route path="/payrolls" element={<Payroll />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/complaints" element={<Complaint />} />
            <Route path="/holidays" element={<Holiday />} />
            <Route path="/announcements" element={<Announcement />} />
            <Route path="/reports" element={<Report />} />
            <Route
              path="/substitute-analysis"
              element={<SubstituteAnalysisPage />}
            />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/trainings/create" element={<CreateTraining />} />
            <Route path="/trainings/:id" element={<ViewTraining />} />
            <Route path="/leave-balances" element={<AssignLeaveBalance />} />
            <Route path="/shifts" element={<Shift />} />
            <Route path="/meetings" element={<Meeting />} />
            <Route path="/leave-types" element={<LeaveType />} />
            <Route path="/document-categories" element={<DocumentCategory />} />
            <Route path="/time-tracking" element={<AdminTimeTracking />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </div>
  );
};

export default AdminApp;
