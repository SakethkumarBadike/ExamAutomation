import { FaTrash, FaSignOutAlt,FaExternalLinkAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import api from "../../../axios.config";
import useAuthStore from "../../store/useAuthStore";
import useClassroom from "../../store/useClassroom";
import { useNavigate } from "react-router-dom";

const ClassroomCard = ({ title, teacher, id }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmToast, setConfirmToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuthStore();
  const { setUpdatedClass } = useClassroom();

  useEffect(() => {
    if (showOptions) {
      const handleClickOutside = () => setShowOptions(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showOptions]);

  function handleClick(e) {
    e.stopPropagation();
    if (actionLoading) {
      return;
    }
    setShowOptions(!showOptions);
  }

  async function handleDeleteConfirm() {
    setActionLoading(true);

    try {
      await api.delete(`/classrooms/${id}/`);
      setUpdatedClass(true);
      showToast("Class deleted successfully!", "error");
      setConfirmToast(null);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExitConfirm() {
    setActionLoading(true);

    try {
      await api.delete(`/classrooms/enrollments/${id}/`);
      setUpdatedClass(true);
      showToast("You exited the class!", "info");
      setConfirmToast(null);
    } finally {
      setActionLoading(false);
    }
  }

  function handleDelete(e) {
    e.stopPropagation();
    setConfirmToast({
      message: "Are you sure you want to delete this class?",
      onConfirm: () => {
        handleDeleteConfirm();
      },
    });
  }

  function handleExit(e) {
    e.stopPropagation();
    setConfirmToast({
      message: "Are you sure you want to exit this class?",
      onConfirm: () => {
        handleExitConfirm();
      },
    });
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div
      className="relative
        rounded-xl
        p-6
        w-full max-w-sm
        cursor-default
        flex flex-col justify-between
        border border-indigo-300
        shadow-lg
        transition-shadow duration-300 transform hover:shadow-xl hover:scale-[1.03]
        bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100"
      role="group"
      aria-label={`Classroom card for ${title}`}
    >
      {/* Top Info */}
      <div>
        <h3
          className="text-2xl font-semibold text-indigo-900 truncate"
          title={title}
        >
          {title}
        </h3>
        <p className="text-sm text-indigo-700 mt-1 truncate" title={teacher}>
          {teacher}
        </p>
      </div>

      {/* Bottom Info & Controls */}
      <div className="flex justify-between items-center mt-6">
        <span className="text-xs font-mono text-indigo-400 select-text">{id}</span>

        {/* Open Class button */}
        <button
          onClick={() => navigate(`/classroom/${id}/quizes`)}
          className="flex cursor-pointer items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="button"
          aria-label={`Open classroom ${title}`}
        >
          <span>Open Class</span>
          <FaExternalLinkAlt />
        </button>

        {/* Options button */}
        <div className="relative ml-3" onClick={(e) => e.stopPropagation()}>
          <button
            aria-label="Options"
            onClick={handleClick}
            className="p-2 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            disabled={actionLoading}
            type="button"
          >
            <svg
              className="w-5 h-5 text-indigo-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <circle cx="3" cy="10" r="2" />
              <circle cx="10" cy="10" r="2" />
              <circle cx="17" cy="10" r="2" />
            </svg>
          </button>

          {/* Dropdown */}
          {showOptions && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5
               focus:outline-none z-10"
            >
              {user.role === "T" ? (
                <button
                  onClick={handleDelete}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={actionLoading}
                  type="button"
                >
                  <FaTrash className="mr-2" /> Delete Class
                </button>
              ) : (
                <button
                  onClick={handleExit}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={actionLoading}
                  type="button"
                >
                  <FaSignOutAlt className="mr-2" /> Exit Class
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-sm font-semibold text-white ${
            toast.type === "error" ? "bg-red-500" : "bg-indigo-600"
          } shadow-lg animate-fade-in`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmToast && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 max-w-full text-center">
            <p className="mb-4 text-gray-900 font-semibold">{confirmToast.message}</p>
            <div className="flex justify-around">
              <button
                onClick={() => setConfirmToast(null)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmToast.onConfirm}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{user.role === "T" ? "Deleting..." : "Exiting..."}</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomCard;
