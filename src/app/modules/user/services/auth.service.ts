import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import 'firebase/database';
import {getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendEmailVerification} from 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  loginUser(email: string, password: string): Promise<any> {
    const auth=getAuth()

    return signInWithEmailAndPassword(auth,email,password);
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  signupUser(email: string, password: string): Promise<any> {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth,email,password).then((newUserCredential=>{
      sendEmailVerification(newUserCredential.user)
    }))
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(newUserCredential => {
        newUserCredential.user.sendEmailVerification().then(()=>{
          firebase
          .database()
          .ref(`/userProfile/${newUserCredential.user.uid}/email`)
          .set(email);
        });
        
      })
      .catch(error => {
        console.error(error);
        throw new Error(error);
      });
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