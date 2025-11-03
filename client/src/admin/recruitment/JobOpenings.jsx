import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import Loader from "../../components/shared/loaders/Loader";
import { setFetchFlag } from "../../reducers/recruitment.reducer";
import FetchError from "../../components/shared/error/FetchError";
import { getJobOpenings } from "../../services/recruitment.service";
import { jobOpeningHead, recruitmentButtons } from "../../constants";
import NoDataMessage from "../../components/shared/error/NoDataMessage";
import FilterButton from "../../components/shared/buttons/FilterButton";
import JobOpeningModal from "../../components/shared/modals/JobOpeningModal";

function JobOpenings() {
  const dispatch = useDispatch();

  const { jobs, loading, error, fetch } = useSelector(
    (state) => state.recruitment
  );

  const [action, setAction] = useState("create");
  const [reviewFilter, setReviewFilter] = useState("");
  const [toggleModal, setToggleModal] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const openCreate = () => {
    setAction("create");
    setSelectedJob(null);
    setToggleModal(true);
  };

  const openEdit = (job) => {
    setAction("update");
    setSelectedJob(job);
    setToggleModal(true);
  };

  const handleReviewFilter = (filter) => {
    dispatch(setFetchFlag(true));
    setReviewFilter(filter);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    dispatch(
      getJobOpenings({ status: reviewFilter.toLowerCase(), deadline: "" })
    );
  };

  // Filtered and paginated jobs
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs || [];
    const q = searchQuery.toLowerCase();
    return (jobs || []).filter((job) => {
      return (
        job.title?.toLowerCase().includes(q) ||
        job.role?.name?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.type?.toLowerCase().includes(q)
      );
    });
  }, [jobs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  useEffect(() => {
    if (fetch) {
      dispatch(
        getJobOpenings({ status: reviewFilter.toLowerCase(), deadline: "" })
      );
    }
  }, [reviewFilter, fetch, dispatch]);

  // Auto-refresh every 10 seconds to pick up new applications
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(
        getJobOpenings({ status: reviewFilter.toLowerCase(), deadline: "" })
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [reviewFilter, dispatch]);

  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Job Openings - Metro HR</title>
      </Helmet>

      <section className="bg-gray-100 dark:bg-secondary p-4 rounded-lg min-h-screen shadow">
        {loading && <Loader />}

        {/* Header with Title, Search, and Create Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Job Openings</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="search"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh applicant counts"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <FaPlus /> Create Job Opening
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {recruitmentButtons.map((filter, i) => (
            <FilterButton
              key={i}
              setState={handleReviewFilter}
              state={reviewFilter}
              filter={filter}
            />
          ))}
        </div>

        <div id="overflow" className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="dark:bg-head bg-headLight text-primary">
                {jobOpeningHead.map((header, i) => (
                  <th key={i} className="py-3 px-4 border-b border-secondary">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length > 0 &&
                pageData.map((job, index) => (
                  <tr
                    key={job._id}
                    className="dark:even:bg-gray-800 odd:bg-gray-200 dark:odd:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <td className="py-3 px-4 border-b border-secondary">
                      {job.title}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {job.role?.name || "N/A"}
                    </td>

                    <td className="py-3 px-4 border-b border-secondary">
                      Rs - {job.minSalary}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {job.type}
                    </td>

                    {/* Description with Tooltip */}
                    <td
                      className="py-3 px-4 border-b border-secondary relative cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {job.description?.slice(0, 12) + "...."}

                      {hoveredIndex === index && (
                        <div className="absolute left-0 top-full mt-1 max-w-[300px] h-auto bg-gray-900 dark:bg-gray-200 dark:text-black text-white text-xs p-2 rounded shadow-lg z-10 break-words whitespace-normal">
                          <i className="fas fa-quote-left dark:text-gray-700 text-white mr-2"></i>
                          {job.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">
                      {formatDate(job.deadline)}
                    </td>

                    <td className="py-3 px-6 border-b border-secondary">
                      {job?.applicants?.length > 0 ? (
                        <Link
                          to={`/applications/${job._id}`}
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          {job.applicants.length} Applic..
                          {job.applicants.length > 1 ? "s" : ""}
                        </Link>
                      ) : (
                        <span
                          className="text-gray-400"
                          title="No applicants yet"
                        >
                          0 Applic..
                        </span>
                      )}
                    </td>

                    <td className="py-3 border-b border-secondary font-semibold">
                      <span
                        className={`inline-flex items-center px-8 py-1 text-xs font-semibold text-white rounded-full  bg-gradient-to-r ${
                          job.status === "Open"
                            ? "from-green-500 to-green-600"
                            : job.status === "Paused"
                            ? "from-yellow-500 to-yellow-600"
                            : "from-red-500 to-red-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="pl-7 px-4 border-b border-secondary">
                      <button
                        title="Update Job"
                        onClick={() => openEdit(job)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <i className="fa-solid fa-sliders"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && !error && filteredJobs.length === 0 && (
            <NoDataMessage message={"No job openings found"} />
          )}
        </div>

        {/* Pagination */}
        {filteredJobs.length > pageSize && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}

        {toggleModal && (
          <JobOpeningModal
            onClose={() => setToggleModal(false)}
            job={selectedJob}
            action={action}
          />
        )}
      </section>
    </>
  );
}

export default JobOpenings;
