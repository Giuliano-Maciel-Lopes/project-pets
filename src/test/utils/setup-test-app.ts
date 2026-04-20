import { INestApplication } from '@nestjs/common';

export function setupTestApp(app: INestApplication): INestApplication {
  app.use((req: any, _res: any, next: () => void) => {
    if (!req.cookies) {
      req.cookies = {};
      const cookieHeader = req.headers.cookie as string | undefined;
      if (cookieHeader) {
        cookieHeader.split(';').forEach((part) => {
          const [name, ...rest] = part.trim().split('=');
          if (name) req.cookies[name.trim()] = rest.join('=');
        });
      }
    }
    next();
  });
  return app;
}
