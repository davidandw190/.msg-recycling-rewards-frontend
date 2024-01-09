import { Component } from '@angular/core';
import { DataState } from 'src/app/enum/data-state.enum';
import {catchError, map, Observable, of, startWith} from "rxjs";
import {RegistrationResponse} from "../../interface/registration-response";
import {UserService} from "../../service/user.service";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerState$: Observable<RegistrationResponse> = of({ dataState: DataState.LOADED });
  readonly DataState = DataState;

  constructor(private userService: UserService) { }

  register(registerForm: NgForm): void {
    this.registerState$ = this.userService.register$(registerForm.value)
      .pipe(
        map(response => {
          console.log(response);
          registerForm.reset();
          return { dataState: DataState.LOADED, registerSuccess: true, message: response.message };
        }),
        startWith({ dataState: DataState.LOADING, registerSuccess: false }),
        catchError((error: string) => {
          return of({ dataState: DataState.ERROR, registerSuccess: false, error })
        })
      );
  }

  createAccountForm(): void {
    this.registerState$ = of({ dataState: DataState.LOADED, registerSuccess: false });
  }
}
