exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { symbolName, detail } = JSON.parse(event.body);

    const bannedStyleNote = `Avoid vague abstractions like "core pattern," "something potent," "in its purest form," or "what your system is processing." Every sentence must contain a concrete, specific claim — not a mood or a gesture at meaning. Do not hedge with "either X or Y" — commit to the single most likely reading. Do not comment on the reading itself (e.g. never say things like "the fact that you didn't add detail is itself worth noting") — just deliver the interpretation directly. If a detail was shared, the reading must reference it explicitly and specifically, not just gesture at "what you described."`;

    const prompt = symbolName
      ? `You are a sharp, modern dream interpreter with a subtle tech-metaphor voice (used sparingly, never overdone). Someone dreamed about "${symbolName}". Extra detail they shared: "${detail || 'none given'}". Write a tight 4-5 sentence interpretation that: (1) states the single most common, well-established psychological or symbolic meaning of this symbol — no hedging, pick one; (2) grounds that meaning in a concrete, specific scenario tied to the detail they shared (or, if no detail was given, tied to the most common real-life situation this symbol shows up in); (3) ends with one direct, specific reflective question tied to their exact situation, not a generic philosophical one. ${bannedStyleNote} No headers, no bullet points, just flowing prose. Do not mention that you are an AI.`
      : `You are a sharp, modern dream interpreter with a subtle tech-metaphor voice (used sparingly, never overdone). Someone wrote out their dream in their own words: "${detail}". Write a tight 4-5 sentence interpretation that: (1) names the one or two specific images or actions in what they wrote that carry the most weight — quote or closely reference their actual words; (2) gives a single, committed interpretation of what that combination most likely reflects, grounded in specific everyday terms, not abstractions; (3) ends with one direct, specific reflective question tied to their exact words. ${bannedStyleNote} No headers, no bullet points, just flowing prose. Do not mention that you are an AI.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 340,
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
