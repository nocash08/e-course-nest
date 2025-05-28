import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: ["dist/**/entities/*.entity{.ts,.js}"],
  migrations: ["dist/src/migrations/*{.ts,.js}"],
});
