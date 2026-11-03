import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../overlay.html',import.meta.url),'utf8');
const code=html.slice(html.indexOf('function motionPose('),html.indexOf('function kitchen('));
test('continuous animation mesh stays joined and never folds at walking or dance poses',()=>{
 const c=vm.createContext({});vm.runInContext(code+';globalThis.pose=motionPose;globalThis.point=meshPoint;',c);
 for(const mode of ['walk','dance'])for(let now=0;now<8000;now+=50){
  const pose=c.pose(mode,now),p=(u,v)=>c.point(u,v,150,55,pose,mode==='dance',false);
  assert.ok(Math.abs(pose.sway)<=.014);assert.ok(Math.abs(pose.bob)<=.013);
  for(let row=0;row<7;row++)for(let col=0;col<4;col++){
   const ys=[0,.2,.34,.48,.60,.72,.85,1],a=p(col/4,ys[row]),b=p((col+1)/4,ys[row]),d=p(col/4,ys[row+1]);
   assert.ok((b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x)>0,'mesh must not fold or detach');
   assert.deepEqual(p(col/4,ys[row]),a,'shared vertex is deterministic');
  }
 }
});
test('mesh renders a complete connected body with cached texture and finite transforms',()=>{
 let draws=0,textures=0;const noop=()=>{};
 const ctx={save:noop,restore:noop,translate:noop,rotate:noop,scale:noop,beginPath:noop,moveTo:noop,lineTo:noop,closePath:noop,clip:noop,transform(...v){assert.ok(v.every(Number.isFinite));},drawImage(){draws++;}};
 const c=vm.createContext({ctx,document:{createElement(){textures++;return {width:0,height:0,getContext(){return {drawImage:noop};}};}}});
 vm.runInContext(code+';globalThis.draw=animatedArt;',c);
 const image={naturalWidth:1024},crop={x:0,y:0,w:180,h:500};
 c.draw(image,crop,500,1000,150,false,'dance',500);c.draw(image,crop,500,1000,150,false,'walk',1000);
 assert.equal(draws,112);assert.equal(textures,1);
});
