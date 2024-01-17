import {User} from "./user";
import {LeaderboardEntry} from "./leaderboard-entry";
import {Page} from "./page";

export interface LeaderboardPageResponse {
  user: User;
  page: Page<LeaderboardEntry>
}
