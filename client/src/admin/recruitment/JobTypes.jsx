import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import SimpleNameModal from "../../components/shared/modals/SimpleNameModal";
import { getJobTypes, createJobType, updateJobType, deleteJobType } from "../../services/jobmeta.service";

const JobTypes = () => {
  const dispatch = useDispatch();
  const { types } = useSelector((s) => s.jobmeta || {});
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [action, setAction] = useState("create");
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    dispatch(getJobTypes());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return (types.items || []).filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));
  }, [types.items, q]);

  const openModal = (type, item = null) => {
    setAction(type);
    setCurrent(item);
    setShow(true);
  };

  const handleSubmit = async ({ name }) => {
    if (action === "create") {
      await dispatch(createJobType({ name }));
    } else if (action === "edit" && current?._id) {
      await dispatch(updateJobType({ id: current._id, payload: { name } }));
    }
    setShow(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete type "${item.name}"?`)) {
      await dispatch(deleteJobType(item._id));
    }
  };

  return (
    <>
      <Helmet>
        <title>Job Types - Metro HR</title>
      </Helmet>
      <section className="bg-gray-100 dark:bg-secondary p-3 sm:p-4 rounded-lg min-h-screen shadow">
        <div className="mb-4 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search types..."
            className="w-full sm:max-w-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2"
          />
          <button
            onClick={() => openModal("create")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Type
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div key={t._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
              <p className="font-semibold">{t.name}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal("edit", t)}
                  className="text-xs px-3 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  className="text-xs px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-500">No types found</div>
          )}
        </div>
      </section>
      {show && (
        <SimpleNameModal
          title={action === "create" ? "Add Type" : "Edit Type"}
          action={action}
          defaultValue={current?.name}
          onSubmit={handleSubmit}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
};

export default JobTypes;
