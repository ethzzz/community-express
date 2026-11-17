import { Module } from '@nestjs/common';
import { ApiClient } from '../../clients/api-client.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
    controllers: [DashboardController],
    providers: [ApiClient],
})
export class DashboardModule {}
