import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { VerifyComponent } from './component/verify/verify.component';
import { ResetPassComponent } from './component/reset-pass/reset-pass.component';
import { ProfileComponent } from './component/profile/profile.component';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import {AppRoutingModule} from "./app-routing.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {TokenInterceptor} from "./interceptor/token.interceptor";
import {NgOptimizedImage} from "@angular/common";
import { CenterDetailsComponent } from './component/center-details/center-details.component';
import { CenterNewComponent } from './component/center-new/center-new.component';
import { StatsComponent } from './component/stats/stats.component';
import {NgbModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { CenterAllComponent } from './component/center-all/center-all.component';
import {HighlightSearchPipe} from "./pipes/highlight-search.pipe";
import {TypeaheadModule} from "ngx-bootstrap/typeahead";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {AcceptedMaterialsPipe} from "./pipes/accepted-materials.pipe";
import {HttpCacheService} from "./service/http.cache.service";
import {CacheInterceptor} from "./interceptor/cache.interceptor";

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
    HighlightSearchPipe
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
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HttpCacheService, useClass: CacheInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  exports: [HighlightSearchPipe]
})
export class AppModule { }
