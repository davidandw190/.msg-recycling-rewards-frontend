import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { VouchersComponent } from "./vouchers/vouchers.component";
import { AuthenticationGuard } from "../../guard/authentication.guard";
import { VoucherDetailsComponent } from "./voucher-details/voucher-details.component";

const voucherRoutes: Routes = [
  {
    path: 'vouchers',
    canActivate: [AuthenticationGuard],
    children: [
      { path: '', component: VouchersComponent, },
      { path: ':code', component: VoucherDetailsComponent, },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(voucherRoutes)],
  exports: [RouterModule],
})
export class VouchersRoutingModule {}
