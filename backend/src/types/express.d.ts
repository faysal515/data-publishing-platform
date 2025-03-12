import { Express } from "express-serve-static-core";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Multer extends Multer {}
  }
}
