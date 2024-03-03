import {RouterModule, Routes} from "@angular/router";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {NgModule} from "@angular/core";
import {EcoLearnComponent} from "./eco-learn/eco-learn.component";
import {EcoLearnNewComponent} from "./eco-learn-new/eco-learn-new.component";


const ecoLearnRoutes: Routes = [
  {
    path: 'eco-learn',
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', component: EcoLearnComponent, },
      { path: 'new', component: EcoLearnNewComponent, },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(ecoLearnRoutes)],
  exports: [RouterModule]
})
export class EcoLearnRoutingModule {}
