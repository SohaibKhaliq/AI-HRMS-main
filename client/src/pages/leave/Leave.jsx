import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { leaveSchema } from "../../validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { createLeave, getMyLeaves } from "../../services/leave.service";
import { getMyLeaveBalances } from "../../services/leaveBalance.service";
import { getLeaveTypes } from "../../services/leaveType.service";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";
import Loader from "../../components/shared/loaders/Loader";
import { formatDate } from "../../utils";

const Leave = () => {
  const dispatch = useDispatch();

  const { loading, myLeaves, fetch } = useSelector((state) => state.leave);
  const { leaveTypes } = useSelector((state) => state.leaveType);
  const { user } = useSelector((state) => state.authentication);
  const { myBalances } = useSelector((state) => state.leaveBalance || {});
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  const fromDate = watch("fromDate");
  const toDate = watch("toDate");

  useEffect(() => {
    if (fetch) {
      dispatch(getMyLeaves());
    }
    dispatch(getLeaveTypes());
    // fetch current employee leave balances (dynamic assigned balances)
    dispatch(getMyLeaveBalances({ year: new Date().getFullYear() }));
  }, [dispatch, fetch]);

  useEffect(() => {
    if (myLeaves) {
      if (filterStatus === "All") {
        setFilteredLeaves(myLeaves);
      } else {
        setFilteredLeaves(
          myLeaves.filter((item) => item.status === filterStatus)
        );
      }
    }
  }, [myLeaves, filterStatus]);

  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setValue("duration", diffDays);
    }
  }, [fromDate, toDate, setValue]);

  const onSubmit = (data) => {
    dispatch(createLeave(data))
      .unwrap()
      .then(() => {
        reset();
        setShowForm(false);
      })
      .catch((error) => console.error("Error creating leave:", error));
  };

  const statusCounts = {
    All: myLeaves?.length || 0,
    Pending: myLeaves?.filter((item) => item.status === "Pending").length || 0,
    Approved:
      myLeaves?.filter((item) => item.status === "Approved").length || 0,
    Rejected:
      myLeaves?.filter((item) => item.status === "Rejected").length || 0,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400";
      case "Rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <>
      <Helmet>
        <title>Apply Leave - Metro HR</title>
      </Helmet>

      {loading && <Loader />}

      <section className="bg-gray-100 border border-gray-300 dark:border-primary dark:bg-secondary p-3 min-h-screen rounded-lg shadow">
        {/* Header Section */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <i className="fa-regular fa-calendar-minus text-blue-600"></i>
              Leave Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Apply for leave and track your leave requests
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <i className={`fas ${showForm ? "fa-times" : "fa-plus"}`}></i>
            {showForm ? "Cancel" : "Apply Leave"}
          </button>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 rounded-lg shadow-lg mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Leave Balance</p>
              <p className="text-4xl font-bold mt-1">
                {(() => {
                  // Prefer authoritative leave balances if present
                  if (myBalances && myBalances.length) {
                    const totalAvailable = myBalances.reduce((sum, b) => {
                      const avail = Number(b.available || 0);
                      return sum + (isNaN(avail) ? 0 : avail);
                    }, 0);
                    return `${totalAvailable} Days`;
                  }
                  // Fallback to user.leaveBalance if no balances are present
                  return `${user?.leaveBalance || 0} Days`;
                })()}
              </p>
            </div>
            <i className="fas fa-calendar-check text-5xl opacity-50"></i>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-500 dark:bg-blue-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Requests</p>
                <p className="text-2xl font-bold">{statusCounts.All}</p>
              </div>
              <i className="fas fa-list text-3xl opacity-75"></i>
            </div>
          </div>

          <div className="bg-yellow-500 dark:bg-yellow-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending</p>
                <p className="text-2xl font-bold">{statusCounts.Pending}</p>
              </div>
              <i className="fas fa-hourglass-half text-3xl opacity-75"></i>
            </div>
          </div>

          <div className="bg-green-500 dark:bg-green-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Approved</p>
                <p className="text-2xl font-bold">{statusCounts.Approved}</p>
              </div>
              <i className="fas fa-check-circle text-3xl opacity-75"></i>
            </div>
          </div>

          <div className="bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Rejected</p>
                <p className="text-2xl font-bold">{statusCounts.Rejected}</p>
              </div>
              <i className="fas fa-times-circle text-3xl opacity-75"></i>
            </div>
          </div>
        </div>

        {/* Leave Application Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <i className="fas fa-file-alt text-blue-600"></i>
              New Leave Application
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("leaveType")}
                  className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-lg border ${
                    errors.leaveType
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                >
                  <option value="">--- Select Leave Type ---</option>
                  {leaveTypes?.map((leave) => (
                    <option key={leave._id} value={leave._id}>
                      {leave.name}
                    </option>
                  ))}
                </select>
                {errors.leaveType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.leaveType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (Days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Auto-calculated"
                  {...register("duration")}
                  className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-lg border ${
                    errors.duration
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                  readOnly
                />
                {errors.duration && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.duration.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("fromDate")}
                  className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-lg border ${
                    errors.fromDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
                {errors.fromDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("toDate")}
                  className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-lg border ${
                    errors.toDate
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={loading}
                />
                {errors.toDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.toDate.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Write your reason for leave..."
                  rows="3"
                  className={`w-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm p-3 rounded-lg border ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  disabled={loading}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <ButtonLoader />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-paper-plane"></i>
                      Submit Leave Request
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowForm(false);
                  }}
                  className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
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

        {/* Leave Records Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div
            id="overflow"
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 550px)" }}
          >
            <table className="min-w-full table-auto text-sm">
              <thead className="sticky top-0">
                <tr className="bg-headLight dark:bg-head text-primary">
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    Leave Type
                  </th>
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    From Date
                  </th>
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    To Date
                  </th>
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    Duration
                  </th>
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    Status
                  </th>
                  <th className="py-3 px-4 border-b border-gray-500 text-left">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves && filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="dark:even:bg-gray-800 odd:bg-gray-50 dark:odd:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      <td className="py-3 px-4 border-b border-gray-500">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-calendar-alt text-blue-600"></i>
                          {leave.leaveType?.name || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-500">
                        {formatDate(leave.fromDate)}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-500">
                        {formatDate(leave.toDate)}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-500">
                        <span className="font-semibold">
                          {leave.duration} days
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-500">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-500">
                        {leave.remarks || leave.description || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <i className="fas fa-inbox text-4xl mb-3"></i>
                        <p className="text-sm">
                          {filterStatus === "All"
                            ? "No leave requests yet. Click 'Apply Leave' to create one."
                            : `No ${filterStatus.toLowerCase()} leave requests found.`}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default Leave;
