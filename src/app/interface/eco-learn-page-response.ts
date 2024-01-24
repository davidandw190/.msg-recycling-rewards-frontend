import {EducationalResource} from "./educational-resource";
import {Page} from "./page";
import {User} from "./user";

export interface EcoLearnPageResponse {
  page: Page<EducationalResource>;
  user: User;
  availableCategories: string[];
  availableContentTypes: string[];
}
