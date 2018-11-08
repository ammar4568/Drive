import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user;

  constructor(private auth: AuthService,
    private router: Router) {
    this.auth.user.subscribe(user => {
      this.user = user;
      // console.log(user);
    });
  }

  ngOnInit() {
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['login']);
  }

}
