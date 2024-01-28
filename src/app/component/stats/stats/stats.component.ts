import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SustainabilityIndexPipe} from "../../../pipes/sustainability-index.pipe";

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsComponent implements OnInit {

  @Input() userRewardPoints: number;
  @Input() activeRecyclers: number;
  @Input() recyclersRewardPoints: number;

  currentMonth: Date = new Date();

  averageRecyclerContribution: number

  constructor(
  ) {}

  ngOnInit(): void {
  }


}
