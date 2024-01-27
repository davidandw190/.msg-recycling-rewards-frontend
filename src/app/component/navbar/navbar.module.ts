import {NavbarComponent} from "./navbar.component";
import {SharedModule} from "../../shared/shared.module";
import {NgModule} from "@angular/core";

@NgModule({
  declarations: [NavbarComponent],
  imports: [SharedModule],
  exports: [NavbarComponent]
})
export class NavbarModule {}
