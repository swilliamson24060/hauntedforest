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
