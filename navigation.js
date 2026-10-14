// A* over the same collision footprints used for walking, with a preference for trails.
export const distance2D=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function segmentDistance(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz;const t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l)):0;return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t);}
class Heap{
 constructor(){this.items=[];}
 push(value){let a=this.items,i=a.length;a.push(value);while(i){let p=(i-1)>>1;if(a[p].score<=value.score)break;a[i]=a[p];i=p;}a[i]=value;}
 pop(){let a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let j=i*2+1;if(j+1<a.length&&a[j+1].score<a[j].score)j++;if(a[j].score>=last.score)break;a[i]=a[j];i=j;}a[i]=last;}return first;}
}
export function createNavigator(roads,colliders,{minX=-171,maxX=171,minZ=-127,maxZ=127,step=1}={}){
 const width=Math.round((maxX-minX)/step)+1,height=Math.round((maxZ-minZ)/step)+1,size=width*height;
 const blocked=new Uint8Array(size),cost=new Float32Array(size);
 const point=id=>({x:minX+(id%width)*step,z:minZ+Math.floor(id/width)*step});
 const cell=(x,z)=>Math.round((z-minZ)/step)*width+Math.round((x-minX)/step);
 for(const c of colliders){const r=c.r+.42;for(let z=Math.max(0,Math.floor((c.z-r-minZ)/step));z<=Math.min(height-1,Math.ceil((c.z+r-minZ)/step));z++)for(let x=Math.max(0,Math.floor((c.x-r-minX)/step));x<=Math.min(width-1,Math.ceil((c.x+r-minX)/step));x++){if(Math.hypot(minX+x*step-c.x,minZ+z*step-c.z)<r)blocked[z*width+x]=1;}}
 for(let i=0;i<size;i++){const p=point(i),d=Math.min(...roads.map(([a,b])=>segmentDistance(p,a,b)));cost[i]=d<1.7?1:d<3?1.6:4.5;}
 function nearest(p){let best=-1,d=Infinity;const cx=Math.round((p.x-minX)/step),cz=Math.round((p.z-minZ)/step);for(let z=Math.max(0,cz-8);z<=Math.min(height-1,cz+8);z++)for(let x=Math.max(0,cx-8);x<=Math.min(width-1,cx+8);x++){let id=z*width+x,dd=distance2D(p,point(id));if(!blocked[id]&&dd<d){d=dd;best=id;}}return best;}
 function route(from,to){const start=nearest(from),goal=nearest(to);if(start<0||goal<0)return null;const scores=new Float32Array(size).fill(Infinity),parent=new Int32Array(size).fill(-1),closed=new Uint8Array(size),open=new Heap();scores[start]=0;open.push({id:start,score:distance2D(point(start),point(goal))});
 while(open.items.length){const {id}=open.pop();if(closed[id])continue;if(id===goal){let ids=[id];while(ids[ids.length-1]!==start)ids.push(parent[ids[ids.length-1]]);const result=ids.reverse().map(point);if(distance2D(from,result[0])>.05)result.unshift({x:from.x,z:from.z});return result;}
 closed[id]=1;const x=id%width,z=Math.floor(id/width);
 for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dz)continue;let nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=width||nz>=height)continue;const n=nz*width+nx;if(blocked[n]||closed[n])continue;if(dx&&dz&&(blocked[z*width+nx]||blocked[nz*width+x]))continue;const score=scores[id]+Math.hypot(dx,dz)*step*(cost[id]+cost[n])*.5;if(score>=scores[n])continue;scores[n]=score;parent[n]=id;open.push({id:n,score:score+distance2D(point(n),point(goal))});}
 }return null;}
 return {route,isWalkable:p=>p.x>=minX&&p.x<=maxX&&p.z>=minZ&&p.z<=maxZ&&!blocked[cell(p.x,p.z)]};
}
