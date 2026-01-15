import * as FireStore from "firebase/firestore"
import { initializeApp } from "firebase/app";
import { IProject } from "../class/Project";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5yZdGBxGAx_xAY-vSowiDsiEte5PEg0I",
  authDomain: "bim-dev-master-86225.firebaseapp.com",
  projectId: "bim-dev-master-86225",
  storageBucket: "bim-dev-master-86225.firebasestorage.app",
  messagingSenderId: "536792841278",
  appId: "1:536792841278:web:f8bd1d294655d98013a56f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDB = FireStore.getFirestore()

export function getCollection<T>(path: string) {
  return FireStore.collection(firestoreDB, path) as FireStore.CollectionReference<T>
}

export async function deleteDocument(path: string, id: string) {
  const doc = FireStore.doc(firestoreDB,`${path}/${id}`)
  await FireStore.deleteDoc(doc)
}

export async function updateDocument<T extends Record<string, any>>(path: string, id: string, data: T) {
  const doc = FireStore.doc(firestoreDB, `${path}/${id}`)
  await FireStore.updateDoc(doc, data)
}