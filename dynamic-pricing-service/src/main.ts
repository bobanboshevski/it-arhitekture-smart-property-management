import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // swagger configuration - http://localhost:3002/api/docs

    const config = new DocumentBuilder()
        .setTitle("Dynamic Pricing API")
        .setDescription("API for dynamic pricing microservice")
        .setVersion("1.0")
        .addTag("pricing")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    
    await app.listen(process.env.PORT ?? 3000);


}

bootstrap();
