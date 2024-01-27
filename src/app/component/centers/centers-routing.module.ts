import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CenterAllComponent} from "./center-all/center-all.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {CenterNewComponent} from "./center-new/center-new.component";
import {CenterDetailsComponent} from "./center-details/center-details.component";

const centerRoutes: Routes = [
  { path: 'centers/all', component: CenterAllComponent, canActivate: [AuthenticationGuard] },
  { path: 'centers/new', component: CenterNewComponent, canActivate: [AuthenticationGuard] },
  { path: 'centers/:id', component: CenterDetailsComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(centerRoutes)],
  exports: [RouterModule]
})
export class CentersRoutingModule {}
