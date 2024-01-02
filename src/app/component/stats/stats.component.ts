import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  @Input() rewardPoints: number;
  @Input() activeRecyclers: number;
  @Input() recyclersRewardPoints: number

  recyclersEnvironmentalImpact: number;
  userEnvironmentalImpact: number;

  constructor() {
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


}
