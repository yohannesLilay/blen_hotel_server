import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TrimMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    this.trimRequestData(req.body);
    this.trimRequestData(req.query);
    this.trimRequestData(req.params);
    next();
  }

  private trimRequestData(data: any) {
    for (const key in data) {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    }
  }
}
