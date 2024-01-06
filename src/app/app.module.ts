import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {LoginComponent} from './component/login/login.component';
import {RegisterComponent} from './component/register/register.component';
import {VerifyComponent} from './component/verify/verify.component';
import {ResetPassComponent} from './component/reset-pass/reset-pass.component';
import {ProfileComponent} from './component/profile/profile.component';
import {HomeComponent} from './component/home/home.component';
import {NavbarComponent} from './component/navbar/navbar.component';
import {AppRoutingModule} from "./app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TokenInterceptor} from "./interceptor/token.interceptor";
import {NgOptimizedImage} from "@angular/common";
import {CenterDetailsComponent} from './component/center-details/center-details.component';
import {CenterNewComponent} from './component/center-new/center-new.component';
import {StatsComponent} from './component/stats/stats.component';
import {NgbModule, NgbNavModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {CenterAllComponent} from './component/center-all/center-all.component';
import {HighlightSearchPipe} from "./pipes/highlight-search.pipe";
import {TypeaheadModule} from "ngx-bootstrap/typeahead";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {AcceptedMaterialsPipe} from "./pipes/accepted-materials.pipe";
import {MatButtonModule} from "@angular/material/button";
import {MatSortModule} from "@angular/material/sort";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatBadgeModule} from "@angular/material/badge";
import {SustainabilityIndexPipe} from "./pipes/sustainability-index.pipe";
import {RewardPointsPipe} from "./pipes/reward-points.pipe";
import {UnitConversionPipe} from "./pipes/unit-converter.pipe";
import { VouchersComponent } from './component/vouchers/vouchers.component';
import { VoucherDetailsComponent } from './component/voucher-details/voucher-details.component';
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    VerifyComponent,
    ResetPassComponent,
    ProfileComponent,
    HomeComponent,
    NavbarComponent,
    CenterAllComponent,
    CenterDetailsComponent,
    CenterNewComponent,
    StatsComponent,
    HighlightSearchPipe,
    VouchersComponent,
    VoucherDetailsComponent,

  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        NgOptimizedImage,
        NgbModule,
        ReactiveFormsModule,
        TypeaheadModule,
        MatInputModule,
        MatSelectModule,
        NgMultiSelectDropDownModule,
        AcceptedMaterialsPipe,
        NgbTimepickerModule,
        MatButtonModule,
        MatSortModule,
        MatChipsModule,
        MatIconModule,
        MatSlideToggleModule,
        MatBadgeModule,
        RewardPointsPipe,
        SustainabilityIndexPipe,
        UnitConversionPipe,
        NgbNavModule,
        MatTabsModule
    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
    // HttpCacheService,
    RewardPointsPipe,
    SustainabilityIndexPipe
  ],
  bootstrap: [AppComponent],
  exports: [HighlightSearchPipe]
})
export class AppModule { }
