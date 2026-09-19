import * as admin from "firebase-admin";

const getFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.apps[0] as admin.app.App;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    console.warn("Firebase Admin environment variables are missing.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail,
      privateKey,
      projectId,
    }),
  });
};

export const adminApp = getFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
export const adminStorage = adminApp.storage();
