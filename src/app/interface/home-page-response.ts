import {User} from "./user";
import {RecyclingCenter} from "./recycling-center";
import {Page} from "./page";
import {UserStats} from "./user-stats";
import {AppStats} from "./app-stats";

export interface HomePageResponse {
  user: User;
  page?: Page<RecyclingCenter>;
  userRewardPoints: number;
  userStats?: UserStats;
  pointsUntilVoucher?: number;
  appStats?: AppStats;
  ecoTip: string;
}
