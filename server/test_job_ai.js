require('dotenv').config({ path: 'server/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
    try {
        const title = "Développeur";
        const department = "IT";
        const systemPrompt = `Tu es un Expert RH...`; // Just testing connection
        const result = await aiModel.generateContent("hello");
        console.log("Success:", await result.response.text());
    } catch(e) {
        console.error("AI ERROR:", e);
    }
}
test();
