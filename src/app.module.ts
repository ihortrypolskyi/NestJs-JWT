import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from "./prisma/prisma.service";

@Global()
@Module({
  imports: [AuthModule, PrismaModule],
  exports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
