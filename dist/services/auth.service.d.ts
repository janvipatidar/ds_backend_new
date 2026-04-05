interface TokenPair {
    token: string;
    refreshToken: string;
}
interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
}
export declare class AuthService {
    register(name: string, email: string, password: string): Promise<{
        user: UserData;
        tokens: TokenPair;
    }>;
    login(email: string, password: string): Promise<{
        user: UserData;
        tokens: TokenPair;
    }>;
    getUserById(userId: string): Promise<UserData>;
    refreshToken(refreshToken: string): Promise<TokenPair>;
    private generateTokens;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map