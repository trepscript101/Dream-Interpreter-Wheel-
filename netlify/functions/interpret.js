exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { symbolName, detail } = JSON.parse(event.body);

    const exampleGood = `Falling means you feel out of control somewhere in your life right now — work, a relationship, a decision that's slipping before you're ready. What part of your life currently feels like it's sliding without your permission?`;

    const styleNote = `Match the length, tone, and directness of this example exactly — two sentences, plain everyday words, no jargon, ends in one short question:\n"${exampleGood}"\nNever mention whether detail was or wasn't given. Never say "psyche," "your system," "in its purest form," or "worth noting." Commit to one meaning — no hedging.`;

    const prompt = symbolName
      ? `You are a sharp, modern dream interpreter. Someone dreamed about "${symbolName}". Extra detail they shared: "${detail || 'none given'}". Give the single most common meaning of this symbol, grounded in a concrete everyday scenario (using their detail if given). ${styleNote} Do not mention that you are an AI.`
      : `You are a sharp, modern dream interpreter. Someone wrote out their dream in their own words: "${detail}". Interpret the one or two images that carry the most weight, in plain concrete terms. ${styleNote} Do not mention that you are an AI.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: response.status, body: errText };
    }

    const data = await response.json();
    const textBlock = data.content.find(b => b.type === "text");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: textBlock ? textBlock.text.trim() : "" })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
