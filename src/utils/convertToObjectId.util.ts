import mongoose from 'mongoose';

export const convertObjectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

export const convertObjIdToString = (id: mongoose.Types.ObjectId): string => {
  return id.toString();
};
