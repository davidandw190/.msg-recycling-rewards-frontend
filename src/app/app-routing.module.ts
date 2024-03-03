
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./component/home/home/home.component";
import { AuthenticationGuard } from "./guard/authentication.guard";

const routes: Routes = [
  { path: 'profile', loadChildren: () => import('./component/profile/profile.module').then(module => module.ProfileModule) },
  { path: 'vouchers/*', loadChildren: () => import('./component/vouchers/vouchers.module').then(module => module.VouchersModule) },

  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', component: HomeComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
