const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askDoubt = async (req, res) => {
  try {
    const { question, videoTitle, videoDescription } = req.body;
    
    if (!question || !videoTitle) {
      return res.status(400).json({
        success: false,
        message: "Question and Video Title are required",
      });
    }

    // Initialize the Gemini model (using gemini-flash-lite-latest for highest availability and free tier quota)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Provide context to the AI
    const prompt = `
    You are an AI teaching assistant for an online education platform named StudyPro. 
    A student is currently watching a video lecture.
    
    Video Title: ${videoTitle}
    Video Description: ${videoDescription || "No description provided."}
    
    The student has asked the following doubt:
    "${question}"
    
    IMPORTANT RULES:
    1. You MUST ONLY answer questions related to the video topic, programming, tech, education, or study concepts.
    2. If the user asks a question completely unrelated to education/studies (e.g., about movies, politics, personal chats, random general knowledge), politely decline to answer. Say exactly: "I am a Study Assistant. I can only answer questions related to this course or your studies. How can I help you with your learning today?"
    3. If the question is relevant, provide a helpful, concise, and educational answer. Keep it conversational and encouraging. Format your answer with basic markdown if necessary.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({
      success: true,
      answer: responseText,
    });
  } catch (error) {
    console.error("Error in askDoubt API:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch response from AI Assistant.",
      error: error.message,
    });
  }
};
