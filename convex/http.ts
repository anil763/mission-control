import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// POST /update-status
// Body: { agentId, status, currentTask? }
http.route({
  path: "/update-status",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const { agentId, status, currentTask } = await req.json();

    if (!agentId || !status) {
      return new Response(JSON.stringify({ error: "agentId and status required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ctx.runMutation(api.agents.updateStatus, { agentId, status, currentTask });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
