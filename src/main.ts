import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './modules/common/filters/http-exception.filter';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Job Marketplace API')
    .setDescription('A complete job marketplace API where Hirers can post jobs and Hustlers can apply')
    .setVersion('1.0.0')
    .addTag('Authentication', 'User registration and authentication endpoints')
    .addTag('Jobs', 'Job posting and management endpoints')
    .addTag('Applications', 'Job application endpoints')
    .addBearerAuth(
      {
        description: 'JWT Authorization',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'defaultBearerAuth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, //  Enables class-transformer to work
      transformOptions: {
        enableImplicitConversion: true, //  Converts "true" => true, "1" => 1, etc.
      },
      whitelist: false, //  Strip unknown properties
      forbidNonWhitelisted: false, //  Don't throw error for unknown properties
    }),
  );


  app.use(bodyParser.json({ limit: '250mb' }));
  app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }));

  app.enableCors();
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3000);
  Logger.log(
    `🚀 Server started on port ${process.env.PORT || 3000} `,
    'Bootstrap',
  );
}
bootstrap();
