import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createJob, updateJob } from "../../../services/recruitment.service";
import { getJobTypes, createJobType } from "../../../services/jobmeta.service";
import JobTypeModal from "./JobTypeModal";
import PropTypes from "prop-types";

const JobOpeningModal = ({ onClose, job, action }) => {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);
  const { designations } = useSelector((state) => state.designation);

  console.log("Departments:", departments);
  console.log("Designations:", designations);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    role: "",
    location: "",
    minSalary: "",
    maxSalary: "",
    type: "Full-time",
    description: "",
    deadline: "",
    status: "Open",
  });
  const { types: jobTypesState } = useSelector(
    (s) => s.jobmeta || { types: { items: [], loading: false } }
  );
  const jobTypes = jobTypesState.items || [];
  const [showJobTypeModal, setShowJobTypeModal] = useState(false);

  useEffect(() => {
    dispatch(getJobTypes());
  }, [dispatch]);

  useEffect(() => {
    if (action === "update" && job) {
      setFormData({
        title: job.title || "",
        department: job.department?._id || "",
        role: job.role?._id || "",
        location: job.location || "",
        minSalary: job.minSalary || "",
        maxSalary: job.maxSalary || "",
        // normalize: if job.type is populated object use its id, else if string keep it
        type:
          job?.type?._id ||
          (typeof job?.type === "string" ? job.type : "") ||
          "",
        description: job.description || "",
        deadline: job.deadline ? job.deadline.split("T")[0] : "",
        status: job.status || "Open",
      });
    }
  }, [job, action]);

  // when jobTypes load and current formData.type is a legacy name, map to id
  useEffect(() => {
    if (jobTypes.length && formData.type) {
      const isId =
        typeof formData.type === "string" &&
        /^[0-9a-fA-F]{24}$/.test(formData.type);
      if (!isId) {
        const found = jobTypes.find(
          (t) => t.name.toLowerCase() === String(formData.type).toLowerCase()
        );
        if (found) setFormData((d) => ({ ...d, type: found._id }));
      }
    }
  }, [jobTypes, formData.type]);

  const handleCreateJobType = async (payload) => {
    try {
      const created = await dispatch(createJobType(payload)).unwrap();
      // created may be the created item; set formData.type to its id
      if (created && created._id) {
        setFormData((d) => ({ ...d, type: created._id }));
      }
      setShowJobTypeModal(false);
    } catch (err) {
      console.error("Failed to create job type inline:", err);
    }
  };

  // render inline JobTypeModal when requested

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (action === "create") {
        await dispatch(createJob(formData)).unwrap();
      } else if (action === "update") {
        await dispatch(updateJob({ id: job._id, job: formData })).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Error submitting job:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center overflow-y-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 text-black dark:text-white w-full max-w-2xl p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl space-y-4 my-8"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
          <h2 className="font-bold text-xl">
            {action === "create"
              ? "Create New Job Opening"
              : "Update Job Opening"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Job Title *
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Specific title for this job posting)
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Developer - AI Team"
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Department</option>
              {departments?.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role/Designation */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Position/Designation *
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Organizational role)
              </span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Position</option>
              {designations?.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Remote, New York"
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Job Type *</label>
            <div className="relative">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {jobTypes.length > 0 ? (
                  jobTypes.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </>
                )}
              </select>
              <button
                type="button"
                onClick={() => setShowJobTypeModal(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 rounded text-sm"
                title="Add Job Type"
              >
                +
              </button>
            </div>
          </div>

          {/* Min Salary */}
          <div>
            <label className="block text-sm font-medium mb-1">Min Salary</label>
            <input
              type="text"
              name="minSalary"
              value={formData.minSalary}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Salary */}
          <div>
            <label className="block text-sm font-medium mb-1">Max Salary</label>
            <input
              type="text"
              name="maxSalary"
              value={formData.maxSalary}
              onChange={handleChange}
              placeholder="e.g. 80000"
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">Deadline *</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter job requirements, responsibilities, qualifications..."
              rows="5"
              className="w-full bg-gray-100 dark:bg-gray-700 text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md"
          >
            {action === "create" ? "Create Job" : "Update Job"}
          </button>
        </div>
      </form>
      {showJobTypeModal && (
        <JobTypeModal
          isOpen={showJobTypeModal}
          onClose={() => setShowJobTypeModal(false)}
          action="create"
          onSubmit={handleCreateJobType}
        />
      )}
    </div>
  );
};

export default JobOpeningModal;

JobOpeningModal.propTypes = {
  onClose: PropTypes.func,
  job: PropTypes.object,
  action: PropTypes.string,
};

JobOpeningModal.defaultProps = {
  onClose: () => {},
  job: null,
  action: "create",
};
