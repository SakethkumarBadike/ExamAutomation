import { IoIosMenu } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import Sidebar from "./SideBar";
import api from "../../axios.config";
import ClassroomCard from "./classroom/ClassRoomCard";
import { useEffect, useState } from "react";
import useClassroom from "../store/useClassroom";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New state for loading
  const { user,checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const { updatedClass, setUpdatedClass } = useClassroom();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true); // Set loading to true when fetching starts
      let res = null;
      if(!user){
        setIsLoading(false);
        return;
      }
      try {
        if (user.role === 'T') {
          res = await api.get('/classrooms/');
        } else {
          res = await api.get('/classrooms/student/enrollments/');
        }
        setData(res.data);
        console.log(res.data);
        setUpdatedClass(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading to false when fetching is done
      }
    }

    if (user) {
      fetchData();
    } else {
      setIsLoading(false); // If no user, set loading to false
    }
  }, [updatedClass]);
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to sign-in...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if(!Array.isArray(data) || data.length === 0) {
    return <div className="h-screen w-full flex justify-center items-center">
      <h1 className="text-gray-300 text-6xl font-extrabold">No Classrooms</h1>
    </div>;
  }
  return (
    <div className="h-full w-full">  {/* changed height from screen to full*/}
      <div className="overflow-y-auto">
        <div className="flex flex-wrap gap-6 p-6">
          {data?.map((item) => (
            <ClassroomCard
              title={item.name}
              teacher={item.creator_name}
              key={item.code}
              id={item.code}
              
            />
          ))}
        </div>
      </div>
    </div>
  );

  
}