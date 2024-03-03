import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CenterAllComponent} from "./center-all/center-all.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {CenterNewComponent} from "./center-new/center-new.component";
import {CenterDetailsComponent} from "./center-details/center-details.component";
import {VouchersComponent} from "../vouchers/vouchers/vouchers.component";
import {VoucherDetailsComponent} from "../vouchers/voucher-details/voucher-details.component";


const centerRoutes: Routes = [
  {
    path: 'centers',
    canActivate: [AuthenticationGuard],
    children: [
      { path: 'all', component: CenterAllComponent, },
      { path: 'new', component: CenterNewComponent, },
      { path: ':id', component: CenterDetailsComponent, },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(centerRoutes)],
  exports: [RouterModule]
})
export class CentersRoutingModule {}
