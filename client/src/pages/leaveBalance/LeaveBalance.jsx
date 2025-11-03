import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLeaveBalances } from '../../services/leaveBalance.service';
import toast from 'react-hot-toast';

const LeaveBalance = () => {
  const dispatch = useDispatch();
  const { myBalances, loading } = useSelector((state) => state.leaveBalance);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchLeaveBalances();
  }, [selectedYear]);

  const fetchLeaveBalances = () => {
    dispatch(getMyLeaveBalances({ year: selectedYear }))
      .unwrap()
      .catch((error) => {
        toast.error(error || 'Failed to fetch leave balances');
      });
  };

  // Calculate summary metrics
  const summary = {
    totalTypes: myBalances.length,
    totalAllocated: myBalances.reduce((sum, b) => sum + (b.allocated || 0), 0),
    totalUsed: myBalances.reduce((sum, b) => sum + (b.used || 0), 0),
    totalAvailable: myBalances.reduce((sum, b) => sum + (b.allocated - b.used || 0), 0),
  };

  // Get usage percentage and color
  const getUsageColor = (used, allocated) => {
    const percentage = (used / allocated) * 100;
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsagePercentage = (used, allocated) => {
    return allocated > 0 ? Math.round((used / allocated) * 100) : 0;
  };

  // Generate year options (current year ± 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Leave Balance Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your leave allocations and usage
            </p>
          </div>
          
          {/* Year Selector */}
          <div className="mt-4 md:mt-0">
            <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        // Loading State
        <div className="space-y-6">
          {/* Summary Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
              >
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ) : myBalances.length === 0 ? (
        // Empty State
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No leave balances found for {selectedYear}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Leave balances may not be initialized yet for this year.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Leave Types */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Leave Types Available</p>
                  <p className="text-4xl font-bold">{summary.totalTypes}</p>
                </div>
                <div className="text-5xl opacity-80">📋</div>
              </div>
            </div>

            {/* Total Allocated */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Days Allocated</p>
                  <p className="text-4xl font-bold">{summary.totalAllocated}</p>
                </div>
                <div className="text-5xl opacity-80">📅</div>
              </div>
            </div>

            {/* Total Used */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Days Used</p>
                  <p className="text-4xl font-bold">{summary.totalUsed}</p>
                </div>
                <div className="text-5xl opacity-80">✓</div>
              </div>
            </div>

            {/* Total Available */}
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Total Days Available</p>
                  <p className="text-4xl font-bold">{summary.totalAvailable}</p>
                </div>
                <div className="text-5xl opacity-80">💰</div>
              </div>
            </div>
          </div>

          {/* Detailed Balance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detailed Leave Balance
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {myBalances.map((balance) => {
                    const available = balance.allocated - balance.used;
                    const usagePercentage = getUsagePercentage(balance.used, balance.allocated);
                    const usageColor = getUsageColor(balance.used, balance.allocated);

                    return (
                      <tr
                        key={balance._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-3"
                              style={{
                                backgroundColor: balance.leaveType?.color || '#10B981',
                              }}
                            ></div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {balance.leaveType?.name || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {balance.leaveType?.code || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {balance.allocated} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {balance.used} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {available} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`${usageColor} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${usagePercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[45px]">
                              {usagePercentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaveBalance;
