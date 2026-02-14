export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send("Neural Link Active.");
  }

  try {
    const { message } = req.body;

    // Use the v1/chat/completions endpoint - the most stable 2026 standard
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

    const result = await response.json();

    // Check for the OpenAI-style response format
    if (result.choices && result.choices[0]?.message?.content) {
      res.status(200).json({ response: result.choices[0].message.content });
    } 
    else if (result.error) {
      res.status(200).json({ response: `AI warming up: ${result.error.message || result.error}` });
    } 
    else {
      // Log the result to Vercel so you can see it if it fails
      console.log("Unexpected Result:", result);
      res.status(200).json({ response: "Neural Link unstable. Please try again." });
    }

  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ response: `CRITICAL UPLINK ERROR: ${error.message}` });
  }
}
