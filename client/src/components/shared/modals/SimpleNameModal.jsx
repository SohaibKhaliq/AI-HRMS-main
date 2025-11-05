import React, { useEffect, useState } from "react";
import ValidatedInput from "../../ui/ValidatedInput";

const SimpleNameModal = ({ title, action = "create", defaultValue = "", onSubmit, onClose }) => {
  const [name, setName] = useState("");
  const isView = action === "view";

  useEffect(() => {
    setName(defaultValue || "");
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isView) onSubmit({ name });
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white text-black w-[90%] sm:max-w-md p-6 border border-gray-300 rounded-lg shadow-xl space-y-5">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="font-bold text-gray-600">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        <div className="w-full">
          <ValidatedInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            validationType="name"
            validationOptions={{ fieldName: title || "Name" }}
            label={title || "Name"}
            disabled={isView}
            required
            className="w-full bg-[#EFEFEF] text-sm p-[17px] rounded-full focus:outline focus:outline-2 focus:outline-gray-700 font-medium"
          />
        </div>

        {!isView && (
          <div className="w-full flex justify-end">
            <button type="submit" className="bg-blue-500 w-full text-white text-sm p-4 font-semibold rounded-3xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400">
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SimpleNameModal;
