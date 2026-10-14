import assert from 'node:assert/strict';
import {createObserver,hasClearSight} from '../hauntings.js';
import * as T from '../vendor/three.module.js';
const camera=new T.PerspectiveCamera(68,1.6,.1,100);camera.position.set(0,1.7,0);camera.updateMatrixWorld();
const ghost=new T.Group();ghost.position.set(0,0,-10);ghost.userData={id:0,lookHeight:1.5};
let seen=[];let observe=createObserver(id=>seen.push(id));
for(let t=0;t<1;t+=.1)observe(t,camera,[ghost],[],true);
assert.deepEqual(seen,[0],'looking at an apparition records it without a button');
for(let t=1;t<2;t+=.1)observe(t,camera,[ghost],[],true);
assert.equal(seen.length,1,'audio and discoveries do not repeat every frame');
seen=[];observe=createObserver(id=>seen.push(id));ghost.position.z=10;
for(let t=0;t<1;t+=.1)observe(t,camera,[ghost],[],true);
assert.equal(seen.length,0,'a figure behind the camera is not recorded');
ghost.position.z=-10;
for(let t=1;t<2;t+=.1)observe(t,camera,[ghost],[{x:0,z:-5,r:1,y:0,height:3}],true);
assert.equal(seen.length,0,'an occluded figure is not recorded through a wall');
for(let t=2;t<3;t+=.1)observe(t,camera,[ghost],[],false);
assert.equal(seen.length,0,'menus do not trigger a discovery');
assert.equal(hasClearSight({x:0,y:1,z:0},{x:0,y:5,z:-10},[{x:0,z:-7,r:1,y:0,height:1}]),true,'a high sight line clears a low obstacle');
console.log('PASS: natural discovery, once-only notification, view direction, occlusion, pause, obstacle height');
// Build each model independently without a GPU, then check all generated coordinates.
const context=new Proxy({createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const {createApparition,animateApparition}=await import('../apparitions.js');
const {locations}=await import('../locations.js');const texture=new T.Texture();
for(const l of locations){const g=createApparition(l,{bark:{map:texture,normalMap:texture},stone:{map:texture,normalMap:texture}});g.userData.baseY=0;g.userData.id=l.id;let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;if(o.geometry?.attributes.position)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v),`${l.name} geometry`);});assert.ok(meshes>40,`${l.name} detail`);animateApparition(g,8,camera,false,.75);g.traverse(o=>{for(const v of [...o.position,...o.scale,o.rotation.x,o.rotation.y,o.rotation.z])assert.ok(Number.isFinite(v),`${l.name} animation`);});animateApparition(g,9,camera,true,1);}
console.log('PASS: all 24 detailed models build and animate with finite geometry');
const {apparitionVisibility}=await import('../hauntings.js');
camera.rotation.set(0,0,0);camera.updateMatrixWorld();
ghost.userData.id=0;ghost.position.set(0,0,-15);
assert.equal(apparitionVisibility(ghost,camera),1);
ghost.position.z=-8;const middleFade=apparitionVisibility(ghost,camera);
assert.ok(middleFade>0&&middleFade<1,'approaching fades the figure gradually');
ghost.position.z=-3;assert.equal(apparitionVisibility(ghost,camera),0,'nearby apparitions disappear');
ghost.position.z=-45;assert.equal(apparitionVisibility(ghost,camera),0);
for(const aspect of [0.45,1.6]){
 camera.aspect=aspect;camera.updateProjectionMatrix();
 ghost.userData.id=1;ghost.position.set(0,0,-18);
 assert.equal(apparitionVisibility(ghost,camera),0,'direct gaze hides a peripheral apparition');
 ghost.position.x=.8*18*Math.tan(camera.fov*Math.PI/360)*aspect;
 assert.ok(apparitionVisibility(ghost,camera)>.9,'peripheral glimpse works on portrait and landscape');
 ghost.userData.visibility=apparitionVisibility(ghost,camera);seen=[];observe=createObserver(id=>seen.push(id));
 for(let t=0;t<.5;t+=.05)observe(t,camera,[ghost],[],true);
 assert.deepEqual(seen,[1],'brief visible peripheral glimpse is recorded');
 ghost.userData.visibility=0;seen=[];observe=createObserver(id=>seen.push(id));
 for(let t=0;t<1;t+=.1)observe(t,camera,[ghost],[],true);
 assert.deepEqual(seen,[],'invisible apparitions cannot be recorded');
}
console.log('PASS: approach fade, near disappearance, peripheral-only visibility and brief discoveries on mobile and desktop');
