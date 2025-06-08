import React, { useEffect, useState } from "react";
import api from "../../../axios.config";
import { useParams } from "react-router-dom";

const StudentResults = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get(`tests/test-result/${id}/`);
        setResult(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
      console.log("Result data:", result);
    };
    
    fetchResults();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (!result) {
    return <div className="text-center py-8">No results found</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Test Result</h1>
      
      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-medium mb-2">{result.title}</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Score:</span>
            <span className="font-medium">
              {result.obtained_marks}/{result.total_marks}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Percentage:</span>
            <span className={`font-medium ${
              result.percentage >= 75 ? 'text-green-600' : 
              result.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {result.percentage}%
            </span>
          </div>

          <div className="flex justify-between">
            <span>Correct Answers:</span>
            <span className="text-green-600">{result.correct_answers}</span>
          </div>

          <div className="flex justify-between">
            <span>Wrong Answers:</span>
            <span className="text-red-600">{result.wrong_answers}</span>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default StudentResults;