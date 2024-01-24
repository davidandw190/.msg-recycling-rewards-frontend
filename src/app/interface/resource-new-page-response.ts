import {User} from "./user";

export interface ResourceNewPageResponse {
  availableContentTypes: string[];
  availableCategories: string[];
  user: User;
}
