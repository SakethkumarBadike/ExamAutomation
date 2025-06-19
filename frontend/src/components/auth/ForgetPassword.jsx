import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../axios.config';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCooldown, setIsCooldown] = useState(false);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds cooldown

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await api.post('auth/password_reset/', { email });
      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setIsLoading(false);
      setIsCooldown(true);
      setTimeLeft(30); // Reset timer
    }
  };

  // useEffect(() => {
  //   let timer;
  //   if (isCooldown && timeLeft > 0) {
  //     timer = setInterval(() => {
  //       setTimeLeft((prev) => prev - 1);
  //     }, 1000);
  //   } else if (timeLeft === 0) {
  //     setIsCooldown(false);
  //   }
  //   return () => clearInterval(timer);
  // }, [isCooldown, timeLeft]);



  useEffect(() => {
  let timer;
  
  if (isCooldown) {
    timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  
  return () => clearInterval(timer); // Cleanup runs only when `isCooldown` changes or unmount
}, [isCooldown]); // ✅ Now depends only on `isCooldown`

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
          Forgot Password
        </h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
        
        <div className="flex items-center justify-center gap-2 mb-2">
          {message && <p className="text-blue-500 text-sm text-center">{message}</p>}
          {isCooldown && (
            <div className="flex items-center bg-blue-100 px-2 py-1 rounded">
              <span className="text-blue-600 font-mono">00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your email"
              disabled={isLoading || isCooldown}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition duration-300 ${
              isCooldown 
                ? "bg-blue-200 text-gray-500 cursor-not-allowed" 
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={isLoading || isCooldown}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
          
          <p className="text-center text-gray-600 mt-4">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/signin')} 
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

export default ForgotPassword;