// require('dotenv').config()

const OpenAI = require("openai")

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

let inputArr = process.argv.slice(2)
const userInput = inputArr.join(' ')

async function getResponse () {
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${userInput}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(response.choices[0].message.content);
}


getResponse();

