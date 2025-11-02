import React, { useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { MdAdd } from "react-icons/md";
import { FiSearch, FiEye, FiEdit, FiTrash2, FiFilter, FiCheckCircle } from "react-icons/fi";
import JobRequisitionModal from "../../components/shared/modals/JobRequisitionModal";
import { useLocation, useNavigate } from "react-router-dom";
import { getDepartments } from "../../services/department.service";
import { getDesignations } from "../../services/designation.service";

const JobRequisitions = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const { departments = [] } = useSelector((s) => s.department || {});
	const { designations = [] } = useSelector((s) => s.designation || {});

	useEffect(() => {
		if (!departments.length) dispatch(getDepartments());
		if (!designations.length) dispatch(getDesignations());
	}, [dispatch]);

	// Dummy data similar to screenshot
	const demo = useMemo(
		() => [
			{ code: "REQ-2025-0014", title: "Customer Support Representative", category: "Customer Service", department: "Human Resources (Downtown Branch)", positions: 4, status: "Approved", priority: "High", createdAt: "2025-09-19", designation: "Support Rep" },
			{ code: "REQ-2025-0013", title: "Customer Success Manager", category: "Customer Service", department: "Information Technology (Downtown Branch)", positions: 1, status: "Approved", priority: "Medium", createdAt: "2025-09-19", designation: "Manager" },
			{ code: "REQ-2025-0012", title: "Project Manager", category: "Operations and Management", department: "Information Technology (Downtown Branch)", positions: 2, status: "Approved", priority: "Medium", createdAt: "2025-09-19", designation: "Project Manager" },
			{ code: "REQ-2025-0011", title: "Operations Manager", category: "Operations and Management", department: "Information Technology (Main Office)", positions: 1, status: "Approved", priority: "High", createdAt: "2025-09-19", designation: "Operations Manager" },
			{ code: "REQ-2025-0010", title: "Senior Accountant", category: "Finance and Accounting", department: "Human Resources (Main Office)", positions: 1, status: "On Hold", priority: "Low", createdAt: "2025-09-19", designation: "Senior Accountant" },
			{ code: "REQ-2025-0009", title: "Financial Analyst", category: "Finance and Accounting", department: "Information Technology (Main Office)", positions: 1, status: "Approved", priority: "Medium", createdAt: "2025-09-19", designation: "Financial Analyst" },
			{ code: "REQ-2025-0008", title: "Talent Acquisition Specialist", category: "Human Resources", department: "Human Resources (Downtown Branch)", positions: 2, status: "Pending Approval", priority: "High", createdAt: "2025-09-19", designation: "Talent Acquisition" },
			{ code: "REQ-2025-0007", title: "HR Business Partner", category: "Human Resources", department: "Human Resources (Main Office)", positions: 1, status: "Approved", priority: "Medium", createdAt: "2025-09-19", designation: "HRBP" },
			{ code: "REQ-2025-0006", title: "Business Development Executive", category: "Sales and Marketing", department: "Finance & Accounting (Main Office)", positions: 3, status: "Approved", priority: "High", createdAt: "2025-09-19", designation: "BDE" },
			{ code: "REQ-2025-0005", title: "Digital Marketing Specialist", category: "Sales and Marketing", department: "Human Resources (Main Office)", positions: 2, status: "Draft", priority: "Medium", createdAt: "2025-09-19", designation: "Marketing Specialist" },
		],
		[]
	);

	const [items, setItems] = useState(demo);
	const [search, setSearch] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState({ category: "", department: "", status: "", priority: "", designation: "" });
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("view");
	const [current, setCurrent] = useState(null);

	// Open modal when route ends with /add
	useEffect(() => {
		if (location.pathname.endsWith("/add")) {
			handleOpen("create");
		}
	}, [location.pathname]);

	const handleOpen = (mode, row = null) => {
		setModalMode(mode);
		setCurrent(row);
		setModalOpen(true);
	};
	const handleClose = () => {
		setModalOpen(false);
		if (location.pathname.endsWith("/add")) navigate("/recruitment/requisitions", { replace: true });
	};

	const handleCreateOrUpdate = (form) => {
		if (modalMode === "create") {
			const newItem = {
				...form,
				code: `REQ-2025-${String(items.length + 5).padStart(4, "0")}`,
				createdAt: new Date().toISOString().slice(0, 10),
			};
			setItems([newItem, ...items]);
		} else if (modalMode === "edit" && current) {
			setItems(items.map((it) => (it.code === current.code ? { ...current, ...form } : it)));
		}
		handleClose();
	};

	const handleApprove = (row) => {
		setItems(items.map((it) => (it.code === row.code ? { ...it, status: "Approved" } : it)));
	};

	const handleDelete = (row) => {
		if (confirm("Delete this requisition?")) {
			setItems(items.filter((it) => it.code !== row.code));
		}
	};

	const filtered = useMemo(() => {
		const s = search.toLowerCase();
		return items.filter((it) => {
			const textMatch = [it.code, it.title, it.category, it.department].some((v) => (v || "").toLowerCase().includes(s));
			const categoryOk = !filters.category || it.category === filters.category;
			const departmentOk = !filters.department || it.department.includes(filters.department);
			const statusOk = !filters.status || it.status === filters.status;
			const priorityOk = !filters.priority || it.priority === filters.priority;
			const designationOk = !filters.designation || it.designation === filters.designation;
			return textMatch && categoryOk && departmentOk && statusOk && priorityOk && designationOk;
		});
	}, [items, search, filters]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

	const statusBadge = (status) => {
		const map = {
			Approved: "bg-green-100 text-green-700",
			Draft: "bg-gray-100 text-gray-700",
			"Pending Approval": "bg-yellow-100 text-yellow-700",
			"On Hold": "bg-red-100 text-red-600",
		};
		return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
	};

	const priorityBadge = (priority) => {
		const map = { Low: "bg-gray-100 text-gray-700", Medium: "bg-yellow-100 text-yellow-700", High: "bg-red-100 text-red-600" };
		return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[priority]}`}>{priority}</span>;
	};

	return (
		<>
			<Helmet>
				<title>Job Requisitions - HRMS</title>
			</Helmet>

			<div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Job Requisitions</h1>
					</div>
					<div className="flex flex-wrap gap-2 items-center">
						<button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition">
							<FiFilter size={18} /> Filters
						</button>
						<button onClick={() => handleOpen("create")} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
							<MdAdd size={20} /> Add Job Requisition
						</button>
					</div>
				</div>

				<div className="mb-6">
					<div className="relative">
						<FiSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
						<input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
					</div>
				</div>

				{showFilters && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
						<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
								<input value={filters.category} onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. Human Resources" />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
								<select value={filters.department} onChange={(e) => { setFilters({ ...filters, department: e.target.value }); setPage(1); }} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
									<option value="">All</option>
									{departments.map((d) => <option key={d._id || d.name} value={d.name}>{d.name}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
								<select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
									<option value="">All</option>
									{['Draft','Pending Approval','Approved','On Hold'].map(s => <option key={s} value={s}>{s}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
								<select value={filters.priority} onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
									<option value="">All</option>
									{['Low','Medium','High'].map(p => <option key={p} value={p}>{p}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
								<select value={filters.designation} onChange={(e) => { setFilters({ ...filters, designation: e.target.value }); setPage(1); }} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
									<option value="">All</option>
									{designations.map((d) => <option key={d._id || d.name} value={d.name}>{d.name}</option>)}
								</select>
							</div>
						</div>
						<div className="mt-4 flex justify-end">
							<button onClick={() => { setFilters({ category: "", department: "", status: "", priority: "", designation: "" }); setPage(1); }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">Reset Filters</button>
						</div>
					</div>
				)}

				{/* Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">#</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Code</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Title</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Category</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Department</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Positions</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Status</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Priority</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Created At</th>
									<th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
								{pageItems.map((row, index) => (
									<tr key={row.code} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
										<td className="px-4 md:px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{(page - 1) * pageSize + index + 1}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-900 dark:text-white">{row.code}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-900 dark:text-white">{row.title}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-900 dark:text-white">{row.category}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-900 dark:text-white">{row.department}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-900 dark:text-white">{row.positions}</td>
										<td className="px-4 md:px-6 py-3 text-sm">{statusBadge(row.status)}</td>
										<td className="px-4 md:px-6 py-3 text-sm">{priorityBadge(row.priority)}</td>
										<td className="px-4 md:px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{row.createdAt}</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<button onClick={() => handleOpen("view", row)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-600 rounded transition" title="View"><FiEye size={18} /></button>
												<button onClick={() => handleOpen("edit", row)} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-gray-600 rounded transition" title="Edit"><FiEdit size={18} /></button>
												{row.status !== 'Approved' && (
													<button onClick={() => handleApprove(row)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-600 rounded transition" title="Approve"><FiCheckCircle size={18} /></button>
												)}
												<button onClick={() => handleDelete(row)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition" title="Delete"><FiTrash2 size={18} /></button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="text-sm text-gray-600 dark:text-gray-400">
						{(() => {
							const start = (page - 1) * pageSize + 1;
							const end = Math.min(page * pageSize, filtered.length);
							return `Showing ${filtered.length ? start : 0} to ${filtered.length ? end : 0} of ${filtered.length} job requisitions`;
						})()}
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600 dark:text-gray-400">Per Page:</label>
							<select value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
								{[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
							</select>
						</div>
						<div className="flex items-center gap-2">
							<button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">Previous</button>
							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
									<button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${page === p ? 'bg-green-600 text-white' : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{p}</button>
								))}
							</div>
							<button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">Next</button>
						</div>
					</div>
				</div>
			</div>

			{modalOpen && (
				<JobRequisitionModal
					isOpen={modalOpen}
					mode={modalMode}
					data={current}
					onClose={handleClose}
					onSubmit={handleCreateOrUpdate}
				/>
			)}
		</>
	);
};

export default JobRequisitions;
