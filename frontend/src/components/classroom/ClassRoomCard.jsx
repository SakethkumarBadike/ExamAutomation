import { FaEllipsisV, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../../axios.config";
import useAuthStore from "../../store/useAuthStore";
import useClassroom from "../../store/useClassroom";
const ClassroomCard = ({ title ,teacher,id}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmToast, setConfirmToast ] = useState(null);
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
    setShowOptions(!showOptions);
  }

 async function handleDeleteConfirm() {
    await api.delete(`/classrooms/${id}/`);                                      // TODO:add Try Catch

    setUpdatedClass(true);
    showToast("Class deleted successfully!", "error");                          //TODO :user React Toast
      
    setConfirmToast(null);
  }

 async function handleExitConfirm() {
    await api.delete(`/classrooms/enrollments/${id}/`);   
    setUpdatedClass(true);                                   // TODO:add Try Catch
    showToast("You exited the class!", "info");
    setConfirmToast(null);
  }

  function handleDelete(e) {
    e.stopPropagation();
    setConfirmToast({ message: "Are you sure you want to delete this class?", onConfirm: ()=>{ 
      handleDeleteConfirm()} });
  }

  function handleExit(e) {
    e.stopPropagation();
    setConfirmToast({ message: "Are you sure you want to exit this class?", onConfirm: ()=>{
     
      handleExitConfirm()}
      
     });
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="relative w-full sm:w-80 h-52 rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-[1.03] hover:shadow-2xl">
     
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500"></div>

     
      <div className="absolute top-4 left-5 text-white">
        <h2 className="text-xl font-semibold font-[poppins] w-60 truncate">{title}</h2>

        <p className="text-sm opacity-80 font-[roboto]">{teacher}</p>
        <p>{id}</p>
      </div>

      {/* Floating Menu Icon */}
      <button className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 cursor-pointer" onClick={handleClick}>
        <FaEllipsisV />
      </button>

      {/* Options Toast */}
      {showOptions && (
        <div className="absolute top-12 right-4   bg-red-500 hover:bg-red-600 shadow-lg rounded-xl w-40 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
          {user.role=='T' ? (
            <button
              onClick={handleDelete}
              className="w-full text-white  py-2 rounded-md text-sm font-[roboto]"
            >
              <FaTrash className="inline mr-2" /> Delete Class
            </button>
          ) : (
            <button
              onClick={handleExit}
              className="w-full text-white  py-2 rounded-md text-sm font-[roboto]"
            >
              Exit Class
            </button>
          )}
        </div>
      )}

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg px-5 py-3 flex justify-between items-center rounded-b-2xl">
        <Link to={`/classroom/${id}/quizes`}>
          <p className="hover:text-blue-700 cursor-pointer text-gray-700 text-sm font-[roboto]">View Class</p>
        </Link>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-4 py-2 shadow-lg rounded-lg text-sm font-semibold text-white transition-opacity duration-300 animate-fade-in ${toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>{toast.message}</div>
      )}

      {/* Confirmation Toast */}
      {confirmToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg rounded-lg text-center w-80">
          <p className="text-gray-800 font-semibold">{confirmToast.message}</p>
          <div className="flex justify-around mt-4">
            <button onClick={() => setConfirmToast(null)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button onClick={confirmToast.onConfirm} className="px-4 py-2 bg-red-500 text-white rounded-md">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomCard;
