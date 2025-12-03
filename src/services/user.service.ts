import User, { IUser } from "../models/user.model";

export const getAllUsersService = async (): Promise<IUser[]> => {
  return User.find().lean();
};

export const createUserService = async (
  data: Partial<IUser>
): Promise<IUser> => {
  const user = new User(data);
  return user.save();
};
