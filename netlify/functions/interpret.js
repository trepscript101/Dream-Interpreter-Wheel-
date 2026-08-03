exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { symbolName, detail } = JSON.parse(event.body);

    const bannedStyleNote = `Write in plain, natural, everyday English — the way a sharp, direct friend would text you an honest take, not like a textbook. Never use these words or phrases: "psyche," "core pattern," "something potent," "in its purest form," "your system," "structural," "reconfiguration," "worth noting," "worth sitting with," "threshold moment," "the principle of." Never mention whether detail was or wasn't provided — just interpret what you have. Commit to one clear meaning; do not hedge with "either X or Y." Hard limit: 3 sentences, under 70 words total. If your draft runs longer or uses a banned word, cut it down before answering.`;

    const prompt = symbolName
      ? `You are a sharp, modern dream interpreter. Someone dreamed about "${symbolName}". Extra detail they shared: "${detail || 'none given'}". In 3 sentences max: (1) state the single most common, well-established meaning of this symbol — pick one, no hedging; (2) ground it in a concrete, specific everyday scenario tied to their detail (or the most common real-life situation this symbol shows up in, if no detail given); (3) end with one short, direct, specific question. ${bannedStyleNote} No headers, no bullet points. Do not mention that you are an AI.`
      : `You are a sharp, modern dream interpreter. Someone wrote out their dream in their own words: "${detail}". In 3 sentences max: (1) name the one or two specific images or actions in what they wrote that carry the most weight, referencing their actual words; (2) give one committed, concrete interpretation of what that reflects in plain everyday terms; (3) end with one short, direct, specific question. ${bannedStyleNote} No headers, no bullet points. Do not mention that you are an AI.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 200,
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
