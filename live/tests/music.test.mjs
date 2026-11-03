import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../overlay.html',import.meta.url),'utf8');
const code=html.slice(html.indexOf('function playMusic(){'),html.indexOf('function duck(on)'));
test('music reuses one audio source and recovers paused, failed and stalled playback',()=>{
 let now=0,created=0,plays=0,loads=0,watch;const timers=new Map();let seq=0;
 const audio={paused:false,ended:false,currentTime:0,muted:true,error:null,play(){plays++;this.paused=false;return Promise.resolve();},load(){loads++;}};
 const ctx=vm.createContext({danceTrack:"",console,performance:{now:()=>now},document:{createElement:()=>audio,body:{append(){}}},AC:{state:'running',createMediaElementSource(){created++;return {connect(){}}}},musicGain:{},settings:{music:true},TRACKS:['first.mp3','second.mp3'],trackIdx:0,musicEl:null,musicRetry:null,musicLastTime:0,musicLastProgress:0,setTimeout:fn=>{const id=++seq;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),setInterval:fn=>{watch=fn;}});
 vm.runInContext(code+'\nglobalThis.start=nextTrack;',ctx);
 ctx.start();assert.equal(created,1);assert.equal(audio.src,'first.mp3');assert.equal(audio.muted,false);
 audio.onended();assert.equal(created,1);assert.equal(audio.src,'second.mp3');
 audio.paused=true;const before=plays;watch();assert.equal(plays,before+1);
 const initialLoads=loads;now=16000;watch();assert.equal(loads,initialLoads+1);assert.equal(created,1);
 audio.onerror();audio.onerror();assert.equal(timers.size,1);[...timers.values()][0]();assert.equal(created,1);
 ctx.settings.music=false;now=40000;const stoppedLoads=loads;watch();assert.equal(loads,stoppedLoads);
});
