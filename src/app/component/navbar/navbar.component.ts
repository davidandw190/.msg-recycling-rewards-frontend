import {Component, Input} from '@angular/core';
import {User} from "../../interface/user";
import {Router} from "@angular/router";
import {UserService} from "../../service/user.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() user: User;

  isNavbarCollapsed = true;
  isSmallScreen = false;




  constructor(
    private router: Router,
    private userService: UserService
  ) {
  }

  isNavbarOpen = false;

  centerLinks = [
    { label: 'All Centers', route: '/centers/all' },
    { label: 'My Favourites', route: '/centers/favourites' },
  ];

  challengeLinks = [
    { label: 'All Challenges', route: '/challenges/all' },
    { label: 'My Challenges', route: '/challenges/my' },
  ];

  toggleNavbar() {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  logOut(): void {
    this.userService.logOut();
    this.router.navigate(['/login'])
  }

  private checkScreenSize() {
    this.isSmallScreen = window.innerWidth < 768;
  }

  // toggleNavbar() {
  //   this.isNavbarCollapsed = !this.isNavbarCollapsed;
  // }
}
