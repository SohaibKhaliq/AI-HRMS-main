import { useState } from "react";
import axiosInstance from "../../../axios/axiosInstance";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const ChangePasswordModal = ({ onClose, employee }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    try {
      setLoading(true);
      await axiosInstance.post(`/employees/${employee._id}/change-password`, {
        password,
      });
      toast.success("Password changed");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black w-[90%] sm:max-w-md p-6 border border-gray-300 rounded-lg shadow-xl space-y-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Change Password for {employee?.name}</h3>
          <button type="button" onClick={onClose} className="text-gray-500">
            ×
          </button>
        </div>

        <div>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-[#EFEFEF] rounded-full"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-3 bg-[#EFEFEF] rounded-full"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-full"
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordModal;

ChangePasswordModal.propTypes = {
  onClose: PropTypes.func,
  employee: PropTypes.object,
};

ChangePasswordModal.defaultProps = {
  onClose: () => {},
  employee: null,
};
