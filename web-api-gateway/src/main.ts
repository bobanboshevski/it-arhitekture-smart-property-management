import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {HttpExceptionFilter} from './shared/filters/http-exception.filter';
import {LoggingInterceptor} from './shared/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Parse comma-separated origins from env
    const corsOrigins = (process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    
    app.enableCors({
        origin: corsOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // Global prefix for all web gateway routes
    app.setGlobalPrefix('api/v1');

    // Validate all incoming request bodies
    app.useGlobalPipes(
        new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}),
    );

    // Global error handling
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global request/response logging
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger docs
    const config = new DocumentBuilder()
        .setTitle('Web API Gateway')
        .setDescription('Single entry point for the web client')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Web API Gateway running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();