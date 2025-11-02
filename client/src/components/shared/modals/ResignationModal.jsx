import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployees } from "../../../services/employee.service";

const ResignationModal = ({ isOpen, onClose, resignation = null, onSubmit }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employee);
  const [formData, setFormData] = useState({
    employee: "",
    resignationDate: "",
    lastWorkingDay: "",
    noticePeriod: "",
    reason: "",
    status: "Pending",
    documentUrl: "",
    remarks: "",
  });

  useEffect(() => {
    if (!employees || employees.length === 0) {
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
    }
  }, [dispatch, employees]);

  useEffect(() => {
    if (resignation) {
      setFormData({
        employee: resignation.employee?._id || resignation.employee || "",
        resignationDate: resignation.resignationDate
          ? resignation.resignationDate.split("T")[0]
          : "",
        lastWorkingDay: resignation.lastWorkingDay
          ? resignation.lastWorkingDay.split("T")[0]
          : "",
        noticePeriod: resignation.noticePeriod || "",
        reason: resignation.reason || "",
        status: resignation.status || "Pending",
        documentUrl: resignation.documentUrl || "",
        remarks: resignation.remarks || "",
      });
    } else {
      setFormData({
        employee: "",
        resignationDate: "",
        lastWorkingDay: "",
        noticePeriod: "",
        reason: "",
        status: "Pending",
        documentUrl: "",
        remarks: "",
      });
    }
  }, [resignation, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isViewMode = resignation && !onSubmit;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {resignation ? (isViewMode ? "View" : "Edit") : "Add"} Resignation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <select
                name="employee"
                value={formData.employee}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              >
                <option value="">Select Employee</option>
                {employees?.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Resignation Date
              </label>
              <input
                type="date"
                name="resignationDate"
                value={formData.resignationDate}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Working Day
              </label>
              <input
                type="date"
                name="lastWorkingDay"
                value={formData.lastWorkingDay}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notice Period (Days)
              </label>
              <input
                type="number"
                name="noticePeriod"
                value={formData.noticePeriod}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                required
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                Document URL
              </label>
              <input
                type="text"
                name="documentUrl"
                value={formData.documentUrl}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={isViewMode}
                rows="2"
                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {resignation ? "Update" : "Create"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResignationModal;
