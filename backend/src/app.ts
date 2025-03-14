import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { DataController } from "./controllers/HealthController";
import { DatasetController } from "./controllers/DatasetController";
import { GlobalErrorHandler } from "./middlewares/ErrorMiddleware";
import cors from "cors";
import { connectToDatabase } from "./config/database";
import logger from "./utils/logger";

useContainer(Container);

const app = express();

connectToDatabase()
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`, { error: err });
    process.exit(1);
  });

app.use(express.json());
app.use(cors());

const expressApp = createExpressServer({
  controllers: [DataController, DatasetController],
  middlewares: [GlobalErrorHandler],
  defaultErrorHandler: false,
  classTransformer: true,
  validation: {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    validationError: {
      target: false,
      value: false,
    },
  },
});

app.use(expressApp);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});
