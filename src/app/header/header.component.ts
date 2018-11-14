import { Component, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() searchTerm = new EventEmitter<string>();

  user;

  constructor(private auth: AuthService,
    private router: Router) {
    this.auth.user.subscribe(user => {
      this.user = user;
      // console.log(user);
    });
  }

  ngOnInit() {
    $(document).ready(function () {
      $('#search_bar').keypress((e) => {
        if (e.which === 13) {
          return false;
        }
        if (e.which === 13) {
          e.preventDefault();
        }
      });
    });
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['login']);
  }

  search() {
    const searchBar = <HTMLInputElement>document.getElementById('search_bar');
    this.searchTerm.emit(searchBar.value);
  }

}
