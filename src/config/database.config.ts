import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./env.config";
import { Peserta, JurnalHarian, Mentor } from "../entities";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.name,
    synchronize: false,
    logging: config.app.env === "development",
    entities: [Peserta, JurnalHarian, Mentor],
    migrations: ["src/migrations/**/*.ts"],
});