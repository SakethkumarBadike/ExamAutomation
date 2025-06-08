import { FaHome, FaBook, FaClipboardList, FaUsers, FaCog, FaSignOutAlt } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Cookies from "js-cookie";
import api from "../../axios.config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";


const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  

  const handleLogout = async () => {
    console.log("Logout clicked");
    const toastId = toast.loading("Logging out...");
    
    try {
      const refreshToken = Cookies.get('refresh_token');
      await api.post('auth/logout/', { refresh_token: refreshToken });
      
      // Clear tokens and auth state
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      logout();
      
      toast.update(toastId, {
        render: "Logged out successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false
      });
      
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.update(toastId, {
        render: "Logout failed. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false
      });
    }
  };

  return (
    <div className="w-full flex flex-col">
      <nav className="flex flex-col space-y-4">
        <NavLink to="/" className={({isActive}) => (isActive ? "text-blue-700" : "")}>
          <SidebarItem icon={<IoHome/>} text="HOME" />
        </NavLink>
        <NavLink to="/tests" className={({isActive}) => (isActive ? "text-blue-700" : "")}>
          <SidebarItem icon={<FaClipboardList />} text="Tests" />
        </NavLink>
        <NavLink to='/settings' className={({isActive}) => (isActive ? "text-blue-700" : "")}>
          <SidebarItem icon={<FaCog />} text="Settings" />
        </NavLink>
        
        <div onClick={handleLogout}>
          <SidebarItem icon={<FaSignOutAlt />} text="Logout" />
        </div>
      </nav>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, text }) => (
  <div className="w-full flex items-center space-x-3 p-3 hover:bg-gray-200 rounded cursor-pointer transition ease-in duration-100">
    <span className="text-xl">{icon}</span>
    <span className="font-roboto">{text}</span>
  </div>
);

export default Sidebar;