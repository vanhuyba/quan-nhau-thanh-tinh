import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';
const source = fs.readFileSync(new URL('../server.mjs', import.meta.url), 'utf8');
function setup(dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chua-test-'))) {
  const messages = [], timers = [];
  const sandbox = { fs, path, __dirname:dir, ROOT:dir, process:{env:{}}, console:{log(){}},
    setInterval(){}, clearInterval(){}, setTimeout(fn, delay){ const t={fn,delay}; timers.push(t); return t; }, clearTimeout(t){ if(t)t.cancelled=true; },
    broadcast(m){ messages.push(m); } };
  vm.createContext(sandbox);
  let code = source.slice(source.indexOf('const TTS_DIR'), source.indexOf('/* -------------------------------------------------------------- server */'));
  vm.runInContext(code + `\nrestoreRuntimeSession();settings.gifts.readAll=false; settings.gifts.minDiamonds=Infinity;
    globalThis.api={onLike,onFollow,onControl,updateDance,reward,saveEulerKey,readEulerKey,eulerStatus,snapshot,manualSeat,saveRuntimeSession,onChat,rebalanceDining,sessionRewards,DINING_SEATS,seat,capacity,giftWish,onGift,expireSeats,viewers,totals,connectTikTok,disconnectTikTok,
    useLib(lib){TikTokLib=lib},get state(){return tiktokState}};`, sandbox);
  return { api:sandbox.api, dir, messages, timers };
}
test('full room still announces and persists a new donor; history survives restart', () => {
  const env=setup();
  try {
    for(let i=0;i<400;i++){ const {v}=env.api.seat('u'+i,'User '+i); v.coins=1; }
    env.api.onGift('new','New donor','Rose',3,2);
    assert.equal(env.api.viewers.size,400);
    assert.equal(env.messages.at(-1).t,'gift');
    assert.equal(env.messages.at(-1).total,6);
    const restored=setup(env.dir);
    assert.equal(restored.api.seat('new','New donor').v.coins,6);
    restored.api.onGift('new','New donor','Rose',1,2);
    assert.equal(restored.messages.at(-1).total,8);
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});
test('simulated gifts are excluded from durable history and comments are not spoken', () => {
  const env=setup();
  try {
    env.api.onGift('sim_Test','Test','Rose',1,1,undefined,true);
    assert.equal(fs.existsSync(path.join(env.dir,'data/gifts.jsonl')),false);
    const {v}=env.api.seat('real','Real'); v.lastText='untrusted text'; v.lastTextAt=Date.now();
    env.api.onGift('real','Real','Rose',1,1);
    assert.notEqual(env.messages.at(-1).prayer,'untrusted text');
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});
test('superseded connections cannot emit gifts or overwrite the current connection; disconnect cancels retry', async () => {
  const env=setup(), conns=[];
  class Conn extends EventEmitter {
    constructor(id){super(); this.id=id; conns.push(this);}
    connect(){return new Promise(resolve=>{this.resolve=resolve;});}
    disconnect(){this.closed=true;}
  }
  env.api.useLib({TikTokLiveConnection:Conn,WebcastEvent:{CHAT:'chat',GIFT:'gift',MEMBER:'member',LIKE:'like'},ControlEvent:{DISCONNECTED:'disconnected',ERROR:'error'}});
  try {
    const first=env.api.connectTikTok('first');
    const second=env.api.connectTikTok('second');
    assert.equal(conns[0].closed,true);
    conns[1].resolve({roomId:'2'}); await second;
    conns[0].resolve({roomId:'1'}); await first;
    assert.equal(env.api.state.uniqueId,'second');
    conns[0].emit('gift',{user:{uniqueId:'old'},repeatCount:1});
    assert.equal(env.api.totals.has('old'),false);
    const gift={user:{uniqueId:'donor',nickname:'Donor'},giftDetails:{giftType:1,giftName:'Rose',diamondCount:2},repeatCount:3};
    conns[1].emit('gift',{...gift,repeatEnd:false});
    assert.equal(env.api.totals.has('donor'),false);
    conns[1].emit('gift',{...gift,repeatEnd:true});
    assert.equal(env.api.totals.get('donor'),6);
    conns[1].emit('disconnected');
    assert.equal(env.timers.at(-1).delay,2000);
    env.api.disconnectTikTok();
    assert.equal(env.timers.at(-1).cancelled,true);
    assert.equal(env.api.state.status,'idle');
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});

test('proto/v3 chat and gift create the same viewer, preserve gift value, and deduplicate final events', async () => {
  const env=setup(); let conn;
  class Conn extends EventEmitter { constructor(){super();conn=this;} async connect(){return {roomId:'live'};} disconnect(){} }
  env.api.useLib({TikTokLiveConnection:Conn,WebcastEvent:{CHAT:'chat',GIFT:'gift',MEMBER:'member',LIKE:'like'},ControlEvent:{DISCONNECTED:'disconnected',ERROR:'error'}});
  try {
    await env.api.connectTikTok('channel');
    const user={id:'730001',nickname:'Diệu An',displayId:'dieu.an',avatarThumb:{urlList:['https://example.com/avatar.png']}};
    conn.emit('chat',{user,content:'Nam mô A Di Đà Phật'});
    assert.equal(env.api.viewers.get(user.id).lastText,'Nam mô A Di Đà Phật');
    const gift={user,gift:{type:1,name:'Hoa hồng',diamondCount:2},repeatCount:3,common:{msgId:'gift-final-1'}};
    conn.emit('gift',{...gift,repeatEnd:0});
    assert.equal(env.api.totals.has(user.id),false);
    conn.emit('gift',{...gift,repeatEnd:1});
    conn.emit('gift',{...gift,repeatEnd:1});
    const gifts=env.messages.filter(m=>m.t==='gift');
    assert.equal(gifts.length,1);
    assert.equal(gifts[0].name,'Diệu An');
    assert.equal(gifts[0].giftName,'Hoa hồng');
    assert.equal(gifts[0].coins,6);
    assert.equal(env.api.viewers.size,1);
    assert.equal(JSON.parse(fs.readFileSync(path.join(env.dir,'data/gifts.jsonl'),'utf8')).coins,6);
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});

test('gift motion leaves the seat and returns without drifting after seven seconds', () => {
  const html=fs.readFileSync(new URL('../overlay.html',import.meta.url),'utf8');
  const start=html.indexOf('      v.giftT=Math.max');
  const end=html.indexOf('    }      // glide',start);
  assert.ok(start>0 && end>start);
  const context=vm.createContext({v:{giftT:7,seat:{x:400,y:1400},x:400,y:1400,ft:0,frame:7,state:'sit'},dt:1/60});
  const step=new vm.Script('{'+html.slice(start,end)+'}');
  let moved=false;
  for(let i=0;i<600;i++){step.runInContext(context);if(context.v.y<1350)moved=true;}
  assert.equal(moved,true);
  assert.ok(Math.abs(context.v.x-400)<0.1 && Math.abs(context.v.y-1400)<0.1);
  assert.equal(context.v.frame,7);
  assert.equal(context.v.flip,false);
});

test('idle seats expire, active seats stay and returning donors retain gift totals', () => {
  const env = setup();
  try {
    env.api.onGift('donor', 'Donor', 'Rose', 3, 1);
    const idle = env.api.viewers.get('donor');
    const active = env.api.seat('active', 'Active').v;
    const now = Date.now();
    idle.lastAt = now - 120_000;
    active.lastAt = now - 119_999;
    env.api.expireSeats(now);
    assert.equal(env.api.viewers.has('donor'), false);
    assert.equal(env.api.viewers.has('active'), true);
    assert.ok(env.messages.some(m=>m.t==='leave' && m.id==='donor'));
    assert.equal(env.messages.at(-1).t,'room');
    assert.equal(env.api.seat('donor', 'Donor').v.coins, 3);
  } finally { fs.rmSync(env.dir, {recursive:true, force:true}); }
});

test('automatic capacity expands beyond 100 up to 400 with unique seats', () => {
  const env = setup();
  try {
    for (let i=0; i<101; i++) env.api.seat('u'+i, 'User '+i);
    assert.equal(env.api.viewers.size, 101);
    assert.equal(env.api.capacity(), 144);
    for (let i=101; i<400; i++) env.api.seat('u'+i, 'User '+i);
    assert.equal(env.api.viewers.size, 400);
    assert.equal(env.api.capacity(), 400);
  } finally { fs.rmSync(env.dir, {recursive:true, force:true}); }
});

test('gift categories match exact localized names and unknown gifts use general wishes', () => {
  const env=setup();
  try {
    for(const [name,topic] of [['Heart Me','Sức khỏe'],['GG','Thi cử'],[' Rose ','Tình duyên'],['Hoa hồng','Tình duyên'],['Ice Cream Cone','Gia đạo'],['Finger Heart','Bình an'],['Doughnut','Tài lộc']]) assert.equal(env.api.giftWish(name).topic,topic);
    assert.equal(env.api.giftWish('Rose Bear').topic,'Lời chúc bình an');
    env.api.onGift('u','User','Ice Cream Cone',3,1);
    const event=env.messages.at(-1);
    assert.equal(event.topic,'Gia đạo'); assert.equal(event.count,3);
    assert.ok(event.prayer.startsWith('Chúc gia đình'));
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});


test('tavern: chat queues, one-coin gifts grant sausages, exact thresholds seat and upgrade', () => {
  const env=setup();
  try {
    const a=env.api;
    a.onChat('guest','Guest','hello');
    const v=a.viewers.get('guest');
    assert.equal(v.seatId,null); assert.equal(v.queuePosition,1);
    a.onGift('guest','Guest','Rose',1,1,undefined,true);
    assert.equal(v.sausages,1);assert.equal(v.sessionCoins,1);assert.equal(v.seatId,null);
    a.onGift('guest','Guest','Rose',9,1,undefined,true);
    assert.equal(v.sausages,10);assert.equal(v.sessionCoins,10);assert.equal(v.diningTier,'regular');assert.ok(v.seatId.startsWith('B'));
    a.onGift('guest','Guest','Gift',1,89,undefined,true);
    assert.equal(v.sessionCoins,99);assert.equal(v.diningTier,'regular');assert.equal(v.sausages,10);
    a.onGift('guest','Guest','Rose',1,1,undefined,true);
    assert.equal(v.sessionCoins,100);assert.equal(v.diningTier,'vip');assert.ok(v.seatId.startsWith('V'));
  }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('tavern: full tiers queue FIFO, freed seats fill, return retains session rewards', () => {
  const env=setup();
  try {
    const a=env.api;
    for(let i=0;i<62;i++)a.onGift('r'+i,'Regular '+i,'Gift',1,10,undefined,true);
    const seated=[...a.viewers.values()].filter(v=>v.seatId);
    assert.equal(seated.length,60);assert.equal(new Set(seated.map(v=>v.seatId)).size,60);
    assert.equal(a.viewers.get('r60').queuePosition,1);assert.equal(a.viewers.get('r61').queuePosition,2);
    for(let i=0;i<21;i++)a.onGift('v'+i,'VIP '+i,'Gift',1,100,undefined,true);
    assert.equal(a.viewers.get('v20').seatId,null);assert.equal(a.viewers.get('v20').queuePosition,1);
    a.onGift('r0','Regular 0','Gift',1,90,undefined,true);
    assert.equal(a.viewers.get('r0').seatId,null);assert.equal(a.viewers.get('r0').diningTier,'vip');
    assert.ok(a.viewers.get('r60').seatId);assert.equal(a.viewers.get('r61').queuePosition,1);
    a.viewers.delete('v0');a.rebalanceDining();
    assert.ok(a.viewers.get('v20').seatId);assert.equal(a.viewers.get('r0').seatId,null);
    a.viewers.delete('r60');a.rebalanceDining();a.seat('r60','Returns');
    assert.equal(a.viewers.get('r60').sessionCoins,10);
    assert.equal(a.viewers.get('r60').seatId,null); // r61 took the freed seat first
  }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('tavern: historical gifts never grant session seating on a fresh server', () => {
  const env=setup();
  try {
    env.api.onGift('old','Old','Gift',1,100);
    const restored=setup(env.dir);const v=restored.api.seat('old','Old').v;
    assert.equal(v.coins,100);assert.equal(v.sessionCoins,0);assert.equal(v.seatId,null);
  }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});


test('each tavern table has exactly ten distinct seats in its tier',()=>{
  const env=setup();try{
    const seats=env.api.DINING_SEATS;
    assert.equal(seats.length,80);assert.equal(new Set(seats.map(s=>s.id)).size,80);
    for(const id of new Set(seats.map(s=>s.tableId))){
      const group=seats.filter(s=>s.tableId===id);assert.equal(group.length,10);
      assert.equal(new Set(group.map(s=>s.x+','+s.y)).size,10);
      assert.ok(group.every(s=>s.tier===group[0].tier));
    }
  }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});


test('manual invitation seats a zero-coin viewer without creating a gift and can be revoked',()=>{
 const env=setup();try{
  const a=env.api;const v=a.seat('invited','Invited').v;
  assert.equal(a.manualSeat('invited','regular'),true);assert.ok(v.seatId.startsWith('B'));assert.equal(v.sessionCoins,0);assert.equal(v.coins,0);assert.equal(v.sausages,0);
  assert.equal(fs.existsSync(path.join(env.dir,'data/gifts.jsonl')),false);
  assert.equal(a.manualSeat('invited','vip'),true);assert.ok(v.seatId.startsWith('V'));
  assert.equal(a.manualSeat('invited','auto'),true);assert.equal(v.seatId,null);assert.equal(v.diningTier,'queue');
  assert.equal(a.manualSeat('missing','vip'),false);assert.equal(a.manualSeat('invited','invalid'),false);assert.equal(a.viewers.size,1);
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('manual invitation respects full VIP queue and never downgrades earned VIP rights',()=>{
 const env=setup();try{
  const a=env.api;for(let i=0;i<20;i++)a.onGift('vip'+i,'VIP','Gift',1,100,undefined,true);
  const v=a.seat('host','Guest').v;a.manualSeat('host','vip');assert.equal(v.seatId,null);assert.equal(v.queuePosition,1);
  a.viewers.delete('vip0');a.rebalanceDining();assert.ok(v.seatId.startsWith('V'));assert.equal(v.sessionCoins,0);
  a.manualSeat('vip1','regular');assert.equal(a.viewers.get('vip1').diningTier,'vip');
  a.manualSeat('vip1','auto');assert.equal(a.viewers.get('vip1').diningTier,'vip');
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('runtime reload preserves manually invited guest, session rewards and assigned seat',()=>{
 const env=setup();try{
  env.api.onGift('guest','Guest','Rose',2,1,undefined,true);env.api.manualSeat('guest','vip');
  const before=env.api.viewers.get('guest');const seatId=before.seatId;
  const restored=setup(env.dir);const after=restored.api.viewers.get('guest');
  assert.ok(after);assert.equal(after.seatId,seatId);assert.equal(after.sessionCoins,2);assert.equal(after.sausages,2);assert.equal(after.manualTier,'vip');
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});


test('Euler key is private on disk and is excluded from public state and logs',()=>{
 const env=setup();try{
  const key='unit-test-euler-key-not-real';assert.equal(env.api.saveEulerKey(key),true);
  assert.equal(env.api.readEulerKey(),key);assert.equal(env.api.eulerStatus().configured,true);
  assert.equal(fs.statSync(path.join(env.dir,'data/euler-key.json')).mode&0o777,0o600);
  assert.equal(JSON.stringify(env.api.snapshot()).includes(key),false);assert.equal(JSON.stringify(env.messages).includes(key),false);
  assert.equal(env.api.saveEulerKey('bad key'),false);assert.equal(env.api.readEulerKey(),key);
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('Euler key reaches signer options and clears stale anonymous client cache',async()=>{
 const env=setup();try{
  const key='unit-test-configured-key';env.api.saveEulerKey(key);let options;
  class Conn extends EventEmitter{constructor(id,o){super();options=o;}async connect(){return {roomId:'fake'};}disconnect(){}}
  const SignConfig={cachedInstance:{old:true}};
  env.api.useLib({TikTokLiveConnection:Conn,WebcastEvent:{CHAT:'chat',GIFT:'gift',MEMBER:'member',LIKE:'like'},ControlEvent:{ERROR:'error',DISCONNECTED:'disconnect'},SignConfig});
  await env.api.connectTikTok('test');assert.equal(options.signApiKey,key);assert.equal(SignConfig.apiKey,key);assert.equal(SignConfig.cachedInstance,undefined);assert.equal(env.api.state.status,'connected');
  assert.equal(JSON.stringify(env.messages).includes(key),false);
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('Euler rate limit stops retries and redacts key in errors',async()=>{
 const env=setup();try{
  const key='unit-test-secret-key';env.api.saveEulerKey(key);
  class Conn extends EventEmitter{async connect(){throw new Error('rate_limit_account_hour '+key);}disconnect(){}}
  env.api.useLib({TikTokLiveConnection:Conn,WebcastEvent:{CHAT:'chat',GIFT:'gift',MEMBER:'member',LIKE:'like'},ControlEvent:{ERROR:'error',DISCONNECTED:'disconnect'},SignConfig:{}});
  await env.api.connectTikTok('test');assert.equal(env.api.state.status,'rate_limited');assert.equal(env.api.state.autoRetry,false);
  assert.equal(env.timers.filter(t=>!t.cancelled).length,0);assert.equal(JSON.stringify(env.messages).includes(key),false);
 }finally{fs.rmSync(env.dir,{recursive:true,force:true});}
});

test('gender chat commands change one avatar while preserving table and rewards, including reload', () => {
  const env=setup();
  try {
    env.api.onChat('gender-user','Guest','NỮ');
    const v=env.api.viewers.get('gender-user');
    assert.equal(v.skin,'woman');
    env.api.onGift(v.id,v.name,'Rose',1,1);
    env.api.onGift(v.id,v.name,'Gift',1,100);
    const before={seatId:v.seatId,coins:v.coins,sessionCoins:v.sessionCoins,sausages:v.sausages,diningTier:v.diningTier};
    for(const [command,skin] of [['nam','man'],['nu','woman'],['NAM!','man'],['nư\u0303','woman']]){
      env.api.onChat(v.id,v.name,command);
      assert.equal(v.skin,skin);
      assert.equal(env.api.viewers.size,1);
      for(const [k,value] of Object.entries(before)) assert.equal(v[k],value);
      assert.ok(env.messages.some(m=>m.t==='skin'&&m.id===v.id&&m.skin===skin));
    }
    env.api.onChat(v.id,v.name,'Nam mô A Di Đà Phật');
    assert.equal(v.skin,'woman');
    env.api.saveRuntimeSession();
    const restored=setup(env.dir).api.viewers.get(v.id);
    assert.equal(restored.skin,'woman');
    assert.equal(restored.seatId,v.seatId);
  } finally { fs.rmSync(env.dir,{recursive:true,force:true}); }
});

test('menu payments preserve change, wait for seating and survive restore',()=>{
 const e=setup();try{
 e.api.onChat('u','Guest','gọi M04');e.api.onGift('u','Guest','Gift',1,15,undefined,true);
 let v=e.api.viewers.get('u');assert.equal(v.meals[0].code,'M04');assert.equal(v.balance,5);assert.equal(v.sessionCoins,15);
 e.api.onChat('u','Guest','gọi B03');e.api.onGift('u','Guest','Rose',5,1,undefined,true);
 assert.equal(e.api.viewers.get('u').meals[1].code,'B03');assert.equal(e.api.viewers.get('u').sausages,0);
 e.api.saveRuntimeSession();const r=setup(e.dir);assert.equal(r.api.viewers.get('u').meals.length,2);assert.equal(r.api.viewers.get('u').balance,0);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
test('follow grants a regular seat; only seated VIPs dance after ten minutes and return to reserved seats',()=>{
 const e=setup();try{
 e.api.onFollow('u','Guest');const regular=e.api.viewers.get('u');assert.ok(regular.seatId);assert.equal(regular.sessionCoins,0);
 e.api.onGift('vip','VIP','Gift',1,100,undefined,true);let v=e.api.viewers.get('vip');const seatId=v.seatId,start=v.vipSeatedAt;
 e.api.expireSeats(start+9*60_000);assert.equal(e.api.snapshot().danceNow,null);
 e.api.expireSeats(start+10*60_000);v=e.api.viewers.get('vip');assert.equal(v.zone,'dance');assert.equal(v.seatId,seatId);assert.equal(e.api.viewers.get('u').zone,undefined);
 assert.equal(e.api.snapshot().danceNow.ids.length,1);assert.equal(e.api.snapshot().danceNow.durationMs,60000);
 e.api.saveRuntimeSession();const r=setup(e.dir);assert.equal(r.api.snapshot().danceNow.ids[0],'vip');
 e.api.expireSeats(start+11*60_000);v=e.api.viewers.get('vip');assert.equal(v.zone,'dining');assert.equal(v.seatId,seatId);assert.equal(e.api.snapshot().danceNow,null);
 e.api.expireSeats(start+20*60_000);assert.equal(e.api.snapshot().danceNow,null);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
test('controller simulations can fast-forward only a demo VIP and clean only that demo guest',()=>{
 const e=setup();try{
 e.api.onControl({cmd:'chat',name:'QA',text:'nam'});e.api.onControl({cmd:'gift',name:'QA',diamonds:100,count:1});
 e.api.onControl({cmd:'testDance',name:'QA'});assert.equal(e.api.snapshot().danceNow.ids[0],'sim_QA');
 e.api.onControl({cmd:'clearTestGuest',name:'QA'});assert.equal(e.api.viewers.has('sim_QA'),false);assert.equal(e.api.snapshot().danceNow,null);
 const {v}=e.api.seat('sim_Protected','Protected');e.api.manualSeat(v.id,'vip');
 e.api.onControl({cmd:'testDance',name:'Protected'});assert.equal(e.api.snapshot().danceNow,null);
 e.api.onControl({cmd:'clearTestGuest',name:'Protected'});assert.ok(e.api.viewers.has(v.id));
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
test('meal effects use actual paid order value and retain change',()=>{
 const e=setup();try{
 e.api.onFollow('u','Guest');
 for(const [code,amount,effect]of [['M07',20,'announce'],['M11',50,'cheers'],['M14',100,'fireworks'],['M15',301,'host']]){
 e.api.onChat('u','Guest','gọi '+code);e.api.onGift('u','Guest','Gift',1,amount,undefined,true);
 const meal=e.messages.filter(m=>m.t==='meal').at(-1);assert.equal(meal.effect,effect);assert.ok(meal.tableId);
 }
 assert.equal(e.api.reward('u').balance,1);
 assert.equal(fs.existsSync(path.join(e.dir,'data/gifts.jsonl')),false);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
test('chat orders accept dish names and codes, wait for payment, and address the exact guest seat',()=>{
 const e=setup();try{
 e.api.onFollow('a','First');e.api.onFollow('b','Second');
 e.api.onChat('b','Second','gọi khoai tây chiên');assert.equal(e.api.reward('b').selectedMeal,'M04');
 assert.equal(e.messages.filter(x=>x.t==='meal').length,0);
 e.api.onGift('b','Second','Gift',1,10,undefined,true);
 const meal=e.messages.filter(x=>x.t==='meal').at(-1);
 assert.equal(meal.id,'b');assert.equal(meal.seatId,e.api.viewers.get('b').seatId);assert.notEqual(meal.seatId,e.api.viewers.get('a').seatId);assert.equal(meal.code,'M04');
 e.api.onChat('b','Second','goi bia 333');assert.equal(e.api.reward('b').selectedMeal,'B03');
 e.api.onChat('b','Second','gọi món không tồn tại');assert.equal(e.api.reward('b').selectedMeal,'B03');
 assert.ok(e.messages.at(-1).text.includes('xem menu'));
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
test('comment alone queues; clearing simulation removes old gift/follow eligibility while preserving real rewards',()=>{
 const e=setup();try{
 e.api.onControl({cmd:'chat',name:'Fresh',text:'hello'});assert.equal(e.api.viewers.get('sim_Fresh').seatId,null);
 e.api.onControl({cmd:'gift',name:'Fresh',diamonds:100,count:1});e.api.onControl({cmd:'follow',name:'Fresh'});assert.ok(e.api.viewers.get('sim_Fresh').seatId);
 e.api.onFollow('real','Real');e.api.onControl({cmd:'clear'});
 assert.equal(e.api.reward('real').followed,true);
 e.api.onControl({cmd:'chat',name:'Fresh',text:'hello'});const v=e.api.viewers.get('sim_Fresh');assert.equal(v.seatId,null);assert.equal(v.sessionCoins,0);assert.equal(!!v.followed,false);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});

test('500 like milestones count deltas, deduplicate events, isolate simulations and survive restart',()=>{
 const e=setup();try{
 e.api.onLike('a',499,'one');assert.equal(e.messages.filter(m=>m.t==='roomCheers').length,0);
 e.api.onLike('a',1,'two');assert.equal(e.messages.at(-1).milestone,500);
 e.api.onLike('a',500,'two');assert.equal(e.api.snapshot().roomLikes,500);
 e.api.onLike('a',500,null,true);assert.equal(e.api.snapshot().roomLikes,500);
 e.api.onLike('a',600,'three');assert.equal(e.messages.at(-1).milestone,1000);assert.equal(e.api.snapshot().roomLikes,1100);
 e.api.onLike('a',-1);e.api.onLike('a',NaN);assert.equal(e.api.snapshot().roomLikes,1100);
 e.api.saveRuntimeSession();const r=setup(e.dir);assert.equal(r.api.snapshot().roomLikes,1100);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});


test('raw v3 LIKE synchronizes authoritative room total and deduplicates', async () => {
  const e=setup(); let conn;
  class Conn extends EventEmitter {
    constructor(){super();conn=this;}
    async connect(){return {roomId:'likes'};}
    disconnect(){}
  }
  e.api.useLib({TikTokLiveConnection:Conn,WebcastEvent:{CHAT:'chat',GIFT:'gift',MEMBER:'member',LIKE:'like'},ControlEvent:{ERROR:'error',DISCONNECTED:'disconnect'}});
  try {
    await e.api.connectTikTok('test');
    conn.emit('like',{user:{id:'1'},count:499,total:'20000',common:{msgId:'raw1'}});
    assert.equal(e.api.snapshot().roomLikes,20000);
    conn.emit('like',{user:{id:'1'},count:1,total:'20001',common:{msgId:'raw2'}});
    assert.equal(e.api.snapshot().roomLikes,20001);
    assert.equal(e.messages.at(-1).t,'like');
    conn.emit('like',{user:{id:'1'},count:1,total:'20001',common:{msgId:'raw2'}});
    assert.equal(e.api.snapshot().roomLikes,20001);
    conn.emit('like',{user:{id:'1'},likeCount:20,totalLikeCount:20021,common:{msgId:'legacy'}});
    assert.equal(e.api.snapshot().roomLikes,20021);
  } finally {e.api.disconnectTikTok();fs.rmSync(e.dir,{recursive:true,force:true});}
});

test('manual removal frees seat, preserves rewards and allows chat return; optional seated idle expiry',()=>{
 const e=setup();try{
  e.api.onGift('guest','Guest','Gift',1,100);
  e.api.onControl({cmd:'removeGuest',id:'guest'});
  assert.equal(e.api.viewers.has('guest'),false);
  e.api.onChat('guest','Guest','hey');
  assert.equal(e.api.viewers.get('guest').sessionCoins,100);
  assert.ok(e.api.viewers.get('guest').seatId);
  const v=e.api.viewers.get('guest'),now=Date.now();v.lastAt=now-180000;
  e.api.expireSeats(now);assert.equal(e.api.viewers.has('guest'),true);
  e.api.onControl({cmd:'settings',settings:{seatedIdleMinutes:2}});
  e.api.expireSeats(now);assert.equal(e.api.viewers.has('guest'),false);
 }finally{fs.rmSync(e.dir,{recursive:true,force:true});}
});
