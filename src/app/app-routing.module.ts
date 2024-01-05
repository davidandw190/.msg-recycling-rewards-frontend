import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./component/login/login.component";
import {RegisterComponent} from "./component/register/register.component";
import {ResetPassComponent} from "./component/reset-pass/reset-pass.component";
import {VerifyComponent} from "./component/verify/verify.component";
import {ProfileComponent} from "./component/profile/profile.component";
import {HomeComponent} from "./component/home/home.component";
import {AuthenticationGuard} from "./guard/authentication.guard";
import {CenterNewComponent} from "./component/center-new/center-new.component";
import {CenterDetailsComponent} from "./component/center-details/center-details.component";
import {CenterAllComponent} from "./component/center-all/center-all.component";
import {VouchersComponent} from "./component/vouchers/vouchers.component";
import {VoucherDetailsComponent} from "./component/voucher-details/voucher-details.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'reset-password', component: ResetPassComponent },
  { path: 'user/verify/account/:key', component: VerifyComponent },
  { path: 'user/verify/password/:key', component: VerifyComponent },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthenticationGuard] },

  { path: 'centers/all', component: CenterAllComponent, canActivate: [AuthenticationGuard] },
  { path: 'centers/new', component: CenterNewComponent, canActivate: [AuthenticationGuard] },
  { path: 'centers/:id', component: CenterDetailsComponent, canActivate: [AuthenticationGuard] },

  { path: 'vouchers', component: VouchersComponent, canActivate: [AuthenticationGuard] },
  { path: 'vouchers/:code', component: VoucherDetailsComponent, canActivate: [AuthenticationGuard] },

  { path: '', component: HomeComponent, canActivate: [AuthenticationGuard] },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
