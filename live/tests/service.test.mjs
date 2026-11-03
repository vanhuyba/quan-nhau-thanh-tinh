import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../overlay.html',import.meta.url),'utf8');
test('serving queue reaches the ordering guest seat from the aisle and preserves consecutive orders',()=>{
 const table={id:'B1',x:498,y:1050,scale:.625};
 const seat={id:'B1-3',x:543,y:1044,side:'back'};
 const c=vm.createContext({tables:[table],seats:[seat],visitors:new Map([['guest',{seatId:seat.id}]])});
 vm.runInContext(html.slice(html.indexOf('const SERVICE_ROUTE='),html.indexOf('function drawServer('))+`;globalThis.at=serverAt;globalThis.push=m=>mealDeliveryQueue.push(m);`,c);
 c.push({id:'guest',name:'First',tableId:'B1',seatId:seat.id});c.push({id:'guest',name:'Second',tableId:'B1',seatId:seat.id});
 assert.equal(c.at(0).delivery.name,'First');
 const arrival=c.at(4000);assert.equal(arrival.x,seat.x);assert.equal(arrival.y,table.y-90*table.scale-20);
 assert.equal(c.at(8000).delivery.name,'Second');assert.equal(c.at(12000).x,seat.x);
 assert.equal(c.at(16000).delivery,undefined);
});

test('delivery keeps the ordered table when the customer moves to VIP',()=>{
 const original={id:'B1',x:498,y:1050,scale:.625};
 const seat={id:'B1-3',x:543,y:1044,side:'back'};
 const c=vm.createContext({tables:[original,{id:'V1',x:498,y:900,scale:.6}],seats:[seat,{id:'V1-1',x:440,y:900,side:'front'}],visitors:new Map([['guest',{seatId:'V1-1'}]])});
 vm.runInContext(html.slice(html.indexOf('const SERVICE_ROUTE='),html.indexOf('function drawServer('))+`;globalThis.at=serverAt;globalThis.push=m=>mealDeliveryQueue.push(m);`,c);
 c.push({id:'guest',name:'Customer',tableId:'B1',seatId:'B1-3'});
 c.at(0);const arrival=c.at(3200),hold=c.at(4800);
 assert.equal(arrival.x,seat.x);assert.equal(arrival.y,original.y-90*original.scale-20);
 assert.equal(hold.x,arrival.x);assert.equal(hold.serving,true);
});

test('heart progress advances to each next 500-like milestone',()=>{
 const elements=Object.fromEntries(['heartProgress','heartCount','heartGoal','heartFill'].map(k=>[k,{style:{},setAttribute(k,v){this[k]=v}}]));
 const c=vm.createContext({document:{getElementById:id=>elements[id]}});
 vm.runInContext(html.slice(html.indexOf('function updateHeartProgress('),html.indexOf('function hearts('))+`;globalThis.update=updateHeartProgress;`,c);
 c.update(250);assert.equal(elements.heartFill.style.width,'50%');
 c.update(500);assert.equal(elements.heartFill.style.width,'0%');assert.match(elements.heartCount.textContent,/500.*1.000/);
 c.update(1250,true);assert.equal(elements.heartFill.style.width,'50%');assert.match(elements.heartGoal.textContent,/Thử/);
});
