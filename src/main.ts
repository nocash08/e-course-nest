import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("/api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((e) => ({
            field: e.property,
            messages: Object.values(e.constraints || {}),
          })),
        );
      },
    }),
  );

  app.useStaticAssets(join(__dirname, "..", "public"), {
    prefix: "/public/",
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
