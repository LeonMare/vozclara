# Glama introspection wrapper for VozClara MCP server.
#
# VozClara MCP runs natively on Cloudflare Workers (see worker/src/mcp/)
# as a Streamable-HTTP remote MCP server. This container exists only to
# bridge local stdio MCP to that hosted endpoint, so Glama (and any other
# tool that expects a containerised stdio MCP) can run introspection,
# `tools/list`, and `tools/call` tests against it.
#
# The bridge is mcp-remote — Cloudflare's reference stdio↔HTTP MCP proxy.
# It speaks JSON-RPC over stdin/stdout on the local side and proxies each
# message to the configured remote URL.
#
# Anonymous endpoint by default. The Pro endpoint at /api/mcp/pro requires
# OAuth 2.1 (PKCE S256) and is intentionally not exposed here — Glama's
# automated introspection cannot complete an interactive consent flow.

FROM node:20-alpine

WORKDIR /app

# Pre-install mcp-remote globally so `docker run` starts immediately
# rather than waiting on npx's first-run download.
RUN npm install -g mcp-remote@latest

# Stdio MCP → HTTPS Streamable-HTTP MCP at vozclara.app/api/mcp.
ENTRYPOINT ["mcp-remote", "https://vozclara.app/api/mcp"]
