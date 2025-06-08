import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
export function QuizDashboard({ role }) {
  const navigate = useNavigate();
  const upcomingQuizzes = [
    { title: "React Basics", date: "Feb 10" },
    { title: "Data Structures", date: "Feb 15" },
  ];

  const completedQuizzes = [
    { title: "JavaScript Quiz", date: "Feb 1" },
    { title: "HTML & CSS", date: "Jan 25" },
  ];

  return (
    <div className=" shadow-md rounded-lg w-full  mx-auto ">
      <Outlet/>
    </div>
  );
}

function App() {
  return <QuizDashboard role="teacher" />;
}

export default App;