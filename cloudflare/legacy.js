// Keep the original Durable Object class and namespace alive.
export { PortfolioAccount } from "./worker.js";

export default {
  fetch(request) {
    const destination = new URL(request.url);
    destination.protocol = "https:";
    destination.hostname = "homepage.gyagp.workers.dev";
    destination.port = "";
    if (!["GET", "HEAD"].includes(request.method)) {
      // An old open page must reload at the new origin before sending mutations.
      return Response.json(
        { error: "siteMoved", url: destination.href },
        {
          status: 409,
          headers: { Location: destination.href, "Cache-Control": "no-store" },
        },
      );
    }
    return new Response(null, {
      status: 308,
      headers: {
        Location: destination.href,
        "Cache-Control": "public, max-age=300",
      },
    });
  },
};
