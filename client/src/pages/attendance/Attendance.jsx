import { Helmet } from "react-helmet";
import { formatDate } from "../../utils";
import { useEffect, useState } from "react";
import { checkAttendanceHead } from "../../constants";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import { getEmployeeAttendance } from "../../services/attendance.service";

const Attendance = () => {
  const dispatch = useDispatch();

  const attendance = useSelector((state) => state.attendance);
  const fetch = useSelector((state) => state.attendance.fetch);

  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const attendancePercentage = useSelector(
    (state) => state.insight.employeeInsights.attendancePercentage
  );

  useEffect(() => {
    if (fetch) {
      dispatch(getEmployeeAttendance());
    }
  }, [dispatch, fetch]);

  useEffect(() => {
    if (attendance?.attendanceList?.attendanceRecord) {
      const records = [...attendance.attendanceList.attendanceRecord];
      
      if (filterStatus === "All") {
        setFilteredAttendance(records);
      } else {
        setFilteredAttendance(records.filter(item => item.status === filterStatus));
      }
    }
  }, [attendance, filterStatus]);

  const statusCounts = {
    All: attendance?.attendanceList?.attendanceRecord?.length || 0,
    Present: attendance?.attendanceList?.attendanceRecord?.filter(item => item.status === "Present").length || 0,
    Absent: attendance?.attendanceList?.attendanceRecord?.filter(item => item.status === "Absent").length || 0,
  };

  return (
    <>
      <Helmet>
        <title>Attendance - Metro HR</title>
      </Helmet>

      {attendance.loading && <Loader />}

      <section className="bg-gray-100 border border-gray-300 dark:border-primary dark:bg-secondary p-3 min-h-screen rounded-lg shadow">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Records</p>
                <p className="text-2xl font-bold">{statusCounts.All}</p>
              </div>
              <i className="fas fa-list text-3xl opacity-75"></i>
            </div>
          </div>
          
          <div className="bg-green-500 dark:bg-green-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Present Days</p>
                <p className="text-2xl font-bold">{statusCounts.Present}</p>
              </div>
              <i className="fas fa-check-circle text-3xl opacity-75"></i>
            </div>
          </div>
          
          <div className="bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Absent Days</p>
                <p className="text-2xl font-bold">{statusCounts.Absent}</p>
              </div>
              <i className="fas fa-times-circle text-3xl opacity-75"></i>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {["All", "Present", "Absent"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>

        <div className="flex justify-center items-center">
          <div className="w-full rounded-lg">
            <div
              id="overflow"
              className="overflow-auto bg-gray-100 dark:bg-secondary shadow rounded-lg"
              style={{ maxHeight: "calc(100vh - 400px)" }}
            >
              <table className="min-w-full table-auto text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-headLight dark:bg-head sticky top-0 text-primary">
                    {checkAttendanceHead.map((header, i) => (
                      <th
                        key={i}
                        className="py-3 px-4 border-b border-gray-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance &&
                    filteredAttendance.map((item) => (
                      <tr
                        key={item._id}
                        className="dark:even:bg-gray-800 odd:bg-gray-200 dark:odd:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                      >
                        <td className="py-3 px-4 border-b border-gray-500">
                          EMP {item.employee.employeeId}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-500">
                          {item.employee.name}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-500">
                          {item.employee.department.name}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-500">
                          {item.employee.role.name}
                        </td>
                        <td className="py-3 px-4 border-b border-gray-500">
                          {formatDate(item.date)}
                        </td>
                        <td
                          className={`py-3 px-4 border-b border-gray-500 font-semibold ${
                            item.status === "Present"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.status === "Present" ? (
                              <i className="fas fa-check-circle"></i>
                            ) : (
                              <i className="fas fa-times-circle"></i>
                            )}
                            {item.status}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {!attendance.loading && filteredAttendance.length === 0 && (
                <div className="w-full h-[40vh] flex flex-col justify-center items-center">
                  <i className="fas fa-calendar-times text-4xl text-gray-400 dark:text-gray-500 mb-3"></i>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No {filterStatus !== "All" ? filterStatus.toLowerCase() : ""} attendance records found
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 border border-blue-700 p-6 rounded-lg text-center text-white shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-2">
                <i className="fas fa-chart-pie text-2xl"></i>
                <h2 className="text-lg font-semibold">Overall Attendance Rate</h2>
              </div>
              <p className="text-4xl font-bold mt-2">
                {attendancePercentage || "0"} %
              </p>
              <p className="text-sm opacity-90 mt-2">
                Based on {statusCounts.All} total records
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Attendance;
