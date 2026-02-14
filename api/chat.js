export default async function handler(req, res) {
  // 1. Check if the request is a POST
  if (req.method !== 'POST') {
    return res.status(200).send("Please use the chat box on the website.");
  }

  try {
    const { message } = req.body;
    
    // 2. The Hugging Face Call
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ inputs: message }),
      }
    );

    const result = await response.json();
    
    // 3. Send back the AI response
    // Hugging Face returns an array: [{ generated_text: "..." }]
    const aiMessage = result[0]?.generated_text || "System overloaded. Try again.";
    res.status(200).json({ response: aiMessage });

  } catch (error) {
    // This will show exactly what failed in your Vercel Logs
    console.error("CRASH DETAILS:", error);
    res.status(500).json({ response: "UPLINK CRASH: Server internal error." });
  }
}
