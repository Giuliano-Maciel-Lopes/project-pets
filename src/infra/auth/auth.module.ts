import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../env/env.service";
import { JwtModule } from "@nestjs/jwt";
import { EnvModule } from "../env/env.module";
import { PassportModule } from "@nestjs/passport";

@Module({
    providers:[JwtService , EnvService],
    imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get('JWT_PRIVATE_KEY')
        const publicKey = env.get('JWT_PUBLIC_KEY')

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
    

})
export class AuthModule{}