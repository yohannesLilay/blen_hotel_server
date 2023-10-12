import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/** Services */
import { UsersService } from './users.service';

/** Controllers */
import { UsersController } from './users.controller';

/** Entities */
import { User } from './entities/user.entity';

/** Custom validators */
import { UniqueEmailValidator } from './validators/unique-email.validator';
import { UniquePhoneNumberValidator } from './validators/unique-phone-number.validator';
import { ValidRolesValidator } from './validators/valid-roles.validator';

/** Modules */
import { RolesModule } from '../roles/roles.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), RolesModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UniqueEmailValidator,
    UniquePhoneNumberValidator,
    ValidRolesValidator,
  ],
  exports: [UsersService],
})
export class UsersModule {}
