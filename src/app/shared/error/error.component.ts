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
  retry = false;

  constructor() {
  }

  get reload(): void {
    return window.location.reload();
  }

  ngOnInit(): void {
    if (!['NO_CONTENT', 'no_content_error'].includes(this.error.status)) {
      if (this.error.status === 'NOT_FOUND') {
        this.imageSrc = './assets/not_found.png';
        this.retry = false;
      } else {
        this.imageSrc = './assets/error.png';
        this.retry = true;
      }
    }
  }
}
