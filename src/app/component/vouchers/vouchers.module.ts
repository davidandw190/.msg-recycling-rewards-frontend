import {NgModule} from "@angular/core";
import {VouchersComponent} from "./vouchers/vouchers.component";
import {VoucherDetailsComponent} from "./voucher-details/voucher-details.component";
import {SharedModule} from "../../shared/shared.module";
import {NavbarModule} from "../navbar/navbar.module";
import {GuidelinesModule} from "../guidelines/guidelines.module";
import {VouchersRoutingModule} from "./vouchers-routing.module";
import {ClipboardModule} from "ngx-clipboard";

@NgModule({
  declarations: [
    VouchersComponent,
    VoucherDetailsComponent,
  ],
  imports: [ SharedModule, VouchersRoutingModule, NavbarModule, GuidelinesModule, ClipboardModule ]
})
export class VouchersModule {}
