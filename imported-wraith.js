import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function installWraith(root){
 const gltf=await new GLTFLoader().loadAsync(new URL('./assets/models/gatekeeper-wraith.glb',import.meta.url).href);
 const model=gltf.scene;
 model.rotation.x=0;
 model.updateMatrixWorld(true);
 let bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());
 model.scale.setScalar(3.6/size.y);model.updateMatrixWorld(true);
 bounds.setFromObject(model);const center=bounds.getCenter(new T.Vector3());
 model.position.set(-center.x,-bounds.min.y+.25,-center.z);
 const materials=[];
 model.traverse(o=>{if(!o.isMesh)return;o.geometry.computeVertexNormals();o.material=new T.MeshStandardMaterial({color:0x516b75,emissive:0x25444d,emissiveIntensity:.08,roughness:.78,metalness:.08,transparent:true,opacity:1,depthWrite:true,side:T.FrontSide});
 o.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`#include <opaque_fragment>
 float rim=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.5);
 gl_FragColor.rgb+=vec3(.04,.09,.12)*rim;
 `);};materials.push(o.material);});
 root.clear();root.add(model);root.rotation.y=0;root.userData.importedWraith={model,materials};root.userData.lookHeight=2.6;
 root.name='haunting-0-imported-wraith';
}
export function animateWraith(root,time,reduced,fade){
 const {model,materials}=root.userData.importedWraith;
 root.position.y=root.userData.baseY+(reduced?0:Math.sin(time*.7)*.12);
 model.rotation.z=reduced?0:Math.sin(time*.43)*.025;
 root.rotation.y=reduced?0:Math.sin(time*.21)*.08;
 for(const m of materials)m.opacity=fade;
}
