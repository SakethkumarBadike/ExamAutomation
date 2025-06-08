import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useParams ,useNavigate} from "react-router-dom";
export default function ClassRoom() {
  
  const {id}= useParams();
  console.log(id)
  return (
    <div className="w-full">
    <div className="border-b border-gray-500 h-16 w-full flex items-center bg-white fixed justify-center gap-25">
      <NavLink 
        to={`/classroom/${id}/quizes`} 
        className={({ isActive }) => 
          `hover:border-black border-b border-transparent transition ease-in duration-300 ${isActive && "text-blue-500 border-blue-500"}`
        }
      >
        Quiz
      </NavLink>
      <NavLink 
        to={`/classroom/${id}/stream`}
        className={({ isActive }) => 
          `hover:border-black border-b border-transparent transition ease-in duration-300 ${isActive && "text-blue-500 border-blue-500"}`
        }
      >
        Stream
      </NavLink>
      <NavLink 
        to={`/classroom/${id}/people`}
        className={({ isActive }) => 
          `hover:border-black border-b border-transparent transition ease-in duration-300 ${isActive && "text-blue-500 border-blue-500"}`
        }
      >
        People
      </NavLink>
    </div>
    <div className="pt-16 w-full"><Outlet /></div>
    
  </div>
  
  );
}