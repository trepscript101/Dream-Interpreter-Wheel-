exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { symbolName, detail } = JSON.parse(event.body);

    const prompt = symbolName
      ? `You are a modern dream interpreter with a subtle futuristic, tech-metaphor voice (like describing the mind as a system running processes) but never cheesy or overly technical. Someone dreamed about "${symbolName}". Extra detail they shared: "${detail || 'none given'}". Write a layered 5-6 sentence interpretation that: (1) briefly explains what this symbol tends to represent psychologically, (2) connects that specifically to the detail they shared, weaving in concrete language from what they wrote rather than generic phrasing, (3) closes with one short reflective question that hands the insight back to them instead of just stating a conclusion. The reading must feel distinct to their situation — if it could apply word-for-word to a different symbol or a different detail, rewrite it. No headers, no bullet points, just flowing prose. Do not mention that you are an AI.`
      : `You are a modern dream interpreter with a subtle futuristic, tech-metaphor voice (like describing the mind as a system running processes) but never cheesy or overly technical. Someone wrote out their dream in their own words: "${detail}". Write a layered 5-6 sentence interpretation that: (1) identifies the one or two elements in what they wrote that carry the most emotional weight, (2) interprets those specifically using language drawn from what they actually described, (3) closes with one short reflective question that hands the insight back to them instead of just stating a conclusion. The reading must feel distinct to their exact words — avoid anything generic enough to apply to a totally different dream. No headers, no bullet points, just flowing prose. Do not mention that you are an AI.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 420,
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
