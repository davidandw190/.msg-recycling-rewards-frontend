import {User} from "./user";
import {Page} from "./page";
import {RecyclingCenter} from "./recycling-center";

export interface CentersPageResponse {
  page: Page<RecyclingCenter>;
  user: User;
}
