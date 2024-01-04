import {ChangeDetectionStrategy, Component, inject, OnInit, TemplateRef} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, startWith, switchMap} from 'rxjs';
import {AppState} from '../../interface/app-state';
import {CustomHttpResponse} from '../../interface/custom-http-response';
import {DataState} from '../../enum/data-state.enum';
import {CenterDetailsResponse} from '../../interface/center-details-response';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {CenterService} from '../../service/center.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RecyclableMaterial} from '../../interface/recyclable-material';
import {UnitMeasure} from '../../interface/unit-measure';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {SustainabilityIndexPipe} from "../../pipes/sustainability-index.pipe";
import {RewardPointsPipe} from "../../pipes/reward-points.pipe";

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

  recyclingForm: FormGroup;
  earnedRewardPoints: number | null = null;
  earnedSustainabilityIndex: number | null = null;

  userSustainabilityIndex: number;

  centerId: number;

  userId: number;

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

  materialRewardPoints: Map<string, number> = new Map(
    [
      ['PAPER', 3],
      ['PLASTIC', 3],
      ['GLASS', 3],
      ['METALS', 3],
      ['ALUMINIUM', 3],
      ['ELECTRONICS', 3],
    ]
  )

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
    private sustainabilityIndexPipe: SustainabilityIndexPipe
  ) {}

  ngOnInit(): void {
    this.centerDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => this.loadCenterDetails(+params.get(this.CENTER_ID)))
    );

    this.centerDetailsState$.subscribe(() => { this.initializeForm() });
  }

  private initializeForm(): void {
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

  private updateUnitMeasures(materialType: string): void {
    const unitMeasures = this.materialUnitMeasures.get(materialType) || [];
    this.recyclingForm.get('unitMeasure').setValue(unitMeasures.length > 0 ? unitMeasures[0].value : '');
    this.unitMeasuresMap[materialType] = unitMeasures;
  }

  private handleMaterialTypeChange(materialType: string): void {
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


  private getMaterialName(materialType: number): string {
    const material = this.acceptedMaterials.find((m) => m.materialId === materialType);
    return material ? material.name : '';
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
        this.initializeForm();
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

}
