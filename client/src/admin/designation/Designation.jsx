import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import FetchError from "../../components/shared/error/FetchError";
import DesignationModal from "../../components/shared/modals/DesignationModal";
import { getDesignations, deleteDesignation } from "../../services/designation.service";
import { getDepartments } from "../../services/department.service";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Designation = () => {
  const dispatch = useDispatch();
  const { designations, loading, error } = useSelector(state => state.designation);
  const { departments } = useSelector(state => state.department);

  const [action, setAction] = useState("");
  const [modalOpen, setModalOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(getDesignations());
    if (!departments || departments.length === 0) dispatch(getDepartments());
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return designations || [];
    const q = searchQuery.toLowerCase();
    return (designations || []).filter(d => d.name.toLowerCase().includes(q) || (d.description||"").toLowerCase().includes(q) || (d.department?.name||"").toLowerCase().includes(q));
  }, [designations, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const openCreate = () => { setAction("create"); setModalOpen({}); };
  const openEdit = (d) => { setAction("update"); setModalOpen(d); };
  const openView = (d) => { setAction("view"); setModalOpen(d); };
  const handleDelete = (id) => { if (!confirm("Are you sure?")) return; dispatch(deleteDesignation(id)); };

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet><title>Designations - Metro HR</title></Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Designations</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="search" placeholder="Search by name, dept or desc" value={searchQuery} onChange={e=>{setSearchQuery(e.target.value); setCurrentPage(1);}} className="w-64 p-2 pl-10 rounded-full bg-white border border-gray-200 text-sm" />
            </div>
            <button onClick={openCreate} className="bg-blue-500 text-white text-sm px-4 py-2 rounded-full">Create</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageData.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No designations found</td></tr>
              ) : (
                pageData.map((d, idx) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.department?.name || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{typeof d.salary === 'number' ? d.salary.toLocaleString() : (d.salary || "-")}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.description?.slice(0,80)}{d.description && d.description.length>80?"...":""}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{d.department?.name||"-"}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${d.status==="Active"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"}`}>{d.status||"Active"}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.createdAt ? (isNaN(new Date(d.createdAt).getTime())?"-": new Date(d.createdAt).toLocaleString()) : "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={()=>openView(d)} title="View" className="text-blue-600 p-2 rounded-full"><FaEye/></button>
                        <button onClick={()=>openEdit(d)} title="Edit" className="text-green-600 p-2 rounded-full"><FaEdit/></button>
                        <button onClick={()=>handleDelete(d._id)} title="Delete" className="text-red-600 p-2 rounded-full"><FaTrash/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Showing {pageData.length} of {filtered.length} designations</div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Prev</button>
            <span className="text-sm">{currentPage} / {totalPages}</span>
            <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-1 bg-white border rounded disabled:opacity-50">Next</button>
          </div>
        </div>

        {modalOpen && (
          <DesignationModal action={action} designation={modalOpen} onClose={()=>setModalOpen(null)} />
        )}
      </section>
    </>
  );
};

export default Designation;
