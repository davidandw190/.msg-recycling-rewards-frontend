import {User} from "./user";
import {RecyclingCenter} from "./recycling-center";
import {Page} from "./page";

export interface CenterNewResponse {
  user: User;
  page: Page<RecyclingCenter>;
}
