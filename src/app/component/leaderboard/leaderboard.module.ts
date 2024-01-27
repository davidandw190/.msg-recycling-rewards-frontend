import {SharedModule} from "../../shared/shared.module";
import {NgModule} from "@angular/core";
import {LeaderboardComponent} from "./leaderboard.component";
import {LeaderboardRoutingModule} from "./leaderboard-routing.module";
import {NavbarModule} from "../navbar/navbar.module";

@NgModule({
  declarations: [LeaderboardComponent],
  imports: [ SharedModule, LeaderboardRoutingModule, NavbarModule ]
})
export class LeaderboardModule {}
