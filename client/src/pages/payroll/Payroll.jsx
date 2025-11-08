import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { FaDownload, FaEye, FaFileInvoiceDollar } from "react-icons/fa";
import axiosInstance from "../../axios/axiosInstance";
import toast from "react-hot-toast";
import ComponentLoader from "../../components/shared/loaders/ComponentLoader";
import FetchError from "../../components/shared/error/FetchError";

const Payroll = () => {
  const { user } = useSelector((state) => state.authentication);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayrolls: 0,
    limit: 12
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate year options (current year and previous years)
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 2024; i--) {
    yearOptions.push(i);
  }

  useEffect(() => {
    fetchPayrolls(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const fetchPayrolls = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/payrolls?employee=${user._id}&year=${selectedYear}&page=${page}&limit=${pagination.limit}`
      );
      setPayrolls(data.payrolls || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalPayrolls: 0,
        limit: 12
      });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payroll data");
      toast.error("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPayrolls(newPage);
    }
  };

  const handleViewPayslip = (payroll) => {
    setSelectedPayroll(payroll);
    setShowModal(true);
  };

  const handleDownloadPayslip = (payroll) => {
    // Create a simple payslip HTML for printing/saving as PDF
    const payslipWindow = window.open('', '_blank');
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${monthNames[payroll.month - 1]} ${payroll.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .payslip-title { font-size: 18px; margin-top: 10px; }
          .info-section { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 18px; background-color: #e3f2fd; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 5px; font-weight: bold; }
          .status-paid { background-color: #d4edda; color: #155724; }
          .status-pending { background-color: #fff3cd; color: #856404; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="header">
          <div className="company-name">Metro Cash & Carry</div>
          <div className="payslip-title">PAYSLIP</div>
        </div>
        
        <div className="info-section">
          <div className="info-row">
            <div><span className="info-label">Employee Name:</span> <span className="info-value">${user?.name || 'N/A'}</span></div>
            <div><span className="info-label">Employee ID:</span> <span className="info-value">${user?.employeeId || 'N/A'}</span></div>
          </div>
          <div className="info-row">
            <div><span className="info-label">Period:</span> <span className="info-value">${monthNames[payroll.month - 1]} ${payroll.year}</span></div>
            <div><span className="info-label">Status:</span> <span className="status ${payroll.isPaid ? 'status-paid' : 'status-pending'}">${payroll.isPaid ? 'PAID' : 'PENDING'}</span></div>
          </div>
          ${payroll.isPaid && payroll.paymentDate ? `
          <div className="info-row">
            <div><span className="info-label">Payment Date:</span> <span className="info-value">${new Date(payroll.paymentDate).toLocaleDateString()}</span></div>
          </div>
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Salary</td>
              <td style="text-align: right;">${payroll.baseSalary?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td style="text-align: right; color: green;">+${payroll.allowances?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Bonuses</td>
              <td style="text-align: right; color: green;">+${payroll.bonuses?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Deductions</td>
              <td style="text-align: right; color: red;">-${payroll.deductions?.toLocaleString()}</td>
            </tr>
            <tr className="total-row">
              <td>Net Salary</td>
              <td style="text-align: right;">Rs. ${payroll.netSalary?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <div className="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div className="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 30px; background-color: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">Print / Save as PDF</button>
          <button onclick="window.close()" style="padding: 10px 30px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Close</button>
        </div>
      </body>
      </html>
    `;
    
    payslipWindow.document.write(payslipHTML);
    payslipWindow.document.close();
  };

  if (loading) return <ComponentLoader />;
  if (error) return <FetchError error={error} />;

  return (
    <>
      <Helmet>
        <title>My Payroll - Metro HR</title>
      </Helmet>

      <section className="px-1 sm:px-4 bg-gray-200 dark:bg-primary min-h-screen py-4">
        <div className="bg-white dark:bg-secondary rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <FaFileInvoiceDollar className="text-3xl text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                My Payroll
              </h1>
            </div>
            
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Year:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {payrolls.length === 0 ? (
            <div className="text-center py-12">
              <FaFileInvoiceDollar className="text-6xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No payroll records found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Period</th>
                    <th className="px-6 py-3">Base Salary</th>
                    <th className="px-6 py-3">Net Salary</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr
                      key={payroll._id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium">
                        {monthNames[payroll.month - 1]} {payroll.year}
                      </td>
                      <td className="px-6 py-4">
                        Rs. {payroll.baseSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        Rs. {payroll.netSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            payroll.isPaid
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {payroll.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewPayslip(payroll)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          {payroll.isPaid && (
                            <button
                              onClick={() => handleDownloadPayslip(payroll)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Download Payslip"
                            >
                              <FaDownload className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {payrolls.length} of {pagination.totalPayrolls} records
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg ${
                                pagination.currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === pagination.currentPage - 2 ||
                          page === pagination.currentPage + 2
                        ) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payslip Detail Modal */}
        {showModal && selectedPayroll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Payslip Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">
                      {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Employee: {user?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Employee ID: {user?.employeeId}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border dark:border-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Base Salary
                      </p>
                      <p className="text-xl font-bold">
                        Rs. {selectedPayroll.baseSalary?.toLocaleString()}
                      </p>
                    </div>
                    <div className="border dark:border-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allowances
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        +Rs. {selectedPayroll.allowances?.toLocaleString()}
                      </p>
                    </div>
                    <div className="border dark:border-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Deductions
                      </p>
                      <p className="text-xl font-bold text-red-600">
                        -Rs. {selectedPayroll.deductions?.toLocaleString()}
                      </p>
                    </div>
                    <div className="border dark:border-gray-700 p-4 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bonuses
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        +Rs. {selectedPayroll.bonuses?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Net Salary
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      Rs. {selectedPayroll.netSalary?.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      selectedPayroll.isPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}>
                      {selectedPayroll.isPaid ? "Paid" : "Pending"}
                    </span>
                    {selectedPayroll.isPaid && selectedPayroll.paymentDate && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Paid on: {new Date(selectedPayroll.paymentDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  {selectedPayroll.isPaid && (
                    <button
                      onClick={() => handleDownloadPayslip(selectedPayroll)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <FaDownload />
                      Download PDF
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Payroll;
