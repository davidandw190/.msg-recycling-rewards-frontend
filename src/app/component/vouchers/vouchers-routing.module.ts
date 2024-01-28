import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {VouchersComponent} from "./vouchers/vouchers.component";
import {AuthenticationGuard} from "../../guard/authentication.guard";
import {VoucherDetailsComponent} from "./voucher-details/voucher-details.component";

const voucherRoutes: Routes = [
  { path: 'vouchers', component: VouchersComponent, canActivate: [AuthenticationGuard] },
  { path: 'vouchers/:code', component: VoucherDetailsComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(voucherRoutes)],
  exports: [RouterModule]
})
export class VouchersRoutingModule {}
