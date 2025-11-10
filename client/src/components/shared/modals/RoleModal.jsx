import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createRole, updateRole } from "../../../services/role.service";
import PropTypes from "prop-types";
import { FaTimes, FaUserTag } from "react-icons/fa";
import toast from "react-hot-toast";

/**
 * Props
 * action: "create" | "update" | "view"   (default: "create")
 * onClose: () => void
 * role: { _id?, name?, description? }   (required for update/view)
 */
const RoleModal = ({ action = "create", onClose, role = null }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  /* --------------------------------------------------------------
   *  Populate form when editing / viewing
   * ------------------------------------------------------------ */
  useEffect(() => {
    if ((action === "update" || action === "view") && role) {
      setFormData({
        name: role.name ?? "",
        description: role.description ?? "",
      });
    } else {
      setFormData({ name: "", description: "" });
      setErrors({});
    }
  }, [action, role]);

  const isView = action === "view";

  /* --------------------------------------------------------------
   *  Input change handler (clears field-level error)
   * ------------------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* --------------------------------------------------------------
   *  Validation
   * ------------------------------------------------------------ */
  const validate = () => {
    const err = {};
    if (!formData.name?.trim()) err.name = "Role name is required";
    return err;
  };

  /* --------------------------------------------------------------
   *  Submit handler
   * ------------------------------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // In view mode just close the modal
    if (isView) return onClose();

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    try {
      if (action === "update" && role?._id) {
        await dispatch(updateRole({ id: role._id, role: formData })).unwrap();
      } else {
        await dispatch(createRole(formData)).unwrap();
      }

      onClose();
    } catch (error) {
      // error could be a string, an Error, or a server response object (from rejectWithValue)
      // Prefer structured payload when available
      const payload =
        (typeof error === "object" && error) ||
        (typeof error === "string" ? { message: error } : {});

      const msg = payload.message || payload.error || "Failed to save role";

      // Structured field-level error handling
      if (payload.field === "name" || payload.code === "DUPLICATE_NAME") {
        setErrors({ name: msg });
        return;
      }

      // Fallback: also detect duplicate wording in message
      if (String(msg).toLowerCase().includes("already in use")) {
        setErrors({ name: msg });
        return;
      }

      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black w-full max-w-xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FaUserTag className="text-xl text-gray-700" />
            <h3 className="font-bold text-gray-700">
              {action === "create"
                ? "Create"
                : action === "update"
                ? "Update"
                : "View"}{" "}
              Role
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        {/* Role name */}
        <div>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isView}
            placeholder="Role name"
            className={`w-full p-3 bg-[#EFEFEF] rounded-lg transition-colors ${
              errors.name ? "border border-red-400" : ""
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isView}
            rows={4}
            placeholder="Description"
            className="w-full p-3 bg-[#EFEFEF] rounded-lg resize-none"
          />
        </div>

        {/* Submit button (hidden in view mode) */}
        {!isView && (
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

/* --------------------------------------------------------------
 *  PropTypes (kept for non-TS projects)
 * ------------------------------------------------------------ */
RoleModal.propTypes = {
  action: PropTypes.oneOf(["create", "update", "view"]),
  onClose: PropTypes.func.isRequired,
  role: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default RoleModal;
