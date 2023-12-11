import {User} from "./user";
import {Role} from "./role";

/**
 * Represents the user profile, including user details, roles, and access/refresh tokens.
 */
export interface Profile {
  user: User;
  roles?: Role[];
  access_token?: string;
  refresh_token?: string;
}
