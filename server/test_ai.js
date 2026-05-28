const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
    try {
        const result = await aiModel.generateContent("hello");
        console.log(await result.response.text());
    } catch(e) {
        console.error("AI ERROR:", e);
    }
}
test();
