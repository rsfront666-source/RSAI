export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI API
    if (url.pathname === "/api/chat") {

      if (request.method !== "POST") {
        return new Response("Cudu AI API is running 🤖", {
          status: 200
        });
      }

      try {
        const body = await request.json();

        if (!body.messages || !Array.isArray(body.messages)) {
          return new Response(
            JSON.stringify({ error: "Messages are required" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: body.messages,
              temperature: 0.7,
              max_tokens: 1000
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              error: data?.error?.message || "Groq API error"
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" }
            }
          );
        }

        return new Response(
          JSON.stringify({
            reply: data.choices?.[0]?.message?.content || "No response."
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Server error"
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // Serve GitHub website files
    return env.ASSETS.fetch(request);
  }
};
