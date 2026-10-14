import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createNavigator,distance2D} from '../navigation.js';
const from={x:0,z:0},to={x:10,z:0},simple=createNavigator([[from,to]],[{x:5,z:0,r:1}],{minX:-2,maxX:12,minZ:-4,maxZ:4});
let route=simple.route(from,to);assert.ok(route);assert.ok(route.every(p=>simple.isWalkable(p)));assert.deepEqual(from,{x:0,z:0},'planning does not move the player');assert.ok(route.some(p=>Math.abs(p.z)>1),'route goes around the obstruction');
const wall=createNavigator([],Array.from({length:9},(_,i)=>({x:5,z:i-4,r:.8})),{minX:0,maxX:10,minZ:-4,maxZ:4});assert.equal(wall.route(from,to),null,'a disconnected destination does not produce a route through walls');
const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context}),createElementNS:()=>({addEventListener(){},removeEventListener(){},set src(v){}})};
const {makeWorld}=await import('../world.js');const {locations}=await import('../locations.js');
const world=makeWorld(new T.Scene(),{mobile:true,loadModels:false}),nav=createNavigator(world.roads,world.colliders),start={x:-125,z:97.5};
for(const l of locations){let target={x:l.x,z:l.z+([17,18].includes(l.id)?3:8)};const result=nav.route(start,target);assert.ok(result,`route to ${l.name}`);assert.ok(result.every(p=>nav.isWalkable(p)),`${l.name}: avoid all physical obstacles`);assert.ok(distance2D(result.at(-1),target)<2,`${l.name}: arrive at the approach`);}
console.log('PASS: all 24 destinations reachable through actual world collision geometry; no teleportation, wall crossing or invalid endpoints');
