import {initializeApp} from 'firebase/app';
import {getAuth,browserSessionPersistence,setPersistence,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendEmailVerification,sendPasswordResetEmail,signOut,reload} from 'firebase/auth';
import {getFirestore,doc,onSnapshot,runTransaction,serverTimestamp,connectFirestoreEmulator} from 'firebase/firestore';
import {connectAuthEmulator} from 'firebase/auth';
import {decodeWorkspace,encodeWorkspace,initialWorkspace} from './dist/workspace-state.js';
import {createSnapshotTracker} from './dist/ui-state.js';
const emulator=location.hostname==='127.0.0.1'&&new URLSearchParams(location.search).get('emulators')==='1';
const app=initializeApp({projectId:emulator?'demo-queueflow':'angular-gateway-xmbw7',appId:'1:572214151398:web:a8847efff694ba585f5327',apiKey:emulator?'demo-key':'AIzaSyB2v9AWHWZPnPzmPPq19gIlZYpHwZuPKX0',authDomain:'angular-gateway-xmbw7.firebaseapp.com'});
const auth=getAuth(app);
const db=getFirestore(app,emulator?'(default)':'ai-studio-resumeaiairesume-160378a3-37d7-4ab9-b93d-ec929e2cbef4');
if(emulator){connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);}
let stop=()=>{},generation=0,ready=false,callbacks={};
const persistence=setPersistence(auth,browserSessionPersistence);
export async function connectWorkspace(handlers){
 callbacks=handlers;await persistence;
 return onAuthStateChanged(auth,async user=>{
  const token=++generation;stop();ready=false;handlers.state(initialWorkspace());handlers.status(user?'loading':'signed-out',user);
  if(!user)return;
  if(!user.emailVerified){handlers.status('verify-email',user);return;}
  const tracker=createSnapshotTracker();const ref=doc(db,'workspaces',user.uid);
  stop=onSnapshot(ref,{includeMetadataChanges:true},snapshot=>{
   if(token!==generation)return;
   try{const state=snapshot.exists()?decodeWorkspace(snapshot.data().payload):initialWorkspace();ready=!snapshot.metadata.fromCache;if(tracker.accept(snapshot.exists()?snapshot.data().revision:0,snapshot.exists()?snapshot.data().payload:''))handlers.state(state);handlers.status(ready?'connected':'connecting',user);}catch(error){ready=false;handlers.state(initialWorkspace());handlers.status('error',user,error);}
  },error=>{if(token===generation){ready=false;handlers.state(initialWorkspace());handlers.status('error',user,error);}});
 });
}
export async function changeWorkspace(fn){
 const user=auth.currentUser,token=generation;
 if(!user?.emailVerified||!ready)throw Error('Wait for a verified, online Firebase connection before editing.');
 const ref=doc(db,'workspaces',user.uid);
 const result=await runTransaction(db,async tx=>{
  if(token!==generation||auth.currentUser?.uid!==user.uid)throw Error('Your account changed. Please try again.');
  const snap=await tx.get(ref),old=snap.exists()?snap.data():null;
  const next=fn(old?decodeWorkspace(old.payload):initialWorkspace());
  tx.set(ref,{ownerId:user.uid,payload:encodeWorkspace(next),revision:old?old.revision+1:1,createdAt:old?old.createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  return next;
 });
 if(token!==generation)throw Error('Your account changed during the save.');return result;
}
export async function googleLogin(){await persistence;return signInWithPopup(auth,new GoogleAuthProvider());}
export async function emailLogin(email,password){await persistence;return signInWithEmailAndPassword(auth,email,password);}
export async function register(email,password){await persistence;const credential=await createUserWithEmailAndPassword(auth,email,password);await sendEmailVerification(credential.user);return credential;}
export async function verificationEmail(){if(!auth.currentUser)throw Error('Sign in before requesting verification.');await sendEmailVerification(auth.currentUser);}
export async function refreshVerification(){if(auth.currentUser){await reload(auth.currentUser);await auth.currentUser.getIdToken(true);const user=auth.currentUser;if(user.emailVerified){await signOut(auth);callbacks.status('signed-out');}return user.emailVerified;}}
export async function resetPassword(email){await sendPasswordResetEmail(auth,email);}
export async function logout(){++generation;stop();ready=false;callbacks.state?.(initialWorkspace());return signOut(auth);}
export function message(error){const code=error?.code||'';return ({'auth/invalid-credential':'Email or password is incorrect.','auth/email-already-in-use':'This email already has an account. Sign in or reset your password.','auth/weak-password':'Use a stronger password with at least 12 characters.','auth/popup-closed-by-user':'Sign-in was closed. Please try again.','auth/popup-blocked':'Allow the sign-in popup, then try again.','auth/unauthorized-domain':'This website is not authorized for Firebase sign-in.','auth/too-many-requests':'Too many attempts. Please wait before trying again.','auth/network-request-failed':'Connection failed. Check your internet connection.','permission-denied':'Database access is not enabled for this account. No data was saved.','resource-exhausted':'The Firebase quota has been reached. No data was saved.','unavailable':'Firebase is unavailable. Reconnect and try again.'})[code]||error?.message||'The operation could not be completed.';}
