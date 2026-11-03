// Chánh Điện Tịnh Tâm — live server
// Runs on the streaming PC. Serves the overlay + control panel, listens to a TikTok LIVE room,
// keeps the list of seated viewers, generates Vietnamese voice lines with Edge TTS and pushes
// everything to the overlay over WebSocket.
//
//   cd live && npm install && node server.mjs        → http://localhost:3000/live/control.html
//
import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');            // repo root: serves /assets, /live
const TTS_DIR = path.join(__dirname, 'tts');
fs.mkdirSync(TTS_DIR, { recursive: true });
for (const f of fs.readdirSync(TTS_DIR)) { try { fs.unlinkSync(path.join(TTS_DIR, f)); } catch {} }
const PORT = +process.env.PORT || 3000;

/* ------------------------------------------------------------------ state */
const settings = {
  title: 'Quán Nhậu Thanh Tịnh',
  subtitle: 'Một góc bình yên · Một chút tâm tình',
  voice: 'vi-VN-HoaiMyNeural',      // or vi-VN-HoaiMyNeural
  pitch: 2,                        // Hz
  rate: 8,                         // %
  music: true, mo: false, moBpm: 52,
  autoChant: false, chantEveryMin: 3,
  announcementEnabled:false, announcementVoice:'vi-VN-HoaiMyNeural', sayText:'Mời cả nhà bình luận để ghé vào Quán Nhậu Thanh Tịnh, cùng ngồi chơi và tâm tình nhé!',
  seatMode: 'auto',                  // auto | 24 | 36 | 64 | 100 | 144 | 225 | 400
  seatedIdleMinutes: 0,
  joinOnEnter: false,                // also seat viewers who only enter the room
  gifts: { readAll: true, minDiamonds: 1 },
};
const viewers = new Map();           // id -> { id, name, skin, avatar, coins, joinedAt, lastAt, lastText, lastTextAt, demo }
// Session rewards are separate from the durable all-time gift ledger.
const sessionRewards = new Map();
let admissionSeq = 0;
let roomLikes=0,demoLikes=0,likesRoomId='',likesSynced=false;
const seenLikes=new Set();
const MENU = [
  {
    "code": "M01",
    "name": "Lạc rang húng lìu",
    "price": 5,
    "dish": "nuts"
  },
  {
    "code": "M02",
    "name": "Dưa chuột chẻ",
    "price": 5,
    "dish": "salad"
  },
  {
    "code": "M03",
    "name": "Rau muống xào tỏi",
    "price": 10,
    "dish": "salad"
  },
  {
    "code": "M04",
    "name": "Khoai tây chiên",
    "price": 10,
    "dish": "fries"
  },
  {
    "code": "M05",
    "name": "Nem chua rán",
    "price": 15,
    "dish": "springroll"
  },
  {
    "code": "M06",
    "name": "Đậu phụ tẩm hành",
    "price": 15,
    "dish": "nuts"
  },
  {
    "code": "M07",
    "name": "Ngao hấp sả",
    "price": 20,
    "dish": "clams"
  },
  {
    "code": "M08",
    "name": "Chân gà sả tắc",
    "price": 25,
    "dish": "chicken"
  },
  {
    "code": "M09",
    "name": "Cánh gà chiên mắm",
    "price": 30,
    "dish": "chicken"
  },
  {
    "code": "M10",
    "name": "Bò lúc lắc",
    "price": 40,
    "dish": "grill"
  },
  {
    "code": "M11",
    "name": "Mực nướng sa tế",
    "price": 50,
    "dish": "squid"
  },
  {
    "code": "M12",
    "name": "Tôm nướng muối ớt",
    "price": 60,
    "dish": "seafood"
  },
  {
    "code": "M13",
    "name": "Gà rang muối",
    "price": 80,
    "dish": "chicken"
  },
  {
    "code": "M14",
    "name": "Cá chép om dưa",
    "price": 100,
    "dish": "fish"
  },
  {
    "code": "M15",
    "name": "Lẩu Thái hải sản",
    "price": 150,
    "dish": "hotpot"
  },
  {
    "code": "B01",
    "name": "Bia hơi Hà Nội",
    "price": 5,
    "dish": "beer"
  },
  {
    "code": "B02",
    "name": "Bia Hà Nội (Habeco)",
    "price": 10,
    "dish": "beer"
  },
  {
    "code": "B03",
    "name": "Bia 333",
    "price": 10,
    "dish": "beer"
  },
  {
    "code": "B04",
    "name": "Bia Sài Gòn Lager",
    "price": 10,
    "dish": "beer"
  },
  {
    "code": "B05",
    "name": "Bia Sài Gòn Special",
    "price": 15,
    "dish": "beer"
  },
  {
    "code": "B06",
    "name": "Bia Huda",
    "price": 15,
    "dish": "beer"
  },
  {
    "code": "B07",
    "name": "Bia Larue",
    "price": 15,
    "dish": "beer"
  },
  {
    "code": "B08",
    "name": "Bia Tiger nâu",
    "price": 20,
    "dish": "beer"
  },
  {
    "code": "B09",
    "name": "Bia Tiger Crystal (bạc)",
    "price": 30,
    "dish": "beer"
  },
  {
    "code": "B10",
    "name": "Bia Heineken",
    "price": 50,
    "dish": "beer"
  }
];
const DANCE_TRACK={url:'/assets/music/dance-floor-v1.wav',title:'Thanh Tịnh · Sàn đêm',durationMs:60_000};
let danceNow=null;

const TABLES = Array.from({length:8}, (_,i)=>({
  id: (i<2?'V':'B')+(i<2?i+1:i-1), tier:i<2?'vip':'regular',
  x:i%2?852:498, y:900+Math.floor(i/2)*150, scale:.60+Math.floor(i/2)*.025,
}));
const DINING_SEATS = TABLES.flatMap(t=>Array.from({length:10},(_,i)=>({
  id:t.id+'-'+i, tableId:t.id, tier:t.tier,
  x:t.x+[-144,-72,0,72,144][i%5]*t.scale, y:t.y+(i<5?-10:104)*t.scale,
  scale:.34*t.scale, gap:65*t.scale, side:i<5?'back':'front',
})));
function reward(id){
  if(!sessionRewards.has(id)) sessionRewards.set(id,{sessionCoins:0,sausages:0});
  return sessionRewards.get(id);
}
function diningTier(coins){return coins>=100?'vip':coins>=10?'regular':'queue';}
function rebalanceDining(){
  const used=new Set();
  for(const v of viewers.values()){
    const r=reward(v.id); Object.assign(v,r);
    const autoTier=r.followed&&r.sessionCoins<10?'regular':diningTier(r.sessionCoins);
    const tier=autoTier==='vip'||r.manualTier==='vip'?'vip':autoTier==='regular'||r.manualTier==='regular'?'regular':'queue';
    if(v.diningTier!==tier){v.diningTier=tier;v.seatId=null;v.eligibleOrder=++admissionSeq;}
    if(tier!=='vip'){r.vipSeatedAt=null;if(r.zone==='dance')r.zone='dining';}
    const current=DINING_SEATS.find(s=>s.id===v.seatId && s.tier===tier);
    if(current && !used.has(current.id)) used.add(current.id); else v.seatId=null;
  }
  for(const tier of ['vip','regular']){
    const waiting=[...viewers.values()].filter(v=>v.diningTier===tier&&!v.seatId).sort((a,b)=>a.eligibleOrder-b.eligibleOrder);
    for(const v of waiting){const free=DINING_SEATS.find(s=>s.tier===tier&&!used.has(s.id));if(!free)break;v.seatId=free.id;const r=reward(v.id);r.diningStartedAt ||= Date.now();v.diningStartedAt=r.diningStartedAt;used.add(free.id);}
  }
  for(const v of viewers.values()){const r=reward(v.id);if(v.seatId&&v.diningTier==='vip'&&!r.vipSeatedAt)r.vipSeatedAt=Date.now();Object.assign(v,r);}
  const queues={queue:0,regular:0,vip:0};
  for(const v of [...viewers.values()].sort((a,b)=>a.eligibleOrder-b.eligibleOrder)){
    v.queuePosition=v.seatId?0:++queues[v.diningTier];
  }
}
function roomState(){return {t:'room',menu:MENU,danceNow,roomLikes,tables:TABLES,seats:DINING_SEATS,viewers:[...viewers.values()].map(pub)};}
function syncDining(){rebalanceDining();for(const v of viewers.values())fulfillMeal(v.id);rebalanceDining();broadcast(roomState());}
const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
const EULER_KEY_FILE=path.join(DATA_DIR,'euler-key.json');
function readEulerKey(){
  const env=String(process.env.EULER_API_KEY||'').trim();if(env)return env;
  try{const key=JSON.parse(fs.readFileSync(EULER_KEY_FILE,'utf8')).key;return typeof key==='string'?key.trim():'';}catch{return '';}
}
function eulerStatus(){return {configured:!!readEulerKey(),source:process.env.EULER_API_KEY?'environment':readEulerKey()?'local':'anonymous'};}
function saveEulerKey(key){
  if(process.env.EULER_API_KEY){broadcast({t:'eulerSaved',ok:false,message:'Máy đang dùng EULER_API_KEY từ môi trường; hãy cập nhật biến đó.'},'control');return false;}
  if(typeof key!=='string'||key.trim().length<8||key.trim().length>4096||/\s/.test(key.trim())){
    broadcast({t:'eulerSaved',ok:false,message:'API key không hợp lệ. Hãy dán nguyên key do Euler cấp, không kèm khoảng trắng.'},'control');return false;
  }
  try{
    fs.writeFileSync(EULER_KEY_FILE+'.tmp',JSON.stringify({key:key.trim()}),{mode:0o600});fs.chmodSync(EULER_KEY_FILE+'.tmp',0o600);fs.renameSync(EULER_KEY_FILE+'.tmp',EULER_KEY_FILE);
    broadcast({t:'eulerSaved',ok:true,...eulerStatus(),message:'Đã lưu key riêng trên máy. Bấm Kết nối khi kênh đang LIVE.'},'control');addLog('Đã cập nhật API key Euler riêng.');return true;
  }catch{broadcast({t:'eulerSaved',ok:false,message:'Không lưu được key trên máy.'},'control');return false;}
}
function redactEulerSecret(value){const key=readEulerKey();return key?String(value).split(key).join('[API key đã ẩn]'):String(value);}
const LEDGER = path.join(DATA_DIR, 'gifts.jsonl');
const totals = new Map();
if (fs.existsSync(LEDGER)) for (const line of fs.readFileSync(LEDGER, 'utf8').split('\n')) {
  try { const g = JSON.parse(line); totals.set(g.id, (totals.get(g.id) || 0) + g.coins); } catch {}
}
let startedAt = Date.now();
let tiktok = null, tiktokState = { status: 'idle', uniqueId: '', error: '' };
const log = [];
function addLog(s){ const line = `[${new Date().toLocaleTimeString('vi-VN')}] ${s}`; log.push(line); if (log.length > 300) log.shift(); broadcast({ t:'log', line }, 'control'); console.log(line); }

const CAPS = [24, 36, 64, 100, 144, 225, 400];
const MAX_SEATS = CAPS.at(-1);
function capacity(){ if (settings.seatMode !== 'auto') return +settings.seatMode; const n = viewers.size; return CAPS.find(c => n <= c) || MAX_SEATS; }

/* skins: sprites that exist in /assets. Walking strips exist for man / woman / granny. */
// A comment changes the outfit only when it IS the keyword (≤ 3 words), so "Nam mô A Di Đà Phật" never reads as "nam".
const SKIN_WORDS = [['woman',['nữ','nu','chị','chi','gái','gai']], ['man',['nam','anh','trai']], ['granny',['bà','ba','cô','co']]];
function skinFromText(t){
  const w = String(t).toLowerCase().normalize('NFC').replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (!w || w.split(' ').length > 3) return null;
  for (const [skin, words] of SKIN_WORDS) if (words.some(k => w === k || w.startsWith(k + ' '))) return skin;
  return null;
}
const DEFAULT_SKINS = ['man', 'woman', 'woman', 'man', 'granny'];

function pub(v){ return { id:v.id, name:v.name, lastAt:v.lastAt, balance:v.balance||0, selectedMeal:v.selectedMeal||null, meals:v.meals||[], followed:!!v.followed, zone:v.zone||'dining', diningStartedAt:v.diningStartedAt||null,vipSeatedAt:v.vipSeatedAt||null, skin:v.skin, avatar:v.avatar||'', coins:v.coins, demo:!!v.demo, manualTier:v.manualTier||null, sessionCoins:v.sessionCoins||0, sausages:v.sausages||0, diningTier:v.diningTier||'queue', seatId:v.seatId||null, queuePosition:v.queuePosition||0 }; }
function snapshot(){ return { t:'state',menu:MENU,danceNow,roomLikes, giftCatalog:GIFT_WISHES.map(({icon,label,topic})=>({icon,label,topic})), settings, euler:eulerStatus(), tables:TABLES, seats:DINING_SEATS, viewers:[...viewers.values()].map(pub), cap: capacity(), startedAt, tiktok: tiktokState }; }

function seat(id, name, opts = {}){
  if (!id) return { v:null, isNew:false };
  id = String(id);
  let v = viewers.get(id);
  if (v){ v.lastAt = Date.now(); if (opts.avatar) v.avatar = opts.avatar; return { v, isNew:false }; }
  if (viewers.size >= MAX_SEATS){                     // full: the longest-quiet non-donor stands up
    const quiet = [...viewers.values()].filter(x => x.coins === 0).sort((a,b) => a.lastAt - b.lastAt)[0];
    if (!quiet) return { v:null, isNew:false };
    viewers.delete(quiet.id); broadcast({ t:'leave', id: quiet.id });
  }
  v = { id, name: (name||id).slice(0, 18), skin: opts.skin || DEFAULT_SKINS[viewers.size % DEFAULT_SKINS.length],
        avatar: opts.avatar || '', coins: opts.demo ? 0 : (totals.get(id) || 0), joinedAt: Date.now(), lastAt: Date.now(), demo: !!opts.demo };
  viewers.set(id, v);
  rebalanceDining();
  broadcast({ t:'join', v: pub(v), cap: capacity() });
  broadcast(roomState());
  return { v, isNew:true };
}

// Seats represent recent interaction, not TikTok concurrent viewers.
const SEAT_IDLE_MS = 2 * 60_000;
function expireSeats(now = Date.now()){
  let changed=false;
  for (const [id, v] of viewers) {
    const r=reward(id);
    if(r.zone==='dance') continue;
    const idleLimit=v.seatId?(settings.seatedIdleMinutes>0?settings.seatedIdleMinutes*60_000:Infinity):SEAT_IDLE_MS;
    if (now - v.lastAt < idleLimit) continue;
    viewers.delete(id); changed=true;
    broadcast({ t:'leave', id });
  }
  if(updateDance(now))changed=true;
  if(changed) syncDining();
}
function updateDance(now=Date.now()){
  let changed=false;
  if(danceNow&&now>=danceNow.endsAt){
    for(const id of danceNow.ids){const r=reward(id);r.zone='dining';r.vipSeatedAt=now;const v=viewers.get(id);if(v)v.lastAt=now;}
    danceNow=null;changed=true;
  }
  if(!danceNow){
    const ready=[...viewers.values()].filter(v=>v.seatId&&v.diningTier==='vip'&&reward(v.id).vipSeatedAt&&now-reward(v.id).vipSeatedAt>=10*60_000);
    if(ready.length){danceNow={...DANCE_TRACK,startedAt:now,endsAt:now+DANCE_TRACK.durationMs,ids:ready.map(v=>v.id)};for(const v of ready)reward(v.id).zone='dance';changed=true;}
  }
  return changed;
}
setInterval(expireSeats, 15_000);
setInterval(()=>{if(updateDance())syncDining();},1000);

/* ------------------------------------------------------------- events in */
function onChat(id, name, text, avatar){
  text = String(text || '').slice(0, 120);
  const want = skinFromText(text);
  const { v, isNew } = seat(id, name, { avatar, skin: want || undefined });
  if (!v) return;
  if (!isNew && want && want !== v.skin){ v.skin = want; broadcast({ t:'skin', id, skin: want }); }
  v.lastText = text; v.lastTextAt = Date.now();
  broadcast({ t:'chat', id, name: v.name, text });
  const match=text.trim().match(/^(?:gọi|goi)\s+(.+)$/i);
  if(match){
    const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();
    const query=normalize(match[1]),item=MENU.find(x=>normalize(x.code)===query||normalize(x.name)===query);
    if(item){
      const r=reward(id);r.selectedMeal=item.code;syncDining();
      const message=r.selectedMeal?(!v.seatId?'Món được giữ chờ bạn vào bàn.':'Còn thiếu '+Math.max(0,item.price-(r.balance||0))+'xu, mời bạn tặng quà để thanh toán.'):'Đã nhận món, nhân viên đang mang đến chỗ bạn.';
      broadcast({t:'notice',text:v.name+' chọn '+item.name+' · '+message});
    }else broadcast({t:'notice',text:v.name+': Mời xem menu và chat gọi mã món, ví dụ gọi M04 hoặc gọi B03.'});
  }

}

function onLike(id,count,eventId,simulated=false,roomTotal){
  const n=Math.floor(Number(count));if(!Number.isSafeInteger(n)||n<=0)return;
  if(eventId&&!simulated){const key=String(eventId);if(seenLikes.has(key))return;seenLikes.add(key);if(seenLikes.size>2000)seenLikes.delete(seenLikes.values().next().value);}
  if(!simulated && viewers.has(String(id)))viewers.get(String(id)).lastAt=Date.now();
  const before=simulated?demoLikes:roomLikes;
  const authoritative=Number(roomTotal);
  const hasTotal=!simulated&&roomTotal!==undefined&&Number.isSafeInteger(authoritative)&&authoritative>=0;
  const initialSync=hasTotal&&!likesSynced;
  const total=hasTotal?authoritative:before+n;if(!Number.isSafeInteger(total))return;
  if(hasTotal)likesSynced=true;
  if(simulated)demoLikes=total;else roomLikes=total;
  broadcast({t:'like',id,n,total,simulated});
  if(!initialSync&&Math.floor(total/500)>Math.floor(before/500))broadcast({t:'roomCheers',total,milestone:Math.floor(total/500)*500,simulated,text:'Một, hai, ba... dô! 🍻',durationMs:8000});
}
function onFollow(id,name,avatar){
  if(!id)return;const {v}=seat(id,name,{avatar});if(!v)return;
  const r=reward(String(id)),firstFollow=!r.followed;
  r.followed=true;syncDining();
  if(firstFollow)say('Cảm ơn '+spoken(v.name)+' đã theo dõi quán. Mời bạn nâng ly!',{tag:'follow',id:String(id)});
}
function fulfillMeal(id){
  const r=reward(id),v=viewers.get(id),item=MENU.find(x=>x.code===r.selectedMeal);
  if(!v||!v.seatId||!item||!(r.balance>=item.price))return;
  const count=Math.min(99,Math.floor(r.balance/item.price));r.balance-=count*item.price;
  r.meals ||= [];const meal={code:item.code,name:item.name,dish:item.dish,count,at:Date.now(),seatId:v.seatId,tableId:v.seatId.split('-')[0]};r.meals.push(meal);r.meals=r.meals.slice(-30);
  r.selectedMeal=null;
  const value=count*item.price;
  broadcast({t:'meal',id,...meal,mealName:meal.name,name:v.name,value,effect:value>=200?'host':value>=100?'fireworks':value>=50?'cheers':value>=20?'announce':'serve'});
  if(value>=20&&settings.gifts.readAll)say('Bàn '+meal.tableId+', '+spoken(v.name)+' gọi '+count+' '+item.name+'. '+(value>=200?'Chủ quán xin cảm ơn quý khách!':'Chúc cả bàn ngon miệng!'),{tag:'meal',id});
}
function onGift(id, name, giftName, count, diamonds, avatar, simulated = false){
  giftName = String(giftName || 'quà').slice(0, 30); count = Math.max(1, Math.min(9999, +count || 1));
  if (!id) return;
  id = String(id);
  const { v: seated } = seat(id, name, { avatar, demo: simulated });
  const v = seated || { id, name: String(name || id).slice(0, 18), coins: totals.get(id) || 0 };
  const coins = Math.max(1, Math.min(50000, Number(diamonds) || 1)) * count;
  v.coins += coins;
  if (!simulated) {
    totals.set(id, v.coins);
    try { fs.appendFileSync(LEDGER, JSON.stringify({ at: new Date().toISOString(), id, name: v.name, giftName, count, coins }) + '\n'); }
    catch (e) { addLog('Không lưu được lịch sử quà: ' + e.message); }
  }
  const r=reward(id); r.sessionCoins+=coins;
  r.balance ||= 0;
  const sausageCount=Number(diamonds)===1&&!r.selectedMeal?count:0; r.sausages+=sausageCount;
  r.balance+=coins-sausageCount;
  if(!r.selectedMeal&&Number(diamonds)===10)r.selectedMeal='B03';
  syncDining();
  if(sausageCount){r.meals ||= [];r.meals.push({code:'S01',name:'Xúc xích',dish:'sausage',count:sausageCount,at:Date.now()});r.meals=r.meals.slice(-30);broadcast({t:'meal',id,name:v.name,seatId:v.seatId,tableId:v.seatId?.split('-')[0],dish:'sausage',count:sausageCount,value:sausageCount,effect:'serve'});}
  fulfillMeal(id);syncDining();
  const { prayer, topic, icon } = giftWish(giftName);
  const tier = coins >= 100 ? 3 : coins >= 10 ? 2 : 1;
  const line = `Cảm ơn ${spoken(v.name)} đã gửi ${giftName}${count > 1 ? ' nhân ' + count : ''}. ${sausageCount ? 'Quán tặng bạn '+sausageCount+' cây xúc xích.' : 'Mời bạn ghé bàn '+(r.sessionCoins>=100?'VIP':r.sessionCoins>=10?'bình dân':'khi đủ 10 xu')+'.'}`;
  broadcast({ t:'gift', id, name: v.name, giftName, count, coins, total: v.coins, tier, prayer, tavernMessage:sausageCount?'Quán tặng bạn '+sausageCount+' cây xúc xích 🌭':r.sessionCoins>=100?'Mời bạn đến khu bàn VIP':r.sessionCoins>=10?'Mời bạn đến khu bàn bình dân':'Cảm ơn bạn đã ghé quán', topic, icon, sausageCount, sessionCoins:r.sessionCoins });
  if (settings.gifts.readAll || coins >= settings.gifts.minDiamonds) say(line, { tag:'gift', id });
}

const GIFT_WISHES = [
  { icon:'🎮', label:'GG', aliases:['gg'], topic:'Thi cử', wishes:['Chúc bạn ôn tập hiệu quả, giữ bình tĩnh, tự tin và làm bài thật tốt.'] },
  { icon:'💗', label:'Heart Me', aliases:['heart me'], topic:'Sức khỏe', wishes:['Chúc bạn luôn mạnh khỏe, tinh thần thư thái và tràn đầy năng lượng.'] },
  { icon:'🌹', label:'Hoa hồng', aliases:['rose','hoa hồng'], topic:'Tình duyên', wishes:['Chúc bạn gặp được người đồng hành chân thành, biết yêu thương và trân trọng nhau.'] },
  { icon:'🍦', label:'Kem ốc quế', aliases:['ice cream cone','kem ốc quế'], topic:'Gia đạo', wishes:['Chúc gia đình bạn luôn hòa thuận, yêu thương và có nhiều khoảnh khắc sum vầy.'] },
  { icon:'🫰', label:'Tim ngón tay', aliases:['finger heart','finger hearts','tim ngón tay','trái tim ngón tay'], topic:'Bình an', wishes:['Chúc bạn mỗi ngày đều bình an, lòng nhẹ nhàng và gặp nhiều điều tốt đẹp.'] },
  { icon:'🍩', label:'Donut', aliases:['doughnut','donut','bánh donut','bánh vòng'], topic:'Tài lộc', wishes:['Chúc công việc của bạn thuận lợi, có thêm cơ hội tốt và tài chính ngày càng vững vàng.'] },
];
function giftWish(name){
  const key = String(name).normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ');
  const entry = GIFT_WISHES.find(g => g.aliases.includes(key));
  const wishes = entry?.wishes || [
    'Chúc bạn và gia đình luôn mạnh khỏe, bình an và nhiều niềm vui.',
    'Chúc bạn có một ngày nhẹ nhàng, ấm áp và nhiều điều tốt đẹp.',
    'Chúc bạn giữ được tinh thần lạc quan và có những người thân yêu bên cạnh.',
  ];
  return { topic:entry?.topic || 'Lời chúc bình an', icon:entry?.icon || '🎁', prayer:wishes[Math.floor(Math.random()*wishes.length)] };
}
const spoken = s => String(s).replace(/[_@.]+/g, ' ').replace(/[^\p{L}\p{N}\s]/gu, '').trim() || 'ẩn danh';

/* ------------------------------------------------------------------ TTS */
const ttsQueue = []; let ttsBusy = false, ttsSeq = 0, ttsVoiceTurn = 0;
function esc(s){ return String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c])); }
function say(text, meta = {}){ if (ttsQueue.length >= 15) { addLog('Hàng đợi giọng đọc đầy, bỏ qua 1 câu'); return; } ttsQueue.push({ text: String(text).slice(0, 500), meta }); pumpTTS(); }
async function pumpTTS(){
  if (ttsBusy || !ttsQueue.length) return; ttsBusy = true;
  const { text, meta } = ttsQueue.shift();
  const voices=[settings.voice,settings.voice==='vi-VN-HoaiMyNeural'?'vi-VN-NamMinhNeural':'vi-VN-HoaiMyNeural'];
  const voice=['say','invite'].includes(meta.tag)?settings.announcementVoice:voices[ttsVoiceTurn++ % 2];
  let tts, timeout;
  try {
    const file = `tts_${Date.now()}_${++ttsSeq}.mp3`;
    const python=path.join(__dirname,'.tts-venv','bin','python');
    if(fs.existsSync(python)){
      const result=await execFileAsync(python,[path.join(__dirname,'synthesize.py'),text,voice,`${settings.rate>=0?'+':''}${settings.rate}%`,`${settings.pitch>=0?'+':''}${settings.pitch}Hz`,path.join(TTS_DIR,file)],{timeout:120000});
      addLog('TTS '+voice+' · '+result.stdout.trim());
      if(fs.statSync(path.join(TTS_DIR,file)).size<1000)throw new Error('File giọng đọc rỗng');
      broadcast({t:'tts',url:`/live/tts/${file}`,text,voice,...meta});
      const old=fs.readdirSync(TTS_DIR).filter(f=>!f.endsWith('.part')).sort();while(old.length>40){try{fs.unlinkSync(path.join(TTS_DIR,old.shift()));}catch{}}
      return;
    }
    tts = new MsEdgeTTS();
    const deadline = new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Quá thời gian tạo giọng đọc')), 20000); });
    await Promise.race([tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3), deadline]);
    const { audioStream } = tts.toStream(esc(text), { pitch: `${settings.pitch >= 0 ? '+' : ''}${settings.pitch}Hz`, rate: `${settings.rate >= 0 ? '+' : ''}${settings.rate}%` });
    const chunks = [];
    await Promise.race([new Promise((res, rej) => { audioStream.on('data', c => chunks.push(c)); audioStream.on('close', res); audioStream.on('error', rej); }), deadline]);
    fs.writeFileSync(path.join(TTS_DIR, file), Buffer.concat(chunks));
    broadcast({ t:'tts', url: `/live/tts/${file}`, text, ...meta });
    const old = fs.readdirSync(TTS_DIR).sort(); while (old.length > 40) { try { fs.unlinkSync(path.join(TTS_DIR, old.shift())); } catch {} }
  } catch (e) {
    addLog('TTS Edge lỗi ('+voice+'): '+(e?.code==='ETIMEDOUT'?'Quá thời gian tạo giọng đọc':String(e?.message||e).split('\n')[0]).slice(0,180));

  }
  finally { clearTimeout(timeout); try { tts?.close(); } catch {} ttsBusy=false;setTimeout(pumpTTS,50); }
}

const CHANTS = [
  'Nam mô Bổn Sư Thích Ca Mâu Ni Phật. Nguyện đem công đức này, hướng về khắp tất cả, đệ tử và chúng sinh, đều trọn thành Phật đạo.',
  'Nam mô A Di Đà Phật. Nguyện sanh Tây Phương Tịnh Độ trung, cửu phẩm liên hoa vi phụ mẫu.',
  'Nam mô Đại Bi Quán Thế Âm Bồ Tát. Nguyện cho tất cả chúng sinh thân tâm an lạc, tai qua nạn khỏi.',
  'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
];
let chantIdx = 0, chantTimer = null;
function chant(){ const text = CHANTS[chantIdx++ % CHANTS.length]; broadcast({ t:'chant', text }); say(text, { tag:'chant' }); }
function scheduleChant(){ clearInterval(chantTimer); if (settings.autoChant) chantTimer = setInterval(chant, Math.max(1, settings.chantEveryMin) * 60_000); }
scheduleChant();

/* --------------------------------------------------------------- TikTok */
// Connector 2.5 uses proto/v3; retain legacy field fallbacks for older payloads.
function eventUser(u = {}) {
  const id = u.id || u.userId || u.uniqueId || u.displayId;
  return { id: id ? String(id) : '', name: u.nickname || u.displayId || u.uniqueId || 'ẩn danh',
    avatar: u.avatarThumb?.urlList?.[0] || u.avatarThumb?.url?.[0] || u.profilePicture?.url?.[0] || u.profilePicture?.urlList?.[0] || '' };
}
function eventGift(d) {
  const g = d.gift || d.giftDetails || d.extendedGiftInfo || {};
  return { type: Number(g.type ?? g.giftType), name: g.name || g.giftName || 'quà',
    diamonds: Number(g.diamondCount ?? g.diamond_count) || 1,
    count: Math.max(1, Number(d.repeatCount) || 1) };
}
let TikTokLib = null, connectionVersion = 0, retryTimer = null, retryAttempt = 0;
function retryTikTok(uniqueId, version){
  if (version !== connectionVersion) return;
  clearTimeout(retryTimer);
  const delay = Math.min(60000, 2000 * 2 ** Math.min(retryAttempt++, 5));
  addLog(`Thử kết nối lại @${uniqueId} sau ${delay / 1000} giây`);
  retryTimer = setTimeout(() => { if (version === connectionVersion) connectTikTok(uniqueId); }, delay);
}
async function connectTikTok(uniqueId){
  uniqueId = String(uniqueId || '').trim().replace(/^.*tiktok\.com\/@?/i, '').replace(/^@/, '').replace(/\/.*$/, '');
  if (!uniqueId) return;
  const version = disconnectTikTok(false);
  tiktokState = { status: 'connecting', uniqueId, error: '' }; broadcast({ t:'tiktok', ...tiktokState });
  try {
    TikTokLib ||= await import('tiktok-live-connector');
    const { TikTokLiveConnection, WebcastEvent, ControlEvent, SignConfig } = TikTokLib;
    const apiKey=readEulerKey();
    if(SignConfig&&SignConfig.apiKey!==(apiKey||undefined)){SignConfig.apiKey=apiKey||undefined;SignConfig.cachedInstance=undefined;}
    const conn = new TikTokLiveConnection(uniqueId, { enableExtendedGiftInfo: false, fetchRoomInfoOnConnect: false, processInitialData: false, ...(apiKey?{signApiKey:apiKey}:{}) });
    if (version !== connectionVersion) return;
    tiktok = conn;
    conn.on(WebcastEvent.CHAT, d => {
      if (version !== connectionVersion) return;
      const u = eventUser(d.user); onChat(u.id, u.name, d.content ?? d.comment, u.avatar);
    });
    const seenGifts = new Set();
    conn.on(WebcastEvent.GIFT, d => {
      if (version !== connectionVersion) return;
      const u = eventUser(d.user), g = eventGift(d);
      if (!u.id) { addLog('Bỏ sự kiện quà thiếu ID người gửi'); return; }
      if (g.type === 1 && !d.repeatEnd) return;
      const eventId = d.common?.msgId || d.common?.messageId;
      if (eventId && seenGifts.has(String(eventId))) return;
      if (eventId) { seenGifts.add(String(eventId)); if (seenGifts.size > 2000) seenGifts.delete(seenGifts.values().next().value); }
      onGift(u.id, u.name, g.name, g.count, g.diamonds, u.avatar);
      addLog(`🎁 ${u.name} tặng ${g.name} x${g.count}`);
    });
    conn.on(WebcastEvent.FOLLOW, d => {if(version!==connectionVersion)return;const u=eventUser(d.user);onFollow(u.id,u.name,u.avatar);});
    conn.on(WebcastEvent.MEMBER, d => {
      if (version !== connectionVersion || !settings.joinOnEnter) return;
      const u = eventUser(d.user); seat(u.id, u.name, { avatar:u.avatar });
    });
    conn.on(WebcastEvent.LIKE, d => {
      if(version === connectionVersion)onLike(eventUser(d.user).id,d.likeCount??d.count,d.common?.msgId||d.common?.messageId,false,d.totalLikeCount??d.total);
    });
    conn.on(ControlEvent.DISCONNECTED, () => { if (version !== connectionVersion) return; tiktokState = { ...tiktokState, status: 'disconnected' }; broadcast({ t:'tiktok', ...tiktokState }); addLog('TikTok: mất kết nối'); retryTikTok(uniqueId, version); });
    conn.on(ControlEvent.ERROR, e => addLog('TikTok lỗi: ' + redactEulerSecret(e?.info || e?.message || e)));
    const st = await conn.connect();
    if (version !== connectionVersion) { conn.disconnect(); return; }
    clearTimeout(retryTimer); retryAttempt = 0;
    tiktok = conn;
    const newRoomId=String(st?.roomId||'');
    if(newRoomId&&newRoomId!==likesRoomId){roomLikes=0;likesSynced=false;seenLikes.clear();likesRoomId=newRoomId;broadcast({t:'like',total:0,n:0,simulated:false});}
    tiktokState = { status: 'connected', uniqueId, error: '', roomId: st?.roomId || '' };
    addLog(`✅ Đã kết nối live @${uniqueId}`);
  } catch (e) {
    if (version !== connectionVersion) return;
    const message=redactEulerSecret(e?.message||e);
    const limited=/rate_limit_|rate limited|rate limit|too many connections/i.test(message);
    if(!limited)retryTikTok(uniqueId,version);
    const period=message.includes('account_hour')?'theo giờ':message.includes('account_day')?'theo ngày':message.includes('account_minute')?'theo phút':'';
    tiktokState={status:limited?'rate_limited':'error',uniqueId,error:limited?'Euler Stream đang giới hạn '+period+'. Đã dừng tự thử lại; chờ hạn mức hoặc lưu API key riêng.':message,autoRetry:!limited};
    addLog(`❌ Không kết nối được @${uniqueId}: ${tiktokState.error}`);
  }
  broadcast({ t:'tiktok', ...tiktokState });
}
function disconnectTikTok(resetRetry = true){
  ++connectionVersion; clearTimeout(retryTimer);
  if (resetRetry) retryAttempt = 0;
  const old = tiktok; tiktok = null;
  if (old) { try { Promise.resolve(old.disconnect()).catch(() => {}); } catch {} }
  tiktokState = { status:'idle', uniqueId:'', error:'' }; broadcast({ t:'tiktok', ...tiktokState });
  return connectionVersion;
}

/* ------------------------------------------------------------- test data */
const DEMO_NAMES = ['Diệu Hạnh','Minh Tâm','Thiện Đức','Huệ An','Tịnh Nhã','Quảng Trí','Chơn Như','Pháp Hỷ','Nguyên Thanh','Tâm Đăng','Diệu Liên','Trí Hải','Phước Lộc','Hạnh Nguyện','Như Ý','Bảo Châu','Thanh Lương','Từ Tâm','An Lạc','Giác Hoa','Tuệ Minh','Liên Hương','Thu Hà','Ngọc Lan','Đức Anh','Hải Đăng','Mai Anh','Phương Thảo','Trung Kiên','Quang Huy','Bảo Ngọc','Diệu Linh'];
function fillDemo(n){
  const have = [...viewers.values()].filter(v => v.demo).length;
  for (let i = have; i < n && viewers.size < MAX_SEATS; i++){
    const name = DEMO_NAMES[i % DEMO_NAMES.length] + (i >= DEMO_NAMES.length ? ' ' + (Math.floor(i / DEMO_NAMES.length) + 1) : '');
    seat('demo_' + i, name, { demo: true, skin: ['man','woman','woman','man','granny','monk','nun','child'][i % 8] });
  }
}
function tavernDemo(){
  // Only remove previous preview actors; real viewers and reward history stay intact.
  for(const id of [...viewers.keys()]) if(id.startsWith('preview_')) {viewers.delete(id);sessionRewards.delete(id);broadcast({t:'leave',id});}
  for(let i=0;i<86;i++){
    const id='preview_'+i;
    const sessionCoins=i<22?100:i<84?10:i===84?1:0;
    sessionRewards.set(id,{sessionCoins,sausages:i===84?1:0});
    seat(id,DEMO_NAMES[i%DEMO_NAMES.length],{demo:true,skin:i%2?'woman':'man'});
  }
  syncDining(); addLog('Preview: 20 VIP, 60 bình dân, 6 khách xếp hàng (có khách nhận xúc xích)');
}
function clearSeats(){
  // A new simulation must not inherit old test gifts/follows after clearing the scene.
  for(const [id,v] of viewers)if(v.demo)sessionRewards.delete(id);
  for(const id of sessionRewards.keys())if(id.startsWith('sim_')||id.startsWith('preview_'))sessionRewards.delete(id);
  viewers.clear();danceNow=null;rebalanceDining();saveRuntimeSession();broadcast(snapshot());addLog('Đã làm trống quán và quyền khách mô phỏng; giữ phần thưởng khách thật.');
}

function manualSeat(id,tier){
  const v=viewers.get(String(id||''));
  if(!v||!['regular','vip','auto'].includes(tier)){
    broadcast({t:'manualSeatResult',ok:false,message:!v?'Khách không còn trong quán.':'Hạng bàn không hợp lệ.'},'control');return false;
  }
  const r=reward(v.id);
  if(tier==='auto')delete r.manualTier;else r.manualTier=tier;
  // Remove the old public marker as Object.assign does not delete missing fields.
  v.manualTier=r.manualTier||null;v.lastAt=Date.now();syncDining();saveRuntimeSession();
  const message=v.seatId?`Đã mời ${v.name} vào bàn ${v.seatId.split('-')[0]}.`:v.diningTier==='queue'?`${v.name} trở về hàng chờ theo xu.`:`Hạng ${v.diningTier==='vip'?'VIP':'bình dân'} đầy ghế; ${v.name} chờ lượt #${v.queuePosition}.`;
  broadcast({t:'manualSeatResult',ok:true,id:v.id,message},'control');addLog(message);return true;
}
function removeGuest(id){
  id=String(id||'');const v=viewers.get(id);if(!v)return;
  viewers.delete(id);
  if(danceNow){danceNow.ids=danceNow.ids.filter(x=>x!==id);if(!danceNow.ids.length)danceNow=null;}
  const r=reward(id);r.zone='dining';r.vipSeatedAt=null;
  broadcast({t:'leave',id});syncDining();saveRuntimeSession();
  addLog('Đã mời '+v.name+' rời quán; giữ lịch sử quà, có thể vào lại khi tương tác.');
}

/* ------------------------------------------------------------- control */
function onControl(m){
  switch (m.cmd){
    case 'testLikes': onLike('',500,null,true);break;
    case 'testDance': {const id='sim_'+String(m.name||'Khách').slice(0,18),v=viewers.get(id);if(v?.demo&&v.diningTier==='vip'&&v.seatId){reward(id).vipSeatedAt=Date.now()-10*60_000;updateDance();syncDining();}break;}
    case 'clearTestGuest': {const id='sim_'+String(m.name||'Khách').slice(0,18),v=viewers.get(id);if(v?.demo){viewers.delete(id);sessionRewards.delete(id);if(danceNow){danceNow.ids=danceNow.ids.filter(x=>x!==id);if(!danceNow.ids.length)danceNow=null;}broadcast({t:'leave',id});syncDining();}break;}
    case 'danceStop': if(danceNow){danceNow.endsAt=Date.now();updateDance();syncDining();}break;
    case 'follow': {const n=String(m.name||'Khách').slice(0,18);onFollow('sim_'+n,n);const v=viewers.get('sim_'+n);if(v)v.demo=true;break;}
    case 'connect': connectTikTok(m.uniqueId); break;
    case 'disconnect': disconnectTikTok(); addLog('Đã ngắt kết nối TikTok'); break;
    case 'chat': { const n = String(m.name || 'Khách').slice(0, 18); onChat('sim_' + n, n, String(m.text || 'Chào quán').slice(0, 120));const v=viewers.get('sim_'+n);if(v)v.demo=true;break; }
    case 'gift': { const n = String(m.name || 'Khách').slice(0, 18); onGift('sim_' + n, n, String(m.gift || 'Hoa hồng').slice(0, 30), clamp(m.count, 1, 99), clamp(m.diamonds, 1, 50000), undefined, true); break; }
    case 'fill': fillDemo(clamp(m.n, 1, MAX_SEATS)); addLog(`Đổ người mẫu: ${viewers.size} người`); break;
    case 'clear': clearSeats(); break;
    case 'removeGuest': removeGuest(m.id); break;
    case 'manualSeat': manualSeat(m.id,m.tier); break;
    case 'setEulerKey': saveEulerKey(m.key); break;
    case 'tavernDemo': tavernDemo(); break;
    case 'bell': broadcast({ t:'bell' }); break;
    case 'mo': broadcast({ t:'mo1' }); break;
    case 'chant': chant(); break;
    case 'say': if (m.text) say(String(m.text).slice(0, 400), { tag:'say' }); break;
    case 'settings':
      applySettings(m.settings || {});
      scheduleChant(); broadcast({ t:'settings', settings, cap: capacity() }); break;
    case 'bots': setBots(!!m.on, +m.n || 12, m.pace); break;
  }
}

// Only known keys, right types, sane ranges: the panel is local, but nothing from the socket is trusted blindly.
const SETTING_RULES = {
  title: v => String(v).slice(0, 40), subtitle: v => String(v).slice(0, 60),
  voice: v => ['vi-VN-NamMinhNeural', 'vi-VN-HoaiMyNeural'].includes(v) ? v : settings.voice,
  pitch: v => clamp(v, -50, 50), rate: v => clamp(v, -50, 50), moBpm: v => clamp(v, 20, 120), chantEveryMin: v => clamp(v, 1, 60),
  seatedIdleMinutes:v=>clamp(v,0,120),
  announcementEnabled:Boolean,
  announcementVoice:v=>['vi-VN-NamMinhNeural','vi-VN-HoaiMyNeural'].includes(v)?v:settings.announcementVoice,
  sayText:v=>String(v).slice(0,400),
  music: Boolean, mo: Boolean, autoChant: Boolean, joinOnEnter: Boolean,
  seatMode: v => ['auto', ...CAPS.map(String)].includes(String(v)) ? String(v) : 'auto',
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, Math.round(+v || 0)));
function applySettings(o){ for (const [k, fn] of Object.entries(SETTING_RULES)) if (k in o) settings[k] = fn(o[k]); }

/* ----------------------------------------------------------------- bots */
let botTimer = null;
const BOT_LINES = ['Chủ quán ơi, cho bàn mình thêm bia nhé!', 'Gọi M04, thêm một đĩa khoai tây chiên nào!', 'Mồi ngon quá, mời cả bàn nâng ly!', 'Một, hai, ba... dô!', 'Hôm nay ai bao bàn mình đây?', 'Cho mình thêm đá với nhé!', 'Bàn bên cạnh vui quá, giao lưu một ly nào!', 'Anh em ăn món gì nữa, gọi thêm đi!', 'Cho bàn mình thêm xúc xích nướng!', 'Nhậu vui thôi, ai uống bia thì nhớ đừng lái xe nhé!', 'Chủ quán lên món nhanh quá!', 'Mời cả nhà ghé quán ngồi tám chuyện!'];
function setBots(on, n, pace){
  clearInterval(botTimer); botTimer = null;
  if (on){
    n = clamp(n, 1, MAX_SEATS);
    for (let i = 0; i < n; i++) seat('bot_' + i, DEMO_NAMES[(i + 7) % DEMO_NAMES.length], { demo: true });
    const every = { slow: 4000, mid: 1800, fast: 700 }[pace] || 1800;
    botTimer = setInterval(() => {
      const ids = [...viewers.keys()].filter(id => id.startsWith('bot_')); if (!ids.length) return;
      const id = ids[Math.floor(Math.random() * ids.length)], v = viewers.get(id), r = Math.random();
      if (r < .62) onChat(id, v.name, BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)]);
      else if (r < .9) broadcast({ t:'like', id, n: 1 + Math.floor(Math.random() * 4) });
      else if (r < .985) onGift(id, v.name, 'Hoa hồng', 1 + Math.floor(Math.random() * 3), 1, undefined, true);
      else onGift(id, v.name, 'Pháo hoa', 1, 99, undefined, true);
    }, every);
    addLog(`🤖 Bật ${n} bot, nhịp ${pace}`);
  } else {
    for (const id of [...viewers.keys()]) if (id.startsWith('bot_')) { viewers.delete(id); broadcast({ t:'leave', id }); }
    syncDining();
    addLog('🤖 Tắt bot');
  }
  broadcast({ t:'bots', on }, 'control');
}

// Runtime checkpoint keeps manual invitations, session coins and seats across a reload.
const SESSION_FILE=path.join(DATA_DIR,'session-state.json');
function saveRuntimeSession(){
  try{
    const checkpoint={version:1,danceNow,roomLikes,likesRoomId,savedAt:Date.now(),startedAt,admissionSeq,settings,account:tiktokState.status==='connected'?tiktokState.uniqueId:'',viewers:[...viewers.values()],rewards:[...sessionRewards]};
    fs.writeFileSync(SESSION_FILE+'.tmp',JSON.stringify(checkpoint));fs.renameSync(SESSION_FILE+'.tmp',SESSION_FILE);
  }catch(e){addLog('Không lưu được trạng thái phiên: '+e.message);}
}
function restoreRuntimeSession(){
  try{
    if(!fs.existsSync(SESSION_FILE))return '';
    const state=JSON.parse(fs.readFileSync(SESSION_FILE,'utf8'));
    if(state.version!==1||!Array.isArray(state.viewers)||!Array.isArray(state.rewards)||Date.now()-state.savedAt>24*60*60_000)return '';
    likesRoomId=String(state.likesRoomId||'');likesSynced=false;
    roomLikes=Number.isSafeInteger(state.roomLikes)&&state.roomLikes>=0?state.roomLikes:0;
    danceNow=state.danceNow&&Array.isArray(state.danceNow.ids)?state.danceNow:null;
    applySettings(state.settings||{});startedAt=Number(state.startedAt)||startedAt;admissionSeq=Number(state.admissionSeq)||0;
    for(const [id,r]of state.rewards)if(typeof id==='string'&&r&&Number.isFinite(r.sessionCoins))sessionRewards.set(id,r);
    for(const p of state.viewers){
      if(!p?.id||viewers.size>=MAX_SEATS)continue;
      const v={...p,id:String(p.id),lastAt:Number(p.lastAt)||state.savedAt,joinedAt:Number(p.joinedAt)||state.savedAt};
      if(v.demo && v.id.startsWith('bot_')){v.name=String(v.name).replace(/\s*[·\-]?\s*bot\s*$/i,'');v.lastText='';v.lastTextAt=0;}
      if(!v.demo){const latest=totals.get(v.id)||0;const delta=Math.max(0,latest-(Number(v.coins)||0));reward(v.id).sessionCoins+=delta;v.coins=latest;}
      if(reward(v.id).zone==='karaoke')reward(v.id).zone='dining';
      viewers.set(v.id,v);
    }
    rebalanceDining();expireSeats();addLog(`Khôi phục ${viewers.size} khách và quyền ngồi của phiên.`);
    return typeof state.account==='string'?state.account:'';
  }catch(e){addLog('Không khôi phục được trạng thái phiên: '+e.message);return '';}
}
let resumeAccount='';
setInterval(saveRuntimeSession,2000);

/* -------------------------------------------------------------- server */
// Security notes (this file is meant to be shared publicly):
//  • listens on 127.0.0.1 only; nothing is reachable from the LAN or internet unless HOST is changed on purpose
//  • Host header must be localhost/127.0.0.1 (blocks DNS-rebinding pages from talking to the server)
//  • WebSocket only accepts pages served by this server (Origin check), so other sites open in the
//    same browser cannot send control commands
//  • static files: only /assets and /live, no dot-files, no node_modules, no server source, no path escapes
//  • no TikTok password, cookie or session is ever used or stored; only public room events are read
const HOST = process.env.HOST || '127.0.0.1';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, `[::1]:${PORT}`]);
if(process.env.LAN_OVERLAY_HOST)ALLOWED_HOSTS.add(process.env.LAN_OVERLAY_HOST+':'+PORT);
const isLocal=req=>['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const okHost = h => ALLOWED_HOSTS.has(String(h || '').toLowerCase());
const SEP = path.sep;
function resolveStatic(urlPath){
  let p = urlPath === '/' ? '/live/control.html' : urlPath;
  if (!/^\/(assets|live)\//.test(p)) return null;
  if (p.startsWith('/live/data/')) return null;
  if (p.split('/').some(seg => seg.startsWith('.') || seg === 'node_modules')) return null;
  if (/\.(mjs|json|md|log)$/i.test(p) && !p.startsWith('/assets/')) return null;      // never serve server code / package files
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT + SEP)) return null;
  return file;
}
const server = http.createServer((req, res) => {
  if (!okHost(req.headers.host)) { res.writeHead(421).end('wrong host'); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  let p; try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  if(!isLocal(req)&&p!=='/live/overlay.html'&&!p.startsWith('/assets/')&&!p.startsWith('/live/tts/')){res.writeHead(403).end('local control only');return;}
  const file = resolveStatic(p);
  if (!file) { res.writeHead(404).end('not found'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': p.startsWith('/live/tts/') ? 'no-store' : 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
  });
});
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 64 * 1024,
  verifyClient: ({ origin, req }) => {
    if (!okHost(req.headers.host)) return false;
    if(!isLocal(req)&&new URL(req.url,'http://x').searchParams.get('role')!=='overlay')return false;
    if (!origin) return true;                                   // OBS / non-browser clients send no Origin
    try { return okHost(new URL(origin).host); } catch { return false; }
  } });
resumeAccount=restoreRuntimeSession();
function broadcast(msg, only){ const s = JSON.stringify(msg); for (const c of wss.clients) if (c.readyState === 1 && (!only || c.role === only)) c.send(s); }
wss.on('connection', (ws, req) => {
  ws.role = new URL(req.url, 'http://x').searchParams.get('role') === 'control' ? 'control' : 'overlay';
  ws.send(JSON.stringify(snapshot()));
  if (ws.role === 'control') ws.send(JSON.stringify({ t:'logs', lines: log }));
  ws.on('message', buf => {
    if (ws.role !== 'control') return;                          // overlays only listen
    try { const m = JSON.parse(buf); if (m && m.t === 'ctl') onControl(m); } catch (e) { addLog('Lệnh lỗi: ' + e.message); }
  });
});
server.listen(PORT, HOST, () => {addLog(`Server chạy tại http://localhost:${PORT}  ·  Bảng điều khiển: http://localhost:${PORT}/live/control.html  ·  Overlay: http://localhost:${PORT}/live/overlay.html`);if(resumeAccount)connectTikTok(resumeAccount);});


setInterval(()=>{if(settings.announcementEnabled && tiktokState.status==='connected' && settings.sayText.trim() && !ttsBusy && !ttsQueue.length)say(settings.sayText,{tag:'invite'});},180000);
