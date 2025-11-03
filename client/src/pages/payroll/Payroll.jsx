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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/payrolls?employee=\${user._id}`);
      setPayrolls(data.payrolls || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payroll data");
      toast.error("Failed to fetch payroll data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = (payroll) => {
    setSelectedPayroll(payroll);
    setShowModal(true);
  };

  const handleDownloadPayslip = async (payroll) => {
    try {
      toast.loading("Generating payslip PDF...");
      const { data } = await axiosInstance.get(
        `/payrolls/\${payroll._id}/download`,
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_\${payroll.year}_\${payroll.month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.dismiss();
      toast.success("Payslip downloaded successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("PDF download feature coming soon");
    }
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
          <div className="flex items-center gap-3 mb-6">
            <FaFileInvoiceDollar className="text-3xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              My Payroll
            </h1>
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
                          className={`px-2 py-1 rounded text-xs font-semibold \${
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
                    <span className={`px-3 py-1 rounded text-sm font-semibold \${
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
