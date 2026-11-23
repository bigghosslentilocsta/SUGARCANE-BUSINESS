import mongoose, { Schema, type Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

clientSchema.index({ name: 'text', phone: 'text' });

export const ClientModel =
  (mongoose.models.Client as mongoose.Model<IClient>) ||
  mongoose.model<IClient>('Client', clientSchema);
