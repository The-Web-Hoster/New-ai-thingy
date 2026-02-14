export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send("Neural Link Active.");
  }

  try {
    const { message } = req.body;

    // THE NEW 2026 ROUTER URL
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/meta-llama/Llama-3.2-3B-Instruct",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: message,
          options: { wait_for_model: true }
        }),
      }
    );

    const result = await response.json();

    let aiMessage = "";

    // The Router usually returns the same array format, 
    // but we add a check for 'choices' just in case it's in OpenAI-style format
    if (Array.isArray(result) && result[0]?.generated_text) {
      aiMessage = result[0].generated_text;
    } else if (result.choices && result.choices[0]?.message?.content) {
      aiMessage = result.choices[0].message.content;
    } else if (result.error) {
      aiMessage = `System Warming Up: ${result.error}`;
    } else {
      aiMessage = "Neural Link unstable. Please re-send message.";
    }

    res.status(200).json({ response: aiMessage });

  } catch (error) {
    res.status(500).json({ response: "CRITICAL UPLINK ERROR: Connection Reset." });
  }
}
