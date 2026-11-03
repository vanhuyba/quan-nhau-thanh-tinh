import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../overlay.html',import.meta.url),'utf8');
test('periodic announcements are disabled and room cheers raise every guest for eight seconds',()=>{
 assert.ok(!html.includes('setInterval(maybeInviteGuests'));
 assert.ok(!html.includes('order-invitation-v4.wav'));
 const visitors=new Map([['a',{}],['b',{}]]),notice={textContent:''};
 const c=vm.createContext({queueTTS(){},visitors,document:{getElementById:()=>notice},performance:{now:()=>100}});
 const code=html.slice(html.indexOf('let cheersUntil='),html.indexOf('/* ======================= effects'));
 vm.runInContext(code+';globalThis.cheer=triggerRoomCheers;',c);c.cheer({milestone:500});
 assert.ok(notice.textContent.includes('500 tim'));for(const v of visitors.values())assert.equal(v.bubble.until,8100);
});

test('fireworks require a single gift over 300 coins and expire after twenty seconds',()=>{
 const source=html.slice(html.indexOf('let fireworksUntil='),html.indexOf('const fx=[], petals=[];'));
 const context=vm.createContext({performance:{now:()=>100}});
 vm.runInContext(source+'\nglobalThis.fxAPI={triggerGiftFireworks,drawGiftFireworks,get until(){return fireworksUntil},particles:fireworkParticles};',context);
 const a=context.fxAPI;
 assert.equal(a.triggerGiftFireworks({coins:300,total:9999}),false);assert.equal(a.until,0);
 assert.equal(a.triggerGiftFireworks({coins:301,name:'Guest'}),true);assert.equal(a.until,20100);
 a.particles.push({});a.drawGiftFireworks(20100,.016);assert.equal(a.particles.length,0);
 assert.equal(a.triggerGiftFireworks({coins:600},1000),true);assert.equal(a.until,21000);
});
