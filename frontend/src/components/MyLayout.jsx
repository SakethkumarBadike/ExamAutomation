import { IoIosMenu } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import Sidebar from "./SideBar";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import { useEffect, useState } from "react";
import api from "../../axios.config";
import useClassroom from "../store/useClassroom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { use } from "react";


export default function MyLayout() {
  const navigate = useNavigate();
  const { user ,checkAuth} = useAuthStore();
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [data, setData] = useState("");
  const { setUpdatedClass } = useClassroom();
  const [showSideBar, setShowSideBar] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

  

  // Handle create/join classroom
  async function handleOnClick() {

    try {
      if(!userLoggedIn){
        navigate('/signin');
        return;
      }
      if (user.role === "S") {
        //${import.meta.env.VITE_BASE_URL}
        await api.post(`/classrooms/join/${data}/`);
      } else {
        await api.post(`/classrooms/`, {
          name: data,
        });
      }
      setIsToastVisible(false);
      setUpdatedClass(true);
      navigate("/");
    } catch (e) {
      console.log(e);
      let errorMessage = "An error occurred.";

      if (e.response && e.response.data && e.response.data.message) {
        errorMessage = e.response.data.message;
      } else if (e.message) {
        errorMessage = e.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setData("");
  }

  useEffect(() => {
    async function checkUserAuth() {
      const isAuthenticated = await checkAuth();
      console.log("User is authenticated:", isAuthenticated);
      if (isAuthenticated.status===200) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
        navigate('/signin'); // Redirect to sign-in if not authenticated
      }
    }
    checkUserAuth();
  },[])

if(user){
  return (
    <div className="h-screen w-full flex flex-col">
      {/* ✅ Navbar */}
      <div className="p-5 flex items-center border-b border-gray-400 justify-between bg-white w-full fixed top-0 z-50">
        <div className="flex items-center">
          {showSideBar ? (
            <RxCross1
              className="w-7 h-7 mr-1 cursor-pointer"
              onClick={() => setShowSideBar(false)}
            />
          ) : (
            <IoIosMenu
              className=" md:hidden w-7 h-7 mr-1 cursor-pointer"
              onClick={() => setShowSideBar(true)}
            />
          )}
          <h4 className="font-[poppins] font-medium">NIT ANP</h4>
        </div>
        <div className="flex items-center space-x-5 cursor-pointer bg-blue-500 px-3 rounded-xl font-medium text-white" onClick={() => setIsToastVisible(true)}>
          {user?.role === "T" && <h2>Create Classroom</h2>}
          {user?.role === "S" && <h2>Join Classroom</h2>}
          
        </div>
      </div>

      {/* ✅ Wrapper for Sidebar + Content */}
      <div className="flex flex-1 pt-[60px]"> {/* Adjusted padding-top to match navbar height */}
        {/* ✅ Sidebar */}
        <div
          className={`hidden md:flex border-r border-gray-500 w-1/6 p-2  h-[calc(100vh-70px)] fixed left-0 top-[70px] overflow-y-auto transition-transform duration-300 ease-in-out 
          `}
        >
          <Sidebar/>
        </div>
        {showSideBar && (
          <div
            className="md:hidden border-r border-gray-500 pt-2.5 h-[calc(100vh-70px)] fixed left-0 top-[70px] overflow-y-auto bg-white shadow-lg transition-transform duration-300 ease-in-out"
            style={{ transform: showSideBar ? "translateX(0)" : "translateX(-100%)" }}
          >
            <Sidebar  />
          </div>
        )}

        {/* ✅ Main Content */}
        <div className="flex-1 md:ml-[16.67%] overflow-y-auto">
          <Outlet userLoggedIn={userLoggedIn}/>
          <ToastContainer />
        </div>
      </div>

      {/* ✅ Blurred Background + Centered Toast */}
      {isToastVisible && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50"
          onClick={() => setIsToastVisible(false)} // Click outside to close
        >
          <div
            className="bg-white shadow-xl p-6 rounded-lg border w-96 text-center"
            onClick={(e) => e.stopPropagation()} // Prevent close on click inside
          >
            {user.role === "T" && <h3 className="text-xl font-semibold">Enter Class Name</h3>}
            {user.role === "S" && <h3 className="text-xl font-semibold">Enter Class Code</h3>}
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full mt-4 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder={user.role === "T" ? "Enter Class Name" : "Enter Class Code"}
            />
            <button
              onClick={handleOnClick}
              className="w-full bg-green-500 text-white mt-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              {user.role === "T" ? "Create" : "Join"}
            </button>
          </div>
        </div>
      )}
    </div>
  );

}


return (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
    <p className="text-lg text-gray-600">Redirecting to sign-in...</p>
  </div>
);
}