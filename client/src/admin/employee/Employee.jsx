import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import Error from "../../components/shared/error/Error";
import Modal from "../../components/shared/modals/Modal";
import Loader from "../../components/shared/loaders/Loader";
import FilterBar from "../../components/shared/others/FilterBar";
import Pagination from "../../components/shared/others/Pagination";
import {
  deleteEmployee,
  getAllEmployees,
} from "../../services/employee.service";
import FetchError from "../../components/shared/error/FetchError";
import NoDataMessage from "../../components/shared/error/NoDataMessage";
import ImportExcelModal from "../../components/shared/modals/ImportExcelModal";
import { setFetchFlag } from "../../reducers/employee.reducer";
import ChangePasswordModal from "../../components/shared/modals/ChangePasswordModal";

function Employee() {
  const dispatch = useDispatch();

  const { employees, pagination, loading, error, fetch } = useSelector(
    (state) => state.employee
  );

  const [uiState, setUiState] = useState({
    toggleFilterBar: false,
    toggleModal: false,
    toggleExcelModal: false,
    deletedEmployee: null,
    exportLoading: false,
    currentPage: 1,
  });

  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: "",
    name: "",
    departmentName: "",
    roleName: "",
  });

  // small Avatar component for image load animation and initials fallback
  /* eslint-disable react/prop-types */
  const Avatar = ({ src, name, size = 48 }) => {
    const [loaded, setLoaded] = useState(false);
    const [err, setErr] = useState(false);

    const initials = (name || "")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700 overflow-hidden`}
        style={{ width: size, height: size }}
      >
        {/* initials fallback */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}
        >
          <span className="select-none">{initials || "--"}</span>
        </div>

        {src && !err && (
          <img
            src={src}
            alt={name}
            onLoad={() => setLoaded(true)}
            onError={() => setErr(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    );
  };

  const goToPage = (page) => {
    dispatch(setFetchFlag(true));
    setUiState((prev) => ({ ...prev, currentPage: page }));
  };

  const confirmation = useCallback(() => {
    // confirmation handler uses deletedEmployee from uiState
    if (!uiState.deletedEmployee) return;
    dispatch(deleteEmployee(uiState.deletedEmployee._id));
    setUiState((prev) => ({
      ...prev,
      deletedEmployee: null,
      toggleModal: false,
    }));
  }, [dispatch, uiState.deletedEmployee]);

  const handleApplyFilters = (newFilters) => {
    dispatch(setFetchFlag(true));
    setFilters(newFilters);
    setUiState((prev) => ({ ...prev, toggleFilterBar: false }));
  };

  // clearFilter and renderFilters removed (not currently used)

  useEffect(() => {
    if (fetch) {
      dispatch(getAllEmployees({ currentPage: uiState.currentPage, filters }));
    }
  }, [dispatch, uiState.currentPage, filters, fetch]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", uiState.toggleFilterBar);
  }, [uiState.toggleFilterBar]);

  if (!employees) return <Error />;
  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>Employees - Metro HR</title>
      </Helmet>

      {loading && <Loader />}

      <section className="bg-gray-100 dark:bg-secondary p-3 sm:p-4 rounded-lg sm:min-h-screen shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Employee Directory</h2>
          <div className="flex-1 ml-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Search by name, id or dept"
                  value={filters.name}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, name: e.target.value }));
                    dispatch(setFetchFlag(true));
                    setUiState((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  className="w-full p-3 pl-4 rounded-full bg-white border border-gray-200 text-sm placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => {
                  dispatch(setFetchFlag(true));
                  setUiState((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-5 py-2 rounded-full shadow"
              >
                Search
              </button>
              <button
                onClick={() =>
                  setUiState((prev) => ({ ...prev, toggleFilterBar: true }))
                }
                className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-full"
              >
                Filters
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-1">Per Page:</span>
                <select
                  value={pagination?.limit || 10}
                  onChange={() => {
                    dispatch(
                      setFetchFlag(true)
                    ); /* server handles page size if supported */
                  }}
                  className="text-sm bg-transparent outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <Link
                to="/employee/create"
                className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded-full inline-flex items-center gap-3"
              >
                <i className="fa fa-plus"></i>
                <div className="text-left">
                  <div className="text-xs">Add</div>
                  <div className="font-semibold">Employee</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Employee Table (card-list style for improved UI) */}
        <div id="overflow" className="min-h-[74vh] sm:min-h-[80vh]">
          {/* header labels for larger screens */}
          <div className="hidden sm:flex items-center bg-[#274a6b] text-white rounded-t-md px-3 py-3 text-sm">
            <div className="flex-1 min-w-0 pl-2">Name</div>
            <div className="w-28 text-center">Employee ID</div>
            <div className="w-36 text-center">Department</div>
            <div className="w-36 text-center">Designation</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-28 text-center">Joined</div>
            <div className="w-28 text-right">Actions</div>
          </div>

          <div className="space-y-3 mt-3">
            {employees.length > 0 &&
              employees.map((employee) => (
                <div
                  key={employee._id}
                  tabIndex={0}
                  className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 active:scale-[0.997] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      <Avatar
                        src={employee.profilePicture}
                        name={employee.name}
                        size={44}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm leading-tight text-gray-800 dark:text-gray-100 truncate">
                        {employee.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 truncate mt-0.5">
                        {employee.email}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block w-28 text-center text-sm text-gray-700">
                    EMP {employee.employeeId}
                  </div>
                  <div className="hidden sm:block w-36 text-center text-sm text-gray-700 overflow-hidden truncate">
                    {employee.department?.name || "--"}
                  </div>
                  <div className="hidden sm:block w-36 text-center text-sm text-gray-700 overflow-hidden truncate">
                    {employee.designation?.name || "--"}
                  </div>
                  <div className="hidden sm:block w-24 text-center text-sm">
                    {(() => {
                      const statusClass =
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : employee.status === "On Leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700";
                      return (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                        >
                          {employee.status}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="hidden sm:block w-28 text-center text-sm text-gray-700">
                    {employee.dateOfJoining
                      ? new Date(employee.dateOfJoining).toLocaleDateString()
                      : "-"}
                  </div>

                  <div className="w-28 flex items-center justify-end gap-2">
                    <Link to={`/employee/${employee._id}`}>
                      <button
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded"
                        title="View"
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </Link>

                    <Link to={`/employee/update/${employee._id}`}>
                      <button
                        className="bg-green-50 text-green-600 hover:bg-green-100 p-2 rounded"
                        title="Edit"
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                    </Link>

                    <button
                      onClick={() =>
                        setUiState((prev) => ({
                          ...prev,
                          deletedEmployee: employee,
                          toggleModal: true,
                        }))
                      }
                      className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

            {!loading && !error && employees.length === 0 && (
              <NoDataMessage message={"No employee found"} />
            )}
          </div>
        </div>

        {/* Pagination footer - visible and separated */}
        {!loading && employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end">
              <Pagination {...pagination} onPageChange={goToPage} />
            </div>
          </div>
        )}

        {uiState.toggleFilterBar && (
          <FilterBar
            isOpen={uiState.toggleFilterBar}
            handleApplyFilters={handleApplyFilters}
            hideFilterBar={() =>
              setUiState((prev) => ({ ...prev, toggleFilterBar: false }))
            }
          />
        )}

        {uiState.toggleModal && (
          <Modal
            onClose={() =>
              setUiState((prev) => ({ ...prev, toggleModal: false }))
            }
            action={"delete"}
            isConfirm={confirmation}
          />
        )}

        {uiState.toggleChangePassword && (
          <ChangePasswordModal
            onClose={() =>
              setUiState((prev) => ({
                ...prev,
                toggleChangePassword: false,
                changePasswordEmployee: null,
              }))
            }
            employee={uiState.changePasswordEmployee}
          />
        )}

        {uiState.toggleExcelModal && (
          <ImportExcelModal
            onClose={() =>
              setUiState((prev) => ({ ...prev, toggleExcelModal: false }))
            }
          />
        )}
      </section>
    </>
  );
}

export default Employee;
