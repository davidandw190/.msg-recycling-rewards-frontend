import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Profile} from "../../../interface/profile";
import {DataState} from "../../../enum/data-state.enum";
import {CustomHttpResponse} from "../../../interface/custom-http-response";
import {AppState} from "../../../interface/app-state";
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, filter,
  map,
  Observable,
  of,
  startWith, switchMap,
  tap
} from "rxjs";
import {UserService} from "../../../service/user.service";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {LocationService} from "../../../service/location.service";
import {TypeaheadMatch} from "ngx-bootstrap/typeahead";
import {User} from "../../../interface/user";
import {NotificationService} from "../../../service/notification.service";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {

  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false)

  isLoading$ = this.isLoadingSubject.asObservable()
  profileState$: Observable<AppState<CustomHttpResponse<Profile>>>;

  readonly DataState = DataState;
  profileForm: FormGroup;

  counties: string[] = this.locationService.getAllCounties();

  cities: string[] = [];

  constructor(
    private userService: UserService,
    private locationService: LocationService,
    private formBuilder: FormBuilder,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeProfileState();
    this.profileForm.markAsPristine();
    this.initializeProfileFormObservables();
  }

  private initializeForm(user: User): void {
    this.profileForm = this.formBuilder.group({
      id: [user.id],
      firstName: [user.firstName, [Validators.required, Validators.minLength(3)]],
      lastName: [user.lastName, [Validators.required, Validators.minLength(3)]],
      email: [user.email, [Validators.required, Validators.email]],
      county: [user.county, [Validators.required]],
      city: [ user.city, [Validators.required]],
      phone: [user.phone],
      bio: [user.bio]
    });

    this.loadCitiesForCounty(user.county)
  }

  private initializeProfileState() {
    this.profileState$ = this.userService.profile$()
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          this.initializeForm(response.data.user)
          return { dataState: DataState.LOADED, appData: response }
        }),

        startWith({ dataState: DataState.LOADING }),

        catchError((error: string) => {
          this.notification.onError(error);
          return of({ dataState: DataState.ERROR, isUsingMfa: false, loginSuccess: false, error: error})
        })
      )
  }

  private initializeProfileFormObservables() {
    this.profileForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(0),
      distinctUntilChanged(),
      tap(() => this.profileForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.profileForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(0),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();
  }

  updateProfile(event: Event): void {
    event.preventDefault();

    const formData = this.profileForm.value
    this.profileState$ = this.userService.updateUser$(formData)
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.initializeForm(response.data.user)
          this.isLoadingSubject.next(false);
          this.profileForm.markAsPristine()
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.notification.onError(error);
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
            this.isLoadingSubject.next(false);
            this.notification.onSuccess(response.message);
            this.dataSubject.next({ ...response, data: response.data });
            updatePasswordForm.reset();
            return { dataState: DataState.LOADED, appData: this.dataSubject.value };
          }),

          startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

          catchError((error: string) => {
            this.isLoadingSubject.next(false);
            this.notification.onError(error);
            updatePasswordForm.reset();
            return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
          })
        )
    } else {
      this.isLoadingSubject.next(false);
      this.notification.onError("The new password and the confirmation password dont match.");
      updatePasswordForm.reset();

    }
  }

  updateRole(roleForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.updateUserRoles$(roleForm.value.roleName)
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          this.notification.onError(error);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  updateAccountSettings(accountSettingsForm: NgForm): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.updateUserAccountSettings$(accountSettingsForm.value)
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          this.isLoadingSubject.next(false);
          this.dataSubject.next({ ...response, data: response.data });
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          this.notification.onError(error);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  toggleMfa(): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.toggleMfa$()
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          this.notification.onError(error);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  toggleEmailNotifications(): void {
    this.isLoadingSubject.next(true);
    this.profileState$ = this.userService.toggleNotifications$()
      .pipe(
        map(response => {
          this.notification.onSuccess(response.message);
          this.dataSubject.next({ ...response, data: response.data });
          this.isLoadingSubject.next(false);
          return { dataState: DataState.LOADED, appData: this.dataSubject.value };
        }),

        startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),

        catchError((error: string) => {
          this.isLoadingSubject.next(false);
          this.notification.onError(error);
          return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error: error })
        })
      )
  }

  onFileSelected(event: any): void {
    const fileInput = event.target;
    const file = fileInput.files[0];
    this.updateProfilePicture(file);
  }

  updateProfilePicture(image: File): void {
    if (image) {
      this.isLoadingSubject.next(true);
      this.profileState$ = this.userService.updateUserProfilePicture$(this.getFormData(image))
        .pipe(
          map(response => {
            this.notification.onSuccess(response.message);
            this.dataSubject.next({ ...response,
              data: { ...response.data,
                user: { ...response.data.user, imageUrl: `${response.data.user.imageUrl}?time=${new Date().getTime()}`}} }); // Im a fucking genius sometimes
            this.isLoadingSubject.next(false);
            return { dataState: DataState.LOADED, appData: this.dataSubject.value };
          }),
          startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
          catchError((error: string) => {
            this.notification.onError(error);
            this.isLoadingSubject.next(false);
            return of({ dataState: DataState.LOADED, appData: this.dataSubject.value, error })
          })
        )
    }
  }

  onSelectCounty(event: TypeaheadMatch): void {
    this.profileForm.get('city').setValue('');
    this.loadCitiesForCounty(event.value)
  }


  filterCounties(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.counties.filter((county) => county.toLowerCase().includes(filterValue)));
  }

  private loadCitiesForCounty(county: string): void {
    this.profileForm.get('city').enable();
    this.cities = this.locationService.getCitiesForCounty(county);
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.profileForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.profileForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      cityControl.setValue(null)
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  public isSelectedCountyValid(): boolean {
    return this.counties.includes(this.profileForm.get("county").value)
  }

  public isSelectedCityValid(): boolean {
    return this.cities.includes(this.profileForm.get("city").value)
  }

  private getFormData(image: File): FormData {
    const formData = new FormData();
    formData.append('image', image);
    return formData;
  }

  onSelectCity($event: TypeaheadMatch) {
  }
}
