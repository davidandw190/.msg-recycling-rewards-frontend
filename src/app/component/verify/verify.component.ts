import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap} from "rxjs";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {UserService} from "../../service/user.service";
import {VerifySate} from "../../interface/verify-state";
import {DataState} from 'src/app/enum/data-state.enum';
import {AccountType} from "../../interface/account-type";
import {User} from "../../interface/user";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  verifyState$: Observable<VerifySate>;
  private userSubject = new BehaviorSubject<User>(null);
  user$ = this.userSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  private readonly ACCOUNT_KEY: string = 'key';

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.verifyState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        console.log(this.activatedRoute);
        const type: AccountType = this.getAccountType(window.location.href);
        return this.userService.verify$(params.get(this.ACCOUNT_KEY), type)
          .pipe(
            map(response => {
              console.log(response);
              type === 'password' ? this.userSubject.next(response.data.user) : null;
              return {
                type,
                title: 'Verified!',
                dataState: DataState.LOADED,
                message: response.message,
                verifySuccess: true
              };
            }),
            startWith({
              title: 'Verifying...',
              dataState: DataState.LOADING,
              message: 'Please wait while we verify the information',
              verifySuccess: false
            }),
            catchError((error: string) => {
              return of({title: error, dataState: DataState.ERROR, error, message: error, verifySuccess: false})
            })
          )
      })
    );
  }

  private getAccountType(url: string): AccountType {
    return url.includes('password') ? 'password' : 'account';
  }

  renewPassword(resetPasswordForm: NgForm) {

  }
}
