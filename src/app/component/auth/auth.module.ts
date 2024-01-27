import {NgModule} from "@angular/core";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {ResetPassComponent} from "./reset-pass/reset-pass.component";
import {VerifyComponent} from "./verify/verify.component";
import {SharedModule} from "../../shared/shared.module";
import {AuthRoutingModule} from "./auth-routing.module";

@NgModule({
  declarations: [ LoginComponent, RegisterComponent, ResetPassComponent, VerifyComponent ],
  imports: [ SharedModule, AuthRoutingModule ]
})
export class AuthModule {}
