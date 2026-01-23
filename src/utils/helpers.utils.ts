import mongoose, { ObjectId, Types } from "mongoose";

export function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
}

export function toObjectIds(
  ids: (string | Types.ObjectId)[],
): Types.ObjectId[] {
  return ids.map(toObjectId);
}
