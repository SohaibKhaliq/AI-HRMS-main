import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {
  createDepartment,
  updateDepartment,
} from "../../../services/department.service";

const DepartmentModal = ({ action, onClose, department }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    createdAt: "",
  });

  useEffect(() => {
    if ((action === "update" || action === "view") && department) {
      setFormData({
        name: department.name || "",
        // head removed
        description:
          department.description ||
          "The Marketing Department is responsible for driving brand awareness",
        status: department.status || "Active",
        createdAt: department.createdAt
          ? new Date(department.createdAt).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [action, department]);

  const isView = action === "view";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === "update")
      dispatch(updateDepartment({ id: department._id, department: formData }));
    else dispatch(createDepartment(formData));

    onClose();
  };

  // head removed: no need to fetch head candidates

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form
        id="modal"
        onSubmit={handleSubmit}
        className="bg-white text-black w-[90%] sm:max-w-xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-5"
      >
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="font-bold text-gray-600">
            {isView ? "View" : action === "create" ? "Create" : "Update"} Department
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <div className="w-full">
          <div className="w-full relative">
            <i className="fa fa-calendar text-sm absolute left-4 pl-1 top-1/2 transform -translate-y-1/2 text-gray-700"></i>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Department name"
              className="w-full bg-[#EFEFEF] text-sm sm:text-center p-[17px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-medium pl-12"
              disabled={isView}
              required
            />
          </div>
        </div>

        {/* Department head removed — no selection UI */}

        {/* Created At - editable only for edit (hidden in create/view) */}
        {action === "update" && (
          <div className="w-full relative">
            <i className="fa fa-calendar text-sm icon absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600"></i>
            <input
              type="datetime-local"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleChange}
              className="w-full bg-[#EFEFEF] text-sm p-[12px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-medium pl-12"
            />
          </div>
        )}

        <div className="w-full relative">
          <i className="fa fa-toggle-off text-sm icon absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600"></i>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-[#EFEFEF] text-center text-sm p-[17px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-medium pl-12"
            disabled={isView}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="w-full">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write your description (optional)"
            className="w-full p-4 bg-[#EFEFEF] text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 resize-none medium"
            disabled={isView}
            rows={4}
          />
        </div>

        {!isView && (
          <div className="w-full flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 w-full text-white text-sm p-4 font-semibold rounded-3xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

DepartmentModal.propTypes = {
  action: PropTypes.oneOf(["create", "update", "view"]).isRequired,
  onClose: PropTypes.func,
  department: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    // head removed
  }),
};

DepartmentModal.defaultProps = {
  onClose: () => {},
  department: null,
};

export default DepartmentModal;
