import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {LeaderboardComponent} from "./leaderboard.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";

const leaderboardRoutes: Routes = [
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(leaderboardRoutes)],
  exports: [RouterModule]
})
export class LeaderboardRoutingModule {}
