import { Helmet } from "react-helmet";
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import DepartmentModal from "../../components/shared/modals/DepartmentModal";
import {
  deleteDepartment,
  // getDepartments is dispatched globally in admin app, state is already populated
} from "../../services/department.service";

const Department = () => {
  const dispatch = useDispatch();
  const { departments, loading, error } = useSelector(
    (state) => state.department
  );

  const [action, setAction] = useState("");
  const [departmentModal, setDepartmentModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // items per page

  const filtered = useMemo(() => {
    if (!searchQuery) return departments || [];
    const q = searchQuery.toLowerCase();
    return (departments || []).filter((d) => {
      return (
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.head?.name?.toLowerCase().includes(q)
      );
    });
  }, [departments, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const openCreate = () => {
    setAction("create");
    setDepartmentModal({});
  };

  const openEdit = (dept) => {
    setAction("update");
    setDepartmentModal(dept);
  };

  const openView = (dept) => {
    setAction("view");
    setDepartmentModal(dept);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this department?"))
      return;
    dispatch(deleteDepartment(id));
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Departments - Metro HR</title>
      </Helmet>

      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Departments</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search by name, head or description"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-64 p-2 pl-10 rounded-full bg-white border border-gray-200 text-sm placeholder-gray-400"
              />
              <i className="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            <button
              onClick={openCreate}
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full shadow-sm hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                pageData.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{department.name}</div>
                      <div className="text-xs text-gray-500">Head: {department.head?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{department.description?.slice(0, 80)}{department.description && department.description.length>80?"...":""}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${department.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {department.status || (department.head ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {department.createdAt ? (() => {
                        const dt = new Date(department.createdAt);
                        return isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
                      })() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={() => openView(department)} title="View" className="text-blue-600 hover:text-blue-800 p-2 rounded-full">
                          <FaEye />
                        </button>
                        <button onClick={() => openEdit(department)} title="Edit" className="text-green-600 hover:text-green-800 p-2 rounded-full">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(department._id)} title="Delete" className="text-red-600 hover:text-red-800 p-2 rounded-full">
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Showing {pageData.length} of {filtered.length} departments</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >Prev</button>
            <span className="text-sm">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >Next</button>
          </div>
        </div>

        {departmentModal && (
          <DepartmentModal
            action={action}
            department={departmentModal}
            onClose={() => setDepartmentModal(null)}
          />
        )}
      </section>
    </>
  );
};

export default Department;
