import { Module } from '@nestjs/common';
import { ApiClient } from '../../clients/api-client.js';
import { ModerationController } from './moderation.controller.js';
import { ModerationService } from './moderation.service.js';

@Module({
    controllers: [ModerationController],
    providers: [ModerationService, ApiClient],
})
export class ModerationModule {}
