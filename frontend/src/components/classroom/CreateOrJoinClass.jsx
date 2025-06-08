import { useState } from "react";
import api from "../../../axios.config"; // Adjust the import path if needed

const AddClassForm = () => {
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error before submitting

        try {
            const response = await api.post("/classrooms/", { name, code });
            // onClassAdded(response.data); // Notify parent component
            setName("");
           
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong!");
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Create a Class</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Class Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    placeholder="Class Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Add Class
                </button>
            </form>
        </div>
    );
};

export default AddClassForm;
