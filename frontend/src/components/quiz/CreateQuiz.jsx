import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../axios.config";

const CreateExamAndQuestions = () => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [numQuestions, setNumQuestions] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [questionsInBank, setQuestionsInBank] = useState(new Set());
    const navigate = useNavigate();
    const { id } = useParams();

    const totalMarksUsed = questions.reduce((sum, q) => sum + parseFloat(q.question.marks), 0);

    const handleCreateExamSubmit = (e) => {
        e.preventDefault();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            setError("Start time must be before end time.");
            return;
        }

        const timeGapInMinutes = (end - start) / (1000 * 60);
        if (parseInt(duration) > timeGapInMinutes) {
            setError("Duration must be less than the time gap between start and end.");
            return;
        }

        setError("");
        setStep(2);
    };

    const handleAddOrUpdateQuestion = (newQuestion) => {
        if (editingIndex !== null) {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = {
                question: {
                    type: newQuestion.questionType,
                    title: newQuestion.question,
                    options: newQuestion.questionType === "MCQ" ? newQuestion.options : null,
                    marks: parseFloat(newQuestion.marks),
                    difficulty: newQuestion.difficulty,
                    answer: newQuestion.questionType === "MCQ" ? newQuestion.options[newQuestion.correctOption] : newQuestion.question,
                    correct_option: newQuestion.questionType === "MCQ" ? newQuestion.correctOption : null,
                },
                order: editingIndex + 1,
            };
            setQuestions(updatedQuestions);
            setEditingIndex(null);
        } else {
            if (questions.length >= numQuestions) {
                alert(`You can only add ${numQuestions} questions.`);
                return;
            }

            const newTotalMarks = totalMarksUsed + parseFloat(newQuestion.marks);
            if (newTotalMarks > parseFloat(totalMarks)) {
                alert(`Total marks cannot exceed ${totalMarks}.`);
                return;
            }

            const question = {
                question: {
                    type: newQuestion.questionType,
                    title: newQuestion.question,
                    options: newQuestion.questionType === "MCQ" ? newQuestion.options : null,
                    marks: parseFloat(newQuestion.marks),
                    difficulty: newQuestion.difficulty,
                    answer: newQuestion.questionType === "MCQ" ? newQuestion.options[newQuestion.correctOption] : newQuestion.question,
                    correct_option: newQuestion.questionType === "MCQ" ? newQuestion.correctOption : null,
                },
                order: questions.length + 1,
            };
            setQuestions([...questions, question]);
        }
    };

    const handleEditQuestion = (index) => {
        setEditingIndex(index);
    };

    const handleDeleteQuestion = (index) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            const updatedQuestions = questions.filter((_, i) => i !== index);
            setQuestions(updatedQuestions);
        }
    };

    const handleFinalSubmit = async () => {
        const examData = {
            classroom_code: id,
            title,
            description,
            total_marks: parseFloat(totalMarks),
            start_time: startTime,
            end_time: endTime,
            duration: parseInt(duration),
            num_questions: parseInt(numQuestions),
            test_questions: questions,
        };

        try {
            const response = await api.post("/tests/create-test/", examData);
            alert("Exam created successfully!");
            navigate("/");
        } catch (error) {
            console.error("Error saving exam:", error);
            alert(`Failed to create exam: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {step === 1 && (
                <div className="max-w-md mx-auto p-4 border rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-4">Create Exam</h2>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <form onSubmit={handleCreateExamSubmit}>
                        <div className="mb-3">
                            <label className="block font-medium">Exam Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Total Marks</label>
                            <input
                                type="number"
                                step="0.1"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Duration (minutes)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium">Number of Questions</label>
                            <input
                                type="number"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                        >
                            Next
                        </button>
                    </form>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-7xl mx-auto flex gap-8">
                    <div className="w-1/2 bg-white p-8 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            {editingIndex !== null ? "Edit Question" : "Add Question"}
                        </h2>
                        <QuestionForm
                            numberOfQuestions={numQuestions}
                            onAddQuestion={handleAddOrUpdateQuestion}
                            totalMarks={totalMarks}
                            totalMarksUsed={totalMarksUsed}
                            editingQuestion={editingIndex !== null ? questions[editingIndex] : null}
                            questionsInBank={questionsInBank}
                            setQuestionsInBank={setQuestionsInBank}
                        />
                    </div>

                    <div className="w-1/2 bg-white p-8 shadow-lg rounded-lg">
                        <h2 className="text-2xl font-semibold mb-6 text-center">Added Questions</h2>
                        {questions.length === 0 ? (
                            <p className="text-gray-500 text-center">No questions added yet.</p>
                        ) : (
                            <ul className="space-y-4">
                                {questions.map((q, index) => (
                                    <li
                                        key={index}
                                        className={`p-4 bg-gray-50 rounded-md shadow-sm ${
                                            editingIndex === index ? "hidden" : ""
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-700 font-medium">{q.question.title}</p>
                                                <p className="text-sm text-gray-600">Marks: {q.question.marks}</p>
                                                <p className="text-sm text-gray-600">Difficulty: {q.question.difficulty}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditQuestion(index)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {q.question.type === "MCQ" && (
                                            <ul className="mt-2 space-y-2">
                                                {q.question.options.map((option, i) => (
                                                    <li
                                                        key={i}
                                                        className={`text-gray-600 ${
                                                            q.question.correct_option === i
                                                                ? "font-bold text-green-600"
                                                                : ""
                                                        }`}
                                                    >
                                                        Option {i + 1}: {option}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-4 text-gray-700">
                            Total Marks Used: {totalMarksUsed} / {totalMarks}
                        </p>
                        <button
                            onClick={handleFinalSubmit}
                            disabled={questions.length < numQuestions || totalMarksUsed !== parseFloat(totalMarks)}
                            className={`w-full mt-6 p-3 rounded-md text-white ${
                                questions.length < numQuestions || totalMarksUsed !== parseFloat(totalMarks)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-200"
                            }`}
                        >
                            Submit Exam
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const QuestionForm = ({
    numberOfQuestions,
    onAddQuestion,
    totalMarks,
    totalMarksUsed,
    editingQuestion,
    questionsInBank,
    setQuestionsInBank
}) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctOption, setCorrectOption] = useState(0);
    const [questionType, setQuestionType] = useState("MCQ");
    const [marks, setMarks] = useState("");
    const [difficulty, setDifficulty] = useState("easy");

    useEffect(() => {
        if (editingQuestion) {
            setQuestion(editingQuestion.question.title || "");
            setOptions(editingQuestion.question.options || ["", "", "", ""]);
            setCorrectOption(editingQuestion.question.correct_option || 0);
            setQuestionType(editingQuestion.question.type || "MCQ");
            setMarks(editingQuestion.question.marks || "");
            setDifficulty(editingQuestion.question.difficulty || "easy");
        } else {
            setQuestion("");
            setOptions(["", "", "", ""]);
            setCorrectOption(0);
            setQuestionType("MCQ");
            setMarks("");
            setDifficulty("easy");
        }
    }, [editingQuestion]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const validateQuestion = () => {
        if (!question.trim()) {
            alert("Question text cannot be empty!");
            return false;
        }
        if (questionType === "MCQ" && options.some((opt) => !opt.trim())) {
            alert("All options must be filled for MCQ questions!");
            return false;
        }
        if (!marks || parseFloat(marks) <= 0) {
            alert("Marks must be a positive number.");
            return false;
        }
        if (totalMarksUsed + parseFloat(marks) > parseFloat(totalMarks)) {
            alert(`Total marks cannot exceed ${totalMarks}.`);
            return false;
        }
        return true;
    };

    const handleAddQuestion = () => {
        if (!validateQuestion()) return;
        
        const newQuestion = {
            question,
            options,
            correctOption,
            questionType,
            marks,
            difficulty,
        };
        onAddQuestion(newQuestion);
        resetForm();
    };

    const handleAddToBank = async () => {
        if (!validateQuestion()) return;
        
        const questionKey = `${question}-${questionType}-${marks}`;
        if (questionsInBank.has(questionKey)) {
            alert("This question is already in your question bank!");
            return;
        }

        const questionData = {
            title: question,
            type: questionType,
            options: questionType === "MCQ" ? options : null,
            marks: parseFloat(marks),
            difficulty,
            answer: questionType === "MCQ" ? options[correctOption] : question,
            correct_option: questionType === "MCQ" ? correctOption : null,
        };

        try {
            await api.post("/tests/add_to_bank/", questionData);
            alert("Question added to bank successfully!");
            setQuestionsInBank(new Set(questionsInBank).add(questionKey));
        } catch (error) {
            console.error("Error adding to question bank:", error);
            alert(`Failed to add to question bank: ${error.response?.data?.message || error.message}`);
        }
    };

    
    return (
        <div>
            <div className="mb-4">
                <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                    Question
                </label>
                <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows="3"
                    className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">
                    Question Type
                </label>
                <select
                    id="questionType"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="DS">Descriptive</option>
                </select>
            </div>
            {questionType === "MCQ" && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Options</h3>
                    {options.map((option, index) => (
                        <div key={index} className="mb-2 flex items-center">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="p-2 w-full border rounded-md focus:ring focus:ring-blue-200 focus:outline-none mr-2"
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                            <input
                                type="radio"
                                name="correctOption"
                                checked={correctOption === index}
                                onChange={() => setCorrectOption(index)}
                            />
                        </div>
                    ))}
                    <p className="text-sm text-gray-500">Select the correct option</p>
                </div>
            )}
            <div className="mb-4">
                <label htmlFor="marks" className="block text-sm font-medium text-gray-700">
                    Marks
                </label>
                <input
                    type="number"
                    step="0.1"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                    Difficulty
                </label>
                <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleAddQuestion}
                    className="flex-1 bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
                >
                    {editingQuestion ? "Update Question" : "Add Question"}
                </button>
                <button
                    onClick={handleAddToBank}
                    className={`flex-1 p-3 rounded-md ${
                        questionsInBank.has(`${question}-${questionType}-${marks}`)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-500 text-white hover:bg-purple-600"
                    }`}
                    disabled={questionsInBank.has(`${question}-${questionType}-${marks}`)}
                >
                    {questionsInBank.has(`${question}-${questionType}-${marks}`)
                        ? "Already in Bank"
                        : "Add to Bank"}
                </button>
            </div>
        </div>
    );
};

export default CreateExamAndQuestions;