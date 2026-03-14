const { GoogleGenAI } = require("@google/genai");

exports.chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mocked fallback if no API key is provided
      console.warn("GEMINI_API_KEY is not set. Using mock response.");
      return res.status(200).json({
        reply: "You already have strong frontend skills.\n\nTo become a Full Stack Developer, you should learn:\n\n1️⃣ Node.js – backend runtime\n2️⃣ Express.js – API framework\n3️⃣ MongoDB – database for MERN stack\n4️⃣ REST API development\n5️⃣ Deployment (Docker or cloud)\n\nSuggested skill exchange:\nYou can teach React and learn Node.js from another user."
      });
    }

    // console.log("Gemini Key:", process.env.GEMINI_API_KEY);

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Format history for the model
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...formattedHistory,
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ],
        config: {
            systemInstruction: `You are an AI Skill Mentor inside a Skill Barter Platform.

Your goal is to help users improve their skills, identify skill gaps, and recommend what they should learn next.
The platform allows users to exchange skills with other users instead of paying money.

Your responsibilities:
1. Analyze the user's current skills.
2. Identify missing skills required for their target career role.
3. Suggest valuable skills they should learn next.
4. Provide a simple step-by-step learning roadmap.
5. Suggest possible skill exchange opportunities (what they can teach and what they should learn).

Chatbot behavior rules:
• Be friendly, short, and conversational.
• Ask follow-up questions if the user hasn't provided enough information.
• Focus mainly on technical and career-related skills.
• Keep answers practical and easy to understand.
• When possible, suggest skills that can be exchanged with other users on the platform.

Always structure recommendations clearly using bullet points or numbered lists (e.g., 1️⃣, 2️⃣, 3️⃣).
`
        }
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error("AI Mentor Error:", error);
    res.status(500).json({ message: "Failed to generate AI response", error: error.message });
  }
};
