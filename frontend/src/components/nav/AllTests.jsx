import React, { useEffect, useState } from "react";
import { FaEye, FaPlay, FaClock } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import api from "../../../axios.config";
import { useNavigate } from "react-router-dom";
const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get("/tests/all-tests/");
        setQuizzes(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setError("Failed to load quizzes. Please try again later.");
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  
  const categorizeQuizzes = (quizzes) => {
    const now = new Date();
    return quizzes.reduce((acc, quiz) => {
      const start = new Date(quiz.start_time)
      const end = new Date(quiz.end_time)

      if (now >= start && now <= end) {
        acc.running.push(quiz);
      } else if (now < start) {
        acc.upcoming.push(quiz);
      } else {
        acc.completed.push(quiz);
      }
      return acc;
    }, { running: [], upcoming: [], completed: [] });
  };

  
  const calculateProgress = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const totalDuration = start - now;
    const elapsedDuration = now - start;
    return Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
  };

  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const categorizedQuizzes = categorizeQuizzes(quizzes);
  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        Your Quizzes
      </h2>

      {quizzes.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No quizzes available right now.
        </p>
      ) : (
        <div className="space-y-10">
          {/* Running Tests Section */}
          {categorizedQuizzes.running.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-4">
                Running Tests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedQuizzes.running.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    status="running"
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tests Section */}
          {categorizedQuizzes.upcoming.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-4">
                Upcoming Tests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedQuizzes.upcoming.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    status="upcoming"
                    formatDate={formatDate}
                    calculateProgress={calculateProgress}
                  />
                ))}
              </div>
            </div>
          )}

         
          {categorizedQuizzes.completed.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-600 mb-4">
                Completed Tests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorizedQuizzes.completed.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    status="completed"
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const QuizCard = ({ quiz, status, formatDate, calculateProgress }) => {
  const progress = status === "upcoming" ? calculateProgress(quiz.start_time) : 0;
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{quiz.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Classroom: {quiz.classroom[0]?.name || "N/A"}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {formatDate(quiz.start_time)} - {formatDate(quiz.end_time)}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Duration: {quiz.duration} minutes
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Total Marks: {quiz.total_marks}
        </p>
        <p className="text-sm text-gray-600 mt-1 truncate">
          {quiz.description}
        </p>
      </div>

      {status === "upcoming" && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Starts in {Math.ceil((new Date(quiz.start_time) - new Date()) / (1000 * 60 * 60))} hours
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        {status === "completed" ? (
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            title="View Results"
            onClick={()=>navigate('/quiz/results/'+quiz.id)}
          >
            <FaEye /> Results
          </button>
        ) : status === "running" ? (
          <NavLink
            to={`/quiz/attempt/${quiz.id}`}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            title="Attempt Test"
          >
            <FaPlay /> Attempt
          </NavLink>
        ) : (
          <span className="flex items-center gap-2 text-sm text-yellow-600">
            <FaClock /> Upcoming
          </span>
        )}
        <NavLink
          to={`/classroom/${quiz.classroom[0]?.code}/quizes`}
          className="text-sm text-blue-600 hover:underline"
        >
          Go to Classroom
        </NavLink>
      </div>
    </div>
  );
};

export default QuizList;