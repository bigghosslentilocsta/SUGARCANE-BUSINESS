import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  tokenVersion: number;
  fullName: string;
  businessName: string;
  role: string;
  phone: string;
  email: string;
  warehouseAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      default: 'Mallikarjuna Sugarcane Suppliers',
      trim: true,
    },
    role: {
      type: String,
      default: 'Managing Owner',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 9392457024',
      trim: true,
    },
    email: {
      type: String,
      default: 'pavankumar111205@gmail.com',
      trim: true,
    },
    warehouseAddress: {
      type: String,
      default:
        'Mallikarjuna Sugarcane Suppliers, Market, Tara Nagar, Lingampally, Serilingampalle (M), Telangana 500019',
      trim: true,
    },
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema);
