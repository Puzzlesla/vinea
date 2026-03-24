import { auth, googleProvider } from '../firebase.js';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState } from 'react';

export const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const logIn = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Error during Google Sign-In:", error);
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }
    
    return(
        <div>
            <input 
            type="email" placeholder="Email..." 
            onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
            type="password" placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={logIn}>Log in</button>

            <button onClick={logOut}>Log out</button>

            <button onClick={signInWithGoogle}>Sign in with Google</button>
        </div>
    );
}