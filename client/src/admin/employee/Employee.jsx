import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { downloadXls } from "../../utils";
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

  const goToPage = (page) => {
    dispatch(setFetchFlag(true));
    setUiState((prev) => ({ ...prev, currentPage: page }));
  };

  const confirmation = useCallback(() => {
    dispatch(deleteEmployee(uiState.deletedEmployee._id));
    setUiState((prev) => ({
      ...prev,
      deletedEmployee: null,
      toggleModal: false,
    }));
  }, [dispatch, uiState.deletedEmployee]);

  const handleExportToExcel = useCallback(() => {
    setUiState((prev) => ({ ...prev, exportLoading: true }));

    const data = employees.map((employee) => ({
      EmployeeID: employee.employeeId,
      Name: employee.name,
      DateOfBirth: employee.dob,
      Email: employee.email,
      PhoneNumber: employee.phoneNumber,
      Address: `${employee.address.street}, ${employee.address.city}, ${employee.address.state}, ${employee.address.postalCode}, ${employee.address.country}`,
      DateOfJoining: employee.dateOfJoining,
      Gender: employee.gender,
      MaritalStatus: employee.maritalStatus,
      Department: employee.department.name,
      Position: employee.role.name,
      EmploymentType: employee.employmentType,
      Shift: employee.shift,
      Status: employee.status,
      Salary: employee.salary,
      BankDetails: `${employee.bankDetails.accountNumber} - ${employee.bankDetails.bankName}`,
      EmergencyContact: `${employee.emergencyContact.name} (${employee.emergencyContact.relationship}) - ${employee.emergencyContact.phoneNumber}`,
      LeaveBalance: employee.leaveBalance,
      Admin: employee.admin ? "Yes" : "No",
    }));

    setTimeout(() => {
      downloadXls(data);
      setUiState((prev) => ({ ...prev, exportLoading: false }));
    }, 2000);
  }, [employees]);

  const handleApplyFilters = (newFilters) => {
    dispatch(setFetchFlag(true));
    setFilters(newFilters);
    setUiState((prev) => ({ ...prev, toggleFilterBar: false }));
  };

  const clearFilter = (filterKey) => {
    dispatch(setFetchFlag(true));
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: "",
      [`${filterKey}Name`]: "",
    }));
  };

  const renderFilters = Object.keys(filters)
    .filter(
      (key) => filters[key] && key !== "departmentName" && key !== "roleName"
    )
    .map((key) => (
      <button
        key={key}
        className="flex justify-between items-center gap-2 text-[0.9rem] border border-gray-300 py-1 px-5 rounded-2xl hover:border-blue-500 hover:bg-blue-100 hover:text-blue-600 
   dark:hover:border-blue-500 dark:hover:bg-transparent dark:hover:text-blue-500  transition-all  ease-in-out duration-300"
      >
        {filters[key + "Name"] || filters[key]}
        <i
          onClick={() => clearFilter(key)}
          className="fa-solid fa-close text-xs cursor-pointer"
        ></i>
      </button>
    ));

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
                <input type="search" placeholder="Search by name, id or dept" value={filters.name} onChange={e=>{setFilters(prev=>({...prev,name:e.target.value})); dispatch(setFetchFlag(true)); setUiState(prev=>({...prev, currentPage:1}));}} className="w-full p-3 pl-4 rounded-full bg-white border border-gray-200 text-sm placeholder-gray-400" />
              </div>
              <button onClick={()=>{dispatch(setFetchFlag(true)); setUiState(prev=>({...prev, currentPage:1}));}} className="bg-green-500 hover:bg-green-600 text-white text-sm px-5 py-2 rounded-full shadow">Search</button>
              <button onClick={()=>setUiState(prev=>({...prev, toggleFilterBar: true}))} className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-full">Filters</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-2">
                <span className="text-sm text-gray-600 mr-1">Per Page:</span>
                <select value={pagination?.limit || 10} onChange={e=>{dispatch(setFetchFlag(true)); /* server handles page size if supported */}} className="text-sm bg-transparent outline-none">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <Link to="/employee/create" className="bg-green-600 hover:bg-green-700 text-white text-sm px-6 py-3 rounded-full inline-flex items-center gap-3">
                <i className="fa fa-plus"></i>
                <div className="text-left">
                  <div className="text-xs">Add</div>
                  <div className="font-semibold">Employee</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div
          id="overflow"
          className="overflow-x-auto min-h-[74vh] sm:min-h-[80vh]"
        >
          <table className="min-w-full text-left table-auto border-collapse text-[0.83rem] whitespace-nowrap">
            <thead>
                <tr className="bg-headLight dark:bg-head text-primary">
                  <th className="py-3 px-4 border-b border-secondary">Name</th>
                  <th className="py-3 px-4 border-b border-secondary">Employee ID</th>
                  <th className="py-3 px-4 border-b border-secondary">Department</th>
                  <th className="py-3 px-4 border-b border-secondary">Designation</th>
                  <th className="py-3 px-4 border-b border-secondary">Status</th>
                  <th className="py-3 px-4 border-b border-secondary">Joined</th>
                  <th className="py-3 px-4 border-b border-secondary">Actions</th>
                </tr>
            </thead>
            <tbody>
              {employees.length > 0 &&
                employees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="dark:even:bg-gray-800 odd:bg-gray-200 dark:odd:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <td className="py-3 px-4 border-b border-secondary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src={employee.profilePicture || '/unknown.jpeg'} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-secondary">EMP {employee.employeeId}</td>
                    <td className="py-3 px-4 border-b border-secondary">{employee.department?.name || '--'}</td>
                    <td className="py-3 px-4 border-b border-secondary">{employee.designation?.name || '--'}</td>
                    <td className="py-3 px-4 border-b border-secondary">{employee.status}</td>
                    <td className="py-3 px-4 border-b border-secondary">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4 border-b border-secondary flex items-center space-x-2">
                      <Link to={`/employee/${employee._id}`}>
                        <button className="text-blue-500 hover:text-blue-400" title="View">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </Link>

                      <Link to={`/employee/update/${employee._id}`}>
                        <button className="text-green-500 hover:text-green-400" title="Edit">
                          <i className="fa-solid fa-edit"></i>
                        </button>
                      </Link>

                      <button onClick={() => setUiState(prev=>({...prev, changePasswordEmployee: employee, toggleChangePassword: true}))} className="text-yellow-600 hover:text-yellow-500" title="Change Password">
                        <i className="fa-solid fa-key"></i>
                      </button>

                      <button onClick={() => setUiState((prev) => ({...prev, deletedEmployee: employee, toggleModal: true}))} className="text-red-500 hover:text-red-400" title="Delete">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && !error && employees.length === 0 && (
            <NoDataMessage message={"No employee found"} />
          )}
        </div>

        {!loading && employees.length > 0 && (
          <Pagination {...pagination} onPageChange={goToPage} />
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
            onClose={() => setUiState(prev=>({...prev, toggleChangePassword:false, changePasswordEmployee:null}))}
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
