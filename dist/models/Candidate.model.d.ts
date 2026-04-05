import mongoose, { Document } from 'mongoose';
export interface ICandidate extends Document {
    name: string;
    designation: string;
    dateOfBirth: Date;
    education: string;
    experience: number;
    noticePeriod: string;
    currentEmployer: string;
    previousEmployer: string;
    keySkills: string[];
    currentLocation: string;
    currentIndustry: string;
    pastIndustry: string;
    email: string;
    phone: string;
    currentAnnualSalary: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Candidate: mongoose.Model<ICandidate, {}, {}, {}, mongoose.Document<unknown, {}, ICandidate, {}, {}> & ICandidate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Candidate.model.d.ts.map