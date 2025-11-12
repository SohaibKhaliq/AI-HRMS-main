import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPromotion,
  updatePromotion,
} from "../../../services/promotion.service";
import PropTypes from "prop-types";

const PromotionModal = ({ action, onClose, promotion }) => {
  const dispatch = useDispatch();
  const { employees } = useSelector(
    (state) => state.employee || { employees: [] }
  );
  const { designations } = useSelector(
    (state) => state.designation || { designations: [] }
  );

  const [formData, setFormData] = useState({
    employee: "",
    previousDesignation: "",
    newDesignation: "",
    promotionDate: "",
    effectiveDate: "",
    salaryAdjustment: 0,
    status: "Pending",
    documentUrl: "",
    remarks: "",
  });

  const [documentFile, setDocumentFile] = useState(null);
  // uploading state removed (unused)

  useEffect(() => {
    if ((action === "update" || action === "view") && promotion) {
      setFormData({
        employee: promotion.employee?._id || "",
        previousDesignation: promotion.previousDesignation?._id || "",
        newDesignation: promotion.newDesignation?._id || "",
        promotionDate: promotion.promotionDate
          ? new Date(promotion.promotionDate).toISOString().slice(0, 10)
          : "",
        effectiveDate: promotion.effectiveDate
          ? new Date(promotion.effectiveDate).toISOString().slice(0, 10)
          : "",
        salaryAdjustment: promotion.salaryAdjustment || 0,
        status: promotion.status || "Pending",
        documentUrl: promotion.documentUrl || "",
        remarks: promotion.remarks || "",
      });
    }
  }, [action, promotion]);

  // When an employee is selected, auto-fill the previous designation if available
  useEffect(() => {
    if (!formData.employee) return;
    const emp = employees?.find((e) => e._id === formData.employee);
    if (emp) {
      const prevDesigId = emp.designation?._id || emp.designation || "";
      if (prevDesigId && prevDesigId !== formData.previousDesignation) {
        setFormData((prev) => ({ ...prev, previousDesignation: prevDesigId }));
      }
    }
  }, [formData.employee, employees, formData.previousDesignation]);

  const isView = action === "view";

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setDocumentFile(file);
    } else {
      alert("Please select a valid PDF file");
      e.target.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("employee", formData.employee);
    submitData.append("previousDesignation", formData.previousDesignation);
    submitData.append("newDesignation", formData.newDesignation);
    submitData.append("promotionDate", formData.promotionDate);
    submitData.append("effectiveDate", formData.effectiveDate);
    submitData.append("salaryAdjustment", formData.salaryAdjustment);
    submitData.append("status", formData.status);
    submitData.append("remarks", formData.remarks);

    if (documentFile) {
      submitData.append("document", documentFile);
    } else if (formData.documentUrl) {
      submitData.append("documentUrl", formData.documentUrl);
    }

    if (action === "update") {
      dispatch(updatePromotion({ id: promotion._id, promotion: submitData }));
    } else {
      dispatch(createPromotion(submitData));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-black w-[90%] sm:max-w-2xl p-6 border border-gray-300 rounded-lg shadow-xl space-y-4 my-4"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold">
            {isView ? "View" : action === "create" ? "Create" : "Update"}{" "}
            Promotion
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Employee *</label>
            <select
              name="employee"
              value={formData.employee}
              onChange={handleChange}
              disabled={isView}
              required
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            >
              <option value="">--- Select Employee ---</option>
              {employees?.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Previous Designation *
            </label>
            <select
              name="previousDesignation"
              value={formData.previousDesignation}
              onChange={handleChange}
              disabled={isView}
              required
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            >
              <option value="">--- Select ---</option>
              {designations?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">New Designation *</label>
            <select
              name="newDesignation"
              value={formData.newDesignation}
              onChange={handleChange}
              disabled={isView}
              required
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            >
              <option value="">--- Select ---</option>
              {designations?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Salary Adjustment</label>
            <input
              type="number"
              name="salaryAdjustment"
              value={formData.salaryAdjustment}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Promotion Date *</label>
            <input
              type="date"
              name="promotionDate"
              value={formData.promotionDate}
              onChange={handleChange}
              disabled={isView}
              required
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Effective Date *</label>
            <input
              type="date"
              name="effectiveDate"
              value={formData.effectiveDate}
              onChange={handleChange}
              disabled={isView}
              required
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isView}
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Document (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isView}
              className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm cursor-pointer"
            />
            {documentFile && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {documentFile.name}
              </p>
            )}
            {!documentFile && formData.documentUrl && (
              <p className="text-xs text-blue-600 mt-1">
                📄 Current: {formData.documentUrl}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            disabled={isView}
            rows={3}
            placeholder="Additional remarks"
            className="w-full p-2 bg-[#EFEFEF] rounded-lg text-sm"
          />
        </div>

        {!isView && (
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-full"
            >
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PromotionModal;

PromotionModal.propTypes = {
  action: PropTypes.string,
  onClose: PropTypes.func,
  promotion: PropTypes.object,
};
