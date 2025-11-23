import { Injectable, Logger } from '@nestjs/common';

export interface XmtpConfig {
  enabled: boolean;
  privateKey?: string;
  recipients: string[];
  env?: string;
}

@Injectable()
export class XmtpService {
  private readonly logger = new Logger(XmtpService.name);
  private client: any | null = null;
  private wallet: any | null = null;
  private initialized = false;
  private config: XmtpConfig;

  constructor() {
    const enabled = (process.env.XMTP_ENABLED || 'false').toLowerCase() === 'true';
    const pk = process.env.XMTP_PRIVATE_KEY;
    const recipients = (process.env.XMTP_RECIPIENTS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const env = process.env.XMTP_ENV || 'production';
    this.config = { enabled, privateKey: pk, recipients, env };

    if (!this.config.enabled) {
      this.logger.log('XMTP disabled via XMTP_ENABLED=false');
    }
  }

  private async ensureInitialized() {
    if (!this.config.enabled) return false;
    if (this.initialized) return true;

    if (!this.config.privateKey) {
      this.logger.warn('XMTP private key not configured; skipping initialization');
      return false;
    }

    try {
      const { Client } = await import('@xmtp/xmtp-js');
      const { Wallet } = await import('ethers');
      this.wallet = new Wallet(this.config.privateKey as string);
      this.client = await Client.create(this.wallet, { env: this.config.env });
      this.initialized = true;
      this.logger.log(`XMTP client initialized as ${this.wallet.address}`);
      return true;
    } catch (err) {
      this.logger.error('Failed to initialize XMTP client', err as any);
      return false;
    }
  }

  async notifyRecipients(post: any) {
    if (!this.config.enabled) return;
    const ok = await this.ensureInitialized();
    if (!ok) return;

    const body = this.buildMessage(post);
    for (const recipient of this.config.recipients) {
      try {
        const conv = await this.client.conversations.newConversation(recipient);
        await conv.send(body);
        this.logger.log(`Sent XMTP message for post ${post.id} to ${recipient}`);
      } catch (err) {
        this.logger.error('Failed to send XMTP message', { recipient, err });
      }
      // small pause to avoid rate issues
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  private buildMessage(post: any) {
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
}
