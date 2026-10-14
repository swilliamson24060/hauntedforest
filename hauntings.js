import * as T from './vendor/three.module.js';

// These hauntings can only be caught near the left or right edge of vision.
export const peripheralHauntings=new Set([1,3,8,12,15,20,22]);
const sightTarget=new T.Vector3(),viewTarget=new T.Vector3();
export function apparitionVisibility(g,camera){
  const distance=Math.hypot(g.position.x-camera.position.x,g.position.z-camera.position.z);
  let fade=T.MathUtils.smoothstep(distance,4,13)*(1-T.MathUtils.smoothstep(distance,28,42));
  if(peripheralHauntings.has(g.userData.id)){
    sightTarget.copy(g.position);sightTarget.y+=g.userData.lookHeight||1.5;
    viewTarget.copy(sightTarget).applyMatrix4(camera.matrixWorldInverse);
    if(viewTarget.z>=0)return 0;
    sightTarget.project(camera);
    if(Math.abs(sightTarget.y)>1||Math.abs(sightTarget.x)>1.15)return 0;
    fade*=T.MathUtils.smoothstep(Math.abs(sightTarget.x),.42,.72);
  }
  return fade;
}

// Discovery uses the same visibility that renders the apparition.
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
      const visible=g.visible&&(g.userData.visibility??1)>.18&&distance<28&&frustum.intersectsSphere(sphere)&&hasClearSight(camera.position,target,colliders);
      const elapsed=visible?(dwell.get(id)||0)+delta:0;dwell.set(id,elapsed);
      if(elapsed>=(peripheralHauntings.has(id)?.18:.35)){notified.add(id);onSeen(id);}
    }
  };
}
