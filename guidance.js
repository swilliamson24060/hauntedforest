import * as T from './vendor/three.module.js';
import {createNavigator,distance2D,segmentDistance} from './navigation.js';
export function createGuidance(scene,world,heightAt){
 const navigator=createNavigator(world.roads,world.colliders),group=new T.Group();scene.add(group);
 const time={value:0};
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{time},vertexShader:`varying vec3 wp;varying vec2 routeUV;void main(){routeUV=uv;vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float time;varying vec3 wp;varying vec2 routeUV;void main(){float edge=pow(max(0.,1.-abs(routeUV.x*2.-1.)),2.);float near=1.-smoothstep(13.,30.,distance(cameraPosition,wp));float pulse=.78+.22*sin(routeUV.y*.9-time*.75);gl_FragColor=vec4(.43,.72,.51,edge*near*pulse*.28);}`});
 let destination=null,route=[],index=0,lastPlan=-10;
 function ground(x,z){let y=heightAt(x,z)+.07;for(let w of world.waters)if(Math.hypot(x-w.x,z-w.z)<w.r)y=Math.max(y,w.y+.06);const bridge=world.bridge;if(bridge&&Math.abs(x-bridge.x)<1.4&&Math.abs(z-bridge.z)<6.2)y=Math.max(y,heightAt(bridge.x,bridge.z)+.62);return y;}
 function clearMesh(){while(group.children.length){const o=group.children[0];group.remove(o);o.geometry.dispose();}}
 function draw(){clearMesh();if(route.length-index<2)return;const vertices=[],uv=[],indices=[];let total=0;for(let j=index;j<route.length;j++){const p=route[j],before=route[Math.max(index,j-1)],after=route[Math.min(route.length-1,j+1)];const dx=after.x-before.x,dz=after.z-before.z,len=Math.hypot(dx,dz)||1;if(j>index)total+=distance2D(p,route[j-1]);for(let side of [-1,1]){const x=p.x-dz/len*.55*side,z=p.z+dx/len*.55*side;vertices.push(x,ground(x,z),z);uv.push(side===-1?0:1,total);}if(j>index){const k=(j-index)*2;indices.push(k-2,k-1,k,k-1,k+1,k);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);group.add(new T.Mesh(geo,material));}
 function target(l){return {x:l.x,z:l.z+(l.id===17||l.id===18?3:8)};}
 function plan(position,t){const next=navigator.route(position,target(destination));if(!next)return false;route=next;index=0;lastPlan=t;draw();return true;}
 return {
  select(location,position,t){const previous=destination;destination=location;if(!plan(position,t)){destination=previous;return false;}return true;},
  clear(){destination=null;route=[];index=0;clearMesh();},
  get destination(){return destination;},
  update(position,t,reduced){time.value=reduced?0:t;if(!destination)return null;let changed=false;while(index<route.length-1&&distance2D(position,route[index+1])<1.5){index++;changed=true;}
   if(distance2D(position,route[route.length-1])<2.5){const arrived=destination;this.clear();return {arrived};}
   const d=index<route.length-1?segmentDistance(position,route[index],route[index+1]):distance2D(position,route[index]);if(d>4&&t-lastPlan>1.5)plan(position,t);else if(changed)draw();
   let remaining=distance2D(position,route[index]);for(let j=index+1;j<route.length;j++)remaining+=distance2D(route[j-1],route[j]);return {name:destination.name,remaining:Math.round(remaining)};
  }
 };
}
