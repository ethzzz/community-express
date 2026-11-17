import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    app.use((req: Request, res: Response, next: NextFunction) => {
        const requestId =
            typeof req.headers['x-request-id'] === 'string'
                ? req.headers['x-request-id']
                : randomUUID();
        res.setHeader('x-request-id', requestId);
        next();
    });

    app.enableCors({
        origin: config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3001',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());

    const swagger = new DocumentBuilder()
        .setTitle('Community Admin API')
        .setDescription('审核、举报、用户治理与审计')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

    const port = Number(config.get<string>('ADMIN_PORT') ?? 3002);
    await app.listen(port);
    console.log(`Admin API listening on http://127.0.0.1:${port}`);
}

await bootstrap();
