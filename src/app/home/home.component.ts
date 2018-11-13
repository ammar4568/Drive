import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DriveComponent } from '../drive/drive.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('type')
  private drive: DriveComponent;

  currentUrl;

  constructor(private router: Router) {
    this.currentUrl = this.router.url.split('/')[1];
  }

  ngOnInit() {
    if (this.currentUrl === 'starred') {
      document.getElementById('starred').classList.add('active');
      document.getElementById('trash').classList.remove('active');
      document.getElementById('my-drive').classList.remove('active');
    } else if (this.currentUrl === 'trash') {
      document.getElementById('trash').classList.add('active');
      document.getElementById('starred').classList.remove('active');
      document.getElementById('my-drive').classList.remove('active');
    } else {
      document.getElementById('my-drive').classList.add('active');
      document.getElementById('starred').classList.remove('active');
      document.getElementById('trash').classList.remove('active');
    }
  }

  notifyType(type) {
    this.drive.upload(type);
  }

}
