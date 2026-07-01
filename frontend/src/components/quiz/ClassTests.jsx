import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from '../../../axios.config';
import useAuthStore from "../../store/useAuthStore";

export function QuizDashboard() {
  const { user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();
  const { id } = useParams();

  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [runningQuizzes, setRunningQuizzes] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]); // Replaces attempted/past confusion
  const [missedQuizzes, setMissedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security Gate
  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);

  // Fetch and categorize cleanly
  useEffect(() => {
    if (!id || !user) return;

    async function fetchData() {
      try {
        const res = await api.get(`/classrooms/tests/${id}`);
        const quizzes = res.data || [];

        const now = new Date();
        const upcoming = [];
        const running = [];
        const completed = [];
        const missed = [];

        quizzes.forEach((quiz) => {
          const startTime = new Date(quiz.start_time);
          const endTime = new Date(quiz.end_time);

          if (quiz.attempted) {
            // If they took it, it's always completed regardless of time
            completed.push(quiz);
          } else if (now < startTime) {
            upcoming.push(quiz);
          } else if (now >= startTime && now <= endTime) {
            running.push(quiz);
          } else if (now > endTime) {
            // Quiz is over and they DID NOT take it
            if (role === "S") {
              missed.push(quiz);
            } else {
              // Teachers just see them as historic past/completed records
              completed.push(quiz);
            }
          }
        });

        setUpcomingQuizzes(upcoming);
        setRunningQuizzes(running);
        setCompletedQuizzes(completed);
        setMissedQuizzes(missed);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id, role, user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="shadow-md rounded-lg w-full mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {role === "T" ? "Teacher Dashboard" : "Student Dashboard"}
      </h1>

      {/* 1. Running Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Running Quizzes</h2>
        {runningQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {runningQuizzes.map((quiz) => (
              <li key={quiz.id} className="p-4 bg-blue-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                  </span>
                  {role === "T" ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      onClick={() => navigate(`/quiz/cancel/${quiz.id}`)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      onClick={() => navigate(`/quiz/attempt/${quiz.id}`)}
                    >
                      Attempt
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No active running quizzes.</p>
        )}
      </div>

      {/* 2. Upcoming Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Upcoming Quizzes</h2>
        {upcomingQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {upcomingQuizzes.map((quiz) => (
              <li key={quiz.id} className="p-4 bg-yellow-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleString()}
                  </span>
                  {role === "T" && (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      onClick={() => navigate(`/quiz/cancel/${quiz.id}`)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming quizzes.</p>
        )}
      </div>

      {/* 3. Completed / Historical Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {role === "T" ? "Past Quizzes" : "Completed Quizzes"}
        </h2>
        {completedQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {completedQuizzes.map((quiz) => (
              <li key={quiz.id} className="p-4 bg-green-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                  </span>
                  <button
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                    onClick={() => navigate(`/quiz/results/${quiz.id}`)}
                  >
                    {role === "T" ? "Review Submissions" : "View Results"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No completed quizzes found.</p>
        )}
      </div>

      {/* 4. Missed Quizzes (Students Only - No "Results" option) */}
      {role === "S" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Missed Quizzes</h2>
          {missedQuizzes.length > 0 ? (
            <ul className="space-y-4">
              {missedQuizzes.map((quiz) => (
                <li key={quiz.id} className="p-4 bg-red-50 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                    </span>
                    <button
                      className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                      onClick={() => navigate(`/classroom/${id}/quiz/missed-details/${quiz.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Great job! You haven't missed any quizzes.</p>
          )}
        </div>
      )}

      {/* Teacher Creation Tray */}
      {role === "T" && (
        <div className="mt-8 text-center">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            onClick={() => navigate("create-quiz/")}
          >
            Create Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizDashboard;