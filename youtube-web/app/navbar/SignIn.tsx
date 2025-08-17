import { signInWithGoogle, signOut } from "../firebase/firebase";
import styles from "./SignIn.module.css";
import { User } from "firebase/auth";

interface SigInProps {
    user: User | null;
}

export default function SignIn({user}: SigInProps ) {
    return (
        <div>
            {user ? (
                <button className={styles.SignIn} onClick={signOut}>
                    Sign Out
                </button>
            ) : (
                <button className={styles.SignIn} onClick={signInWithGoogle}>
                    Sign In
                </button>
            )}
        </div>
    );
}