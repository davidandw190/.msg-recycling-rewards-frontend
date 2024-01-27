import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ProfileComponent} from './component/profile/profile.component';
import {HomeComponent} from './component/home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import {HttpClientModule} from "@angular/common/http";
import {StatsComponent} from './component/stats/stats.component';
import {NgbNavModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {VouchersComponent} from './component/vouchers/vouchers.component';
import {VoucherDetailsComponent} from './component/voucher-details/voucher-details.component';
import {VoucherStatusPipe} from "./pipes/voucher-status.pipe";
import {ClipboardModule} from "ngx-clipboard";
import {VoucherGuidelinesComponent} from './component/voucher-guidelines/voucher-guidelines.component';
import {LeaderboardComponent} from './component/leaderboard/leaderboard.component';
import {EcoLearnComponent} from './component/eco-learn/eco-learn.component';
import {RecyclingGuidelinesComponent} from './component/recycling-guidelines/recycling-guidelines.component';
import {EcoLearnNewComponent} from './component/eco-learn-new/eco-learn-new.component';
import {VgCoreModule} from "@videogular/ngx-videogular/core";
import {VgOverlayPlayModule} from "@videogular/ngx-videogular/overlay-play";
import {VgBufferingModule} from "@videogular/ngx-videogular/buffering";
import {VgControlsModule} from "@videogular/ngx-videogular/controls";
import {MatLegacyChipsModule} from "@angular/material/legacy-chips";
import {ShareResourceComponent} from './component/share-resource/share-resource.component';
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {CoreModule} from "./core/core.module";
import {SharedModule} from "./shared/shared.module";
import {AuthModule} from "./component/auth/auth.module";
import {CentersModule} from "./component/centers/centers.module";
import {NavbarModule} from "./component/navbar/navbar.module";

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    HomeComponent,
    StatsComponent,
    VouchersComponent,
    VoucherDetailsComponent,
    VoucherGuidelinesComponent,
    LeaderboardComponent,
    EcoLearnComponent,
    RecyclingGuidelinesComponent,
    EcoLearnNewComponent,
    ShareResourceComponent,

  ],
  imports: [
    CoreModule,
    SharedModule,
    AuthModule,
    CentersModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatInputModule,
    MatSelectModule,
    NgMultiSelectDropDownModule,
    NgbTimepickerModule,
    ClipboardModule,
    NgbNavModule,
    VoucherStatusPipe,
    VgCoreModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgControlsModule,
    MatLegacyChipsModule,
    CKEditorModule,
    NavbarModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
