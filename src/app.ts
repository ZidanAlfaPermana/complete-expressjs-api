import express, { Application } from "express";
import routes from "./routes";
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(express.json());
app.use(requestLogger);
app.use("/api", routes);
app.use(errorHandler);
app.use(notFoundHandler);

export default app;