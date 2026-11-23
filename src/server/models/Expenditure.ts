import mongoose, { Schema, type Document } from 'mongoose';

export interface IExpenditure extends Document {
  date: Date;
  truckNumber: string;
  driverName: string;
  description: string;
  amountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const expenditureSchema = new Schema<IExpenditure>(
  {
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    truckNumber: {
      type: String,
      default: '',
      trim: true,
    },
    driverName: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const ExpenditureModel =
  (mongoose.models.Expenditure as mongoose.Model<IExpenditure>) ||
  mongoose.model<IExpenditure>('Expenditure', expenditureSchema);
