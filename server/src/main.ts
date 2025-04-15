import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; 
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Allow (cookies) to be sent
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Enable global validation pipe - IMPORTANT for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.setGlobalPrefix('api'); // global API prefix

  // --- Swagger/OpenAPI Setup ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Survista API')
    .setDescription('API documentation for the Survista survey platform')
    .setVersion('1.0')
    .addBearerAuth() 
    .addCookieAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get<number>('PORT');
  await app.listen(port!);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api-docs`); // Log Swagger URL

}
bootstrap();
