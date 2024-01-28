import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DataState} from "../../../enum/data-state.enum";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {LoginState} from "../../../interface/login-state";
import {UserService} from "../../../service/user.service";
import {Router} from "@angular/router";
import {NgForm} from "@angular/forms";
import {Key} from "../../../enum/key.enum";
import {NotificationService} from "../../../service/notification.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginState$: Observable<LoginState> = of({ dataState: DataState.LOADED })
  private phoneSubject = new BehaviorSubject<string | null>(null);
  private emailSubject = new BehaviorSubject<string | null>(null);
  readonly DataState = DataState;

  constructor(
    private router: Router,
    private userService: UserService,
    private notification: NotificationService
  ) {}

  /**
   * Handles user login by calling the login$ method from the UserService.
   * @param {NgForm} loginForm - Angular form containing user login credentials.
   */
  login(loginForm: NgForm): void {
    this.loginState$ = this.userService.login$(loginForm.value.email, loginForm.value.password)
      .pipe(
        map(response => {
          if (response.data.user.usingMfa) {
            this.notification.onSuccess(response.message);
            this.phoneSubject.next(response.data.user.phone);
            this.emailSubject.next(response.data.user.email);
            return {
              dataState: DataState.LOADED, isUsingMfa: true, loginSuccess: false,
              phone: response.data.user.phone.substring(response.data.user.phone.length - 4)
            };
          } else {
            this.notification.onSuccess(response.message);
            localStorage.setItem(Key.TOKEN, response.data.access_token);
            localStorage.setItem(Key.REFRESH_TOKEN, response.data.refresh_token);
            this.router.navigate(['/']);
            return { dataState: DataState.LOADED, loginSuccess: true };
          }
        }),

        startWith({ dataState: DataState.LOADING, isUsingMfa: false }),

        catchError((error: string) => {
          this.notification.onError(error);
          return of({ dataState: DataState.ERROR, isUsingMfa: false, loginSuccess: false, error: error })
        })
      )
  }

  verifyLoginCode(verifyCodeForm: NgForm): void {
    this.loginState$ = this.userService.verifyLoginCode$(this.emailSubject.value, verifyCodeForm.value.code)
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          localStorage.setItem(Key.TOKEN, response.data.access_token);
          localStorage.setItem(Key.REFRESH_TOKEN, response.data.refresh_token);
          this.router.navigate(['/']);
          return { dataState: DataState.LOADED, loginSuccess: true };
        }),

        startWith({ dataState: DataState.LOADING, isUsingMfa: true, loginSuccess: false,
          phone: this.phoneSubject.value.substring(this.phoneSubject.value.length - 4) }),

        catchError((error: string) => {
          this.notification.onError(error);
          return of({ dataState: DataState.ERROR, isUsingMfa: true, loginSuccess: false, error: error,
            phone: this.phoneSubject.value.substring(this.phoneSubject.value.length - 4) })
        })
      )
  }

  loginPage(): void {
    this.loginState$ = of({ dataState: DataState.LOADED });
  }
}
