// Pure coordination primitives shared by the UI and Firebase listener.
export function createOperationGate(){
 let epoch=0,current=null;
 return {
  get busy(){return current!==null;},
  get scope(){return epoch;},
  begin(){if(current)return null;current={epoch};return current;},
  finish(token){if(token!==current)return false;current=null;return true;},
  isCurrent(token){return token===current&&token?.epoch===epoch;},
  reset(){epoch++;current=null;},
 };
}
export function createSnapshotTracker(){
 let revision=-1,payload=null;
 return {
  reset(){revision=-1;payload=null;},
  accept(nextRevision,nextPayload){
   if(!Number.isSafeInteger(nextRevision)||nextRevision<0||nextRevision<revision)return false;
   if(nextRevision===revision&&nextPayload===payload)return false;
   // A revision identifies an immutable committed snapshot.
   if(nextRevision===revision&&payload!==null)return false;
   revision=nextRevision;payload=nextPayload;return true;
  },
 };
}
export function connectionMessage({mode='demo',status='signed-out',online=true,busy=false,error=''}){
 if(busy)return {kind:'loading',title:'Saving changes…',detail:'Wait for confirmation before trying again.'};
 if(mode==='demo')return {kind:'info',title:online?'Local demo':'Local demo · Offline',detail:'Records stay on this device. Sign in to use a private cloud workspace.'};
 if(!online)return {kind:'warning',title:'You are offline',detail:'Showing the last loaded workspace. Cloud changes are paused until you reconnect.'};
 if(status==='connected')return {kind:'success',title:'Connected',detail:'Your changes are saved across your devices.'};
 if(status==='error')return {kind:'error',title:'Could not connect',detail:error||'Your workspace is locked. Retry the connection; do not resubmit bookings blindly.'};
 if(status==='verify-email')return {kind:'warning',title:'Verify your email',detail:'Open the verification email, then return to Account & connection. Your records stay locked until verification completes.'};
 if(status==='signed-out')return {kind:'info',title:'Sign in to your workspace',detail:'Cloud records are hidden while you are signed out.'};
 return {kind:'loading',title:status==='loading'?'Loading your private workspace…':'Reconnecting…',detail:'Editing is paused until the server confirms the connection.'};
}
