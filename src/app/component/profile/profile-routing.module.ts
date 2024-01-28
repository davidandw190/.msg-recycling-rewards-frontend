import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ProfileComponent} from "./profile/profile.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {CenterAllComponent} from "../centers/center-all/center-all.component";

const profileRoutes: Routes = [
  { path: 'profile', component: ProfileComponent, canActivate: [AuthenticationGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(profileRoutes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule {}
