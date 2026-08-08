exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const { symbolName, detail } = JSON.parse(event.body);

    const coreMeanings = {
      "Falling": "a loss of control or ground beneath you, often surfacing during real transitions — a job change, a relationship shift, a decision you're not ready for",
      "Being Chased": "avoidance — running from a conflict, decision, or emotion instead of facing it directly",
      "Teeth": "loss of personal power or confidence, insecurity about how you're seen, or fear of losing something important",
      "Water": "emotion itself — calm water reflects balance, turbulent or murky water reflects unresolved or unclear feelings",
      "Flying": "freedom and confidence when the flight feels smooth; fear of losing control or overreaching when it struggles",
      "A Stranger": "an unacknowledged part of yourself surfacing — a trait, desire, or potential you haven't recognized yet",
      "Old Home": "your foundational identity — checking who you are now against who you were shaped to be there",
      "Death": "an ending, almost never literal — a phase, identity, or relationship closing to make room for what's next",
      "Snakes": "transformation — an old version of you shedding to make way for a new one",
      "Loss": "anxiety about losing control, identity, or something valuable — tied closely to what specifically was lost",
      "Fire": "intense emotion — passion or creative energy when controlled, anger or overwhelm when it rages out of hand",
      "Late": "fear of missing an opportunity or falling behind in some area of life that matters to you",
      "Eating": "whether your real needs, emotional or otherwise, are actually being met right now",
      "Dancing": "freedom, joy, and self-expression — or, if it feels effortful, being out of step with your own life's rhythm",
      "Wedding": "a commitment or union — rarely literal marriage, more often integrating two parts of yourself or committing to something new",
      "Singing": "your voice and self-expression — wanting to be heard, or finally saying something you've held back"
    };

    const groundingLine = symbolName && coreMeanings[symbolName]
      ? `Established dream psychology (Jungian and Freudian sources) treats this symbol as pointing toward: ${coreMeanings[symbolName]}. Use this as your starting anchor — but do not just restate it. Synthesize it into a fresh, specific, personal-feeling read, especially shaped around any detail they gave you.`
      : `Draw on well-established dream psychology (Jungian and Freudian traditions) for the images they describe, rather than inventing meaning freely.`;

    const exampleGood = `Falling means you feel out of control somewhere in your life right now — work, a relationship, a decision that's slipping before you're ready. What part of your life currently feels like it's sliding without your permission?`;

    const styleNote = `Match the length, tone, and directness of this example exactly — two sentences, plain everyday words, no jargon, ends in one short question:\n"${exampleGood}"\nNever mention whether detail was or wasn't given. Do not use ANY computer, technology, or systems-metaphor language whatsoever — no "system," "operating mode," "workaround," "access," "default," "process," or similar engineering-style words, even ones not listed here. Write only the way a smart, direct friend would talk, never like a machine describing another machine. Be simple and intelligent, not padded or vague. Commit to one meaning — no hedging.`;

    const prompt = symbolName
      ? `You are a sharp, modern dream interpreter. Someone dreamed about "${symbolName}". Extra detail they shared: "${detail || 'none given'}". ${groundingLine} ${styleNote} Do not mention that you are an AI.`
      : `You are a sharp, modern dream interpreter. Someone wrote out their dream in their own words: "${detail}". Interpret the one or two images that carry the most weight. ${groundingLine} ${styleNote} Do not mention that you are an AI.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 130,
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
