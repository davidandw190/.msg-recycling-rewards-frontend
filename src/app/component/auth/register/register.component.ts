import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {DataState} from 'src/app/enum/data-state.enum';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap
} from "rxjs";
import {RegistrationResponse} from "../../../interface/registration-response";
import {UserService} from "../../../service/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LocationService} from "../../../service/location.service";
import {TypeaheadMatch} from "ngx-bootstrap/typeahead";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {
  registerState$: Observable<RegistrationResponse> = of({ dataState: DataState.LOADED });
  readonly DataState = DataState;

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  counties: string[] = this.locationService.getAllCounties();

  cities: string[] = [];

  registerForm: FormGroup;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {

    this.initializeForm()

    this.registerForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      tap(() => this.registerForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.registerForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();

    // Delay the initialization of registerState$ to ensure proper rendering
    setTimeout(() => {
      this.registerState$ = of({ dataState: DataState.LOADED, registerSuccess: false });
    });
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      county: ['', [Validators.required]],
      city: [{ value: null, disabled: true }, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5)]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(formGroup: FormGroup): null | { mismatch: boolean } {
    const password = formGroup.get('password').value;
    const confirmPassword = formGroup.get('confirmPassword').value;

    if (password === confirmPassword) {
      formGroup.get('confirmPassword').setErrors(null);
      return null;
    } else {
      formGroup.get('confirmPassword').setErrors({ mismatch: true });
      return { mismatch: true };
    }
  }

  register(): void {

    const formData = this.registerForm.value;

    this.registerState$ = this.userService.register$(formData)
      .pipe(
        map(response => {
          console.log(response);
          // registerForm.reset();
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

  onSelectCounty(event: TypeaheadMatch): void {
    const selectedCounty = event.item;
    this.loadCitiesForCounty(selectedCounty);
  }

  filterCounties(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.counties.filter((county) => county.toLowerCase().includes(filterValue)));
  }

  private loadCitiesForCounty(county: string): void {
    this.cities = this.locationService.getCitiesForCounty(county);
    this.registerForm.get('city').enable();
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.registerForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.registerForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }


  onSelectCity($event: TypeaheadMatch) {

  }
}
