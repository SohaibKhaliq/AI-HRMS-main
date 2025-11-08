import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

/*
  Props:
  - isOpen: boolean
  - mode: 'create' | 'edit' | 'view'
  - data: requisition object when editing/viewing
  - onClose: fn()
  - onSubmit: fn(formValues) -> parent updates list
*/
import PropTypes from "prop-types";

const JobRequisitionModal = ({
  isOpen,
  mode = "view",
  data,
  onClose,
  onSubmit,
}) => {
  const { departments = [] } = useSelector((s) => s.department || {});
  const { designations = [] } = useSelector((s) => s.designation || {});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      code: "",
      title: "",
      category: "",
      department: "",
      positions: 1,
      status: "Draft",
      priority: "Medium",
      designation: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      reset({
        code: data?.code || "",
        title: data?.title || "",
        category: data?.category || "",
        department: data?.department || "",
        positions: data?.positions || 1,
        status: data?.status || "Draft",
        priority: data?.priority || "Medium",
        designation: data?.designation || "",
      });
    } else if (mode === "create") {
      reset({
        code: data?.code || "",
        title: "",
        category: "",
        department: departments[0]?.name || "",
        positions: 1,
        status: "Draft",
        priority: "Medium",
        designation: designations[0]?.name || "",
      });
    }
  }, [mode, data, reset, departments, designations]);

  if (!isOpen) return null;
  const readOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create"
                ? "Add Job Requisition"
                : mode === "edit"
                ? "Edit Job Requisition"
                : "View Job Requisition"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <FiX size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code
                </label>
                <input
                  disabled
                  value={data?.code || "Auto"}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  {...register("title", { required: true })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Job title"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">Title is required</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  {...register("category", { required: true })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Human Resources"
                />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    Category is required
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  {...register("department", { required: true })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d._id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Designation *
                </label>
                <select
                  {...register("designation", { required: true })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {designations.map((d) => (
                    <option key={d._id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Positions *
                </label>
                <input
                  type="number"
                  min={1}
                  {...register("positions", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  {...register("status")}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {["Draft", "Pending Approval", "Approved", "On Hold"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  {...register("priority")}
                  disabled={readOnly}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {["Low", "Medium", "High"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {readOnly ? "Close" : "Cancel"}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {mode === "create" ? "Create" : "Update"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobRequisitionModal;

JobRequisitionModal.propTypes = {
  isOpen: PropTypes.bool,
  mode: PropTypes.string,
  data: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

JobRequisitionModal.defaultProps = {
  isOpen: false,
  mode: "view",
  data: null,
  onClose: () => {},
  onSubmit: () => {},
};
