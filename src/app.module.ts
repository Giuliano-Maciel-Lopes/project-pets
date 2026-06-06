import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from './infra/http/http.module';
import { envSchema } from './infra/env/env.schema';
import { EnvService } from './infra/env/env.service';
import { EnvModule } from './infra/env/env.module';
import { AuthModule } from './infra/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
    AuthModule,
    HttpModule,
    EnvModule,
  ],
  providers: [EnvService],
})
export class AppModule {}
