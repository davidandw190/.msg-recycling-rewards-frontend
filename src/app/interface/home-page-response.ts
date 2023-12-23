import {User} from "./user";
import {RecyclingCenter} from "./recycling-center";
import {Page} from "./page";

export interface HomePageResponse {
  user: User;
  page: Page<RecyclingCenter>
}
