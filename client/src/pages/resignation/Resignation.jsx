import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/shared/loaders/Loader";
import ButtonLoader from "../../components/shared/loaders/ButtonLoader";
import { createResignation, getResignations } from "../../services/resignation.service";
import toast from "react-hot-toast";

const Resignation = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authentication);
  const { resignations, loading } = useSelector((state) => state.resignation || {});
  const [submitted, setSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      resignationDate: new Date().toISOString().split("T")[0],
      noticePeriod: 30,
      reason: "",
      remarks: "",
    },
  });

  useEffect(() => {
    dispatch(getResignations());
  }, [dispatch]);

  // Check if current user has already submitted a resignation
  const userResignation = resignations?.find(
    (res) => res.employee?._id === user?._id
  );

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);

      if (!allowedTypes.includes(fileExtension)) {
        toast.error("Only PDF, DOC, DOCX, JPG, PNG files are allowed");
        return;
      }

      if (fileSizeMB > 5) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setDocumentFile(file);
      setDocumentPreview(file.name);
    }
  };

  const handleRemoveDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      setFormLoading(true);
      const formData = new FormData();
      formData.append("employee", user._id);
      formData.append(
        "resignationDate",
        new Date(data.resignationDate).toISOString()
      );
      formData.append(
        "lastWorkingDay",
        new Date(
          new Date(data.resignationDate).getTime() +
            data.noticePeriod * 24 * 60 * 60 * 1000
        ).toISOString()
      );
      formData.append("noticePeriod", parseInt(data.noticePeriod));
      formData.append("reason", data.reason);
      formData.append("status", "Pending");
      formData.append("remarks", data.remarks);
      if (documentFile) {
        formData.append("document", documentFile);
      }

      await dispatch(createResignation(formData));
      toast.success("Resignation submitted successfully!");
      setSubmitted(true);
      reset();
      setDocumentFile(null);
      setDocumentPreview(null);
    } catch (error) {
      toast.error("Failed to submit resignation");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Resignation - Metro HR</title>
      </Helmet>

      <section className="h-screen overflow-hidden bg-gray-50">
        <main className="flex justify-center items-center w-full h-full text-black font-medium">
          <div className="w-[94%] sm:w-[490px] rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex flex-col items-center py-8 bg-gradient-to-r from-red-50 to-red-50 border-b">
              <h1 className="text-[1.3rem] mt-3 font-extrabold flex items-center gap-2 text-red-700">
                <i className="fa-solid fa-person-walking-arrow-loop-left"></i>
                Submit Resignation
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                {user?.name || "Employee"} ({user?.employeeId})
              </p>
            </div>

            {userResignation ? (
              <div className="p-8">
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                  <h3 className="text-blue-900 font-semibold mb-2">
                    Resignation Already Submitted
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Your resignation request has been submitted on{" "}
                    <strong>
                      {new Date(userResignation.resignationDate).toLocaleDateString()}
                    </strong>
                  </p>
                  <div className="bg-white rounded p-3 space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          userResignation.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : userResignation.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : userResignation.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {userResignation.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <p className="text-gray-600">{userResignation.reason}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Last Working Day:
                      </span>
                      <p className="text-gray-600">
                        {new Date(
                          userResignation.lastWorkingDay
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {userResignation.remarks && (
                      <div>
                        <span className="font-medium text-gray-700">Remarks:</span>
                        <p className="text-gray-600">{userResignation.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-4 pb-8 px-8 pt-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                {submitted && (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-green-800 text-sm">
                    Resignation submitted successfully!
                  </div>
                )}

                {/* Resignation Date */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Resignation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("resignationDate", {
                      required: "Resignation date is required",
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {errors.resignationDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.resignationDate.message}
                    </p>
                  )}
                </div>

                {/* Notice Period */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Notice Period (Days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("noticePeriod", {
                      required: "Notice period is required",
                      min: { value: 1, message: "Notice period must be at least 1 day" },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard notice period is 30 days
                  </p>
                  {errors.noticePeriod && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.noticePeriod.message}
                    </p>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Reason for Resignation{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("reason", {
                      required: "Please select a reason",
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="Career change">Career change</option>
                    <option value="Better opportunities">
                      Better opportunities
                    </option>
                    <option value="Relocation">Relocation</option>
                    <option value="Further education">Further education</option>
                    <option value="Personal reasons">Personal reasons</option>
                    <option value="Health reasons">Health reasons</option>
                    <option value="Family matters">Family matters</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.reason && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Additional Remarks
                  </label>
                  <textarea
                    {...register("remarks")}
                    rows="3"
                    placeholder="Add any additional information or remarks..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Supporting Document (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <input
                      type="file"
                      onChange={handleDocumentChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="document-upload"
                    />
                    {documentPreview ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="fa-solid fa-file text-red-500 text-lg"></i>
                          <span className="text-sm font-medium text-gray-700">
                            {documentPreview}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDocument}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <i className="fa-solid fa-trash"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer flex flex-col items-center justify-center py-6"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-3xl mb-2"></i>
                        <p className="text-sm font-medium text-gray-700">
                          Drop your document here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <ButtonLoader /> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Submit
                      Resignation
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Please note: Once submitted, your resignation will be reviewed
                  by HR. You will receive an update on your request status.
                </p>
              </form>
            )}
          </div>
        </main>
      </section>
    </>
  );
};

export default Resignation;
