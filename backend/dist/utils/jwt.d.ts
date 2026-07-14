export interface TokenPayload {
    id: string;
    email: string;
    role: 'ADMIN' | 'COUNSELOR';
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
//# sourceMappingURL=jwt.d.ts.map