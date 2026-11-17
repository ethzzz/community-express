import { Module } from '@nestjs/common';
import { ApiClient } from '../../clients/api-client.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';

@Module({
    controllers: [AdminUsersController],
    providers: [AdminUsersService, ApiClient],
})
export class AdminUsersModule {}
