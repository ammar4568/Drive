import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<User>;


  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore,
    private router: Router) {
    this.user = this.afAuth.authState
      .pipe(switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }));
  }

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential: any) => {
        const token = credential.credential.idToken;
        localStorage.setItem('currentUserToken', JSON.stringify({ token: token }));
        this.updateUserData(credential.user);
      });
  }

  private updateUserData(user) {
    // Set user data to firebase on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: false
    };
    localStorage.setItem('currentUser', JSON.stringify(data));
    userRef.set(data);
    this.router.navigate(['']);
  }

  signOut() {
    localStorage.removeItem('currentUser');
    this.afAuth.auth.signOut();
  }
}
