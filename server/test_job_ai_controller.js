const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const { generateJobDescription } = require('./controllers/jobDescriptionController');

const req = {
    body: {
        title: "Ingénieur DevOps",
        department: "IT"
    }
};

const res = {
    status(code) {
        console.log("STATUS CODE:", code);
        return this;
    },
    json(data) {
        console.log("JSON RESPONSE:", JSON.stringify(data, null, 2));
    }
};

console.log("Starting test with GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

generateJobDescription(req, res)
    .then(() => console.log("Finished test run"))
    .catch(err => console.error("Uncaught Controller Error:", err));
