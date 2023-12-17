import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Profile} from "../../interface/profile";
import {DataState} from "../../enum/data-state.enum";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {UserService} from "../../service/user.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false)

  isLoading$ = this.isLoadingSubject.asObservable()
  profileState$: Observable<AppState<CustomHttpResponse<Profile>>>;

  readonly DataState = DataState;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.profileState$ = this.userService.profile$()
      .pipe(
        map(response => {
          console.log(response)
          this.dataSubject.next(response);
          return { dataState: DataState.LOADED, appData: response }
        }),

        startWith({ dataState: DataState.LOADING, isUsingMfa: false}),

        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, isUsingMfa: false, loginSuccess: false, error: error})
        })
      )
  }

  updateProfile(profileForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.updateUser$(profileForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  updatePassword(updatePasswordForm: NgForm): void {
    this.isLoadingSubject.next(true);
    if (updatePasswordForm.value.newPassword === updatePasswordForm.value.confirmPassword) {
      this.profileState$ = this.userService.updateUserPassword$(updatePasswordForm.value)
        .pipe(
          map(response => {
            console.log(response);
            this.dataSubject.next({ ...response, data: response.data });
            updatePasswordForm.reset();
            this.isLoadingSubject.next(false);
            return { dataState: DataState.LOADED, appData: this.dataSubject.value };
          }),

          startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

          catchError((error: string) => {
            updatePasswordForm.reset();
            this.isLoadingSubject.next(false);
            return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
          })
        )
    } else {
      updatePasswordForm.reset();
      this.isLoadingSubject.next(false);
    }
  }

  updateRole(roleForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.updateUserRoles$(roleForm.value.roleName)
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  updateAccountSettings(accountSettingsForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.updateUserAccountSettings$(accountSettingsForm.value)
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  toggleMfa(): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.toggleMfa$()
      .pipe(
        map(response => {
          console.log(response);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
        })
      )
  }


}
