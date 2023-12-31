import {ChangeDetectionStrategy, Component, inject, OnInit, TemplateRef} from '@angular/core';
import {BehaviorSubject, catchError, finalize, map, Observable, of, startWith, switchMap} from 'rxjs';
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

  materialUnits: number = null;

  centerId: number;

  userId: number;

  acceptedMaterials: RecyclableMaterial[] = [];

  unitMeasuresMap: Map<string, UnitMeasure> = new Map([
    ['G', { label: 'Grams (g)', value: 'g', ratio: 0.005 }],
    ['KG', { label: 'Kilograms (kg)', value: 'kg', ratio: 6 }],
    ['BOTTLE_0.5L', { label: 'Bottles (0.5L)', value: '0.5L', ratio: 3}],
    ['BOTTLE_1L', { label: 'Bottles (1L)', value: '1L', ratio: 6 }],
    ['BOTTLE_1.5L', { label: 'Bottles (1.5L)', value: '1.5L', ratio: 8 }],
    ['BOTTLE_2L', { label: 'Bottles (2L)', value: '2L', ratio: 10 }],
    ['CAN', { label: 'Cans', value: 'can/(s)', ratio: 3 }],
    ['PIECE', { label: 'Pieces', value: 'piece/(s)', ratio: 3 }],
  ]);

  materialUnitMeasures: Map<string, UnitMeasure[]> = new Map([
    ['PAPER', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
    ]],

    ['PLASTIC', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('PIECE'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
      this.unitMeasuresMap.get('BOTTLE_1.5L'),
      this.unitMeasuresMap.get('BOTTLE_2L'),
    ]],

    ['METALS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['GLASS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
    ]],

    ['ALUMINUM', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
      this.unitMeasuresMap.get('BOTTLE_0.5L'),
      this.unitMeasuresMap.get('BOTTLE_1L'),
      this.unitMeasuresMap.get('CAN'),
    ]],

    ['ELECTRONICS', [
      this.unitMeasuresMap.get('G'),
      this.unitMeasuresMap.get('KG'),
    ]],
  ]);

  constructor(
    private activatedRoute: ActivatedRoute,
    private centerService: CenterService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.centerDetailsState$ = this.activatedRoute.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return this.centerService.centerDetails$(+params.get(this.CENTER_ID)).pipe(
          map((response) => {
            console.log(response);
            this.dataSubject.next(response);
            this.centerId = response.data.center.centerId;
            this.userId = response.data.user.id
            this.acceptedMaterials = [...response.data.center.acceptedMaterials] || [];
            return { dataState: DataState.LOADED, appData: response };
          }),

          startWith({ dataState: DataState.LOADING }),

          catchError((error: string) => {
            return of({ dataState: DataState.ERROR, error });
          })
        );
      })
    );

    this.centerDetailsState$.subscribe(() => {
      this.initializeForm();
    });
  }

  initializeForm() {
    const defaultMaterialType = this.acceptedMaterials.length > 0 ? this.acceptedMaterials[0].name : '';
    const defaultUnitMeasure = this.materialUnitMeasures.get(defaultMaterialType)?.[0]?.value || '';

    this.recyclingForm = this.formBuilder.group({
      recycledMaterialType: [defaultMaterialType, Validators.required],
      unitMeasure: [defaultUnitMeasure, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
    });

    const unitMeasures = this.materialUnitMeasures.get(defaultMaterialType) || [];
    this.recyclingForm.get('unitMeasure').setValue(unitMeasures.length > 0 ? unitMeasures[0].value : '');
    this.unitMeasuresMap[defaultMaterialType] = unitMeasures;

    this.recyclingForm.get('recycledMaterialType').valueChanges.subscribe((materialType) => {
      const unitMeasures = this.materialUnitMeasures.get(materialType) || [];
      this.recyclingForm.get('unitMeasure').setValue(unitMeasures.length > 0 ? unitMeasures[0].value : '');
      this.unitMeasuresMap[materialType] = unitMeasures;
    });

    this.recyclingForm.valueChanges.subscribe(() => {
      this.calculateAddedValue();
    });
  }

  calculateAddedValue() {
    const materialType = this.recyclingForm.value.recycledMaterialType;
    const unitMeasure = this.recyclingForm.value.unitMeasure;
    const amount = this.recyclingForm.value.amount;

    if (materialType && unitMeasure && amount !== null) {
      const selectedMaterial = this.acceptedMaterials.find((m) => m.name === materialType);

      if (selectedMaterial) {
        const rewardPointsPerUnit = selectedMaterial.reward_points || 1;
        const unitRatio = this.materialUnitMeasures.get(materialType)?.find(unit => unit.value === unitMeasure)?.ratio || 1;
        // this.addedValue = amount * rewardPointsPerUnit * unitRatio;
        if (unitRatio !== null) {
          this.materialUnits = amount * unitRatio;
          this.earnedRewardPoints = this.materialUnits * rewardPointsPerUnit;
          this.earnedSustainabilityIndex = 5/100 * this.earnedRewardPoints;
        } else {
          this.earnedRewardPoints = null;
          this.earnedSustainabilityIndex = null;
        }
      } else {
        console.error('Selected material not found in acceptedMaterials array');
        this.earnedRewardPoints = null;
        this.earnedSustainabilityIndex = null;
      }
    } else {
      this.earnedRewardPoints = null;
    }
  }

  getMaterialName(materialType: number): string {
    const material = this.acceptedMaterials.find((m) => m.materialId === materialType);
    return material ? material.name : '';
  }

  getMaterialIdByName(materialName: string): number | null {
    const material = this.acceptedMaterials.find((m) => m.name === materialName);
    return material ? material.materialId : null;
  }

  contribute() {
    this.isLoadingSubject.next(true);

    const selectedMaterialId: number | null = this.getMaterialIdByName(
      this.recyclingForm.get('recycledMaterialType').value
    );
    let formData;

    if (selectedMaterialId !== null && this.earnedRewardPoints !== null) {
      formData = {
        ...this.recyclingForm.value,
        materialId: selectedMaterialId,
        centerId: this.centerId,
        userId: this.userId,
        amount: this.materialUnits,
      };

      this.centerService
        .contribute$(formData)
        .pipe(
          switchMap(() => {
            return this.centerService.centerDetails$(this.centerId);
          }),
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
        )
        .subscribe((result) => {
          this.centerDetailsState$ = of(result);
        });
    } else {
      this.isLoadingSubject.next(false);
    }
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

}
