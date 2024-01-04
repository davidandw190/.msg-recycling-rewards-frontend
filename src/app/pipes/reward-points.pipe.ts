import { Pipe, PipeTransform } from '@angular/core';
import {RecyclableMaterial} from "../interface/recyclable-material";

@Pipe({
  name: 'rewardPoints',
  pure: false,
  standalone: true
})
export class RewardPointsPipe implements PipeTransform {
  transform(materialAmount: number, material: RecyclableMaterial, unitRatio: number): number {
    const rewardPointsPerUnit = material.rewardPoints || 1;
    return Math.ceil(materialAmount / unitRatio) * rewardPointsPerUnit;
  }
}
