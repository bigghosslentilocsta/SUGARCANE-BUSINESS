import mongoose, { Schema, type Document } from 'mongoose';

export type SettlementStatus = 'Paid' | 'Not Paid';

export interface ITransaction extends Document {
  clientId: string;
  clientName: string;
  quantity: number;
  unit: string;
  amount: number;
  paidAmount: number;
  status: SettlementStatus;
  date: Date;
  settledAt?: Date | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unit: {
      type: String,
      default: 'Tons',
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Paid', 'Not Paid'],
      default: 'Not Paid',
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    settledAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

export const TransactionModel =
  (mongoose.models.Transaction as mongoose.Model<ITransaction>) ||
  mongoose.model<ITransaction>('Transaction', transactionSchema);
