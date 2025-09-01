import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  dateOfBirth: Date;
  googleId?: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  googleId: { type: String }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);