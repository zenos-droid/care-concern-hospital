import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { badRequest } from "../utils/errors";

export const validate = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return next(badRequest("Validation failed", result.error.flatten()));
  }
  req.body = result.data.body ?? req.body;
  req.query = result.data.query ?? req.query;
  req.params = result.data.params ?? req.params;
  return next();
};
