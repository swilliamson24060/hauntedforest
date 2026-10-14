import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {sculptedModels} from './sculpted-models.js?v=3.1';
const loader=new GLTFLoader();let active=0;
export async function loadSculptedModel(id){
 const entry=sculptedModels.find(m=>m.id===id);if(!entry)throw new Error('Unknown sculpted haunting '+id);
 const gltf=await loader.loadAsync(new URL('./assets/models/'+entry.file+'?v=3',import.meta.url).href);
 return prepareSculptedModel(gltf.scene,entry);
}
export function prepareSculptedModel(model,entry){
 const materials=new Set(),motions=[];
 model.traverse(o=>{
  if(o.userData.motion)motions.push({object:o,motion:o.userData.motion,rotation:o.rotation.clone(),position:o.position.clone()});
  if(!o.isMesh)return;
  o.castShadow=false;o.receiveShadow=false;
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(materials.has(m))continue;materials.add(m);m.transparent=true;m.depthWrite=true;m.userData.baseOpacity=m.opacity;
   const cloth=m.name==='tattered-cloth';
   m.userData.clock={value:0};m.onBeforeCompile=shader=>{
    shader.uniforms.spectralTime=m.userData.clock;
    if(cloth){shader.vertexShader='uniform float spectralTime;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      transformed.x+=sin(position.y*3.1+position.z*1.7+spectralTime*.8)*.012;
      transformed.z+=sin(position.y*2.2+spectralTime*.6)*.014;
    `);}
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
      float rim=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.8);
      gl_FragColor.rgb+=vec3(.025,.055,.065)*rim;
    `);
   };m.customProgramCacheKey=()=>cloth?'sculpt-cloth-v1':'sculpt-solid-v1';
  }
 });
 return {model,materials:[...materials],motions,lookHeight:entry.lookHeight,id:entry.id};
}
// Load only nearby sculptures, two at a time. Keep the original figure as a failure fallback.
export function requestSculptedModel(root,distance){
 if(root.userData.id===0||distance>68||root.userData.sculpted||root.userData.sculptLoading||root.userData.sculptFailed||active>=2)return;
 active++;root.userData.sculptLoading=true;
 loadSculptedModel(root.userData.id).then(data=>{
  root.clear();root.scale.set(1,1,1);root.rotation.set(0,0,0);root.add(data.model);
  root.userData.sculpted=data;root.userData.lookHeight=data.lookHeight;delete root.userData.rig;
 }).catch(error=>{root.userData.sculptFailed=true;console.warn('Using fallback apparition',root.userData.id,error);}).finally(()=>{active--;root.userData.sculptLoading=false;});
}
export function animateSculpted(root,time,reduced,fade){
 const data=root.userData.sculpted,t=reduced?0:time;
 root.position.y=root.userData.baseY+(reduced?0:Math.sin(t*.65+data.id)*.07);
 for(const {object,motion,rotation,position}of data.motions){
  if(motion.orbit){const phase=motion.phase||0;object.position.set(Math.sin(t*motion.speed+phase)*motion.orbit,motion.height,Math.cos(t*motion.speed+phase)*motion.orbit*.6);}
  else{object.position.copy(position);object.rotation.copy(rotation);if(!reduced)object.rotation[motion.axis]+=Math.sin(t*(motion.speed||.5)+(motion.phase||0))*motion.amplitude;}
 }
 for(const m of data.materials){m.opacity=m.userData.baseOpacity*fade;m.userData.clock.value=t;}
}
