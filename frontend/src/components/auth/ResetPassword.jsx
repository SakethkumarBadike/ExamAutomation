import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../axios.config';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { uid, token } = useParams(); // Get uid and token from URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // if (password.length < 8) {
    //   setError("Password must be at least 8 characters");
    //   return;
    // }

    setIsLoading(true);

    try {
        console.log("Resetting password for UID:", uid, "with token:", token);
      await api.post('/auth/password_reset_confirm/', {
        uid,
        token,
        new_password: password,
        confirm_password: confirmPassword
      });
      setMessage("Password reset successfully!");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Reset Password
        </h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
        {message && <p className="text-green-500 text-sm text-center mb-2">{message}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-gray-600">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Confirm new password"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
          
          <p className="text-center text-gray-600 mt-4">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-indigo-500 hover:underline focus:outline-none"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;