import mongoose, { Schema } from 'mongoose';
const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000,
    },
}, {
    timestamps: true,
});
// Index for faster queries
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });
export const Contact = mongoose.model('Contact', contactSchema);
//# sourceMappingURL=Contact.model.js.map