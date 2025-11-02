import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX, FiUpload, FiCalendar, FiDownload } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncementById,
} from "../../../services/announcement.service";
import { setFetchFlag } from "../../../reducers/announcement.reducer";
import { announcementSchema } from "../../../validations";
import { toast } from "react-toastify";

const AnnouncementModal = ({ isOpen, onClose, action, announcement }) => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      category: "General",
      description: "",
      startDate: "",
      endDate: "",
      priority: "Medium",
      attachment: null,
    },
  });

  const announcementCategories = ["General", "Policy", "Event", "Training", "Urgent", "Benefits", "Recognition"];
  const priorityLevels = ["Low", "Medium", "High", "Critical"];

  // Populate form when editing
  useEffect(() => {
    if (action === "edit" && announcement) {
      setValue("title", announcement.title || "");
      setValue("category", announcement.category || "General");
      setValue("description", announcement.description || "");
      setValue(
        "startDate",
        announcement.startDate
          ? new Date(announcement.startDate).toISOString().split("T")[0]
          : ""
      );
      setValue(
        "endDate",
        announcement.endDate
          ? new Date(announcement.endDate).toISOString().split("T")[0]
          : ""
      );
      setValue("priority", announcement.priority || "Medium");
    } else if (action === "create") {
      reset({
        title: "",
        category: "General",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        attachment: null,
      });
    }
  }, [action, announcement, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("startDate", data.startDate);
      formData.append("endDate", data.endDate);
      formData.append("priority", data.priority);

      // Handle file upload
      if (data.attachment && data.attachment[0]) {
        formData.append("document", data.attachment[0]);
        setUploading(true);
      }

      if (action === "create") {
        await dispatch(createAnnouncement(formData)).unwrap();
        toast.success("Announcement created successfully!");
      } else if (action === "edit") {
        await dispatch(
          updateAnnouncement({ id: announcement._id, data: formData })
        ).unwrap();
        toast.success("Announcement updated successfully!");
      }

      dispatch(setFetchFlag(true));
      onClose();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error(error.message || "Failed to save announcement");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = action === "view";
  const modalTitle =
    action === "create"
      ? "Add Announcement"
      : action === "edit"
      ? "Edit Announcement"
      : "View Announcement";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <BsMegaphone className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modalTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <FiX size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  {...register("title")}
                  disabled={isReadOnly}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  placeholder="Enter announcement title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category")}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  >
                    {announcementCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority *
                  </label>
                  <select
                    {...register("priority")}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  >
                    {priorityLevels.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                  )}
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiCalendar className="inline mr-1" />
                    Start Date *
                  </label>
                  <input
                    type="date"
                    {...register("startDate")}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiCalendar className="inline mr-1" />
                    End Date *
                  </label>
                  <input
                    type="date"
                    {...register("endDate")}
                    disabled={isReadOnly}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  disabled={isReadOnly}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 resize-none"
                  placeholder="Enter detailed description of the announcement"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* File Upload */}
              {!isReadOnly && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUpload className="inline mr-1" />
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    {...register("attachment")}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (Max: 5MB)
                  </p>
                </div>
              )}

              {/* Show existing attachment in view/edit mode */}
              {(action === "view" || action === "edit") && announcement?.attachmentUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Attachment
                  </label>
                  <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <FiDownload className="text-blue-500" />
                    <a
                      href={announcement.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 underline"
                    >
                      Download Attachment
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                >
                  {isSubmitting || uploading
                    ? "Saving..."
                    : action === "create"
                    ? "Create Announcement"
                    : "Update Announcement"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;