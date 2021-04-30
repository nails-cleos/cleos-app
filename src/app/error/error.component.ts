import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  @Input() error: any;
  @Input() isCard: boolean | undefined;
  imageSrc: string | undefined;

  constructor() {
  }

  ngOnInit(): void {
    if (this.error.status !== 'NO_CONTENT') {
      if (this.error.status === 'NOT_FOUND') {
        this.imageSrc = './assets/not_found.png';
      } else {
        this.imageSrc = './assets/error.png';
      }
    }
  }

}
