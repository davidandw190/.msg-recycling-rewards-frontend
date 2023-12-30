import {RecyclingCenter} from "./recycling-center";
import {User} from "./user";
import {RecyclingActivity} from "./recycling-activity";

export interface CenterDetailsResponse {
  user: User;
  center: RecyclingCenter;
  activities: RecyclingActivity[];
  rewardPoints: Number;
}
