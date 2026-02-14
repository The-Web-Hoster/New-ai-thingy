export default async function handler(req, res) {
  // Always set the header to JSON immediately to prevent the "N" error
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(200).json({ response: "Neural Link Active. Use the website." });
  }

  try {
    const { message } = req.body;

    // Use the absolutely most basic stable Hugging Face URL
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: message,
          options: { wait_for_model: true }
        }),
      }
    );

    // Get the text first to check if it's actually JSON
    const text = await response.text();
    
    try {
      const result = JSON.parse(text);
      
      if (Array.isArray(result) && result[0]?.generated_text) {
        return res.status(200).json({ response: result[0].generated_text });
      } else if (result.error) {
        return res.status(200).json({ response: `AI is busy: ${result.error}` });
      } else {
        return res.status(200).json({ response: "The AI sent a strange response. Try again." });
      }
    } catch (e) {
      // This is where the 'N' was coming from! We caught it.
      console.error("HF sent back non-JSON:", text);
      return res.status(200).json({ response: "AI Uplink sent back a webpage instead of text. Waiting for reboot..." });
    }

  } catch (error) {
    return res.status(200).json({ response: "CRITICAL CONNECTION ERROR: Check your internet and token." });
  }
}
