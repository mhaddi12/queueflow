// Only replace records before the first company snapshot. Cached navigation and
// saves retain their content; terminal and offline states must stay actionable.
export function needsWorkspaceSkeleton({ready,online,status,hasSnapshot}) {
 if(!ready)return true;
 return online && !hasSnapshot && ['loading','connecting'].includes(status);
}
