import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './infra/env/env.service';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './infra/http/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false,
  });

  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(EnvService);
  const port = configService.get('PORT');
  const corsOrigin = configService.get('CORS_ORIGIN');

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Project Pets API')
      .setDescription(
        'API REST de adoção de pets.\n\n' +
          '**Como autenticar:** faça `POST /sessions`, copie o `accessToken` da resposta e clique em **Authorize** no topo da página.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Cole aqui o accessToken retornado pelo POST /sessions',
        },
        'JWT',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
}
bootstrap();
