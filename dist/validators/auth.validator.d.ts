import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        name: string;
    }, {
        email: string;
        password: string;
        name: string;
    }>;
    query: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    params: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
        name: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}, {
    body: {
        email: string;
        password: string;
        name: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
    query: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    params: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}, {
    body: {
        email: string;
        password: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
    query: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    params: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
}, "strip", z.ZodTypeAny, {
    body: {
        refreshToken: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}, {
    body: {
        refreshToken: string;
    };
    params?: {} | undefined;
    query?: {} | undefined;
}>;
//# sourceMappingURL=auth.validator.d.ts.map