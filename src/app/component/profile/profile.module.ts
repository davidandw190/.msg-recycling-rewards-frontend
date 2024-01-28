import {NgModule} from "@angular/core";
import {ProfileComponent} from "./profile/profile.component";
import {SharedModule} from "../../shared/shared.module";
import {ProfileRoutingModule} from "./profile-routing.module";
import {NavbarModule} from "../navbar/navbar.module";

@NgModule({
  declarations: [ ProfileComponent ],
  imports: [ SharedModule, ProfileRoutingModule, NavbarModule ]
})
export class ProfileModule {}
