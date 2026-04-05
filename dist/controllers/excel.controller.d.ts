import { Request, Response, NextFunction } from 'express';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadExcel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const exportExcel: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=excel.controller.d.ts.map