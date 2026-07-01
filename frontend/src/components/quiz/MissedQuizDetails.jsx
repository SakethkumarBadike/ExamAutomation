import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../axios.config";

export function MissedQuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        // Replace with your actual quiz details endpoint
        const res = await api.get(`/tests/details/${quizId}`);
        setQuiz(res.data);
      } catch (error) {
        console.error("Failed to load missed quiz info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{quiz?.title || "Quiz Expired"}</h1>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
          Missed
        </span>
      </div>

      <p className="text-gray-600 mb-6">
        {quiz?.description || "You did not attempt this quiz within the allocated timeframe."}
      </p>

      <div className="bg-gray-50 p-4 rounded-md space-y-3 mb-6 text-sm text-gray-700">
        <div><strong>Opened:</strong> {quiz ? new Date(quiz.start_time).toLocaleString() : "N/A"}</div>
        <div><strong>Closed:</strong> {quiz ? new Date(quiz.end_time).toLocaleString() : "N/A"}</div>
        <div><strong>Your Grade:</strong> <span className="text-red-600 font-bold">0% (Absent)</span></div>
      </div>

      {/* <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition"
        >
          Back to Dashboard
        </button>
        <a
          href={`mailto:teacher@example.com?subject=Inquiry regarding missed quiz: ${quiz?.title}`}
          className="flex-1 text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Contact Instructor
        </a>
      </div> */}
    </div>
  );
}