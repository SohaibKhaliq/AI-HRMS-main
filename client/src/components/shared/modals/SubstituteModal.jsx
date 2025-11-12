import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { assignSustitute } from "../../../services/leave.service";
import { getAllEmployees } from "../../../services/employee.service";
import axiosInstance from "../../../axios/axiosInstance";

const SubstituteModal = ({ onClose, leaveId, onAssigned }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employee);

  const [employee, setEmployee] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(
        assignSustitute({ leaveId, employee })
      );

      // If parent provided a callback, call it after successful assignment
      if (
        resultAction &&
        resultAction.payload &&
        typeof onAssigned === "function"
      ) {
        onAssigned(resultAction.payload);
      }
    } catch (e) {
      // ignore - notifications handled by thunk
      console.warn("assign substitute failed", e);
    } finally {
      onClose();
    }
  };

  useEffect(() => {
    // load a simple list of employees to pick a substitute from
    dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
  }, [dispatch]);

  const fetchCandidates = async () => {
    if (!leaveId) return;
    setLoadingCandidates(true);
    try {
      const { data } = await axiosInstance.get(
        `/leaves/${leaveId}/substitute-candidates`
      );
      setCandidates(data.candidates || []);
    } catch (err) {
      console.error("Failed to fetch substitute candidates", err);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form
        id="modal"
        onSubmit={handleSubmit}
        className="bg-white text-black w-[90%] sm:max-w-xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-5"
      >
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="font-bold text-gray-600">Assign Substitute</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <div className="w-full relative">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-gray-600">Suggested Candidates</h4>
            <button
              type="button"
              onClick={fetchCandidates}
              className="text-xs text-blue-600 hover:underline"
            >
              {loadingCandidates ? "Loading..." : "Fetch Candidates"}
            </button>
          </div>
          {candidates && candidates.length > 0 && (
            <div className="mb-3 max-h-40 overflow-auto border border-gray-200 rounded p-2">
              {candidates.map((c) => (
                <div
                  key={c.employeeId}
                  className="flex items-center justify-between py-1"
                >
                  <div className="text-sm">
                    {c.name}{" "}
                    <span className="text-xs text-gray-400">({c.score})</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setEmployee(c.employeeId)}
                      className="text-xs px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <i className="fa fa-building-columns text-sm icon absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600"></i>
          <select
            id="select"
            name="head"
            value={employee}
            onChange={(e) => setEmployee(e.target.value)}
            className="w-full bg-[#EFEFEF] text-center text-sm p-[17px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-medium pl-12"
            required
          >
            <option value="">--- Select Substitute ---</option>
            {employees &&
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
          </select>
        </div>

        <div className="w-full flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 w-full text-white text-sm p-4 font-semibold rounded-3xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubstituteModal;

SubstituteModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  leaveId: PropTypes.string,
  onAssigned: PropTypes.func,
};
