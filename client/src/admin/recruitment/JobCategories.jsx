import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { MdAdd } from "react-icons/md";
import { FiSearch, FiFilter, FiEdit, FiTrash2 } from "react-icons/fi";
import JobCategoryModal from "../../components/shared/modals/JobCategoryModal";
import { getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory } from "../../services/jobmeta.service";
import Loader from "../../components/shared/loaders/Loader";

const JobCategories = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((s) => s.jobmeta || {});
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [show, setShow] = useState(false);
  const [action, setAction] = useState("create");
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    dispatch(getJobCategories());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return (categories.items || []).filter((c) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(searchLower) ||
        (c.description || "").toLowerCase().includes(searchLower)
      );
    });
  }, [categories.items, searchQuery]);

  const openModal = (type, item = null) => {
    setAction(type);
    setCurrent(item);
    setShow(true);
  };

  const handleSubmit = async (formData) => {
    if (action === "create") {
      await dispatch(createJobCategory(formData));
    } else if (action === "edit" && current?._id) {
      await dispatch(updateJobCategory({ id: current._id, payload: formData }));
    }
    setShow(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete category "${item.name}"?`)) {
      await dispatch(deleteJobCategory(item._id));
    }
  };

  if (categories.loading) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>Job Categories - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-3 sm:p-5 rounded-lg min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Job Categories</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing {filtered.length} of {categories.items?.length || 0} job categories
            </p>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <FiFilter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                onClick={() => openModal("create")}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MdAdd size={20} />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  filtered.map((category, index) => (
                    <tr
                      key={category._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal("edit", category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {show && (
        <JobCategoryModal
          title={action === "create" ? "Add Category" : "Edit Category"}
          action={action}
          defaultValues={current}
          onSubmit={handleSubmit}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
};

export default JobCategories;
