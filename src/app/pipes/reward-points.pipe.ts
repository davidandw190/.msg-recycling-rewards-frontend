import { Pipe, PipeTransform } from '@angular/core';
import {RecyclableMaterial} from "../interface/recyclable-material";

@Pipe({
  name: 'rewardPoints',
  pure: false,
  standalone: true
})
export class RewardPointsPipe implements PipeTransform {
  transform(amount: number, material: RecyclableMaterial, unitRatio: number): number {
    const rewardPointsPerUnit = material.reward_points || 1;
    const rawResult = amount * rewardPointsPerUnit * unitRatio;
    return Math.ceil(rawResult);
  }
}
