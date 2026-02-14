export default async function handler(req, res) {
  // 1. Tell the browser we are sending JSON no matter what
  res.setHeader('Content-Type', 'application/json');

  try {
    const { message } = req.body;

    // Use a model that is ALMOST ALWAYS online
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({ inputs: message }),
      }
    );

    const rawText = await response.text();
    
    // 2. Check if the response is actually HTML (the "N" error culprit)
    if (rawText.startsWith("<!DOCTYPE") || rawText.includes("Not Found")) {
      return res.status(200).json({ 
        response: "GATEWAY ERROR: Hugging Face sent back a webpage. Check your HF_TOKEN in Vercel settings." 
      });
    }

    const data = JSON.parse(rawText);
    const aiResponse = Array.isArray(data) ? data[0].generated_text : data.choices[0].message.content;
    
    return res.status(200).json({ response: aiResponse });

  } catch (error) {
    // 3. This ensures the chatbox shows the error instead of the "N" crash
    return res.status(200).json({ response: `ROUTER ERROR: ${error.message}` });
  }
}
