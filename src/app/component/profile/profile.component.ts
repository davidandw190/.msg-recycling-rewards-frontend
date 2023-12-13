import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Profile} from "../../interface/profile";
import {DataState} from "../../enum/data-state.enum";
import {CustomHttpResponse} from "../../interface/custom-http-response";
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {UserService} from "../../service/user.service";

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
          return {
            dataState: DataState.LOADED,
            appData: response
          }
        }),

        startWith({
          dataState: DataState.LOADING,
          isUsingMfa: false
        }),

        catchError((error: string) => {
          return of({
            dataState: DataState.ERROR,
            isUsingMfa: false,
            loginSuccess: false,
            error: error
          })
        })
      )
  }


}
