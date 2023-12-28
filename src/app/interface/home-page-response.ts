import {User} from "./user";
import {RecyclingCenter} from "./recycling-center";
import {Page} from "./page";
import {UserStats} from "./user-stats";

export interface HomePageResponse {
  user: User;
  page: Page<RecyclingCenter>
  userStats: UserStats;
}
