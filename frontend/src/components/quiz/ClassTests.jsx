import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../axios.config';
import { useParams } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export function QuizDashboard() {
  const { user } = useAuthStore();
  const role = user?.role;
  const navigate = useNavigate();
  const { id } = useParams();

  // State to store quizzes
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [runningQuizzes, setRunningQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [pastQuizzes, setPastQuizzes] = useState([]);
  const [missedQuizzes, setMissedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch quizzes from the backend
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/classrooms/tests/${id}`);
        // console.log(res.data);

        const quizzes = res.data || [];

        // Categorize quizzes into upcoming, running, attempted, past, and missed
        const now = new Date()
        const upcoming = [];
        const running = [];
        const attempted = [];
        const past = [];
        const missed = [];

        quizzes.forEach((quiz) => {
          const startTime = new Date(quiz.start_time)
          const endTime = new Date(quiz.end_time)

          if (quiz.attempted) {
            // Quiz is attempted
            attempted.push(quiz);
          } else if (now < startTime) {
            // Quiz is upcoming
            upcoming.push(quiz);
          } else if (now >= startTime && now <= endTime) {
            // Quiz is running
            running.push(quiz);
          } else if (now > endTime) {
            // Quiz is past
            past.push(quiz);
            if (role === "S" && !quiz.attempted) {
              // Quiz is missed by the student
              missed.push(quiz);
            }
          }
        });

        setUpcomingQuizzes(upcoming);
        setRunningQuizzes(running);
        setAttemptedQuizzes(attempted);
        setPastQuizzes(past);
        setMissedQuizzes(missed);
        // console.log("Upcoming Quizzes:", res.data);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, role]);

  // Handle quiz attempt
  const handleAttemptQuiz = (quizId) => {
    navigate(`/quiz/attempt/${quizId}`); // Navigate to the quiz attempt page
  };
  if(!user){
    navigate("/signin");
  }
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="shadow-md rounded-lg w-full mx-auto p-6 bg-white  ">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {role === "T" ? "Teacher Dashboard" : "Student Dashboard"}
      </h1>

      {/* Running Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Running Quizzes</h2>
        {runningQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {runningQuizzes.map((quiz, index) => (
              <li
                key={index}
                className="p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                  </span>
                  {role === "T" ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors duration-200"
                      onClick={() => {
                        console.log("Cancel quiz:", quiz.id);
                      }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => handleAttemptQuiz(quiz.id)}
                    >
                      Attempt
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No running quizzes.</p>
        )}
      </div>

      {/* Upcoming Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Upcoming Quizzes</h2>
        {upcomingQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {upcomingQuizzes.map((quiz, index) => (
              <li
                key={index}
                className="p-4 bg-yellow-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleString()}
                  </span>
                  {role === "T" ? (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors duration-200"
                      onClick={() => {
                        console.log("Cancel quiz:", quiz.id);
                      }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm cursor-not-allowed"
                      disabled
                    >
                      Attempt
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

      {/* Attempted Quizzes (for Students) */}
      {role === "S" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Attempted Quizzes</h2>
          {attemptedQuizzes.length > 0 ? (
            <ul className="space-y-4">
              {attemptedQuizzes.map((quiz, index) => (
                <li
                  key={index}
                  className="p-4 bg-green-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                    </span>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                      onClick={() => {
                        navigate(`/quiz/results/${quiz.id}`);
                      }}
                    >
                      View Results
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No attempted quizzes.</p>
          )}
        </div>
      )}

      {/* Past Quizzes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Past Quizzes</h2>
        {pastQuizzes.length > 0 ? (
          <ul className="space-y-4">
            {pastQuizzes.map((quiz, index) => (
              <li
                key={index}
                className="p-4 bg-purple-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                  </span>
                  {role === "T" ? (
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                      onClick={() => {
                        console.log("Review quiz:", quiz.id);
                      }}
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                      onClick={() => {
                        console.log("View results for quiz:", quiz.id);
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No past quizzes.</p>
        )}
      </div>

      {/* Missed Quizzes (for Students) */}
      {role === "S" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Missed Quizzes</h2>
          {missedQuizzes.length > 0 ? (
            <ul className="space-y-4">
              {missedQuizzes.map((quiz, index) => (
                <li
                  key={index}
                  className="p-4 bg-red-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {quiz.title} - {new Date(quiz.start_time).toLocaleDateString()}
                    </span>
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                      onClick={() => {
                        console.log("View missed quiz:", quiz.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No missed quizzes.</p>
          )}
        </div>
      )}

      {/* Create Quiz Button for Teachers */}
      {role === "T" && (
        <div className="mt-8 text-center">
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
            onClick={() => {
              navigate("create-quiz/");
            }}
          >
            Create Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizDashboard;