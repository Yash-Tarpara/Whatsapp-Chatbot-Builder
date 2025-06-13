import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateReply = async (message) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
  });
  return res.choices[0].message.content.trim();
};

export default generateReply;
