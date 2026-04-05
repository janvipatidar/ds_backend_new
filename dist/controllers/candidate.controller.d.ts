import { Request, Response, NextFunction } from 'express';
export declare const createCandidate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCandidates: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCandidateById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCandidate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCandidate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCandidateStats: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=candidate.controller.d.ts.map