import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import api from "../../../axios.config";
import useAuthStore from '../../store/useAuthStore';

const SettingsPageCombined = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore((state) => state);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const data = api.get('tests/list_question_bank/')
      .then((response) => {
        console.log(response.data);
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching question bank:", error);
        
      });


  },[])

  const handleChangepassword = async () => {

    setLoading(true);
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      setLoading(false);
      return;
    }
   

    const toastId = toast.loading("Changing password...");
    
    try {
      const response = await api.post("/auth/change_password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.update(toastId, {
        render: "Password changed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        hideProgressBar: false,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      
      let errorMessage = "Failed to change password";
      if (error.response) {
        // Handle different HTTP status codes
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid request";
        } else if (error.response.status === 401) {
          errorMessage = "Current password is incorrect";
        } else if (error.response.status === 500) {
          errorMessage = "Server error, please try again later";
        }
      }

      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        hideProgressBar: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      {/* Change Password Section */}
      <div className="bg-white rounded-md shadow p-6 mb-4">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <div className="mb-4">
          <label htmlFor="current-password" className="block text-gray-700 text-sm font-bold mb-2">
            Current Password:
          </label>
          <input 
            type="password" 
            id="current-password" 
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-password" className="block text-gray-700 text-sm font-bold mb-2">
            New Password:
          </label>
          <input 
            type="password" 
            id="new-password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-bold mb-2">
            Confirm New Password:
          </label>
          <input 
            type="password" 
            id="confirm-password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          />
        </div>
        <button 
          onClick={handleChangepassword} 
          disabled={loading}
          className={`${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
      {/*show question bank to teachers */}
      {user.role === "teacher" && (
        <div className="bg-white rounded-md shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Question Bank</h2>
          <p className="text-gray-700">Manage your question bank here.</p>
          <QuestionBankList questions={questions} />
        </div>
      )}

      
    </div>
  );
};

const QuestionBankList = ({ questions }) => {
  // Convert UTC to IST for display
  

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Question Bank ({questions.length})</h2>
      
      <div className="overflow-y-auto max-h-[70vh] pr-2">
        {questions.map((question) => (
          <div 
            key={question.id} 
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => console.log('Selected:', question.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{question.text}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>Marks: {question.marks}</span>
                  <span>Type: {question.type}</span>
                  <span>Difficulty: {question.difficulty}</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {question.created_at}
              </span>
            </div>
            
            {question.type === 'MCQ' && (
              <ul className="mt-3 space-y-1 pl-4">
                {question.options.map((option, i) => (
                  <li 
                    key={i} 
                    className={`text-sm ${i === question.correct_answer ? 'text-green-600 font-medium' : 'text-gray-600'}`}
                  >
                    {i + 1}. {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPageCombined;