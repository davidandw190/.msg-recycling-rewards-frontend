import {NgModule} from "@angular/core";
import {UserService} from "../service/user.service";
import {CenterService} from "../service/center.service";
import {HttpCacheService} from "../service/http.cache.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {TokenInterceptor} from "../interceptor/token.interceptor";
import {VoucherService} from "../service/voucher.service";
import {LeaderboardService} from "../service/leaderboard.service";
import {EcoLearnService} from "../service/eco-learn.service";
import {LocationService} from "../service/location.service";
import {NotificationService} from "../service/notification.service";

@NgModule({
  imports: [HttpClientModule],
  providers: [
    UserService,
    CenterService,
    VoucherService,
    LeaderboardService,
    EcoLearnService,
    LocationService,
    HttpCacheService,
    NotificationService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    // { provide: HttpCacheService, useClass: HttpCacheService },
  ]
})
export class CoreModule { }
