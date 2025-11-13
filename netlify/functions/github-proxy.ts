const DEFAULT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, User-Agent",
};

const FORWARD_HEADER_KEYS = ["authorization", "content-type", "user-agent"] as const;

const DEFAULT_USER_AGENT = "Gephi-Lite/1.0 (+https://gephi.org/gephi-lite)";

export const handler = async (event: any) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: DEFAULT_HEADERS,
      body: "",
    };
  }

  const path = (event.path || "").replace(/^\/\.netlify\/functions\/github-proxy\/?/, "");

  if (!path) {
    return {
      statusCode: 400,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ error: "path parameter is required" }),
    };
  }

  const query = event.rawQuery ? `?${event.rawQuery}` : "";
  const targetUrl = `https://github.com/${path}${query}`;

  const forwardHeaders: Record<string, string> = {};
  FORWARD_HEADER_KEYS.forEach((key) => {
    const value = event.headers?.[key];
    if (value) {
      forwardHeaders[key] = value;
    }
  });

  if (!forwardHeaders["user-agent"]) {
    forwardHeaders["user-agent"] = DEFAULT_USER_AGENT;
  }

  let body: string | undefined;
  if (event.body && event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
    body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body;
  }

  try {
    const response = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: forwardHeaders,
      body,
    });

    const contentType = response.headers.get("content-type");
    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: {
        ...DEFAULT_HEADERS,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body: responseBody,
    };
  } catch (error) {
    console.error("GitHub proxy error:", error);
    return {
      statusCode: 500,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ error: "Failed to proxy request to GitHub" }),
    };
  }
};
