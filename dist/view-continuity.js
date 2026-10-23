// Keep transient input/focus/scroll state separate from data snapshots.
export function captureView(root){
 const active=document.activeElement;
 return {
  scrollY:window.scrollY,
  focus:root.contains(active)&&active.id?{id:active.id,start:active.selectionStart,end:active.selectionEnd}:null,
  drafts:[...root.querySelectorAll('[data-dirty="true"]')].filter(el=>el.id).map(el=>({id:el.id,value:el.value})),
  tables:[...root.querySelectorAll('.table-scroll')].map(el=>el.scrollLeft),
 };
}
export function restoreView(root,snapshot){
 for(const draft of snapshot.drafts){const el=document.getElementById(draft.id);if(root.contains(el)){el.value=draft.value;el.dataset.dirty='true';}}
 root.querySelectorAll('.table-scroll').forEach((el,index)=>{el.scrollLeft=snapshot.tables[index]||0;});
 if(snapshot.focus){const el=document.getElementById(snapshot.focus.id);if(root.contains(el)){el.focus({preventScroll:true});if(typeof el.setSelectionRange==='function'&&snapshot.focus.start!==null){try{el.setSelectionRange(snapshot.focus.start,snapshot.focus.end);}catch{}}}}
 // Never scroll the document while its viewport is locked by a dialog/drawer.
 if(!document.documentElement.classList.contains('viewport-locked'))window.scrollTo({top:snapshot.scrollY,behavior:'instant'});
}
export function installViewportManager(){
 let locked=false,scrollY=0,oldStyle='';
 const sync=()=>{
  const needsLock=!!document.querySelector('dialog[open]')||document.body.classList.contains('nav-open');
  if(needsLock===locked)return;
  locked=needsLock;
  if(locked){scrollY=window.scrollY;oldStyle=document.body.getAttribute('style')||'';document.documentElement.classList.add('viewport-locked');Object.assign(document.body.style,{position:'fixed',top:`-${scrollY}px`,width:'100%'});}
  else{document.body.setAttribute('style',oldStyle);document.documentElement.classList.remove('viewport-locked');window.scrollTo({top:scrollY,behavior:'instant'});}
 };
 const observer=new MutationObserver(sync);observer.observe(document.body,{attributes:true,attributeFilter:['open','class'],subtree:true,childList:true});
 document.addEventListener('close',sync,true);sync();return sync;
}
