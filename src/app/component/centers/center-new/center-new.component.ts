import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
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
} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'; // Import Validators
import {TypeaheadMatch} from 'ngx-bootstrap/typeahead';
import {CustomHttpResponse} from '../../../interface/custom-http-response';
import {AppState} from '../../../interface/app-state';
import {CentersPageResponse} from '../../../interface/centers-page-response';
import {DataState} from '../../../enum/data-state.enum';
import {CenterService} from '../../../service/center.service';
import {LocationService} from '../../../service/location.service';
import {NgbTimeStruct} from "@ng-bootstrap/ng-bootstrap";
import {NotificationService} from "../../../service/notification.service";

@Component({
  selector: 'app-center-new',
  templateUrl: './center-new.component.html',
  styleUrls: ['./center-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenterNewComponent implements OnInit {
  newCenterState$: Observable<AppState<CustomHttpResponse<CentersPageResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CentersPageResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  counties: string[] = this.locationService.getAllCounties();
  cities: string[] = [];

  newCenterForm: FormGroup;

  availableMaterials: string[] = ['GLASS', 'PLASTIC', 'PAPER', 'ALUMINIUM', 'METALS', 'ELECTRONICS'];
  selectedMaterials: string[] = []
  defaultOpeningHour: NgbTimeStruct;
  defaultClosingHour: NgbTimeStruct;

  constructor(
    private centerService: CenterService,
    private locationService: LocationService,
    private formBuilder: FormBuilder,
    private notification: NotificationService
  ) {
    this.defaultOpeningHour = { hour: 8, minute: 0, second: 0 };
    this.defaultClosingHour = { hour: 20, minute: 0, second: 0 };

    this.newCenterForm = this.formBuilder.group({
      name: ['', Validators.required],
      county: ['', Validators.required],
      contact: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      materials: [''],
      openingHour: [this.defaultOpeningHour],
      closingHour: [this.defaultClosingHour],
      alwaysOpen: [false],
    });

  }

  ngOnInit(): void {
    this.newCenterState$ = this.centerService.centers$().pipe(
      map((response) => {
        console.log(response);
        this.dataSubject.next(response);
        return { dataState: DataState.LOADED, appData: response };
      }),

      startWith({ dataState: DataState.LOADING }),

      catchError((error: string) => of({ dataState: DataState.LOADED, error }))
    );

    this.newCenterForm.get('city').disable()

    this.newCenterForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      tap(() => this.newCenterForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.newCenterForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();

    this.newCenterForm
      .get('materials').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap((material) => this.onSelectMaterials(material)),
        filter(() => false)
      )
  }


  createCenter(): void {
    this.isLoadingSubject.next(true);

    if (this.newCenterForm.get('alwaysOpen').value) {
      this.newCenterForm.get('openingHour').setValue(null);
      this.newCenterForm.get('closingHour').setValue(null);
    } else {
      const openingTime = this.newCenterForm.get('openingHour').value;
      const closingTime = this.newCenterForm.get('closingHour').value;

      if (openingTime && closingTime) {
        this.newCenterForm.get('openingHour').setValue(this.formatTime(openingTime));
        this.newCenterForm.get('closingHour').setValue(this.formatTime(closingTime));
      }
    }

    const formData = {
      ...this.newCenterForm.value,
      materials: this.selectedMaterials
    };

    console.log('Opening Time:', this.newCenterForm.get('openingHour').value);
    console.log('Closing Time:', this.newCenterForm.get('closingHour').value);
    console.log('Form Data:', formData);

    this.centerService.create$(formData).pipe(
      map((response) => {
        this.notification.onSuccess(response.message)
        this.newCenterForm.reset({ county: '', city: '' });
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: this.dataSubject.value };
      }),
      startWith({ dataState: DataState.LOADED, appData: this.dataSubject.value }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        this.notification.onError(error)
        return of({ dataState: DataState.LOADED, error });
      })
    ).subscribe((result) => {
      this.newCenterState$ = of(result);
    });
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
    this.newCenterForm.get('city').enable();
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.newCenterForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.newCenterForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  onSelectCity(event: TypeaheadMatch): void {
  }

  onSelectMaterials(event: TypeaheadMatch): void {
    const selectedMaterial = event.item;

    if (!this.selectedMaterials.includes(selectedMaterial)) {
      this.notification.onDefault(selectedMaterial + " added to the accepted materials.")
      this.selectedMaterials.push(selectedMaterial);
    } else {
      this.notification.onDefault("Accepted material already selected.")
    }

    this.newCenterForm.get("materials").reset()

    console.log(this.selectedMaterials.length);
  }

  onRemoveMaterial(material: string): void {
    this.selectedMaterials = this.selectedMaterials.filter((m) => m !== material);
    this.notification.onDefault("Accepted material removed successfully.")
  }

  private formatTime(time: NgbTimeStruct): string {

    if (typeof time === 'string') {
      return time;
    }

    if (!time || typeof time.hour === 'undefined' || typeof time.minute === 'undefined') {
      console.error('Invalid time object:', time);
      return '00:00:00';
    }

    const formattedTime = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}:00`;
    console.log('Formatted Time:', formattedTime);
    return formattedTime;
  }

  protected isAcceptedMaterialsChosen(): boolean {
    return this.selectedMaterials.length >= 1;
  }


}

