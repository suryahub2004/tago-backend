import { Module, Global } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { AppGateway } from '../../gateways/app.gateway';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [BroadcastController],
  providers: [BroadcastService, AppGateway],
  exports: [BroadcastService, AppGateway],
})
export class BroadcastModule {}
