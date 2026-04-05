import { Document, Model } from 'mongoose';
export interface IAdmin extends Document {
    username: string;
    email: string;
    password: string;
    role: 'super_admin' | 'recruiter';
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
interface IAdminModel extends Model<IAdmin> {
    seedDefaultAdmin(): Promise<void>;
}
export declare const Admin: IAdminModel;
export {};
//# sourceMappingURL=Admin.model.d.ts.map