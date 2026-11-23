import mongoose, { Schema, type Document } from 'mongoose';

export type QuoteStatus = 'New' | 'Contacted' | 'Quoted' | 'Closed';

export interface IInquiry extends Document {
  name: string;
  phone: string;
  company: string;
  message: string;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quoted', 'Closed'],
      default: 'New',
    },
  },
  { timestamps: true }
);

export const InquiryModel =
  (mongoose.models.Inquiry as mongoose.Model<IInquiry>) ||
  mongoose.model<IInquiry>('Inquiry', inquirySchema);
