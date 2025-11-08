import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  createDocumentType,
  updateDocumentType,
} from "../../../services/documentType.service";
import ValidatedInput from "../../ui/ValidatedInput";
import PropTypes from "prop-types";

const DocumentTypeModal = ({ action, onClose, documentType }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    required: false,
    status: "Active",
    createdAt: "",
  });

  useEffect(() => {
    if ((action === "update" || action === "view") && documentType) {
      setFormData({
        name: documentType.name || "",
        description: documentType.description || "",
        required: !!documentType.required,
        status: documentType.status || "Active",
        createdAt: documentType.createdAt
          ? new Date(documentType.createdAt).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [action, documentType]);

  const isView = action === "view";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action === "update")
      dispatch(updateDocumentType({ id: documentType._id, docType: formData }));
    else dispatch(createDocumentType(formData));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black w-[90%] sm:max-w-xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold">
            {action === "create"
              ? "Create"
              : action === "update"
              ? "Update"
              : "View"}{" "}
            Document Type
          </h3>
          <button type="button" onClick={onClose} className="text-gray-500">
            ×
          </button>
        </div>

        <div>
          <ValidatedInput
            validationType="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isView}
            required
            placeholder="Document type name"
            className="w-full"
          />
        </div>

        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isView}
            rows={4}
            placeholder="Description"
            className="w-full p-3 bg-[#EFEFEF] rounded-lg"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="required"
              checked={formData.required}
              onChange={handleChange}
              disabled={isView}
            />{" "}
            Required
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isView}
            className="p-2 bg-[#EFEFEF] rounded-full"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {action === "update" && (
          <div>
            <input
              type="datetime-local"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleChange}
              className="w-full p-3 bg-[#EFEFEF] rounded-full"
            />
          </div>
        )}

        {!isView && (
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-full"
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DocumentTypeModal;

DocumentTypeModal.propTypes = {
  action: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  documentType: PropTypes.object,
};
