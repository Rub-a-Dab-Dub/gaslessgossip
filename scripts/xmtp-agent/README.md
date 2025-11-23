XMTP Agent Prototype

This is a small standalone prototype that listens to the backend posts SSE stream and forwards new posts to one or more XMTP recipients.

Requirements
- Node 18+ (ESM support)
- An XMTP-capable Ethereum private key (for the sender wallet)
- Network access to your running backend (the agent connects to `/posts/stream`)

Setup
1. Create a folder env file `scripts/xmtp-agent/.env` (or provide env vars in your shell) with the following keys:

```
# URL of the API that exposes /posts/stream
API_URL=http://localhost:3001

# Private key of the sender wallet used by XMTP (0x...)
XMTP_PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Comma-separated XMTP recipient addresses (wallet addresses)
XMTP_RECIPIENTS=0xRecipientAddress1,0xRecipientAddress2

# XMTP environment (default 'production'; change if needed)
XMTP_ENV=production
```

2. Install dependencies in `scripts/xmtp-agent`:

```bash
cd scripts/xmtp-agent
npm init -y
npm install @xmtp/xmtp-js ethers eventsource dotenv
```

3. Run the agent:

```bash
node agent.mjs
```

Notes
- The agent uses the SSE endpoint at `${API_URL}/posts/stream`. Ensure this endpoint is reachable from where the agent runs and that your API allows SSE connections (CORS + cookies if needed).
- XMTP requires a wallet/private key. Keep this key secret and use a wallet with minimal privileges for the prototype.
- This is a prototype: it sends the post body as plain text to configured recipients. Integrations should handle errors, retries, and message formatting as needed.

Next steps / Improvements
- Use a managed queue and persistent state to survive restarts.
- Add recipient discovery (e.g., look up XMTP addresses for app users) instead of static recipients.
- Use richer message formats (attachments, images) supported by XMTP.
- Integrate agent as a background service inside your backend (NestJS provider) if you want server-side routing and access controls.
