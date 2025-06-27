const QuestionItem = ({ question, answer, onOptionSelect }) => {
    return (
        <div className="mt-4 border-t pt-4 col-span-4 h-full overflow-y-auto">
            <h3 className="text-lg font-medium">Question {question.id} • {question.marks} points</h3>
            <p className="mt-2 text-gray-700">{question.title}</p>
            <div className="mt-4 space-y-2 h-64 overflow-y-auto">
                {question.type === 'MCQ' && question.options.map((option, index) => (
                    <label
                        key={index}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                            answer?.selected_option === index ? "border-blue-500 bg-blue-100" : "border-gray-300"
                        }`}
                    >
                        <input
                            type="radio"
                            name="quiz"
                            className="hidden"
                            onChange={()=>{}}
                            checked={answer?.selected_option === index}
                            onClick={() => onOptionSelect(index)}
                        />
                        <span
                            className={`w-5 h-5 flex items-center justify-center border rounded-full mr-3 ${
                                answer?.selected_option === index ? "border-blue-500" : "border-gray-300"
                            }`}
                        >
                            {answer?.selected_option === index && (
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            )}
                        </span>
                        {option}
                    </label>
                ))}
                {question.type === 'DS' && (
                    <textarea
                        type="text"
                        className="border rounded-lg p-2 w-full h-48 resize-none"
                        placeholder="Type your answer here..."
                        value={answer?.answer_text || ""}
                        onChange={(e) => onOptionSelect(e.target.value)}
                    />
                )}
            </div>
        </div>
    );
};


export default QuestionItem;