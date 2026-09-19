"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AppUser extends FirebaseUser {
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Optimistically set the user to unblock the UI rendering immediately
        setUser({ ...firebaseUser, role: "VIEWER" } as AppUser);
        setLoading(false);

        // Fetch role from Firestore users collection in the background
        getDoc(doc(db, "users", firebaseUser.uid))
          .then((userDoc) => {
            const role = userDoc.exists() ? userDoc.data().role : "VIEWER";
            setUser((prev) => prev ? { ...prev, role } : prev);
          })
          .catch((error) => {
            console.error("Failed to fetch user role:", error);
          });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
