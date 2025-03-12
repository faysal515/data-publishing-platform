import winston from "winston";
import path from "path";
import fs from "fs";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();

  if (envLogLevel && Object.keys(levels).includes(envLogLevel)) {
    return envLogLevel;
  }

  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.json()
);

const currentLevel = level();

const logger = winston.createLogger({
  level: currentLevel,
  levels,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),

    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
    }),
  ],
});

logger.info(`Logger initialized with level: ${currentLevel}`);

export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
