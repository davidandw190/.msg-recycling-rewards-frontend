import { Component } from '@angular/core';
import { DataState } from 'src/app/enum/data-state.enum';
import {catchError, map, Observable, of, startWith} from "rxjs";
import {RegistrationResponse} from "../../../interface/registration-response";
import {UserService} from "../../../service/user.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent {
  resetPasswordState$: Observable<RegistrationResponse> = of({ dataState: DataState.LOADED });
  readonly DataState = DataState;

  constructor(private userService: UserService) { }

  resetPassword(resetPasswordForm: NgForm): void {
    this.resetPasswordState$ = this.userService.requestPasswordReset$(resetPasswordForm.value.email)
      .pipe(
        map(response => {
          console.log(response);
          resetPasswordForm.reset();
          return { dataState: DataState.LOADED, registerSuccess: true, message: response.message };
        }),
        startWith({ dataState: DataState.LOADING, registerSuccess: false }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, registerSuccess: false, error })
        })
      );
  }

}
