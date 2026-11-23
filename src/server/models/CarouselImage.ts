import mongoose, { Schema, type Document } from 'mongoose';

export interface ICarouselImage extends Document {
  url: string;
  publicId: string;
  caption: string;
  captionTe: string;
  captionHi: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const carouselImageSchema = new Schema<ICarouselImage>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: 'Sugarcane Harvest & Dispatch',
      trim: true,
    },
    captionTe: {
      type: String,
      default: '',
      trim: true,
    },
    captionHi: {
      type: String,
      default: '',
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const CarouselImageModel =
  (mongoose.models.CarouselImage as mongoose.Model<ICarouselImage>) ||
  mongoose.model<ICarouselImage>('CarouselImage', carouselImageSchema);
