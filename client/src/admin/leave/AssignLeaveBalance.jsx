import { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEmployees } from "../../services/employee.service";
import { getLeaveTypes } from "../../services/leaveType.service";
import {
  initializeLeaveBalance,
  getBalanceByEmployeeAndYear,
  adjustLeaveBalance,
} from "../../services/leaveBalance.service";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function AssignLeaveBalance() {
  const dispatch = useDispatch();
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]); // for bulk
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loadingInit, setLoadingInit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [adjustInputs, setAdjustInputs] = useState({});
  const [invalidInputs, setInvalidInputs] = useState({}); // { [leaveTypeId]: errorMessage }
  const [adjustReasons, setAdjustReasons] = useState({}); // { [leaveTypeId]: reason }
  const debounceRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [lastAdjustments, setLastAdjustments] = useState({});

  const employeesState = useSelector((state) => state.employee || {});
  const { data: employeesData } = employeesState; // employee list response shape from getAllEmployees

  const balancesState = useSelector((state) => state.leaveBalance || {});
  const { allBalances } = balancesState;
  const leaveTypeState = useSelector((state) => state.leaveType || {});
  const { leaveTypes = [], loading: leaveTypesLoading } = leaveTypeState;

  useEffect(() => {
    // initial load first page and leave types
    dispatch(getAllEmployees({ currentPage: 1 }));
    dispatch(getLeaveTypes());
  }, [dispatch]);

  useEffect(() => {
    // suggestions come from employeesData.employees
    const list = (employeesData && employeesData.employees) || [];
    setSuggestions(list);
    setHasMoreSuggestions(
      Boolean(
        employeesData &&
          employeesData.pagination &&
          employeesData.pagination.totalPages > 1
      )
    );
  }, [employeesData]);

  useEffect(() => {
    if (selectedEmployee) {
      dispatch(
        getBalanceByEmployeeAndYear({
          employeeId: selectedEmployee,
          year: selectedYear,
        })
      )
        .unwrap()
        .catch((err) => toast.error(err || "Failed to load balances"));
    }
  }, [selectedEmployee, selectedYear, dispatch]);

  // handle search with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // reset page and fetch
      setSuggestionsPage(1);
      dispatch(
        getAllEmployees({ currentPage: 1, filters: { name: searchQuery } })
      )
        .unwrap()
        .then((data) => {
          setSuggestions(data.employees || []);
          setHasMoreSuggestions(
            Boolean(
              data.pagination &&
                data.pagination.currentPage < data.pagination.totalPages
            )
          );
        })
        .catch(() => {
          // fallback: keep existing suggestions
        });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, dispatch]);

  const loadMoreSuggestions = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = suggestionsPage + 1;
    try {
      const data = await dispatch(
        getAllEmployees({
          currentPage: nextPage,
          filters: { name: searchQuery },
        })
      ).unwrap();
      setSuggestions((prev) => [...prev, ...(data.employees || [])]);
      setSuggestionsPage(nextPage);
      setHasMoreSuggestions(
        Boolean(
          data.pagination &&
            data.pagination.currentPage < data.pagination.totalPages
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  // confirmation wrapper for initialize
  const confirmInitialize = () => {
    const targets = bulkMode
      ? selectedEmployees
      : selectedEmployee
      ? [selectedEmployee]
      : [];
    if (!targets || targets.length === 0)
      return toast.error("Please select one or more employees");
    setConfirmPayload({ action: "initialize", targets });
    setConfirmOpen(true);
  };

  const performInitialize = async (targets) => {
    setConfirmOpen(false);
    setLoadingInit(true);
    try {
      const results = await Promise.all(
        targets.map((empId) =>
          dispatch(
            initializeLeaveBalance({ employeeId: empId, year: selectedYear })
          )
            .unwrap()
            .then(() => ({ empId, success: true }))
            .catch((e) => ({ empId, success: false, error: e }))
        )
      );
      const successCount = results.filter((r) => r.success).length;
      toast.success(`${successCount} of ${targets.length} initialized`);
      if (!bulkMode && targets.length === 1) {
        await dispatch(
          getBalanceByEmployeeAndYear({
            employeeId: targets[0],
            year: selectedYear,
          })
        ).unwrap();
      }
    } catch (err) {
      toast.error(err?.message || "Initialization failed");
    } finally {
      setLoadingInit(false);
    }
  };

  const toggleSelectEmployeeBulk = (empId) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  };

  const handleSetAdjustInput = (leaveTypeId, value) => {
    // Update input and validate inline
    setAdjustInputs((prev) => ({ ...prev, [leaveTypeId]: value }));
    // Inline validation rules: allow empty while typing (treated as no change), non-negative number otherwise
    const msg = (() => {
      if (value === "" || value === undefined) return null;
      const n = Number(value);
      if (Number.isNaN(n)) return "Enter a valid number";
      if (n < 0) return "Value cannot be negative";
      return null;
    })();
    setInvalidInputs((prev) => ({ ...prev, [leaveTypeId]: msg }));
  };

  const handleReasonChange = (leaveTypeId, value) => {
    setAdjustReasons((prev) => ({ ...prev, [leaveTypeId]: value }));
  };

  const performAdjust = async (balance, overrideValue, reason) => {
    // When called directly (Save click or blur), no confirmation modal
    if (!balance || !balance.leaveType?._id) return;
    const ltId = balance.leaveType._id;
    const rawValue =
      overrideValue !== undefined ? overrideValue : adjustInputs[ltId];
    // Fallback: if user didn't change the input we use current allotted (or default) instead of undefined
    const baseAllotted =
      balance.totalAllotted || balance.leaveType?.maxDaysPerYear || 0;
    const newTotal =
      rawValue === undefined || rawValue === ""
        ? baseAllotted
        : Number(rawValue);
    if (Number.isNaN(newTotal)) return toast.error("Invalid number");
    if (newTotal < 0) return toast.error("Allocated days can't be negative");
    const adjustment = newTotal - (balance.totalAllotted || 0);
    if (adjustment === 0) return toast("No change");
    try {
      await dispatch(
        adjustLeaveBalance({
          employeeId: balance.employee || selectedEmployee,
          leaveTypeId: ltId,
          year: selectedYear,
          adjustment,
          reason: reason ?? adjustReasons[ltId] ?? undefined,
        })
      ).unwrap();
      // store previous value for undo
      setLastAdjustments((prev) => ({
        ...prev,
        [ltId]: balance.totalAllotted || 0,
      }));
      toast.success("Adjustment applied");
      // clear error and sync input to the saved total
      setInvalidInputs((prev) => ({ ...prev, [ltId]: null }));
      setAdjustInputs((prev) => ({ ...prev, [ltId]: newTotal }));
      // Optionally clear reason after save
      setAdjustReasons((prev) => ({ ...prev, [ltId]: "" }));
      await dispatch(
        getBalanceByEmployeeAndYear({
          employeeId: selectedEmployee,
          year: selectedYear,
        })
      ).unwrap();
    } catch (err) {
      toast.error(err || "Failed to apply adjustment");
    }
  };

  const handleUndoAdjustment = async (balance) => {
    const prev = lastAdjustments[balance.leaveType._id];
    if (prev === undefined) return toast.error("Nothing to undo");
    const currentTotal = balance.totalAllotted || 0;
    const adjustment = prev - currentTotal;
    try {
      await dispatch(
        adjustLeaveBalance({
          employeeId: balance.employee || selectedEmployee,
          leaveTypeId: balance.leaveType._id,
          year: selectedYear,
          adjustment,
        })
      ).unwrap();
      toast.success("Undo successful");
      setLastAdjustments((prevMap) => {
        const copy = { ...prevMap };
        delete copy[balance.leaveType._id];
        return copy;
      });
      await dispatch(
        getBalanceByEmployeeAndYear({
          employeeId: selectedEmployee,
          year: selectedYear,
        })
      ).unwrap();
    } catch (err) {
      toast.error(err?.message || "Undo failed");
    }
  };

  // suggestions are derived from employeesData

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 2; i++) yearOptions.push(i);

  // Merge leave types with balances so we always show all types
  const mergedRows = useMemo(() => {
    if (!leaveTypes || leaveTypes.length === 0) return [];
    const balanceMap = new Map();
    (allBalances || []).forEach((b) => {
      if (b.leaveType?._id) balanceMap.set(b.leaveType._id, b);
    });
    return leaveTypes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((lt) => {
        const found = balanceMap.get(lt._id);
        if (found) return { type: lt, balance: found, initialized: true };
        return {
          type: lt,
          balance: {
            _id: `pending-${lt._id}`,
            leaveType: lt,
            totalAllotted: lt.maxDaysPerYear || 0,
            used: 0,
            pending: 0,
            available: lt.maxDaysPerYear || 0,
          },
          initialized: false,
        };
      });
  }, [leaveTypes, allBalances]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assign Leave Balances
          </h1>
          <p className="text-sm text-gray-500">
            Initialize or view leave balances for an employee
          </p>
        </div>
      </div>

      <div className="p-6 mb-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-5">
          <div>
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-400">
              Search Employee
            </label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type name or email to search..."
              className="w-full px-4 py-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-2 overflow-auto bg-white border rounded max-h-40 dark:bg-gray-700">
              {suggestions.map((emp) => {
                const isSelected =
                  emp._id === selectedEmployee ||
                  selectedEmployees.includes(emp._id);
                return (
                  <div
                    key={emp._id}
                    className={`p-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 ${
                      isSelected ? "bg-blue-50 dark:bg-blue-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {bulkMode && (
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp._id)}
                          onChange={() => toggleSelectEmployeeBulk(emp._id)}
                        />
                      )}
                      <button
                        className="text-left"
                        onClick={() => {
                          setSelectedEmployee(emp._id);
                          setSearchQuery(emp.name);
                        }}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {emp.name}
                        </div>
                        <div className="text-xs text-gray-500">{emp.email}</div>
                      </button>
                    </div>
                    {!bulkMode && (
                      <button
                        className="text-sm text-blue-600"
                        onClick={() => {
                          setSelectedEmployee(emp._id);
                          setSearchQuery(emp.name);
                        }}
                      >
                        Select
                      </button>
                    )}
                  </div>
                );
              })}
              {hasMoreSuggestions && (
                <div className="flex justify-center p-2">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={loadMoreSuggestions}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block mb-1 text-sm text-gray-600 dark:text-gray-400">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-900 bg-white border rounded dark:bg-gray-700 dark:text-white"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 lg:col-span-1">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bulkMode}
                onChange={() => setBulkMode(!bulkMode)}
              />{" "}
              Bulk Mode
            </label>
          </div>
          <div className="flex items-end lg:col-span-1">
            <button
              onClick={confirmInitialize}
              disabled={loadingInit || !selectedEmployee}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingInit
                ? "Initializing..."
                : bulkMode
                ? "Initialize Selected"
                : "Initialize Balances"}
            </button>
          </div>
          <div className="text-xs text-gray-500 lg:col-span-1">
            {selectedEmployee
              ? `Managing year ${selectedYear} for selected employee.`
              : "Select an employee to view or initialize balances."}
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Current Balances
        </h2>
        {!selectedEmployee ? (
          <p className="text-sm text-gray-500">
            Select an employee to view balances.
          </p>
        ) : leaveTypesLoading ? (
          <p className="text-sm text-gray-500">Loading leave types...</p>
        ) : mergedRows.length === 0 ? (
          <p className="text-sm text-gray-500">
            No leave types found. Create leave types first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Leave Type</th>
                  <th className="px-4 py-2 text-left">Code</th>
                  <th className="px-4 py-2 text-left">Allocated</th>
                  <th className="px-4 py-2 text-left">Used</th>
                  <th className="px-4 py-2 text-left">Pending</th>
                  <th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mergedRows.map(({ type, balance, initialized }) => {
                  const available = balance.available || 0;
                  const totalAllotted = balance.totalAllotted || 0;
                  const ltId = type._id;
                  const disabled = !initialized; // disable adjust until initialized
                  return (
                    <tr
                      key={ltId}
                      className="border-b border-gray-100 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{type.name}</td>
                      <td className="px-4 py-2">{type.code || "—"}</td>
                      <td className="px-4 py-2">{totalAllotted}</td>
                      <td className="px-4 py-2">{balance.used}</td>
                      <td className="px-4 py-2">{balance.pending}</td>
                      <td className="px-4 py-2">{available}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {!initialized && (
                              <button
                                className="px-3 py-1 text-white bg-indigo-600 rounded"
                                onClick={() =>
                                  performAdjust(
                                    { ...balance, leaveType: type },
                                    type.maxDaysPerYear || 0,
                                    adjustReasons[ltId]
                                  )
                                }
                              >
                                Init
                              </button>
                            )}
                            <input
                              type="number"
                              min={0}
                              disabled={disabled}
                              value={adjustInputs[ltId] ?? totalAllotted}
                              onChange={(e) =>
                                handleSetAdjustInput(ltId, e.target.value)
                              }
                              onBlur={() => {
                                const err = invalidInputs[ltId];
                                const raw = adjustInputs[ltId];
                                // Only auto-save if valid and actually changed
                                const newVal =
                                  raw === undefined || raw === ""
                                    ? totalAllotted
                                    : Number(raw);
                                if (!err && newVal !== totalAllotted) {
                                  performAdjust(
                                    { ...balance, leaveType: type },
                                    newVal,
                                    adjustReasons[ltId]
                                  );
                                }
                              }}
                              className={`w-24 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                              } ${invalidInputs[ltId] ? "border-red-500" : ""}`}
                            />
                            <button
                              disabled={
                                disabled || Boolean(invalidInputs[ltId])
                              }
                              className={`px-3 py-1 bg-green-600 text-white rounded ${
                                disabled || invalidInputs[ltId]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={() =>
                                initialized &&
                                performAdjust(
                                  balance,
                                  adjustInputs[ltId],
                                  adjustReasons[ltId]
                                )
                              }
                            >
                              Save
                            </button>
                            {lastAdjustments[ltId] && initialized && (
                              <button
                                className="px-2 py-1 text-white bg-yellow-500 rounded"
                                onClick={() => handleUndoAdjustment(balance)}
                              >
                                Undo
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Reason (optional)"
                              value={adjustReasons[ltId] ?? ""}
                              onChange={(e) =>
                                handleReasonChange(ltId, e.target.value)
                              }
                              disabled={disabled}
                              className={`flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                disabled ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            />
                          </div>
                          {invalidInputs[ltId] && (
                            <p className="text-xs text-red-600">
                              {invalidInputs[ltId]}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title={"Confirm initialize"}
        message={`Initialize leave balances for ${
          confirmPayload?.targets?.length || 0
        } employee(s)?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!confirmPayload) return setConfirmOpen(false);
          return performInitialize(confirmPayload.targets);
        }}
        confirmLabel={"Initialize"}
      />
    </div>
  );
}
