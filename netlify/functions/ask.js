exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const { question = "" } = JSON.parse(event.body || "{}");

    if (!question.trim()) {
      return json(400, { error: "Question is required." });
    }

    const url = process.env.AI_API_URL;
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;

    if (!url || !key || !model) {
      return json(500, {
        error: "AI backend is not configured. Check AI_API_URL, AI_API_KEY and AI_MODEL."
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are an AI interview practice assistant. Answer clearly and accurately. For coding questions, explain the solution and provide code when useful."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    console.log("AI provider response:", JSON.stringify(data));

    if (!response.ok) {
      return json(response.status, {
        error:
          data?.error?.message ||
          data?.error ||
          "AI provider returned an error."
      });
    }

    // OpenAI-compatible response
    let answer = data?.choices?.[0]?.message?.content;

    // Handle providers that return content as an array
    if (Array.isArray(answer)) {
      answer = answer
        .map(item => item?.text || item?.content || "")
        .join("");
    }

    // Gemini-style fallback
    if (!answer) {
      answer =
        data?.candidates?.[0]?.content?.parts
          ?.map(part => part?.text || "")
          .join("");
    }

    // Another possible text response
    if (!answer) {
      answer = data?.output_text;
    }

    if (!answer) {
      console.log("Unexpected AI response:", JSON.stringify(data));

      return json(502, {
        error: "AI returned a response, but no answer text was found."
      });
    }

    return json(200, {
      answer: answer
    });

  } catch (error) {
    console.error("Function error:", error);

    return json(500, {
      error: error.message || "AI request failed."
    });
  }
};


function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(body)
  };
}