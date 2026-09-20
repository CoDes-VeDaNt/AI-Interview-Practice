exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const { question = "" } = JSON.parse(event.body || "{}");

    if (!question.trim()) {
      return json(400, { error: "Question is required." });
    }

    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "gemini-2.5-flash";

    if (!key) {
      return json(500, {
        error: "Gemini API key is missing. Check AI_API_KEY in Netlify."
      });
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You are an AI interview practice assistant. " +
                "Answer clearly and accurately. " +
                "For coding questions, explain the solution and provide code when useful."
            }
          ]
        },

        contents: [
          {
            role: "user",
            parts: [
              {
                text: question
              }
            ]
          }
        ],

        generationConfig: {
          temperature: 0.3
        }
      })
    });

    const data = await response.json();

    console.log("Gemini response:", JSON.stringify(data));

    if (!response.ok) {
      return json(response.status, {
        error:
          data?.error?.message ||
          "Gemini API returned an error."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part?.text || "")
        .join("");

    if (!answer) {
      return json(502, {
        error: "Gemini responded, but no answer text was returned."
      });
    }

    return json(200, {
      answer: answer
    });

  } catch (error) {
    console.error("Gemini function error:", error);

    return json(500, {
      error: error.message || "Gemini request failed."
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