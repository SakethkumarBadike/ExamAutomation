import { useState } from "react";
import api from "../../../axios.config"; // Adjust the import path if needed

const AddClassForm = () => {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true); 

        try {
            await api.post("/classrooms/", { name, code });
            
            setName("");
            setCode("");
            setSuccess(true);
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
           
        } catch (err) {
            const backendError = err.response?.data;
            if (backendError && typeof backendError === 'object') {
                const firstKey = Object.keys(backendError)[0];
                setError(Array.isArray(backendError[firstKey]) ? backendError[firstKey][0] : "Invalid input values.");
            } else {
                setError("Something went wrong!");
            }
        } finally {
            setLoading(false); 
        }
    };

    // STATE 1: Whole form goes away, rendering ONLY this loader box instead
    if (loading) {
        return (
            <div className="max-w-md mx-auto bg-gray-50 p-12 rounded-lg shadow-md border border-gray-100 flex flex-col justify-center items-center min-h-[340px]">
                {/* Spinner has standard default wait arrow pointer */}
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-700 tracking-wide animate-pulse">
                    Creating Classroom...
                </h3>
                <p className="text-xs text-gray-400 mt-1">Talking to database cluster</p>
            </div>
        );
    }

    // STATE 2: Standard form input layout
    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-100 min-h-[340px] flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Create a Class</h2>
                
                {/* Error Banner - Clickable to dismiss instantly */}
                {error && (
                    <div 
                        onClick={() => setError(null)}
                        className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm cursor-pointer hover:bg-red-100 transition-colors"
                        title="Click to dismiss"
                    >
                        {error}
                    </div>
                )}

                {/* Success Banner - Clickable to dismiss instantly */}
                {success && (
                    <div 
                        onClick={() => setSuccess(false)}
                        className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-sm cursor-pointer hover:bg-green-100 transition-colors"
                        title="Click to dismiss"
                    >
                        ✓ Classroom created successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Class Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Advanced Web Development"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Unique Class Code</label>
                        <input
                            type="text"
                            placeholder="e.g. CS-302"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                        />
                    </div>

                    {/* Submit Button with explicit pointer configuration */}
                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 active:scale-[0.99] shadow-sm mt-2 cursor-pointer"
                    >
                        Create Classroom
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddClassForm;