import { Module } from '@nestjs/common';
import { XmtpService } from './xmtp.service';

@Module({
  providers: [XmtpService],
  exports: [XmtpService],
})
export class XmtpModule {}
