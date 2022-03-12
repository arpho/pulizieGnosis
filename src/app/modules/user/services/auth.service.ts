import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
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

  signupUser(email: string, password: string): Promise<any> {
    const auth = getAuth()
    createUserWithEmailAndPassword(auth, email, password).then((newUserCredential => {
      sendEmailVerification(newUserCredential.user)
    }))
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then((user) => {
        if (user != null) {
          const JustCreatedUser = user.user
          sendEmailVerification(JustCreatedUser).then(() => {
            const db = getDatabase()
            const newUser = new UserModel(JustCreatedUser)
            const usersRef = ref(db, '/userProfile')
            push(usersRef, newUser.serialize())
            firebase
              .database()
              .ref(`/userProfile/${user.user.uid}/email`)
              .set(email);
          });
        }

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