export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(200).send("Neural Link Active. Use the website to communicate.");
  }

  try {
    const { message } = req.body;

    // 2. Call Hugging Face with the 'Wait' flag
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
          options: { wait_for_model: true } // Tells the AI to wake up instead of crashing
        }),
      }
    );

    const result = await response.json();

    // 3. Handle different response types from Hugging Face
    let aiMessage = "";
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiMessage = result[0].generated_text;
    } else if (result.error) {
      aiMessage = `AI nodes warming up... try again in 10 seconds. (${result.error})`;
    } else {
      aiMessage = "Neural Link unstable. Please re-send message.";
    }

    res.status(200).json({ response: aiMessage });

  } catch (error) {
    console.error("UPLINK ERROR:", error);
    res.status(500).json({ response: "CRITICAL UPLINK ERROR: Check Vercel Logs." });
  }
}
