import {NgModule} from "@angular/core";
import {SharedModule} from "../../shared/shared.module";
import {RecyclingGuidelinesComponent} from "./recycling-guidelines/recycling-guidelines.component";
import {VoucherGuidelinesComponent} from "./voucher-guidelines/voucher-guidelines.component";

@NgModule({
  declarations: [RecyclingGuidelinesComponent, VoucherGuidelinesComponent],
  imports: [SharedModule],
  exports: [RecyclingGuidelinesComponent, VoucherGuidelinesComponent]
})
export class GuidelinesModule {}
