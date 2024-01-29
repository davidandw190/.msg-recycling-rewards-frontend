import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./component/auth/login/login.component";
import {RegisterComponent} from "./component/auth/register/register.component";
import {ResetPassComponent} from "./component/auth/reset-pass/reset-pass.component";
import {VerifyComponent} from "./component/auth/verify/verify.component";
import {ProfileComponent} from "./component/profile/profile/profile.component";
import {HomeComponent} from "./component/home/home/home.component";
import {AuthenticationGuard} from "./guard/authentication.guard";
import {CenterNewComponent} from "./component/centers/center-new/center-new.component";
import {CenterDetailsComponent} from "./component/centers/center-details/center-details.component";
import {CenterAllComponent} from "./component/centers/center-all/center-all.component";
import {VouchersComponent} from "./component/vouchers/vouchers/vouchers.component";
import {VoucherDetailsComponent} from "./component/vouchers/voucher-details/voucher-details.component";
import {LeaderboardComponent} from "./component/leaderboard/leaderboard.component";
import {EcoLearnComponent} from "./component/eco-learn/eco-learn/eco-learn.component";
import {EcoLearnNewComponent} from "./component/eco-learn/eco-learn-new/eco-learn-new.component";

const routes: Routes = [
  { path: 'profile', loadChildren: () => import('./component/profile/profile.module').then(module => module.ProfileModule) },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', component: HomeComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
