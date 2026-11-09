/** A mounted view owns a lease. Active models cannot be evicted by another head or preview. */
export function createModelLeases<K,M extends {dispose():void}>(create:(key:K)=>M){
 const entries=new Map<K,{model:M;users:number}>();
 return {
  acquire(key:K){
   let entry=entries.get(key);
   if(!entry){entry={model:create(key),users:0};entries.set(key,entry);}
   entry.users++;let released=false;
   return {model:entry.model,release(){
    if(released)return;released=true;
    if(--entry.users===0){entries.delete(key);entry.model.dispose();}
   }};
  },
 };
}
