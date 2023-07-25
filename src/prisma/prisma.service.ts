import { PrismaClient } from "@prisma/client/extension";
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
    constructor() {
      super({
        datasources: {
          db: {
            url: 'postgresql://postgres:123@localhost:5441/nestjs?schema=public',
          }
        }
      });
    }

    async onModuleInit() {
      await this.$connect();
    }

    async onModuleDestroy() {
      await this.$disconnect();
    }
}
