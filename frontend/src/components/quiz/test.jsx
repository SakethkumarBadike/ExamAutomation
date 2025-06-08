import { useState, useEffect,useRef } from "react";
import api from "../../../axios.config";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
// Question Item Component
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

// Enhanced Question Status Component
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


// QuizQuestion Component
const QuizQuestion = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [markedForReview, setMarkedForReview] = useState([]);
    const [testData, setTestData] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const blurCountRef = useRef(0);
    const  user = useAuthStore((state) => state.user);
    if(!user)navigate('/signin');
    //anamolies
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsVisible(false);
                blurCountRef.current += 1;

                if (blurCountRef.current >= 3) {
                    alert("You've left the test too many times. Your test will be auto-submitted.");
                    handleEndTest();
                } else {
                    alert(`Warning: Don't switch tabs during the test! (${blurCountRef.current}/3 attempts)`);
                }
            } else {
                setIsVisible(true);
            }
        };

        const handleWindowResize = () => {
            if (
                window.innerHeight < screen.availHeight - 100 ||
                window.innerWidth < screen.availWidth - 100
            ) {
                handleVisibilityChange(); 
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('resize', handleWindowResize);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    useEffect(() => {
        
        const arr = Array(questions.length).fill(false);
        setMarkedForReview(arr);
        async function fetchQuestions() {
            try {
                const res = await api.get(`/tests/attempt/${id}/`);
                setTestData(res.data);
                setQuestions(res.data.test_questions);
                setTimeLeft(res.data.duration * 60);

                // Initialize answers array
                const default_ans = res.data.test_questions.map((question) => ({
                    question_id: question.id,
                    answer_text: question.type === 'DS' ? "" : null,
                    selected_option: question.type === 'MCQ' ? null : null,
                }));
                setAnswers(default_ans);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        }
        fetchQuestions();

       
    }, [id]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) {
            handleEndTest();
            return;
        }
        const timer = setTimeout(() => {
            if(timeLeft <=0) handleEndTest();
            else{
            setTimeLeft((prev) => prev - 1);
        }
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

    // Handle option selection
    const handleAnswer = (value) => {
        const currentAnswer = answers[currentQuestionIndex];
        const isAlreadySelected = currentAnswer.selected_option === value;

        const updatedAnswers = answers.map((item, index) => {
            if (index === currentQuestionIndex) {
                return {
                    ...item,
                    selected_option: isAlreadySelected ? null : value,
                    answer_text: questions[currentQuestionIndex].type === 'DS' ? value : "",
                };
            }
            return item;
        });

        setAnswers(updatedAnswers);
    };

    // Handle navigation to the next question
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    // Handle navigation to the previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    // Handle question selection from status
    const handleQuestionSelect = (index) => {
        setCurrentQuestionIndex(index);
    };

    // Handle quiz end
    const handleEndTest = async () => {
        setSubmitting(true);

        const submissionData = {
            test_id: id,
            answers: answers,
        };

        try {
            const response = await api.post('/tests/submit-test/', submissionData);
            navigate('/');
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit the test. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (questions.length === 0) {
        return (
            <div className="text-center text-2xl font-bold mt-10 text-gray-600 animate-pulse">
                Loading questions...
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="flex flex-col justify-center items-center min-h-full bg-gray-50" >
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl font-bold text-blue-600 mb-4">Submitting your response...</h1>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                    <p className="text-gray-600 mt-4 text-center">Please wait while we process your answers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 shadow-xl rounded-2xl border border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{testData.title}</h2>
                <button 
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md"
                    onClick={handleEndTest}
                >
                    End Test
                </button>
            </div>
            <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                🕒 {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60} remaining •{" "}
                <span className="font-medium">{currentQuestionIndex + 1}/{questions.length} Questions</span>
            </div>

            <div className="mt-6 pt-4 grid grid-cols-6 gap-6 ">
                <QuestionStatus 
                    questions={questions} 
                    answers={answers} 
                    currentQuestionIndex={currentQuestionIndex} 
                    markedForReview={markedForReview}
                    onQuestionSelect={handleQuestionSelect}
                />
                {questions.length > 0 && (
                    <QuestionItem
                        question={questions[currentQuestionIndex]}
                        answer={answers[currentQuestionIndex]}
                        onOptionSelect={handleAnswer}
                    />
                )}
            </div>

            <div className="flex justify-between items-center mt-8 bg-gray-50 p-4 rounded-lg">
                <button 
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md ${
                        currentQuestionIndex === 0 
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                            : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                    onClick={handlePrevious} 
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </button>
                <label className="flex items-center text-gray-700 cursor-pointer">
                    <input
                        type="checkbox"
                        className="mr-2 w-5 h-5 text-blue-600 rounded focus:ring-blue-400"
                        onChange={(e) => {
                            const arr = [...markedForReview];
                            arr[currentQuestionIndex] = !arr[currentQuestionIndex];
                            setMarkedForReview(arr);
                        }}
                        checked={markedForReview[currentQuestionIndex]}
                    />
                    <span className="font-medium">Mark for Review</span>
                </label>
                <button
                    className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md ${
                        currentQuestionIndex === questions.length - 1
                            ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default QuizQuestion;