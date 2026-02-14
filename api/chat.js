export default async function handler(req, res) {
  // 1. Safety check: Only allow POST requests from your website
  if (req.method !== 'POST') {
    return res.status(200).send("Neural Link Active. Communication must be sent via POST.");
  }

  try {
    const { message } = req.body;

    // 2. The Hugging Face Request
    // Using the most stable Llama 3.2 model for 2026
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: message,
          options: { wait_for_model: true } // Crucial: prevents immediate 503 errors
        }),
      }
    );

    const result = await response.json();

    // 3. Robust Response Handling
    let aiMessage = "";

    if (Array.isArray(result) && result[0]?.generated_text) {
      // Success! We got a response
      aiMessage = result[0].generated_text;
    } 
    else if (result.estimated_time) {
      // Model is still loading into Hugging Face's RAM
      const waitTime = Math.round(result.estimated_time);
      aiMessage = `AI nodes warming up... ready in about ${waitTime} seconds. Please try again.`;
    } 
    else if (result.error) {
      // Specific error from Hugging Face (like an invalid token)
      aiMessage = `UPLINK ERROR: ${result.error}`;
    } 
    else {
      // Mystery error - usually happens if the JSON structure changes
      aiMessage = "Neural Link unstable. Please re-send your transmission.";
    }

    // 4. Send the final JSON back to your index.html
    res.status(200).json({ response: aiMessage });

  } catch (error) {
    // If the server crashes entirely, this shows up in Vercel Logs
    console.error("SERVER CRASH:", error);
    res.status(500).json({ response: "CRITICAL UPLINK ERROR: System failure." });
  }
}
