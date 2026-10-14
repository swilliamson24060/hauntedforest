import * as T from './vendor/three.module.js';

// Observation records a haunting; it never controls whether that haunting exists.
export function hasClearSight(from, to, colliders) {
  const dx=to.x-from.x, dz=to.z-from.z, lengthSquared=dx*dx+dz*dz;
  if(lengthSquared<.01)return true;
  for(const c of colliders){
    const u=((c.x-from.x)*dx+(c.z-from.z)*dz)/lengthSquared;
    if(u<=.025||u>=.96)continue;
    // Ignore a low obstacle when looking over it at a taller creature.
    const sightHeight=from.y+(to.y-from.y)*u;
    if(sightHeight>(c.y??0)+(c.height??3.2))continue;
    const distance=Math.hypot(from.x+u*dx-c.x,from.z+u*dz-c.z);
    if(distance<c.r*.78)return false;
  }
  return true;
}

export function createObserver(onSeen) {
  const frustum=new T.Frustum(),matrix=new T.Matrix4(),target=new T.Vector3(),sphere=new T.Sphere();
  const dwell=new Map(),notified=new Set();
  let previous=0;
  return function observe(time,camera,ghosts,colliders,enabled){
    const delta=Math.min(.25,Math.max(0,time-previous));previous=time;
    if(!enabled){dwell.clear();return;}
    camera.updateMatrixWorld();
    matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
    for(const g of ghosts){
      const id=g.userData.id;
      if(notified.has(id))continue;
      target.copy(g.position);target.y+=g.userData.lookHeight||1.5;
      sphere.center.copy(target);sphere.radius=.5;
      const distance=target.distanceTo(camera.position);
      const visible=g.visible&&distance<24&&frustum.intersectsSphere(sphere)&&hasClearSight(camera.position,target,colliders);
      const elapsed=visible?(dwell.get(id)||0)+delta:0;dwell.set(id,elapsed);
      if(elapsed>=.55){notified.add(id);onSeen(id);}
    }
  };
}
