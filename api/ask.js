export default async function handler(req, res) {
  const { question } = await req.json();

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Christian guide who explains Scripture with kindness and clarity." },
        { role: "user", content: question },
      ],
    }),
  });

  const data = await completion.json();
  return res.json({ answer: data.choices[0].message.content });
}
