export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { message } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`, 
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ 
          model: "meta-llama/Llama-3.2-3B-Instruct",
          messages: [{ role: "user", content: message }],
          max_tokens: 500
        }),
      }
    );

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return res.status(200).json({ response: data.choices[0].message.content });
    } 
    
    // If the model is loading, it looks like this in the new Router:
    return res.status(200).json({ 
      response: `DEBUG: ${response.status} - ${JSON.stringify(data)}` 
    });

  } catch (error) {
    return res.status(200).json({ response: `SYSTEM CRASH: ${error.message}` });
  }
}
