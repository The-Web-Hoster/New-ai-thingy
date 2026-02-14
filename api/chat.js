// No 'require' needed because we are using ESM
export default async function handler(req, res) {
  // 1. Setup Security & Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  // Handle the 'preflight' request from the browser
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // 2. Connect to the 2026 Hugging Face Router
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct", // Top-tier 2026 open-source model
          messages: [{ role: "user", content: message }],
          max_tokens: 300,
          temperature: 0.7
        }),
      }
    );

    const data = await response.json();

    // 3. Smart Error Handling
    if (data.error) {
      // Check if it's a 'Model Loading' error
      if (data.error.includes("loading") || response.status === 503) {
        return res.status(200).json({ 
          response: "NEURAL CORE LOADING... SEND YOUR MESSAGE AGAIN IN 5 SECONDS." 
        });
      }
      return res.status(200).json({ response: `AI ERROR: ${data.error}` });
    }

    // 4. Extract and Send the Text
    const aiText = data.choices?.[0]?.message?.content || "Connection stable. System idle.";
    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ response: `UPLINK CRASH: ${error.message}. CHECK VERCEL LOGS.` });
  }
}
