export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(200).json({ response: "Neural Link Active." });
  }

  try {
    const { message } = req.body;

    // THE FINAL 2026 ROUTER URL
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          // The new router prefers 'inputs' as a string for this model
          inputs: message,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false
          }
        }),
      }
    );

    const result = await response.json();

    if (Array.isArray(result) && result[0]?.generated_text) {
      return res.status(200).json({ response: result[0].generated_text });
    } 
    else if (result.error) {
      // If it's the "loading" error, it will tell us here
      return res.status(200).json({ response: `AI is warming up: ${result.error}` });
    } 
    else {
      return res.status(200).json({ response: "Neural Link stable, but AI is silent. Try again." });
    }

  } catch (error) {
    return res.status(200).json({ response: "CONNECTION ERROR: Check Vercel logs." });
  }
}
