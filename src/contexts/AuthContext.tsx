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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore users collection
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const role = userDoc.exists() ? userDoc.data().role : "VIEWER";
          setUser({ ...firebaseUser, role } as AppUser);
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setUser({ ...firebaseUser, role: "VIEWER" } as AppUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
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
