import {ChangeDetectionStrategy, Component, inject, OnInit, TemplateRef} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged, filter,
  map,
  Observable,
  of,
  startWith,
  switchMap, tap
} from 'rxjs';
import {AppState} from '../../interface/app-state';
import {CustomHttpResponse} from '../../interface/custom-http-response';
import {DataState} from '../../enum/data-state.enum';
import {CenterDetailsResponse} from '../../interface/center-details-response';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {CenterService} from '../../service/center.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RecyclableMaterial} from '../../interface/recyclable-material';
import {UnitMeasure} from '../../interface/unit-measure';
import {NgbModal, NgbTimeStruct} from "@ng-bootstrap/ng-bootstrap";
import {SustainabilityIndexPipe} from "../../pipes/sustainability-index.pipe";
import {RewardPointsPipe} from "../../pipes/reward-points.pipe";
import {LocationService} from "../../service/location.service";
import {TypeaheadMatch} from "ngx-bootstrap/typeahead";
import {RecyclingCenter} from "../../interface/recycling-center";

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CenterDetailsComponent implements OnInit {
  centerDetailsState$: Observable<AppState<CustomHttpResponse<CenterDetailsResponse>>>;
  private dataSubject = new BehaviorSubject<CustomHttpResponse<CenterDetailsResponse>>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  readonly DataState = DataState;

  private readonly CENTER_ID: string = 'id';

  private modalService: NgbModal = inject(NgbModal);

  updateCenterForm: FormGroup;

  recyclingForm: FormGroup;
  earnedRewardPoints: number | null = null;
  earnedSustainabilityIndex: number | null = null;

  userSustainabilityIndex: number;

  centerId: number;

  userId: number;

  availableMaterials: string[] = ['GLASS', 'PLASTIC', 'PAPER', 'ALUMINIUM', 'METALS', 'ELECTRONICS'];
  selectedMaterials: string[] = []
  openingTime: NgbTimeStruct;
  closingTime: NgbTimeStruct;

  counties: string[] = this.locationService.getAllCounties();
  cities: string[] = [];

  acceptedMaterials: RecyclableMaterial[] = [];

  unitMeasuresMap: Map<string, UnitMeasure> = new Map([
    ['G', { label: 'Grams (g)', value: 'g', ratio: 0.005 }],
    ['KG', { label: 'Kilograms (kg)', value: 'kg', ratio: 6 }],
    ['0.5L', { label: 'Bottles (0.5L)', value: '0.5L', ratio: 3}],
    ['1L', { label: 'Bottles (1L)', value: '1L', ratio: 6 }],
    ['1.5L', { label: 'Bottles (1.5L)', value: '1.5L', ratio: 8 }],
    ['2L', { label: 'Bottles (2L)', value: '2L', ratio: 10 }],
    ['CAN', { label: 'Cans', value: 'can/(s)', ratio: 3 }],
    ['PIECE', { label: 'Pieces', value: 'piece/(s)', ratio: 3 }],
  ]);

  materialUnitMeasures: Map<string, UnitMeasure[]> = new Map([
    ['PAPER', [
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
    ]],

    ['PLASTIC', [
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
      this.unitMeasuresMap.get('0.5L'),
      this.unitMeasuresMap.get('1L'),
      this.unitMeasuresMap.get('1.5L'),
      this.unitMeasuresMap.get('2L'),
    ]],

    ['METALS', [
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['GLASS', [
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('0.5L'),
      this.unitMeasuresMap.get('1L'),
    ]],

    ['ALUMINUM', [
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('0.5L'),
      this.unitMeasuresMap.get('1L'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['ELECTRONICS', [
      this.unitMeasuresMap.get('KG'),
    ]],
  ]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder,
    private rewardPointsPipe: RewardPointsPipe,
    private locationService: LocationService,
    private sustainabilityIndexPipe: SustainabilityIndexPipe
  ) {}

  ngOnInit(): void {
    this.centerDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => this.loadCenterDetails(+params.get(this.CENTER_ID)))
    );

    this.centerDetailsState$.subscribe((response) => {
      this.initializeContributeForm();
      this.initializeCenterUpdateForm(response.appData.data.center)
    });


    this.updateCenterForm
      .get('county')
      .valueChanges.pipe(
      debounceTime(0),
      distinctUntilChanged(),
      tap(() => this.updateCenterForm.get('city').setValue('')),
      tap((county) => this.handleCountyChange(county)),
      switchMap((value) => this.filterCounties(value)),
      tap((counties) => (this.counties = counties))
    )
      .subscribe();

    this.updateCenterForm
      .get('city')
      .valueChanges.pipe(
      debounceTime(0),
      distinctUntilChanged(),
      switchMap((value) => this.filterCities(value)),
      tap((cities) => (this.cities = cities)),
      filter(() => false)
    )
      .subscribe();

    this.updateCenterForm
      .get('materials').valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        tap((material) => this.onSelectMaterials(material)),
        filter(() => false)
      )
  }

  private initializeContributeForm(): void {
    const defaultMaterialType = this.acceptedMaterials.length > 0 ? this.acceptedMaterials[0].name : '';
    const defaultUnitMeasure = this.materialUnitMeasures.get(defaultMaterialType)?.[0]?.value || '';

    this.recyclingForm = this.formBuilder.group({
      recycledMaterialType: [defaultMaterialType, Validators.required],
      unitMeasure: [defaultUnitMeasure, Validators.required],
      amount: [null, [Validators.required, Validators.min(1), Validators.max(10_000)]],
    });

    this.updateUnitMeasures(defaultMaterialType);

    this.recyclingForm.valueChanges.subscribe(() => {
      this.computeAddedValue();
    });
  }

  private initializeCenterUpdateForm(center: RecyclingCenter): void {

    const materialNames: string[] = center.acceptedMaterials.map(material => material.name);

    this.updateCenterForm = this.formBuilder.group({
      name: [center.name, Validators.required],
      county: [center.county, Validators.required],
      contact: [center.contact, Validators.required],
      city: [center.city, Validators.required],
      address: [center.address, Validators.required],
      materials: [''],
      openingTime: [this.parseTime(center.openingHour)],
      closingTime: [this.parseTime(center.closingHour)],
      alwaysOpen: [center.alwaysOpen],
    });

    this.selectedMaterials = materialNames;
    this.loadCitiesForCounty(center.county)

    this.updateCenterForm.markAsPristine();
  }

  private updateUnitMeasures(materialType: string): void {
    const unitMeasures = this.materialUnitMeasures.get(materialType) || [];
    this.recyclingForm.get('unitMeasure').setValue(unitMeasures.length > 0 ? unitMeasures[0].value : '');
    this.unitMeasuresMap[materialType] = unitMeasures;
  }

  private loadCenterDetails(centerId: number): Observable<AppState<CustomHttpResponse<CenterDetailsResponse>>> {
    return this.centerService.centerDetails$(centerId).pipe(
      map((response) => {
        console.log(response);
        this.dataSubject.next(response);
        this.centerId = response.data.center.centerId;
        this.userId = response.data.user.id;
        this.acceptedMaterials = [...response.data.center.acceptedMaterials] || [];
        this.userSustainabilityIndex = this.sustainabilityIndexPipe.transform(response.data.rewardPoints.valueOf());
        return {dataState: DataState.LOADED, appData: response};
      }),
      startWith({dataState: DataState.LOADING}),
      catchError((error: string) => of({dataState: DataState.ERROR, error}))
    );
  }

  private computeAddedValue(): void {
    const materialType = this.recyclingForm.value.recycledMaterialType;
    const unitMeasure = this.recyclingForm.value.unitMeasure;
    const amount = this.recyclingForm.value.amount;

    if (!materialType || !unitMeasure || amount === null) {
      this.earnedRewardPoints = null;
      this.earnedSustainabilityIndex = null;
      return;
    }

    const selectedMaterial = this.acceptedMaterials.find((m) => m.name === materialType);

    if (!selectedMaterial) {
      console.error('Selected material not found in acceptedMaterials array');
      this.earnedRewardPoints = null;
      this.earnedSustainabilityIndex = null;
      return;
    }

    const unitRatio = this.materialUnitMeasures.get(materialType)?.find((unit) => unit.value === unitMeasure)?.ratio || 1;

    if (unitRatio !== null) {
      this.earnedRewardPoints = this.rewardPointsPipe.transform(amount, selectedMaterial, unitRatio);
      this.earnedSustainabilityIndex = this.sustainabilityIndexPipe.transform(this.earnedRewardPoints);
    } else {
      this.earnedRewardPoints = null;
      this.earnedSustainabilityIndex = null;
    }
  }

  private getMaterialIdByName(materialName: string): number | null {
    const material = this.acceptedMaterials.find((m) => m.name === materialName);
    return material ? material.materialId : null;
  }

  contribute(): void {
    this.isLoadingSubject.next(true);

    const recycledMaterialType = this.recyclingForm.get('recycledMaterialType').value;
    const unitMeasure = this.recyclingForm.get('unitMeasure').value;
    const unitRatio = this.materialUnitMeasures.get(recycledMaterialType)?.find(unit => unit.value === unitMeasure)?.ratio || 1;
    const recycledAmount = this.recyclingForm.get('amount').value;

    const selectedMaterialId = this.getMaterialIdByName(recycledMaterialType);

    if (selectedMaterialId === null || this.earnedRewardPoints === null) {
      this.isLoadingSubject.next(false);
      return;
    }

    const formData = {
      ...this.recyclingForm.value,
      materialId: selectedMaterialId,
      centerId: this.centerId,
      userId: this.userId,
      amount: Math.ceil(recycledAmount / unitRatio)
    };

    this.centerService.contribute$(formData).pipe(
      switchMap(() => this.centerService.centerDetails$(this.centerId)),
      map((response) => {
        console.log(response);
        this.dataSubject.next(response);
        this.centerId = response.data.center.centerId;
        this.userId = response.data.user.id;
        this.acceptedMaterials = [...response.data.center.acceptedMaterials] || [];
        this.initializeContributeForm();
        this.initializeCenterUpdateForm(response.data.center)
        this.updateCenterForm.markAsPristine();
        this.isLoadingSubject.next(false);
        return { dataState: DataState.LOADED, appData: response };
      }),
      catchError((error: string) => {
        this.isLoadingSubject.next(false);
        return of({ dataState: DataState.ERROR, error });
      })
    ).subscribe((result) => {
      this.centerDetailsState$ = of(result);
    });

    this.earnedRewardPoints = null;
    this.earnedSustainabilityIndex = null;
  }


  get recycledMaterialTypeValue(): string {
    return this.recyclingForm.get('recycledMaterialType').value;
  }

  openScrollableContent(longContent: TemplateRef<any>) {
    this.modalService.open(longContent, {
      scrollable: true,
      size: "lg"
    });
  }

  openStatsModal(content: TemplateRef<any>) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  onSelectCounty(event: TypeaheadMatch): void {
    this.updateCenterForm.get('city').setValue('');
    this.loadCitiesForCounty(event.value)
  }


  filterCounties(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return of(this.counties.filter((county) => county.toLowerCase().includes(filterValue)));
  }

  private loadCitiesForCounty(county: string): void {
    this.updateCenterForm.get('city').enable();
    this.cities = this.locationService.getCitiesForCounty(county);
  }

  filterCities(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    const selectedCounty = this.updateCenterForm.get('county').value;
    const citiesForCounty = this.locationService.getCitiesForCounty(selectedCounty);

    if (!filterValue) {
      return of(citiesForCounty);
    }

    return of(citiesForCounty.filter((city) => city.toLowerCase().includes(filterValue)));
  }

  private handleCountyChange(county: string): void {
    const cityControl = this.updateCenterForm.get('city');

    if (this.locationService.isValidCounty(county)) {
      cityControl.enable();
      cityControl.setValue(null)
      this.loadCitiesForCounty(county);
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  updateCenter() {

    this.updateCenterForm.markAsPristine()
  }

  onSelectCity($event: TypeaheadMatch) {

  }

  onSelectMaterials(event: TypeaheadMatch): void {
    const selectedMaterial = event.item;

    if (!this.selectedMaterials.includes(selectedMaterial)) {
      this.selectedMaterials.push(selectedMaterial);
    }

    this.updateCenterForm.get("materials").reset()

    console.log(this.selectedMaterials.length);
  }

  onRemoveMaterial(material: string): void {
    this.selectedMaterials = this.selectedMaterials.filter((m) => m !== material);
  }

  private formatTime(time: NgbTimeStruct): string {
    return `${time.hour}:${time.minute}`;
  }

  private parseTime(timeString: string): NgbTimeStruct | null {
    const timeArray = timeString.split(':');

    if (timeArray.length === 2) {
      const hour = parseInt(timeArray[0], 10);
      const minute = parseInt(timeArray[1], 10);

      if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return { hour, minute, second: 0 }; // Assuming seconds are always 0
      }
    }

    return null;
  }

  public isSelectedCountyValid(): boolean {
    return this.counties.includes(this.updateCenterForm.get("county").value)
  }

  public isSelectedCityValid(): boolean {
    return this.cities.includes(this.updateCenterForm.get("city").value)
  }

}
