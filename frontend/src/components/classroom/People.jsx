import api from "../../../axios.config";
import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const PeopleSection = () => {
  const { id } = useParams();
  const [peopleData, setPeopleData] = useState({
    teacher: [],
    students: [],
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/classrooms/people/${id}/`);
        setPeopleData(response.data);
      } catch (error) {
        console.error("Error fetching people data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Teachers Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Teachers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PersonCard
            key={peopleData.teacher.id}
            role={"Teacher"}
            name={peopleData.teacher.username}
          />
        </div>
      </div>

      {/* Students Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Students</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {peopleData.students.map((person) => (
            <PersonCard key={person.id} name={person.username} role={"Student"} />
          ))}
        </div>
      </div>
    </div>
  );
};

const PersonCard = ({ name, role }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 hover:shadow-lg transition duration-300">
      
      <div>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-gray-500">{role}</p>
      </div>
    </div>
  );
};

export default PeopleSection;