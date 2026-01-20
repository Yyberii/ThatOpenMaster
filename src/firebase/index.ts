import { initializeApp } from "firebase/app";
import * as FireStore from "firebase/firestore"
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "bim-dev-master-86225.firebasestorage.app",
  messagingSenderId: "536792841278",
  appId: "1:536792841278:web:f8bd1d294655d98013a56f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseDB = getFirestore(app)

export function getCollection<T>(path: string) {
  return FireStore.collection(firebaseDB, path) as FireStore.CollectionReference<T>
}

export async function deleteDocument(path: string, id: string) {
  const doc = FireStore.doc(firebaseDB,`${path}/${id}`)
  await FireStore.deleteDoc(doc)
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = FireStore.doc(firebaseDB, `${path}/${id}`)
  await FireStore.updateDoc(doc, data)
}