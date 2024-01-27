import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";

const homeRoutes: Routes = [ { path: '', component: HomeComponent, canActivate: [AuthenticationGuard] } ];

@NgModule({
  imports: [RouterModule.forChild(homeRoutes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
