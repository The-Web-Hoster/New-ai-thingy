export default async function handler(req, res) {
  // Always force JSON headers to kill the "N" error
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(200).json({ response: "Neural Link Active." });
  }

  try {
    const { message } = req.body;

    // THE 2026 ROUTER URL (Mandatory Update)
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: message,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false
          }
        }),
      }
    );

    // Read response as text first to debug errors
    const text = await response.text();
    let result;
    
    try {
      result = JSON.parse(text);
    } catch (e) {
      // If HF sends back a non-JSON error page
      console.error("Non-JSON response:", text);
      return res.status(200).json({ response: "AI Uplink sent a webpage instead of text. The model might be offline." });
    }

    if (Array.isArray(result) && result[0]?.generated_text) {
      return res.status(200).json({ response: result[0].generated_text });
    } 
    else if (result.error) {
      // Check if it's a 'Model too busy' or 'Loading' error
      return res.status(200).json({ response: `AI warming up: ${result.error}` });
    } 
    else {
      return res.status(200).json({ response: "Neural Link stable, but AI is silent. Try sending another message." });
    }

  } catch (error) {
    // This catches the 'Connection Reset'
    return res.status(200).json({ response: "CONNECTION ERROR: Check your Vercel Environment Variables." });
  }
}
