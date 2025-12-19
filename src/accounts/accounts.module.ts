import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountRepository } from './repositories/account.repository';

@Module({
  providers: [AccountsService,AccountRepository],
  controllers: [AccountsController],
  exports: [AccountsService]
})
export class AccountsModule { }
