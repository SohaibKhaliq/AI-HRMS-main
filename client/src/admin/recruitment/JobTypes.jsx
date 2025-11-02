import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";

const JobTypes = () => {
  const { jobs = [] } = useSelector((s) => s.recruitment || {});
  const [q, setQ] = useState("");

  const types = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => j?.type && set.add(j.type));
    return Array.from(set);
  }, [jobs]);

  const filtered = types.filter((t) => t.toLowerCase().includes(q.toLowerCase()));

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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <div key={t} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <p className="font-semibold">{t}</p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-gray-500">No types found</div>
          )}
        </div>
      </section>
    </>
  );
};

export default JobTypes;
