import Role from "../../models/role.model";
import User, { IUser } from "../../models/user.model";

export const getAllUsersService = async (): Promise<IUser[]> => {
  return User.find().lean();
};
