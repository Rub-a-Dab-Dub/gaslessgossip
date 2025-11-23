import 'dotenv/config';
import EventSource from 'eventsource';
import { Wallet } from 'ethers';
import { Client } from '@xmtp/xmtp-js';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const XMTP_PRIVATE_KEY = process.env.XMTP_PRIVATE_KEY;
const RECIPIENTS = (process.env.XMTP_RECIPIENTS || '').split(',').map(s => s.trim()).filter(Boolean);
const XMTP_ENV = process.env.XMTP_ENV || 'production';

if (!XMTP_PRIVATE_KEY) {
  console.error('Missing XMTP_PRIVATE_KEY in environment');
  process.exit(1);
}
if (RECIPIENTS.length === 0) {
  console.error('Missing XMTP_RECIPIENTS in environment. Provide one or more wallet addresses separated by commas.');
  process.exit(1);
}

const base = API_URL.replace(/\/$/, '');
const SSE_URL = `${base}/posts/stream`;

async function start() {
  console.log('Starting XMTP agent');
  console.log('SSE:', SSE_URL);
  console.log('Recipients:', RECIPIENTS);
 
  const wallet = new Wallet(XMTP_PRIVATE_KEY);
  const xmtp = await Client.create(wallet, { env: XMTP_ENV });
  console.log('XMTP client created as', wallet.address);

  const es = new EventSource(SSE_URL);

  es.onopen = () => console.log('Connected to posts SSE');
  es.onerror = (err) => console.error('SSE error', err);

  // small queue to avoid flooding recipients if many posts arrive
  const queue = [];
  let sending = false;

  es.onmessage = async (ev) => {
    try {
      const parsed = JSON.parse(ev.data);
      // controller wraps payload in { data }
      const payload = parsed?.data ?? parsed;
      if (!payload || !payload.id) return;
      console.log('New post received', payload.id);
      queue.push(payload);
      if (!sending) processQueue(xmtp, queue);
    } catch (err) {
      console.error('Failed to handle SSE message', err);
    }
  };
}

async function processQueue(xmtp, queue) {
  let sending = true;
  while (queue.length) {
    const post = queue.shift();
    try {
      await notifyRecipients(xmtp, post);
    } catch (err) {
      console.error('Failed to notify recipients for post', post?.id, err);
    }
    // small delay between sends
    await new Promise((r) => setTimeout(r, 500));
  }
  sending = false;
}

async function notifyRecipients(xmtp, post) {
  const body = buildMessageFromPost(post);
  for (const r of RECIPIENTS) {
    try {
      const conv = await xmtp.conversations.newConversation(r);
      await conv.send(body);
      console.log(`Sent post ${post.id} to ${r}`);
      // small delay between recipients
      await new Promise((r2) => setTimeout(r2, 200));
    } catch (err) {
      console.error('Failed sending to', r, err?.message || err);
    }
  }
}

function buildMessageFromPost(post) {
  const lines = [];
  lines.push(`New post from ${post.author?.username ?? 'unknown'}`);
  if (post.content) lines.push(post.content);
  if (post.medias && post.medias.length) {
    lines.push('Attachments:');
    for (const m of post.medias) lines.push(m);
  }
  lines.push(`Posted at: ${post.createdAt}`);
  return lines.join('\n');
}

start().catch((err) => {
  console.error('Agent failed', err);
  process.exit(1);
});
