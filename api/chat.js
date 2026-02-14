export default async function handler(req, res) {
  // 1. Setup Security & Headers (CORS)
  // This allows your website to talk to your API without being blocked
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  // Handle the 'preflight' request (Browser check)
  if (req.method === "OPTIONS") return res.status(200).end();

  // ONLY allow POST requests for the actual chat
  if (req.method !== "POST") {
    return res.status(405).json({ response: "Please use the chat box on the website." });
  }

  try {
    // 2. The "Destructure" Fix
    // We use (req.body || {}) to make sure it doesn't crash if the body is empty
    const { message } = req.body || {};
    
    if (!message) {
      return res.status(400).json({ response: "SYSTEM: No message detected in the neural uplink." });
    }

    // 3. Connect to the Hugging Face Router
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct",
          messages: [{ role: "user", content: message }],
          max_tokens: 300,
          temperature: 0.7
        }),
      }
    );

    const data = await response.json();

    // 4. Smart Error Handling
    if (data.error) {
      if (typeof data.error === 'string' && data.error.includes("loading")) {
        return res.status(200).json({ 
          response: "NEURAL CORE LOADING... SEND YOUR MESSAGE AGAIN IN 10 SECONDS." 
        });
      }
      return res.status(200).json({ response: `AI ERROR: ${data.error.message || data.error}` });
    }

    // 5. Extract and Send the Text
    const aiText = data.choices?.[0]?.message?.content || "Connection stable. System idle.";
    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ response: `UPLINK CRASH: ${error.message}. CHECK VERCEL LOGS.` });
  }
}
