import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDesignation, updateDesignation } from "../../../services/designation.service";
import ValidatedInput from "../../ui/ValidatedInput";

const DesignationModal = ({ action, onClose, designation }) => {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);

  const [formData, setFormData] = useState({ name: "", description: "", department: "", status: "Active", createdAt: "", salary: "" });

  useEffect(() => {
    if ((action === "update" || action === "view") && designation) {
      setFormData({
        name: designation.name || "",
        description: designation.description || "",
        department: designation.department?._id || "",
        status: designation.status || "Active",
        createdAt: designation.createdAt ? new Date(designation.createdAt).toISOString().slice(0,16) : "",
        salary: designation.salary !== undefined && designation.salary !== null ? String(designation.salary) : "",
      });
    }
  }, [action, designation]);

  const isView = action === "view";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    // ensure salary is numeric if provided
    if (payload.salary !== undefined && payload.salary !== null && payload.salary !== "") payload.salary = Number(payload.salary);
    else delete payload.salary;

    if (action === "update") dispatch(updateDesignation({ id: designation._id, designation: payload }));
    else dispatch(createDesignation(payload));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white text-black w-[90%] sm:max-w-xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">{isView?"View":""}{action === "create"?"Create": action === "update"?"Update":""} Designation</h3>
          <button type="button" onClick={onClose} className="text-gray-500">×</button>
        </div>

        <div>
          <ValidatedInput
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            validationType="name"
            validationOptions={{ fieldName: "Designation name" }}
            label="Designation Name"
            disabled={isView}
            required
            className="w-full p-3 bg-[#EFEFEF] rounded-full"
          />
        </div>

        <div>
          <select name="department" value={formData.department} onChange={handleChange} disabled={isView} className="w-full p-3 bg-[#EFEFEF] rounded-full">
            <option value="">--- Select Department ---</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <select name="status" value={formData.status} onChange={handleChange} disabled={isView} className="w-full p-3 bg-[#EFEFEF] rounded-full">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <ValidatedInput
            type="textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            validationType="description"
            validationOptions={{ 
              fieldName: "Description",
              minLength: 10,
              maxLength: 500,
              required: false 
            }}
            label="Description"
            disabled={isView}
            required={false}
            className="w-full p-3 bg-[#EFEFEF] rounded-lg"
          />
        </div>

        <div>
          <ValidatedInput
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            validationType="salary"
            label="Salary"
            disabled={isView}
            required={false}
            className="w-full p-3 bg-[#EFEFEF] rounded-full"
          />
        </div>

        {action === "update" && (
          <div>
            <input type="datetime-local" name="createdAt" value={formData.createdAt} onChange={handleChange} className="w-full p-3 bg-[#EFEFEF] rounded-full" />
          </div>
        )}

        {!isView && (
          <div>
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-full">Submit</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DesignationModal;
