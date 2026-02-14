export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { message } = req.body;

    // We are switching to Gemma 2 - it's the most reliable for the 2026 Router free tier
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/gemma-2-2b-it",
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

    const text = await response.text();
    
    // THE ULTIMATE DEBUG: If it's not JSON, we see the first 50 characters of the webpage
    if (text.trim().startsWith("<")) {
      return res.status(200).json({ 
        response: `HF ERROR: Sent HTML. Status: ${response.status}. Preview: ${text.substring(0, 50)}` 
      });
    }

    const data = JSON.parse(text);
    
    if (Array.isArray(data) && data[0]?.generated_text) {
      return res.status(200).json({ response: data[0].generated_text });
    } else if (data.error) {
      return res.status(200).json({ response: `AI Busy: ${data.error}` });
    }

    return res.status(200).json({ response: "Link stable, AI silent. Try again." });

  } catch (error) {
    return res.status(200).json({ response: `FATAL: ${error.message}` });
  }
}
