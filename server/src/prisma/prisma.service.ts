import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{

  async onModuleInit() {
    // Connect to the database when the application starts
    await this.$connect();
  }

}
