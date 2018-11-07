import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
    // { path: '**', redirectTo: '/' }, // Unknown Route
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
];
