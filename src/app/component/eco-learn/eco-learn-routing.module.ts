import {RouterModule, Routes} from "@angular/router";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {NgModule} from "@angular/core";
import {EcoLearnComponent} from "./eco-learn/eco-learn.component";
import {EcoLearnNewComponent} from "./eco-learn-new/eco-learn-new.component";

const ecoLearnRoutes: Routes = [
  { path: 'eco-learn', component: EcoLearnComponent, canActivate: [AuthenticationGuard] },
  { path: 'eco-learn/new', component: EcoLearnNewComponent, canActivate: [AuthenticationGuard] },

];

@NgModule({
  imports: [RouterModule.forChild(ecoLearnRoutes)],
  exports: [RouterModule]
})
export class EcoLearnRoutingModule {}
