import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import 'firebase/auth';
import 'firebase/database';
import { DatabaseReference, getDatabase, ref, push } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, Auth } from 'firebase/auth'
import { UserModel } from '../models/userModel'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth: Auth

  constructor() { }

  loginUser(email: string, password: string): Promise<any> {
    this.auth = getAuth()

    return signInWithEmailAndPassword(this.auth, email, password);
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  signupUser(email: string, password: string): any {
   /*  const auth = getAuth()
    createUserWithEmailAndPassword(auth, email, password).then((newUserCredential => {
      sendEmailVerification(newUserCredential.user)
    })) */

    this.createUserObserver(email, password).subscribe({
      next: v => { console.log('creato user', v) 
      sendEmailVerification(v['user'])
    },
      error: e => { console.error('errore', e) },
      complete: () => { console.log('ok') }
    })
    /* return createUserWithEmailAndPassword(this.auth, email, password)
      .then((user) => {
        console.log('creato', user)
        if (user != null) {
          const JustCreatedUser = user.user
          console.log('new user', JustCreatedUser)
          sendEmailVerification(JustCreatedUser).then(() => {
            const db = getDatabase()
            const newUser = new UserModel(JustCreatedUser)
            const usersRef = ref(db, '/userProfile')
            push(usersRef, newUser.serialize())
          });
        }
      })
      .catch(error => {
        console.log('errore', error);
        throw new Error(error);
      }); */
  }


  createUserObserver(email, pass) {
    const auth = getAuth()
    const observer = new Observable(subscriber => {
      createUserWithEmailAndPassword(auth, email, pass)
        .then((userCredential) => {
          subscriber.next(userCredential);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
          subscriber.complete();
        });
    });

    return observer;
  }

  logoutUser(): Promise<void> {
    const userId: string = firebase.auth().currentUser.uid;
    firebase

      .database()
      .ref(`/userProfile/${userId}`)
      .off();
    return firebase.auth().signOut();
  }

}