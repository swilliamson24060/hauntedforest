import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {sculptedModels} from '../sculpted-models.js';
import {prepareSculptedModel,animateSculpted} from '../sculpted-hauntings.js';
import {apparitionVisibility} from '../hauntings.js';
assert.deepEqual(sculptedModels.map(m=>m.id),Array.from({length:23},(_,i)=>i+1));
const hashes=new Set();let total=0;
for(const entry of sculptedModels){
 const bytes=await readFile(new URL('../assets/models/'+entry.file,import.meta.url));
 assert.equal(bytes.length,entry.bytes);assert.ok(bytes.length<1700000);
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');
 let addedHeads=0;gltf.scene.traverse(o=>{if(o.name.startsWith('carved-mask'))addedHeads++;});
 assert.equal(addedHeads,[2,14,18].includes(entry.id)?1:0,`${entry.name}: only purpose-built creatures get a separate head; robed sculptures already contain one`);
 const data=prepareSculptedModel(gltf.scene,entry),root=new T.Group();root.userData={id:entry.id,baseY:0,sculpted:data};root.add(data.model);
 let triangles=0;data.model.traverse(o=>{if(!o.isMesh)return;triangles+=o.geometry.index.count/3;for(const a of ['position','normal'])for(const v of o.geometry.attributes[a].array)assert.ok(Number.isFinite(v));});
 assert.equal(triangles,entry.triangles);assert.ok(triangles<65000);total+=triangles;
 const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3());assert.ok(size.y>.7&&size.y<9);assert.ok(size.x<12&&size.z<12);
 for(const reduced of [false,true])for(const time of [0,1,17,73]){animateSculpted(root,time,reduced,.4);root.traverse(o=>{for(const n of [...o.position,...o.scale,o.rotation.x,o.rotation.y,o.rotation.z])assert.ok(Number.isFinite(n));});for(const m of data.materials)assert.equal(m.opacity,.4);}
 animateSculpted(root,75,false,0);for(const m of data.materials)assert.equal(m.opacity,0);
 const camera=new T.PerspectiveCamera(68,1,.1,100);camera.position.copy(root.position);camera.updateMatrixWorld();assert.equal(apparitionVisibility(root,camera),0);
 hashes.add(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
}
assert.equal(hashes.size,23);
console.log(`PASS: 23 distinct GLBs parse with finite geometry; ${total} triangles total; animated parts, reduced motion and approach fading validated`);
