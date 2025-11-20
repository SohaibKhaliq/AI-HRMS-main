import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useDispatch } from "react-redux";
import { getHiringMetrics } from "../../services/recruitment.service";
import Loader from "../../components/shared/loaders/Loader";
import Chart from "../../components/shared/charts/BarChart"; // Chart component now imported from shared charts

const HiringReports = () => {
  const dispatch = useDispatch();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await dispatch(getHiringMetrics({})).unwrap();
        setMetrics(data.metrics);
      } catch (err) {
        // handle
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>Hiring Reports - Metro HR</title>
      </Helmet>

      {loading && <Loader />}

      <section className="bg-gray-100 p-4 rounded-lg min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Hiring Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top-level charts */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Applications By Month</h3>
            {metrics && metrics.length > 0 ? (
              <Chart data={metrics} xKey="month" seriesKeys={["Applied", "Interview", "Hired"]} />
            ) : (
              <p className="text-sm text-gray-500">No data for selected date range</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Table</h3>
            <div className="overflow-auto">
              <table className="min-w-full text-left table-auto">
                <thead>
                  <tr className="bg-headLight dark:bg-head text-primary">
                    <th className="py-2 px-3 border border-secondary">Month</th>
                    <th className="py-2 px-3 border border-secondary">Applications</th>
                    <th className="py-2 px-3 border border-secondary">Interviews</th>
                    <th className="py-2 px-3 border border-secondary">Hires</th>
                    <th className="py-2 px-3 border border-secondary">Rejected</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.month} className="odd:bg-gray-50 even:bg-white">
                      <td className="py-2 px-3 border border-secondary">{m.month}</td>
                      <td className="py-2 px-3 border border-secondary">{m.Applied || 0}</td>
                      <td className="py-2 px-3 border border-secondary">{m.Interview || 0}</td>
                      <td className="py-2 px-3 border border-secondary">{m.Hired || 0}</td>
                      <td className="py-2 px-3 border border-secondary">{m.Rejected || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HiringReports;
