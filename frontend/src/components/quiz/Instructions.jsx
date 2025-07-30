import { useState } from 'react';

const Instructions = ({ setShowInstructions, testData }) => {
    const [checked, setChecked] = useState(false);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Test Instructions
            </h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">{testData.title}</h2>
                <div className="prose max-w-none text-gray-600">
                    <p className="mb-4">Duration: {testData.duration} minutes</p>
                    <p className="mb-4">Total Questions: {testData.test_questions?.length || 0}</p>
                    <p className="mb-4">Maximum Marks: {testData.total_marks}</p>
                    
                    <h3 className="font-medium mt-6 mb-2 text-gray-800">Important Instructions:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Do not refresh the page during the test</li>
                        <li>Do not switch tabs or minimize the browser window</li>
                        <li>The test will auto-submit when time expires</li>
                        <li>You have limited attempts to leave the test window</li>
                        <li>All questions are mandatory</li>
                    </ul>
                </div>
            </div>

            <div className="mb-6">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="h-5 w-5 text-blue-600"
                    />
                    <span className="text-gray-700">
                        I have read and understood all instructions.
                    </span>
                </label>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => setShowInstructions(false)}
                    disabled={!checked}
                    className={`px-8 py-3 rounded-lg font-bold text-lg ${
                        checked
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Start Test
                </button>
            </div>
        </div>
    );
};

export default Instructions;
