
import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./component/home/home/home.component";
import { AuthenticationGuard } from "./guard/authentication.guard";

const routes: Routes = [
  { path: 'profile', loadChildren: () => import('./component/profile/profile.module').then(module => module.ProfileModule) },
  { path: 'vouchers/**', loadChildren: () => import('./component/vouchers/vouchers.module').then(module => module.VouchersModule) },
  { path: 'centers/**', loadChildren: () => import('./component/centers/centers.module').then(module => module.CentersModule) },
  { path: 'eco-learn/**', loadChildren: () => import('./component/eco-learn/eco-learn.module').then(module => module.EcoLearnModule) },

  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', component: HomeComponent, canActivate: [AuthenticationGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
