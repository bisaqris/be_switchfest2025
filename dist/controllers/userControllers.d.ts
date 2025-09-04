import { Request, Response } from "express";
export declare const getUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getUser: (req: Request, res: Response) => Promise<void>;
export declare const createUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=userControllers.d.ts.map