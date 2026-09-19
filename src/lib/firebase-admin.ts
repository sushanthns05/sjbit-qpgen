import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const getFirebaseAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    console.warn("Firebase Admin environment variables are missing.");
  }

  try {
    return initializeApp({
      credential: cert({
        clientEmail: clientEmail || "uninitialized@example.com",
        privateKey: privateKey || "-----BEGIN PRIVATE KEY-----\nUNINITIALIZED\n-----END PRIVATE KEY-----\n",
        projectId: projectId || "uninitialized",
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization failed. Returning fallback app.", error);
    return initializeApp({ projectId: "uninitialized" }, "fallback");
  }
};

export const adminApp = getFirebaseAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
