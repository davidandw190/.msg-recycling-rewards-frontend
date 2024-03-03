import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {CoreModule} from "./core/core.module";
import {SharedModule} from "./shared/shared.module";
import {AuthModule} from "./component/auth/auth.module";
import {CentersModule} from "./component/centers/centers.module";
import {LeaderboardModule} from "./component/leaderboard/leaderboard.module";
import {HomeModule} from "./component/home/home.module";
import {ProfileModule} from "./component/profile/profile.module";
import {VouchersModule} from "./component/vouchers/vouchers.module";
import {EcoLearnModule} from "./component/eco-learn/eco-learn.module";
import {NotificationModule} from "./notification.module";
import {BrowserModule} from "@angular/platform-browser";

@NgModule({
  declarations: [AppComponent],
  imports: [
    CoreModule,
    SharedModule,
    AuthModule,
    CentersModule,
    LeaderboardModule,
    HomeModule,
    ProfileModule,
    VouchersModule,
    EcoLearnModule,
    NotificationModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
