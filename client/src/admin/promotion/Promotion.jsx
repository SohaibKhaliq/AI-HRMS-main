import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import PromotionModal from "../../components/shared/modals/PromotionModal";
import {
  getPromotions,
  deletePromotion,
} from "../../services/promotion.service";
import { getDesignations } from "../../services/designation.service";
import { getAllEmployees } from "../../services/employee.service";
import { FaEye, FaEdit, FaTrash, FaPlus, FaDownload } from "react-icons/fa";

const Promotion = () => {
  const dispatch = useDispatch();
  const { promotions, loading, error } = useSelector(
    (state) =>
      state.promotion || { promotions: [], loading: false, error: null }
  );
  const { designations } = useSelector(
    (state) => state.designation || { designations: [] }
  );
  const { employees } = useSelector(
    (state) => state.employee || { employees: [] }
  );

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(getPromotions());
    if (!designations || designations.length === 0) dispatch(getDesignations());
    if (!employees || employees.length === 0)
      dispatch(getAllEmployees({ currentPage: 1, filters: {} }));
  }, [dispatch, designations, employees]);

  const filtered = useMemo(() => {
    let result = promotions || [];

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.employee?.name?.toLowerCase().includes(q) ||
          p.employee?.employeeId?.toLowerCase().includes(q) ||
          p.previousDesignation?.name?.toLowerCase().includes(q) ||
          p.newDesignation?.name?.toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Apply date range filter
    if (dateFrom) {
      result = result.filter(
        (p) => new Date(p.promotionDate) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      result = result.filter(
        (p) => new Date(p.promotionDate) <= new Date(dateTo)
      );
    }

    return result;
  }, [promotions, searchQuery, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => {
    setAction("create");
    setModalOpen({});
  };
  const openEdit = (p) => {
    setAction("update");
    setModalOpen(p);
  };
  const openView = (p) => {
    setAction("view");
    setModalOpen(p);
  };
  const handleDelete = (id) => {
    if (!confirm("Are you sure?")) return;
    dispatch(deletePromotion(id));
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Promotions - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Promotion Management</h2>
          <div className="flex-1 ml-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-3 pl-4 rounded-full bg-white border border-gray-200 text-sm placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-5 py-2 rounded-full shadow"
              >
                Search
              </button>
              <button className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-full">
                Filters
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-1">Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm bg-transparent outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <button
                onClick={openCreate}
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded-full inline-flex items-center gap-3"
              >
                <FaPlus className="text-lg" />
                <div className="text-left">
                  <div className="text-xs">Add</div>
                  <div className="font-semibold">Promotion</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 opacity-0">
                Action
              </label>
              <button
                onClick={clearFilters}
                className="bg-gray-400 hover:bg-gray-500 text-white text-sm px-3 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
          {(statusFilter || dateFrom || dateTo || searchQuery) && (
            <div className="mt-2 text-sm text-blue-600">
              Filters applied: {statusFilter && `Status="${statusFilter}"`}{" "}
              {dateFrom && `From="${dateFrom}"`} {dateTo && `To="${dateTo}"`}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promotion Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary Adjustment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No promotions found
                  </td>
                </tr>
              ) : (
                pageData.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.employee?.name} (EMP {p.employee?.employeeId})
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.previousDesignation?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {p.newDesignation?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.promotionDate
                        ? new Date(p.promotionDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {p.effectiveDate
                        ? new Date(p.effectiveDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      +{p.salaryAdjustment || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          p.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : p.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {p.documentUrl ? (
                        <a
                          href={p.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaDownload className="inline" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openView(p)}
                          title="View"
                          className="text-blue-600 p-2 rounded-full hover:bg-blue-50"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit"
                          className="text-green-600 p-2 rounded-full hover:bg-green-50"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          title="Delete"
                          className="text-red-600 p-2 rounded-full hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {pageData.length} of {filtered.length} promotions
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {modalOpen && (
          <PromotionModal
            action={action}
            promotion={modalOpen}
            onClose={() => setModalOpen(null)}
          />
        )}
      </section>
    </>
  );
};

export default Promotion;
