const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateQuiz = async (req, res) => {
  try {
    const { videoTitle, videoDescription, numQuestions, difficulty, quizType } = req.body;
    
    if (!videoTitle) {
      return res.status(400).json({
        success: false,
        message: "Video Title is required",
      });
    }

    const qCount = numQuestions || 5;
    const diff = difficulty || "Medium";
    const type = quizType || "MCQ";

    // Initialize the Gemini model (using flash-lite for high availability)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Enforce strict JSON generation
    const prompt = `
    You are an expert technical instructor for the online platform "StudyPro". 
    A student has just watched a video lecture and wants to test their knowledge.
    
    Video Title: ${videoTitle}
    Video Description: ${videoDescription || "No description provided."}
    
    Create a quiz based on this topic.
    Quiz Requirements:
    - Exactly ${qCount} questions.
    - Difficulty level: ${diff}.
    - Question Style Focus: ${type}.
    
    IMPORTANT RULES FOR QUESTION STYLES:
    If the style is "Code Output", provide a code snippet and ask what it prints.
    If the style is "Find the Error", provide a buggy code snippet and ask what the error is.
    If the style is "True / False", provide a statement and make the options "True" and "False".
    Regardless of the style requested, ALL questions must be formatted as Multiple Choice Questions with exactly 4 options (unless True/False, which has 2).
    
    OUTPUT FORMAT:
    You MUST return ONLY a valid JSON array of objects. Do not wrap it in markdown code blocks like \`\`\`json. Just the raw JSON array.
    Each object must have the following keys exactly:
    - "id": A unique integer starting from 1.
    - "question": The question text (can include markdown for code snippets like \`console.log("hello")\`).
    - "options": An array of strings representing the possible answers.
    - "answer": The exact string from the options array that is the correct answer.

    Example Output Structure:
    [
      {
        "id": 1,
        "question": "What will \`typeof null\` print in JavaScript?",
        "options": ["undefined", "object", "null", "error"],
        "answer": "object"
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Clean up potential markdown wrappers
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let quizData;
    try {
      quizData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", responseText);
      return res.status(500).json({
        success: false,
        message: "Failed to parse generated quiz.",
        rawOutput: responseText
      });
    }

    return res.status(200).json({
      success: true,
      quiz: quizData,
    });
  } catch (error) {
    console.error("Error in generateQuiz API:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz from AI.",
      error: error.message,
    });
  }
};
