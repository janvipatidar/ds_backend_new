import 'dotenv/config';
export declare const config: {
    nodeEnv: "development" | "production" | "test";
    port: string;
    mongoUri: string;
    jwt: {
        secret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    corsOrigin: string[];
    rateLimit: {
        windowMs: string;
        max: string;
    };
};
export default config;
//# sourceMappingURL=env.d.ts.map