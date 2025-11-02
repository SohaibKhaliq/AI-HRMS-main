import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSearch, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import {
  getResignations,
  deleteResignation,
  updateResignation,
} from "../../services/resignation.service";
import ResignationModal from "../../components/shared/modals/ResignationModal";

const Resignation = () => {
  const dispatch = useDispatch();
  const { resignations, loading } = useSelector((state) => state.resignation);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  useEffect(() => {
    dispatch(getResignations());
  }, [dispatch]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const filteredResignations = resignations?.filter((res) => {
    const searchLower = searchTerm.toLowerCase();
    const employeeName =
      `${res.employee?.firstName} ${res.employee?.lastName}`.toLowerCase() || "";
    const reason = res.reason?.toLowerCase() || "";
    const status = res.status?.toLowerCase() || "";

    return (
      employeeName.includes(searchLower) ||
      reason.includes(searchLower) ||
      status.includes(searchLower)
    );
  });

  const totalPages = Math.ceil((filteredResignations?.length || 0) / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedResignations = filteredResignations?.slice(
    startIndex,
    startIndex + perPage
  );

  const handleAddClick = () => {
    setSelectedResignation(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewClick = (res) => {
    setSelectedResignation(res);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleEditClick = (res) => {
    setSelectedResignation(res);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this resignation?")) {
      const result = await dispatch(deleteResignation(id));
      if (!result?.payload?.error) {
        toast.success("Resignation deleted successfully");
      } else {
        toast.error("Failed to delete resignation");
      }
    }
  };

  const handleStatusChange = async (resignation, newStatus) => {
    const result = await dispatch(
      updateResignation({
        id: resignation._id,
        data: { ...resignation, status: newStatus },
      })
    );
    if (!result?.payload?.error) {
      toast.success(`Resignation status updated to ${newStatus}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (selectedResignation) {
        await dispatch(
          updateResignation({
            id: selectedResignation._id,
            data: formData,
          })
        );
        toast.success("Resignation updated successfully");
      } else {
        // For create - would need a create endpoint
        toast.info("Create functionality to be implemented");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error submitting form");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-6">Resignations</h1>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 min-w-xs">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee, reason, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Per Page Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Per Page:</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
            >
              <span className="text-lg">+</span>
              Add
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : paginatedResignations?.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Resignation Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Last Working Day
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Notice Period
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedResignations?.map((res, index) => (
                  <tr key={res._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {res.employee?.firstName} {res.employee?.lastName}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {new Date(res.resignationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {new Date(res.lastWorkingDay).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {res.noticePeriod} days
                    </td>
                    <td className="px-6 py-3 text-sm">{res.reason}</td>
                    <td className="px-6 py-3 text-sm">
                      <select
                        value={res.status}
                        onChange={(e) =>
                          handleStatusChange(res, e.target.value)
                        }
                        className={`px-3 py-1 rounded text-sm font-medium border cursor-pointer ${
                          res.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : res.status === "Approved"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : res.status === "Rejected"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewClick(res)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(res)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(res._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No resignations found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ResignationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedResignation(null);
        }}
        resignation={selectedResignation}
        onSubmit={isViewMode ? null : handleModalSubmit}
      />
    </div>
  );
};

export default Resignation;
