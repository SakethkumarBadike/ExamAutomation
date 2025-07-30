import { useState, useEffect } from "react";
import api from "../../../axios.config";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import Instructions from "./Instructions";
import QuestionItem from "./QuestionItem";
import QuestionStatus from "./QuestionStatus";
import { useOnRefresh } from "../../hooks/useOnRefresh";

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
    const user = useAuthStore((state) => state.user);
    const [showInstructions, setShowInstructions] = useState(true);

    if (!user) navigate('/signin');

    // Custom hook to handle page refresh warning
    useOnRefresh(!showInstructions);

    useEffect(() => {
        const arr = Array(questions.length).fill(false);
        setMarkedForReview(arr);

        async function fetchQuestions() {
            try {
                const res = await api.get(`/tests/attempt/${id}/`);
                setTestData(res.data);
                setQuestions(res.data.test_questions);
                setTimeLeft(res.data.duration * 60);

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
            if (timeLeft <= 0) handleEndTest();
            else setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft]);

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

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleQuestionSelect = (index) => {
        setCurrentQuestionIndex(index);
    };

    const handleEndTest = async () => {
        setSubmitting(true);

        const submissionData = {
            test_id: id,
            answers: answers,
        };

        try {
            await api.post('/tests/submit-test/', submissionData);
            navigate('/');
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Failed to submit the test. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (showInstructions) {
        return (
            <Instructions
                testData={testData}
                setShowInstructions={setShowInstructions}
            />
        );
    }

    if (questions.length === 0) {
        return (
            <div className="text-center text-2xl font-bold mt-10 text-gray-600 animate-pulse">
                Loading questions...
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="flex flex-col justify-center items-center min-h-full bg-gray-50">
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
                    disabled={submitting}
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