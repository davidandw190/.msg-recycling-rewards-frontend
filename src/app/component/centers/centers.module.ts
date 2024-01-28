import {NgModule} from "@angular/core";
import {CenterAllComponent} from "./center-all/center-all.component";
import {CenterNewComponent} from "./center-new/center-new.component";
import {CenterDetailsComponent} from "./center-details/center-details.component";
import {SharedModule} from "../../shared/shared.module";
import {CentersRoutingModule} from "./centers-routing.module";
import {NavbarModule} from "../navbar/navbar.module";
import {GuidelinesModule} from "../guidelines/guidelines.module";

@NgModule({
  declarations: [
    CenterAllComponent,
    CenterNewComponent,
    CenterDetailsComponent,
  ],
  imports: [ SharedModule, CentersRoutingModule, NavbarModule, GuidelinesModule ]
})
export class CentersModule {}
