import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import RoleModal from "../../components/shared/modals/RoleModal";
import { getRoles, deleteRole } from "../../services/role.service";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import ConfirmModal from "../../components/shared/modals/ConfirmModal";

const Role = () => {
  const dispatch = useDispatch();
  const {
    roles = [],
    loading,
    error,
  } = useSelector((state) => state.role || {});

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!searchQuery) return roles || [];
    const q = searchQuery.toLowerCase();
    return (roles || []).filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openCreate = () => {
    setAction("create");
    setModalOpen({});
  };
  const openEdit = (d) => {
    setAction("update");
    setModalOpen(d);
  };
  const openView = (d) => {
    setAction("view");
    setModalOpen(d);
  };
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const openDeleteConfirm = (id, name) => {
    setConfirmTarget({ id, name });
    setConfirmOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!confirmTarget) return;
    dispatch(deleteRole(confirmTarget.id));
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Roles - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Role Management</h2>
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
                  <div className="font-semibold">Role</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No roles found
                  </td>
                </tr>
              ) : (
                pageData.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {d.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {d.description?.slice(0, 80)}
                      {d.description && d.description.length > 80 ? "..." : ""}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openView(d)}
                          title="View"
                          className="text-blue-600 p-2 rounded-full"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEdit(d)}
                          title="Edit"
                          className="text-green-600 p-2 rounded-full"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(d._id, d.name)}
                          title="Delete"
                          className="text-red-600 p-2 rounded-full"
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
            Showing {pageData.length} of {filtered.length} roles
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
          <RoleModal
            action={action}
            role={modalOpen}
            onClose={() => setModalOpen(null)}
          />
        )}

        <ConfirmModal
          open={confirmOpen}
          title="Delete role"
          message={
            confirmTarget
              ? `Delete "${confirmTarget.name}"? This cannot be undone.`
              : "Are you sure?"
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmTarget(null);
          }}
          confirmLabel="Delete"
        />
      </section>
    </>
  );
};

export default Role;
