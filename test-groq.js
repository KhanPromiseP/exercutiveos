require('dotenv').config({ path: '.env.local' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function run() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "hello" }],
      model: "llama3-70b-8192",
      tools: [{ type: "function", function: { name: "test", description: "test", parameters: { type: "object", properties: {} } } }]
    });
    console.log(completion.choices[0].message);
  } catch(e) {
    console.error(e);
  }
}
run();
