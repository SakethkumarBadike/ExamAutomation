
const QuestionStatus = ({ questions, answers, currentQuestionIndex, markedForReview, onQuestionSelect }) => {
    const getStatusStyles = (index) => {
        if (index === currentQuestionIndex) {
            return "bg-blue-500 ring-2 ring-blue-300 shadow-lg scale-110";
        }
        if ((answers[index]?.selected_option !== null || answers[index]?.answer_text) && markedForReview[index]) {
            return "bg-purple-500 hover:bg-purple-600";
        }
        if (answers[index]?.selected_option !== null || answers[index]?.answer_text) {
            return "bg-green-500 hover:bg-green-600";
        }
        if (markedForReview[index]) {
            return "bg-yellow-500 hover:bg-yellow-600";
        }
        return "bg-gray-300 hover:bg-gray-400";
    };

    return (
        <div className="flex flex-col gap-4 mt-4 col-span-2">
            <div className="overflow-y-auto grid grid-cols-5 gap-3 p-4 bg-gray-50 rounded-xl shadow-md max-h-[calc(70vh-100px)] border border-gray-200">
                {questions.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => onQuestionSelect(index)}
                        className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${getStatusStyles(index)} 
                            transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                    >
                        <span className="font-medium">{index + 1}</span>
                    </button>
                ))}
            </div>

            <div className="text-sm mt-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {[
                    { color: "bg-blue-500", text: "Current Question" },
                    { color: "bg-green-500", text: "Attempted" },
                    { color: "bg-yellow-500", text: "Marked for Review" },
                    { color: "bg-purple-500", text: "Attempted & Marked" },
                    { color: "bg-gray-300", text: "Unattempted" },
                ].map((status, idx) => (
                    <div key={idx} className="flex items-center mb-2 last:mb-0">
                        <div className={`w-4 h-4 ${status.color} rounded-full mr-2 shadow-sm`}></div>
                        <span className="text-gray-700">{status.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionStatus;