import { useState } from "react";
import { useNavigate } from "react-router-dom";
const CreateExamForm = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const navigate  = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    // onSubmit({ title, duration, totalMarks, numQuestions });
    navigate("../create-quiz");
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Create Exam</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block font-medium">Exam Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block font-medium">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block font-medium">Total Marks</label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block font-medium">Number of Questions</label>
          <input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
};

export default CreateExamForm;
