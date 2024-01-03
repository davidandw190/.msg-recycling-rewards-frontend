import {RecyclingCenter} from "./recycling-center";
import {User} from "./user";
import {RecyclingActivity} from "./recycling-activity";
import {CenterStats} from "./center-stats";

export interface CenterDetailsResponse {
  user: User;
  center: RecyclingCenter;
  activities: RecyclingActivity[];
  rewardPoints: Number;
  centerStats: CenterStats
}
