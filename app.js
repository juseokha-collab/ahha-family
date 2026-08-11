/* ---------- utils ---------- */
function isMobileViewport(){ return window.innerWidth <= 600; }
function multiDayCount(){ return isMobileViewport() ? 2 : 3; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function pad2(n){ return String(n).padStart(2,'0'); }
function fmtDate(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function shortDate(s){ const [y,m,d]=s.split('-'); return y.slice(2)+'.'+m+'.'+d; }
function timeRangeLabel(s){ return s.time ? (s.time + (s.endTime?'~'+s.endTime:'')) : ''; }
const KST_OFFSET_MIN=540;
function getUKOffsetMinutes(dateStr){
  const d=new Date(dateStr+'T12:00:00Z');
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(d);
  const lh=Number(parts.find(p=>p.type==='hour').value);
  const lm=Number(parts.find(p=>p.type==='minute').value);
  return (lh*60+lm)-720;
}
function koreaToUK(hhmm, dateStr){
  const [h,mi]=hhmm.split(':').map(Number);
  const ukOff=getUKOffsetMinutes(dateStr);
  let mins=(h*60+mi)-KST_OFFSET_MIN+ukOff;
  mins=((mins%1440)+1440)%1440;
  return pad2(Math.floor(mins/60))+':'+pad2(mins%60);
}
function ukToKorea(hhmm, dateStr){
  const [h,mi]=hhmm.split(':').map(Number);
  const ukOff=getUKOffsetMinutes(dateStr);
  let mins=(h*60+mi)-ukOff+KST_OFFSET_MIN;
  mins=((mins%1440)+1440)%1440;
  return pad2(Math.floor(mins/60))+':'+pad2(mins%60);
}
function koreaToUKFull(hhmm, korDateStr){
  const [h,mi]=hhmm.split(':').map(Number);
  const ukOff=getUKOffsetMinutes(korDateStr);
  let mins=(h*60+mi)-KST_OFFSET_MIN+ukOff;
  let shift=0;
  if(mins<0){ mins+=1440; shift=-1; }
  else if(mins>=1440){ mins-=1440; shift=1; }
  return { time: pad2(Math.floor(mins/60))+':'+pad2(mins%60), date: fmtDate(addDays(parseDate(korDateStr), shift)) };
}
function ukToKoreaFull(hhmm, ukDateStr){
  const [h,mi]=hhmm.split(':').map(Number);
  const ukOff=getUKOffsetMinutes(ukDateStr);
  let mins=(h*60+mi)-ukOff+KST_OFFSET_MIN;
  let shift=0;
  if(mins<0){ mins+=1440; shift=-1; }
  else if(mins>=1440){ mins-=1440; shift=1; }
  return { time: pad2(Math.floor(mins/60))+':'+pad2(mins%60), date: fmtDate(addDays(parseDate(ukDateStr), shift)) };
}
function ukTodayStr(){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  return `${parts.find(p=>p.type==='year').value}-${parts.find(p=>p.type==='month').value}-${parts.find(p=>p.type==='day').value}`;
}
function todayStr(){ return fmtDate(new Date()); }
function parseDate(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function dday(dateStr){
  const now=new Date(); now.setHours(0,0,0,0);
  const t=parseDate(dateStr); t.setHours(0,0,0,0);
  return Math.round((t-now)/86400000);
}
function nextOccurrence(dateStr, recurring){
  const d=parseDate(dateStr);
  if(!recurring) return d;
  const now=new Date(); now.setHours(0,0,0,0);
  let next=new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if(next<now) next=new Date(now.getFullYear()+1, d.getMonth(), d.getDate());
  return next;
}
function ddayFromDate(target){
  const now=new Date(); now.setHours(0,0,0,0);
  const t=new Date(target.getFullYear(),target.getMonth(),target.getDate());
  return Math.round((t-now)/86400000);
}
function ddayPillClass(d){ if(d<0) return ''; if(d<=3) return 'd-urgent'; if(d<=14) return 'd-soon'; return 'd-far'; }
function ddayLabel(d){ return d===0?'D-Day':(d>0?'D-'+d:'D+'+(-d)); }

/* ---------- lunar calendar (1900-2100) ---------- */
const LUNAR_INFO=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
0x0d520];
function lunarLeapMonth(y){ return LUNAR_INFO[y-1900]&0xf; }
function lunarLeapDays(y){ return lunarLeapMonth(y) ? ((LUNAR_INFO[y-1900]&0x10000)?30:29) : 0; }
function lunarMonthDays(y,m){ return (LUNAR_INFO[y-1900]&(0x10000>>m))?30:29; }
function lunarYearDays(y){
  let sum=348;
  for(let i=0x8000;i>0x8;i>>=1){ sum += (LUNAR_INFO[y-1900]&i)?1:0; }
  return sum+lunarLeapDays(y);
}
function lunar2solar(lYear,lMonth,lDay,isLeapMonth){
  if(!lYear||!lMonth||!lDay||lYear<1900||lYear>2100) return null;
  let offset=0;
  for(let y=1900;y<lYear;y++) offset+=lunarYearDays(y);
  const leap=lunarLeapMonth(lYear);
  const useLeap = !!isLeapMonth && leap===lMonth;
  for(let m=1;m<lMonth;m++){ offset+=lunarMonthDays(lYear,m); if(leap===m) offset+=lunarLeapDays(lYear); }
  if(useLeap) offset+=lunarMonthDays(lYear,lMonth);
  offset += (lDay-1);
  const base=Date.UTC(1900,0,31);
  const d=new Date(base+offset*86400000);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function nextLunarOccurrence(lMonth,lDay,isLeap){
  const now=new Date(); now.setHours(0,0,0,0);
  for(let y=now.getFullYear(); y<=now.getFullYear()+1; y++){
    const d=lunar2solar(y,lMonth,lDay,isLeap);
    if(d && d>=now) return d;
  }
  for(let y=now.getFullYear(); y<=now.getFullYear()+1; y++){
    const d=lunar2solar(y,lMonth,lDay,false);
    if(d && d>=now) return d;
  }
  return now;
}
function eventOccurrence(ev){
  if(ev.lunar && ev.recurring) return nextLunarOccurrence(ev.lunarMonth, ev.lunarDay, ev.lunarLeap);
  return nextOccurrence(ev.date, ev.recurring);
}

/* ---------- holidays (KR) ---------- */
const FIXED_HOLIDAYS=[[1,1,'신정'],[3,1,'삼일절'],[5,5,'어린이날'],[6,6,'현충일'],[8,15,'광복절'],[10,3,'개천절'],[10,9,'한글날'],[12,25,'크리스마스']];
const SUBSTITUTE_ELIGIBLE=['삼일절','광복절','개천절','한글날','어린이날','부처님오신날','설날','추석'];
function buildHolidayData(year){
  const map={};
  const clusters=[];
  FIXED_HOLIDAYS.forEach(([m,d,name])=>{
    const ds=fmtDate(new Date(year,m-1,d));
    map[ds]=name;
    clusters.push({name, dates:[ds]});
  });
  const seollal=lunar2solar(year,1,1,false);
  if(seollal){
    const ds=[fmtDate(addDays(seollal,-1)), fmtDate(seollal), fmtDate(addDays(seollal,1))];
    map[ds[0]]='설날 연휴'; map[ds[1]]='설날'; map[ds[2]]='설날 연휴';
    clusters.push({name:'설날', dates:ds});
  }
  const chuseok=lunar2solar(year,8,15,false);
  if(chuseok){
    const ds=[fmtDate(addDays(chuseok,-1)), fmtDate(chuseok), fmtDate(addDays(chuseok,1))];
    map[ds[0]]='추석 연휴'; map[ds[1]]='추석'; map[ds[2]]='추석 연휴';
    clusters.push({name:'추석', dates:ds});
  }
  const buddha=lunar2solar(year,4,8,false);
  if(buddha){ const ds=fmtDate(buddha); map[ds]='부처님오신날'; clusters.push({name:'부처님오신날', dates:[ds]}); }
  return {map, clusters};
}
function computeSubstitutes(map, clusters){
  const subs={};
  clusters.forEach(c=>{
    if(!SUBSTITUTE_ELIGIBLE.includes(c.name)) return;
    const hasWeekend = c.dates.some(ds=>{ const dow=parseDate(ds).getDay(); return dow===0||dow===6; });
    if(!hasWeekend) return;
    let next=addDays(parseDate(c.dates[c.dates.length-1]),1);
    for(let guard=0; guard<10; guard++){
      const ns=fmtDate(next);
      const dow=next.getDay();
      if(dow!==0 && dow!==6 && !map[ns] && !subs[ns]){ subs[ns]='대체공휴일'; break; }
      next=addDays(next,1);
    }
  });
  return subs;
}
function getHolidayMapForYear(year){
  const {map, clusters}=buildHolidayData(year);
  return Object.assign({}, map, computeSubstitutes(map, clusters));
}
function getHolidaysAround(year){
  return Object.assign({}, getHolidayMapForYear(year-1), getHolidayMapForYear(year), getHolidayMapForYear(year+1));
}
/* ---------- UK holidays ---------- */
function computeEasterSunday(year){
  const a=year%19, b=Math.floor(year/100), c=year%100;
  const d=Math.floor(b/4), e=b%4;
  const f=Math.floor((b+8)/25);
  const g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4), k=c%4;
  const l=(32+2*e+2*i-h-k)%7;
  const mo=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*mo+114)/31);
  const day=((h+l-7*mo+114)%31)+1;
  return new Date(year, month-1, day);
}
function nthWeekdayOfMonth(year, month, weekday, n){
  const d=new Date(year,month,1);
  let count=0;
  while(true){
    if(d.getDay()===weekday){ count++; if(count===n) return new Date(d); }
    d.setDate(d.getDate()+1);
  }
}
function lastWeekdayOfMonth(year, month, weekday){
  const d=new Date(year,month+1,0);
  while(d.getDay()!==weekday) d.setDate(d.getDate()-1);
  return new Date(d);
}
function ukSubstitute(date){
  const dow=date.getDay();
  if(dow===6) return addDays(date,2);
  if(dow===0) return addDays(date,1);
  return date;
}
function getUKHolidayMapForYear(year){
  const map={};
  map[fmtDate(ukSubstitute(new Date(year,0,1)))]='신정';
  const easter=computeEasterSunday(year);
  map[fmtDate(addDays(easter,-2))]='성금요일';
  map[fmtDate(addDays(easter,1))]='부활절 월요일';
  map[fmtDate(nthWeekdayOfMonth(year,4,1,1))]='5월 초 공휴일';
  map[fmtDate(lastWeekdayOfMonth(year,4,1))]='5월 말 공휴일';
  map[fmtDate(lastWeekdayOfMonth(year,7,1))]='8월 말 공휴일';
  const xmas=new Date(year,11,25), boxing=new Date(year,11,26);
  let xmasDate=xmas, boxingDate=boxing;
  if(xmas.getDay()===6){ xmasDate=addDays(xmas,2); boxingDate=addDays(boxing,2); }
  else if(xmas.getDay()===0){ xmasDate=addDays(xmas,1); boxingDate=addDays(boxing,1); }
  else if(boxing.getDay()===6){ boxingDate=addDays(boxing,2); }
  else if(boxing.getDay()===0){ boxingDate=addDays(boxing,1); }
  map[fmtDate(xmasDate)]='크리스마스';
  map[fmtDate(boxingDate)]='박싱데이';
  return map;
}
function getUKHolidaysAround(year){
  return Object.assign({}, getUKHolidayMapForYear(year-1), getUKHolidayMapForYear(year), getUKHolidayMapForYear(year+1));
}
function getHolidaysForViewer(year){
  return effectiveRole()==='daughter' ? getUKHolidaysAround(year) : getHolidaysAround(year);
}

/* ---------- state ---------- */
const LS_KEY='damsom-state-v1';
function defaultState(){
  return {
    schedule:[],
    daily:{},
    budget:[],
    vehicle:{plate:'',model:'',regDate:'',tireSize:'',fuel:[],maint:[],renewals:[],maintCycle:{}},
    events:[],
    healthSchedule:{dad:[],mom:[],daughter:[]},
    budgetCategories:{},
    study:[],
    todos:{},
    studyBlocks:{}
  };
}
const SB_COLORS={study:'#f5d76e', exercise:'#7ee787'};
const SEED_DUE_DATE='2026-11-13';
const SEED_CREATED_DATE='2026-08-08';
function seedDaughterTodos(){
  const tasks=[
    'UCLH - Mandatory Training: Learning Disability & Autism',
    'UCLH - Mandatory Training: Safeguarding Adults',
    'UCLH - Mandatory Training: NEWS',
    'UCLH - Mandatory Training: Equality, Diversity, Human Rights',
    'UCLH - Mandatory Training: Fire Training eLearning',
    'UCLH - Mandatory Training: Infection Prevention and Control',
    'UCLH - Mandatory Training: Safeguarding Children Level 2',
    'UCLH - Mandatory Training: Understanding Sexual Misconduct',
    'UCLH - Mandatory Training: Workshop Raising Awareness of Prevent'
  ];
  return tasks.map(task=>({id:uid(), task, dueDate:SEED_DUE_DATE, done:true, doneDate:SEED_CREATED_DATE, createdDate:SEED_CREATED_DATE}));
}
function migrateTodos(st){
  if(!st.todos) st.todos={};
  if(!st.todosSeeded){ st.todos.daughter=seedDaughterTodos(); st.todosSeeded=true; }
  if(!st.todos.daughter) st.todos.daughter=[];
  if(!st.todos.dad) st.todos.dad=[];
  if(!st.todos.mom) st.todos.mom=[];
  return st;
}
const MAINT_ITEMS=['엔진오일 및 필터','에어컨필터','미션오일','구동벨트','타이어','와이퍼','브레이크오일','배터리','점화플러그','기타'];
function matchMaintItem(text){
  const t=(text||'').toLowerCase();
  const rules=[
    ['엔진오일 및 필터', ['엔진오일','오일필터','엔진 오일']],
    ['에어컨필터', ['에어컨필터','에어컨 필터','캐빈필터','캐빈 필터']],
    ['미션오일', ['미션오일','미션 오일','변속기오일']],
    ['구동벨트', ['구동벨트','구동 벨트','벨트']],
    ['타이어', ['타이어']],
    ['와이퍼', ['와이퍼']],
    ['브레이크오일', ['브레이크오일','브레이크 오일','브레이크액']],
    ['배터리', ['배터리','베터리']],
    ['점화플러그', ['점화플러그','점화 플러그','플러그']]
  ];
  for(const [item,keys] of rules){ if(keys.some(k=>t.includes(k.toLowerCase()))) return item; }
  return null;
}
function extractPlace(memo){
  if(!memo) return {place:'', memo:''};
  const m=memo.match(/@(\S+)\s*$/);
  if(m) return {place:m[1], memo:memo.slice(0,m.index).trim()};
  return {place:'', memo};
}
function migrateVehicle(st){
  const v=st.vehicle;
  if(v.regDate===undefined) v.regDate='';
  if(v.tireSize===undefined) v.tireSize='';
  if(!v.maintCycle) v.maintCycle={};
  if(!st.healthSchedule) st.healthSchedule={dad:[],mom:[],daughter:[]};
  ['dad','mom','daughter'].forEach(k=>{ if(!st.healthSchedule[k]) st.healthSchedule[k]=[]; });
  if(!v.regDate && !v.tireSize && v.model){
    let model=v.model;
    const tireMatch=model.match(/\(([^)]*\d{3}\/\d{2}R\d{2}[^)]*)\)/);
    if(tireMatch){ v.tireSize=tireMatch[1].trim(); model=model.replace(tireMatch[0],''); }
    const dateMatch=model.match(/등록일\s*(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
    if(dateMatch){ v.regDate=`${dateMatch[1]}-${pad2(dateMatch[2])}-${pad2(dateMatch[3])}`; model=model.replace(dateMatch[0],''); }
    model=model.replace(/★/g,'').replace(/\s{2,}/g,' ').trim();
    v.model=model;
  }
  v.maint=(v.maint||[]).map(mt=>{
    if(mt.item) return mt;
    const {place,memo}=extractPlace(mt.memo);
    const item=matchMaintItem(mt.type)||'기타';
    const extraMemo = (!matchMaintItem(mt.type) && mt.type) ? (mt.type+(memo?' · '+memo:'')) : memo;
    return {id:mt.id,date:mt.date,item,place,cost:mt.cost||'',odo:mt.odo||'',memo:extraMemo};
  });
  return st;
}
function migrateDaily(st){
  Object.keys(st.daily||{}).forEach(d=>{
    const day=st.daily[d];
    if(!day.entries){
      day.entries={};
      if(day.mood||day.diary){
        day.entries['legacy']={mood:day.mood||'',diary:day.diary||'',name:'이전 기록'};
      }
      delete day.mood; delete day.diary;
    }
    if(!day.health){
      day.health={};
      if(day.weight||day.sleep||day.exercise||day.meds||day.symptom){
        day.health.mom={weight:day.weight||'',sleep:day.sleep||'',exercise:day.exercise||false,meds:day.meds||false,symptom:day.symptom||''};
      }
      delete day.weight; delete day.sleep; delete day.exercise; delete day.meds; delete day.symptom;
    }
  });
  return st;
}
function migrateBudgetOwnership(st){
  (st.budget||[]).forEach(b=>{
    if(b.paymentWeek && b.owner===undefined){
      if(b.type==='income'){ b.owner='daughter'; if(b.confirmed===undefined) b.confirmed=false; }
      else { b.owner='jinahkim2023@gmail.com'; }
    }
    if(b.category==='학습·운동 인센티브' && b.memo==='지난주 활동 기준') b.memo='';
  });
  return st;
}
function resetWeeklyPaymentDataOnce(st){
  if(!st.weeklyPaymentResetV2){
    st.budget=(st.budget||[]).filter(b=>!b.paymentWeek);
    st.weeklyPaymentStatus={};
    st.weeklyPaymentResetV2=true;
  }
  return st;
}
function loadLocal(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      const base=defaultState();
      base.vehicle=Object.assign(base.vehicle, parsed.vehicle||{});
      return resetWeeklyPaymentDataOnce(migrateBudgetOwnership(migrateTodos(migrateVehicle(migrateDaily(Object.assign(base, parsed, {vehicle:base.vehicle}))))));
    }
  }catch(e){}
  return defaultState();
}
let state=loadLocal();
let saveTimer=null;
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){} }
function familyDocRef(){ return db.collection('shared').doc('family-state'); }
function queueSave(){
  saveLocal();
  clearTimeout(saveTimer);
  saveTimer=setTimeout(()=>{
    if(user && db){
      familyDocRef().set(state)
        .then(()=>setSyncStatus('synced'))
        .catch(e=>{ console.warn(e); setSyncStatus('error'); });
    }
  }, 800);
}
function ensureDay(d){ if(!state.daily[d]) state.daily[d]={}; if(!state.daily[d].entries) state.daily[d].entries={}; if(!state.daily[d].health) state.daily[d].health={}; }
let viewAsOverride=null; // null | 'mom' | 'daughter'
const VIEW_AS_EMAIL={ mom:'jinahkim2023@gmail.com' };
function effectiveRole(){ return viewAsOverride || EMAIL_ROLE[user&&user.email] || null; }
function currentAuthorKey(){
  if(viewAsOverride==='mom') return VIEW_AS_EMAIL.mom;
  if(viewAsOverride==='daughter') return 'daughter';
  if(user && EMAIL_ROLE[user.email]==='daughter') return 'daughter';
  return user ? user.email : 'local';
}
function authorLabel(entry, key){ return (entry&&entry.name) ? entry.name : (key==='local' ? '나' : key); }
function setSyncStatus(s){
  const el=document.getElementById('syncStatus');
  if(!el) return;
  el.textContent = s==='synced' ? '☁️ 동기화됨' : s==='syncing' ? '☁️ 동기화 중…' : s==='error' ? '⚠️ 동기화 오류' : '';
}

/* ---------- firebase ---------- */
let auth=null, db=null, user=null;
try{
  if(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.apiKey!=='REPLACE_ME'){
    firebase.initializeApp(window.FIREBASE_CONFIG);
    auth=firebase.auth();
    db=firebase.firestore();
  }
}catch(e){ console.warn('firebase init skipped', e); }

function mergeById(localArr, cloudArr){
  const cloud=(cloudArr||[]).slice();
  const cloudIds=new Set(cloud.map(x=>x&&x.id));
  const onlyLocal=(localArr||[]).filter(x=>x && x.id && !cloudIds.has(x.id));
  return cloud.concat(onlyLocal);
}
function mergeKeyedArrays(localObj, cloudObj){
  const merged={};
  const keys=new Set([...Object.keys(localObj||{}), ...Object.keys(cloudObj||{})]);
  keys.forEach(k=>{ merged[k]=mergeById((localObj||{})[k], (cloudObj||{})[k]); });
  return merged;
}
function mergeCategoryLists(localObj, cloudObj){
  const merged={};
  const keys=new Set([...Object.keys(localObj||{}), ...Object.keys(cloudObj||{})]);
  keys.forEach(k=>{
    const cloudList=(cloudObj||{})[k]||[];
    const localList=(localObj||{})[k]||[];
    merged[k]=cloudList.concat(localList.filter(x=>!cloudList.includes(x)));
  });
  return merged;
}
function mergeDaily(localDaily, cloudDaily){
  const merged=JSON.parse(JSON.stringify(cloudDaily||{}));
  Object.keys(localDaily||{}).forEach(date=>{
    const ld=localDaily[date]||{};
    if(!merged[date]) merged[date]={entries:{},health:{}};
    if(!merged[date].entries) merged[date].entries={};
    if(!merged[date].health) merged[date].health={};
    Object.keys(ld.entries||{}).forEach(k=>{ if(merged[date].entries[k]===undefined) merged[date].entries[k]=ld.entries[k]; });
    Object.keys(ld.health||{}).forEach(k=>{ if(merged[date].health[k]===undefined) merged[date].health[k]=ld.health[k]; });
  });
  return merged;
}
function mergeStudyBlocks(localSB, cloudSB){
  const merged=JSON.parse(JSON.stringify(cloudSB||{}));
  Object.keys(localSB||{}).forEach(key=>{
    if(!merged[key]) merged[key]={};
    Object.keys(localSB[key]).forEach(date=>{
      const localArr=localSB[key][date]||[];
      const cloudArr=merged[key][date];
      if(!cloudArr || !cloudArr.length){ merged[key][date]=localArr.slice(); return; }
      merged[key][date]=cloudArr.map((v,i)=> (v && String(v).length) ? v : (localArr[i]||v));
    });
  });
  return merged;
}
function mergeVehicle(localV, cloudV){
  const merged=JSON.parse(JSON.stringify(cloudV||{}));
  merged.fuel=mergeById(localV&&localV.fuel, cloudV&&cloudV.fuel);
  merged.maint=mergeById(localV&&localV.maint, cloudV&&cloudV.maint);
  merged.renewals=mergeById(localV&&localV.renewals, cloudV&&cloudV.renewals);
  merged.maintCycle=Object.assign({}, (localV&&localV.maintCycle)||{}, (cloudV&&cloudV.maintCycle)||{});
  ['plate','model','regDate','tireSize'].forEach(f=>{
    if(!merged[f] && localV && localV[f]) merged[f]=localV[f];
  });
  return merged;
}
function mergeStates(localState, cloudState){
  const merged=JSON.parse(JSON.stringify(cloudState));
  merged.schedule=mergeById(localState.schedule, cloudState.schedule);
  merged.budget=mergeById(localState.budget, cloudState.budget);
  merged.events=mergeById(localState.events, cloudState.events);
  merged.study=mergeById(localState.study, cloudState.study);
  merged.todos=mergeKeyedArrays(localState.todos, cloudState.todos);
  merged.healthSchedule=mergeKeyedArrays(localState.healthSchedule, cloudState.healthSchedule);
  merged.budgetCategories=mergeCategoryLists(localState.budgetCategories, cloudState.budgetCategories);
  merged.daily=mergeDaily(localState.daily, cloudState.daily);
  merged.studyBlocks=mergeStudyBlocks(localState.studyBlocks, cloudState.studyBlocks);
  merged.vehicle=mergeVehicle(localState.vehicle, cloudState.vehicle);
  return merged;
}
function initAuth(){
  renderAuthArea();
  if(!auth) return;
  auth.onAuthStateChanged(async u=>{
    user=u;
    renderAuthArea();
    if(u && db){
      setSyncStatus('syncing');
      try{
        const localState=state;
        const doc = await familyDocRef().get();
        if(doc.exists){
          const data=doc.data();
          const base=defaultState();
          base.vehicle=Object.assign(base.vehicle, data.vehicle||{});
          const cloudState=resetWeeklyPaymentDataOnce(migrateBudgetOwnership(migrateTodos(migrateVehicle(migrateDaily(Object.assign(base, data, {vehicle:base.vehicle}))))));
          state=mergeStates(localState, cloudState);
          await familyDocRef().set(state);
        } else {
          state=localState;
          await familyDocRef().set(state);
        }
        setSyncStatus('synced');
      }catch(e){ console.warn(e); setSyncStatus('error'); }
      saveLocal();
      renderAll();
    }
  });
}
function doLogin(){
  if(!auth){ showToast('Firebase 설정 후 로그인할 수 있어요'); return; }
  const provider=new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e=>showToast('로그인 실패: '+e.message));
}
function renderAuthArea(){
  const el=document.getElementById('authArea');
  if(user){
    el.innerHTML = `<span id="syncStatus"></span><span>${escapeHtml(user.displayName||user.email)}님</span><button class="btn small" id="logoutBtn">로그아웃</button>`;
    document.getElementById('logoutBtn').onclick=()=>auth.signOut();
    setSyncStatus('synced');
  } else if(auth){
    el.innerHTML = `<button class="btn small" id="loginBtn">구글 로그인</button>`;
    document.getElementById('loginBtn').onclick=doLogin;
  } else {
    el.innerHTML = `<span>로컬 저장 모드</span>`;
  }
  if(typeof updateViewAsButtons==='function') updateViewAsButtons();
}

/* ---------- modal / toast ---------- */
function openModal(html){
  document.getElementById('modalBody').innerHTML=html;
  document.getElementById('modalBg').classList.add('show');
}
function closeModal(){ document.getElementById('modalBg').classList.remove('show'); closeDatePicker(); }
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);

/* ---------- date picker ---------- */
let activeDatePicker=null;
function outsideDatePickerClick(e){
  if(activeDatePicker && !activeDatePicker.contains(e.target)) closeDatePicker();
}
function closeDatePicker(){
  if(activeDatePicker){ activeDatePicker.remove(); activeDatePicker=null; document.removeEventListener('mousedown', outsideDatePickerClick); }
}
function openDatePicker(inputEl){
  closeDatePicker();
  const initial = inputEl.value ? parseDate(inputEl.value) : new Date();
  let viewMonth = new Date(initial.getFullYear(), initial.getMonth(), 1);
  const pop=document.createElement('div');
  pop.className='datepicker-pop';
  document.body.appendChild(pop);
  activeDatePicker=pop;
  function render(){
    const y=viewMonth.getFullYear(), m=viewMonth.getMonth();
    const firstDow=new Date(y,m,1).getDay();
    const daysInMonth=new Date(y,m+1,0).getDate();
    const totalCells=Math.ceil((firstDow+daysInMonth)/7)*7;
    const selStr=inputEl.value;
    let grid='';
    for(let i=0;i<totalCells;i++){
      const dayNum=i-firstDow+1;
      const dateObj=new Date(y,m,dayNum);
      const dateStr=fmtDate(dateObj);
      const inMonth=dayNum>=1 && dayNum<=daysInMonth;
      grid+=`<div class="cal-cell ${inMonth?'':'other'} ${dateStr===todayStr()?'today':''} ${dateStr===selStr?'sel':''}" data-date="${dateStr}"><div class="day-row"><span class="day-num">${dateObj.getDate()}</span></div></div>`;
    }
    pop.innerHTML=`
      <div class="datebar"><button class="iconbtn" id="dpPrev">‹</button><div class="d">${y}년 ${m+1}월</div><button class="iconbtn" id="dpNext">›</button></div>
      <div class="cal-grid">${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('')}${grid}</div>
    `;
    pop.querySelector('#dpPrev').onclick=(e)=>{ e.stopPropagation(); viewMonth=new Date(y,m-1,1); render(); };
    pop.querySelector('#dpNext').onclick=(e)=>{ e.stopPropagation(); viewMonth=new Date(y,m+1,1); render(); };
    pop.querySelectorAll('.cal-cell').forEach(c=>c.onclick=(e)=>{
      e.stopPropagation();
      inputEl.value=c.dataset.date;
      inputEl.dispatchEvent(new Event('change',{bubbles:true}));
      closeDatePicker();
    });
  }
  render();
  const rect=inputEl.getBoundingClientRect();
  let left=rect.left, top=rect.bottom+4;
  if(left+250>window.innerWidth-8) left=window.innerWidth-258;
  if(left<8) left=8;
  if(top+300>window.innerHeight-8) top=Math.max(8, rect.top-304);
  pop.style.left=left+'px';
  pop.style.top=top+'px';
  setTimeout(()=>document.addEventListener('mousedown', outsideDatePickerClick), 0);
}
function attachDatePicker(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.readOnly=true;
  el.classList.add('date-input');
  el.addEventListener('click', (e)=>{ e.stopPropagation(); openDatePicker(el); });
}
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ---------- tabs ---------- */
const ALL_TAB_KEYS=['home','schedule','health','budget','vehicle','events','study'];
let activeTab='home';
function getVisibleTabs(){
  if(effectiveRole()==='daughter'){
    return [
      {key:'home',label:'🏠',title:'Home'},
      {key:'schedule',label:'📅',title:'Calendar'},
      {key:'study',label:'📚',title:'Learning'},
      {key:'health',label:'🏃',title:'Activity'},
      {key:'budget',label:'💰',title:'Account'}
    ];
  }
  return [
    {key:'home',label:'홈'},
    {key:'schedule',label:'일정'},
    {key:'health',label:'건강'},
    {key:'budget',label:'가계부'},
    {key:'vehicle',label:'차량'},
    {key:'events',label:'경조사'}
  ];
}
function renderTabs(){
  const tabs=getVisibleTabs();
  if(!tabs.some(t=>t.key===activeTab)) activeTab='home';
  document.getElementById('tabs').innerHTML = tabs.map(t=>`<button data-tab="${t.key}" class="${t.key===activeTab?'active':''}"${t.title?` title="${t.title}" style="font-size:22px;padding:6px 14px;"`:''}>${t.label}</button>`).join('');
  ALL_TAB_KEYS.forEach(k=>{
    const el=document.getElementById('tab-'+k);
    if(el) el.style.display = (k===activeTab) ? '' : 'none';
  });
}
document.getElementById('tabs').addEventListener('click', e=>{
  const btn=e.target.closest('button[data-tab]'); if(!btn) return;
  activeTab=btn.dataset.tab;
  renderTabs();
});

function todayPillBtn(id){
  return `<button id="${id}" style="background:#000;color:#fff;border:none;border-radius:999px;padding:3px 12px;font-size:11px;font-weight:700;cursor:pointer;">Today</button>`;
}
const SCHED_COLORS=['#FFADAD','#FFD6A5','#CAFFBF','#A0C4FF','#BDB2FF'];
let scheduleColorPick=null;
function renderColorSwatches(selectedColor, groupId){
  return `<div class="row" style="gap:6px;" data-swatch-group="${groupId}">${SCHED_COLORS.map(c=>`<button type="button" class="color-swatch" data-color="${c}" style="width:20px;height:20px;border-radius:50%;background:${c};border:${selectedColor===c?'3px solid var(--text)':'2px solid transparent'};cursor:pointer;padding:0;box-shadow:0 0 0 1px rgba(0,0,0,0.15);"></button>`).join('')}</div>`;
}
function fmtShortDateDow(dateStr){
  const d=parseDate(dateStr);
  const dow=['일','월','화','수','목','금','토'][d.getDay()];
  return `${d.getMonth()+1}.${d.getDate()}(${dow})`;
}
function weekdayColor(dateStr){
  const dow=parseDate(dateStr).getDay();
  const holidays=getHolidaysForViewer(parseDate(dateStr).getFullYear());
  if(holidays[dateStr] || dow===0) return 'var(--weekend-sun)';
  if(dow===6) return 'var(--weekend-sat)';
  return '';
}
function headerDateHtml(dateStr){
  const isToday = dateStr===todayStr();
  const color=weekdayColor(dateStr);
  const holidays=getHolidaysForViewer(parseDate(dateStr).getFullYear());
  const holidayName=holidays[dateStr];
  const dateHtml = color ? `<span style="color:${color};">${fmtShortDateDow(dateStr)}</span>` : fmtShortDateDow(dateStr);
  const badgeText = holidayName || (isToday ? 'Today' : '');
  if(badgeText) return `<div style="line-height:1.4;"><div><span style="display:inline-block;background:#000;color:#fff;border-radius:999px;padding:1px 8px;font-size:10px;font-weight:700;white-space:nowrap;">${escapeHtml(badgeText)}</span></div><div>${dateHtml}</div></div>`;
  return dateHtml;
}
/* ---------- HOME ---------- */
let homeDate = todayStr();
const MOODS=['😊','🥰','🙂','😐','😫','😢','😠','🤒'];
let diaryArchiveOpen=false;
let diaryArchiveIncludeFamily=false;
function myVisibleScheduleItems(dateStr){
  const allowed=getAllowedScheduleFilters();
  const virtualEventItems=state.events
    .filter(ev=>!(ev.hiddenFromDaughter && effectiveRole()==='daughter'))
    .map(ev=>({id:'evt-'+ev.id, date:fmtDate(eventOccurrence(ev)), time:'', title:'🎉 '+ev.name, owner:'common'}));
  const allItems=state.schedule.map(s=>({...s, owner:s.owner||'common'})).concat(virtualEventItems);
  const visible = allowed.includes('all') ? allItems : allItems.filter(it=>allowed.includes(it.owner));
  return visible.filter(it=>scheduleItemOccursOn(it,dateStr)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function myVisibleScheduleItemsUK(ukDateStr){
  const candidates=[-1,0,1].map(off=>fmtDate(addDays(parseDate(ukDateStr), off)));
  const results=[];
  candidates.forEach(korDate=>{
    myVisibleScheduleItems(korDate).forEach(it=>{
      if(!it.time){
        if(korDate===ukDateStr) results.push({...it});
        return;
      }
      const conv=koreaToUKFull(it.time, korDate);
      if(conv.date!==ukDateStr) return;
      let newEnd=it.endTime;
      if(it.endTime) newEnd=koreaToUKFull(it.endTime, korDate).time;
      results.push({...it, time:conv.time, endTime:newEnd});
    });
  });
  return results.sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
const DT_START_MIN=480; // 08:00
const DT_END_MIN=1080;  // 18:00
const DT_STEP=60;
const DT_ROWS=(DT_END_MIN-DT_START_MIN)/DT_STEP+1; // 11
function minsToIdx(mins){
  if(mins<DT_START_MIN) return -1;
  if(mins>=DT_START_MIN+DT_ROWS*DT_STEP) return DT_ROWS;
  return Math.floor((mins-DT_START_MIN)/DT_STEP);
}
function computeDayLayoutFromItems(items){
  const mainStart={};
  const skip=new Set();
  function addBlock(it, startIdx, endIdx){
    if(endIdx<=startIdx) endIdx=startIdx+1;
    endIdx=Math.min(DT_ROWS+1, endIdx);
    if(!mainStart[startIdx]) mainStart[startIdx]={items:[],span:1};
    mainStart[startIdx].items.push(it);
    const span=endIdx-startIdx;
    if(span>mainStart[startIdx].span) mainStart[startIdx].span=span;
  }
  items.forEach(it=>{
    if(!it.time){ addBlock(it, -1, 0); return; }
    const [h,mi]=it.time.split(':').map(Number);
    const startMins=h*60+mi;
    const startIdx=minsToIdx(startMins);
    let endIdx;
    if(it.endTime){
      const [eh,emi]=it.endTime.split(':').map(Number);
      const endMins=eh*60+emi;
      endIdx=minsToIdx(Math.max(endMins-1, startMins))+1;
    } else {
      endIdx=startIdx+1;
    }
    addBlock(it, startIdx, endIdx);
  });
  Object.entries(mainStart).forEach(([idx,val])=>{
    const s=Number(idx);
    for(let r=s+1;r<s+val.span;r++) skip.add(r);
  });
  return {mainStart, skip};
}
function computeDayLayout(dateStr){ return computeDayLayoutFromItems(myVisibleScheduleItems(dateStr)); }
const ROLE_EMOJI={dad:'👨',mom:'👩',daughter:'👧'};
const ROLE_BADGE_COLOR={dad:'#4d7fe0',mom:'#e0538f',daughter:'#9a5be0'};
function authorRoleOf(key){
  if(!key) return null;
  if(key==='daughter') return 'daughter';
  return EMAIL_ROLE[key] || null;
}
function authorBadge(key){
  const role=authorRoleOf(key);
  if(!role) return '';
  return `<span class="author-badge" style="background:${ROLE_BADGE_COLOR[role]};">${ROLE_EMOJI[role]}</span>`;
}
function dtChip(it){
  const isVirtual = typeof it.id==='string' && it.id.startsWith('evt-');
  const memoAttr = it.memo ? ` data-memo="${escapeHtml(it.memo)}"` : '';
  if(isVirtual) return `<div class="dt-evt" data-virtual="1"${memoAttr}>${escapeHtml(it.title)}</div>`;
  const badge = authorBadge(it.createdBy);
  const colorAttr = it.color ? ` style="background:${it.color};color:#181820;"` : '';
  return `<div class="dt-evt" draggable="true" data-item-id="${it.id}"${memoAttr}${colorAttr}>${badge}${timeRangeLabel(it)?escapeHtml(timeRangeLabel(it))+' ':''}${escapeHtml(it.title)}</div>`;
}
let dtTooltipEl=null;
function showDtTooltip(target, text){
  hideDtTooltip();
  const el=document.createElement('div');
  el.className='dt-tooltip';
  el.textContent=text;
  document.body.appendChild(el);
  const rect=target.getBoundingClientRect();
  let top=rect.top-el.offsetHeight-6;
  if(top<4) top=rect.bottom+6;
  let left=rect.left;
  if(left+el.offsetWidth>window.innerWidth-8) left=window.innerWidth-el.offsetWidth-8;
  if(left<4) left=4;
  el.style.top=top+'px';
  el.style.left=left+'px';
  dtTooltipEl=el;
}
function hideDtTooltip(){
  if(dtTooltipEl){ dtTooltipEl.remove(); dtTooltipEl=null; }
}
function dtHl(hhmm){
  const h=Number(hhmm.split(':')[0]);
  return [9,12,15,18,21,0].includes(h) ? `<span class="dt-hl">${hhmm}</span>` : hhmm;
}
function unifiedRowMeta(idx){
  if(idx===-1) return {label:`<div>${dtHl('08:00')}</div><div>이전</div>`, isEdge:true, addTime:'07:00'};
  if(idx===DT_ROWS) return {label:`<div>${dtHl('18:00')}</div><div>이후</div>`, isEdge:true, addTime:'19:00'};
  const totalMin=DT_START_MIN+idx*DT_STEP;
  const t=pad2(Math.floor(totalMin/60))+':'+pad2(totalMin%60);
  return {label:dtHl(t), isEdge:false, addTime:t};
}
let showCommonOnHome=false;
let showDaughterOnHome=false;
let studyAnchor=todayStr();
function myHomeVisibleScheduleItems(dateStr){
  const role=effectiveRole();
  const virtualEventItems=state.events
    .filter(ev=>!(ev.hiddenFromDaughter && role==='daughter'))
    .map(ev=>({id:'evt-'+ev.id, date:fmtDate(eventOccurrence(ev)), time:'', title:'🎉 '+ev.name, owner:'common'}));
  const allItems=state.schedule.map(s=>({...s, owner:s.owner||'common'})).concat(virtualEventItems);
  const daughterOnly = role && role!=='daughter' && showDaughterOnHome;
  const visible = allItems.filter(it=>{
    if(!role) return it.owner==='common';
    if(daughterOnly){
      if(it.owner==='daughter') return true;
      if(it.owner==='common') return showCommonOnHome;
      return false;
    }
    if(it.owner===role) return true;
    if(it.owner==='common') return showCommonOnHome;
    return false;
  });
  return visible.filter(it=>scheduleItemOccursOn(it,dateStr)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function renderDayTimelines(){
  const days=Array.from({length:multiDayCount()},(_,n)=>fmtDate(addDays(parseDate(homeDate), n)));
  const layouts=days.map(d=>computeDayLayoutFromItems(myHomeVisibleScheduleItems(d)));
  const indices=[-1].concat(Array.from({length:DT_ROWS},(_,i)=>i)).concat([DT_ROWS]);
  let rows='';
  indices.forEach(idx=>{
    const meta=unifiedRowMeta(idx);
    const cells=days.map((d,di)=>{
      const layout=layouts[di];
      const gap = di>0 ? '<td class="dt-gap"></td>' : '';
      if(layout.skip.has(idx)) return gap;
      const cell=layout.mainStart[idx];
      const edgeClass=meta.isEdge?' dt-edge':'';
      if(cell){
        const cellColor=(cell.items.find(it=>it.bgColor)||{}).bgColor;
        const colorAttr=cellColor?` style="background:${cellColor};"`:'';
        return gap+`<td class="dt-cell filled${edgeClass}" rowspan="${cell.span}" data-add-date="${d}" data-add-time="${meta.addTime}"${colorAttr}>${cell.items.map(dtChip).join('')}</td>`;
      }
      return gap+`<td class="dt-cell${edgeClass}" data-add-date="${d}" data-add-time="${meta.addTime}"></td>`;
    }).join('');
    rows += `<tr class="${meta.isEdge?'dt-edge-row':''}"><td class="dt-time-col">${meta.label}</td>${cells}</tr>`;
  });
  const headCells = days.map((d,i)=>{
    const gap = i>0 ? '<th class="dt-gap"></th>' : '';
    const isFirst = i===0;
    const isLast = i===days.length-1;
    const dateText = headerDateHtml(d);
    const prevBtn = isFirst ? `<button class="iconbtn" id="dtPrevBtn" style="font-size:13px;width:20px;height:20px;flex-shrink:0;">◀</button>` : '';
    const nextBtn = isLast ? `<button class="iconbtn" id="dtNextBtn" style="font-size:13px;width:20px;height:20px;flex-shrink:0;">▶</button>` : '';
    const justify = isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center';
    return gap+`<th><div class="row" style="justify-content:${justify};flex-wrap:nowrap;gap:4px;">${prevBtn}${dateText}${nextBtn}</div></th>`;
  }).join('');
  const role=effectiveRole();
  return `
    <div class="dt-panel">
      <div class="row" style="justify-content:space-between;margin-bottom:8px;gap:10px;align-items:center;">
        <div class="row" style="gap:8px;align-items:center;">
          ${renderColorSwatches(scheduleColorPick, 'paint')}
          ${!days.includes(todayStr())?todayPillBtn('dtTodayBtn'):''}
        </div>
        <div class="row" style="gap:10px;">
          ${role && role!=='daughter' ? `<label class="pill" style="cursor:pointer;"><input type="checkbox" id="showDaughterToggleHome" ${showDaughterOnHome?'checked':''} style="margin-right:4px;">딸</label>` : ''}
          <label class="pill" style="cursor:pointer;"><input type="checkbox" id="showCommonToggleHome" ${showCommonOnHome?'checked':''} style="margin-right:4px;">가족공통</label>
        </div>
      </div>
      ${scheduleColorPick?`<div class="meta" style="margin-bottom:6px;">🎨 색상을 적용할 일정을 클릭하세요</div>`:''}
      <div style="overflow-x:auto;">
        <table class="dt-table">
          <thead><tr><th class="dt-time-col"></th>${headCells}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}
function moveScheduleItem(id, newDate, newTime){
  const item=state.schedule.find(x=>x.id===id);
  if(!item) return;
  if(!canManageSchedule(item)){ showToast('가족공통 일정은 작성자만 이동할 수 있어요'); return; }
  if(item.time && item.endTime){
    const [sh,smi]=item.time.split(':').map(Number);
    const [eh,emi]=item.endTime.split(':').map(Number);
    const durMin=(eh*60+emi)-(sh*60+smi);
    const [nh,nmi]=newTime.split(':').map(Number);
    let endMin=Math.max(0, Math.min(1439, nh*60+nmi+durMin));
    item.endTime=pad2(Math.floor(endMin/60))+':'+pad2(endMin%60);
  }
  item.date=newDate;
  item.time=newTime;
  queueSave(); renderSchedule(); renderHome();
  showToast('일정을 이동했어요');
}
function bindDayTimelineEvents(){
  const el=document.getElementById('tab-home');
  bindShowCommonToggle('showCommonToggleHome');
  const showDaughterToggle=document.getElementById('showDaughterToggleHome');
  if(showDaughterToggle) showDaughterToggle.addEventListener('change', e=>{
    showDaughterOnHome=e.target.checked;
    renderHome();
  });
  const dtTodayBtn=document.getElementById('dtTodayBtn');
  if(dtTodayBtn) dtTodayBtn.onclick=()=>{
    homeDate=todayStr();
    renderHome();
  };
  el.querySelectorAll('[data-swatch-group="paint"] .color-swatch').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const c=btn.dataset.color;
      scheduleColorPick = (scheduleColorPick===c) ? null : c;
      renderHome();
    });
  });
  const dtPrevBtn=document.getElementById('dtPrevBtn');
  if(dtPrevBtn) dtPrevBtn.onclick=()=>{
    homeDate=fmtDate(addDays(parseDate(homeDate),-1));
    renderHome();
  };
  const dtNextBtn=document.getElementById('dtNextBtn');
  if(dtNextBtn) dtNextBtn.onclick=()=>{
    homeDate=fmtDate(addDays(parseDate(homeDate),1));
    renderHome();
  };
  el.querySelectorAll('.dt-cell').forEach(td=>{
    td.addEventListener('click', e=>{
      if(e.target.closest('.dt-evt')) return;
      openScheduleModal(null, {date:td.dataset.addDate, time:td.dataset.addTime});
    });
    td.addEventListener('dragover', e=>{ e.preventDefault(); td.classList.add('dt-dragover'); });
    td.addEventListener('dragleave', ()=>{ td.classList.remove('dt-dragover'); });
    td.addEventListener('drop', e=>{
      e.preventDefault();
      td.classList.remove('dt-dragover');
      const id=e.dataTransfer.getData('text/plain');
      if(!id) return;
      moveScheduleItem(id, td.dataset.addDate, td.dataset.addTime);
    });
  });
  el.querySelectorAll('.dt-evt[data-item-id]').forEach(chip=>{
    chip.addEventListener('click', e=>{
      e.stopPropagation();
      const item=state.schedule.find(x=>x.id===chip.dataset.itemId);
      if(!item) return;
      if(scheduleColorPick){
        item.color=scheduleColorPick;
        queueSave(); renderHome();
        return;
      }
      const cell=chip.closest('.dt-cell');
      const occurDate=cell?cell.dataset.addDate:null;
      openScheduleModal(item, null, occurDate);
    });
    chip.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', chip.dataset.itemId);
      e.dataTransfer.effectAllowed='move';
    });
  });
  el.querySelectorAll('.dt-evt[data-virtual]').forEach(chip=>{
    chip.addEventListener('click', e=>{
      e.stopPropagation();
      showToast('경조사 탭에서 수정할 수 있어요');
    });
  });
  el.querySelectorAll('.dt-evt[data-memo]').forEach(chip=>{
    chip.addEventListener('mouseenter', ()=>showDtTooltip(chip, chip.dataset.memo));
    chip.addEventListener('mouseleave', hideDtTooltip);
  });
}
function myTodos(){
  const key=currentAuthorKey();
  if(!state.todos) state.todos={};
  if(!state.todos[key]) state.todos[key]=[];
  return state.todos[key];
}
function todosForToday(){
  return myTodos().filter(t=>t.dueDate>=homeDate).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
}
function todoProgressPct(list){
  if(!list.length) return null;
  const done=list.filter(t=>t.done).length;
  return Math.round(done/list.length*100);
}
function computeDailyProgress(dateStr, authorKey){
  const list=(state.todos&&state.todos[authorKey])||[];
  const active=list.filter(t=>t.createdDate<=dateStr && t.dueDate>=dateStr);
  if(!active.length) return null;
  const done=active.filter(t=>t.doneDate && t.doneDate<=dateStr).length;
  return Math.round(done/active.length*100);
}
function commitNewTodo(){
  const taskEl=document.getElementById('newTodoTask');
  const dueEl=document.getElementById('newTodoDue');
  if(!taskEl||!dueEl) return;
  const task=taskEl.value.trim();
  const due=dueEl.value||todayStr();
  if(!task) return;
  myTodos().push({id:uid(), task, dueDate:due, done:false, doneDate:'', createdDate:todayStr()});
  queueSave(); renderHome();
}
function openTodoEditModal(id){
  const list=myTodos();
  const t=list.find(x=>x.id===id);
  if(!t) return;
  openModal(`
    <h3>To do 수정</h3>
    <div class="field"><label>할 일</label><input id="mTask" value="${escapeHtml(t.task)}"></div>
    <div class="field"><label>D-day 날짜</label><input type="text" readonly class="date-input" id="mDue" value="${t.dueDate}"></div>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mDone" ${t.done?'checked':''} style="margin-right:4px;">완료</label>
    <div class="modal-actions">
      <button class="btn danger" id="mDelete">삭제</button>
      <button class="btn" id="mCancel">취소</button>
      <button class="btn primary" id="mSave">저장</button>
    </div>
  `);
  attachDatePicker('mDue');
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    t.task=document.getElementById('mTask').value.trim()||t.task;
    t.dueDate=document.getElementById('mDue').value||t.dueDate;
    const doneNow=document.getElementById('mDone').checked;
    if(doneNow && !t.done) t.doneDate=todayStr();
    if(!doneNow) t.doneDate='';
    t.done=doneNow;
    queueSave(); closeModal(); renderHome();
  };
  document.getElementById('mDelete').onclick=()=>{
    if(!confirm('이 할 일을 삭제할까요?')) return;
    const key=currentAuthorKey();
    state.todos[key]=state.todos[key].filter(x=>x.id!==id);
    queueSave(); closeModal(); renderHome();
  };
}
function renderHome(){
  const day = state.daily[homeDate] || {};
  const entries = day.entries || {};
  const myKey = currentAuthorKey();
  const mine = entries[myKey] || {};
  const el=document.getElementById('tab-home');
  const dLabel = parseDate(homeDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const dLabelColor = weekdayColor(homeDate);
  const todaySchedule = myHomeVisibleScheduleItems(homeDate);
  const ym=homeDate.slice(0,7);
  const monthBudget = state.budget.filter(b=>b.date.startsWith(ym) && b.type!=='income' && (b.owner===undefined || b.owner===myKey)).reduce((s,b)=>s+Number(b.amount||0),0);
  const upcomingEvent = state.events.filter(ev=>!(ev.hiddenFromDaughter && effectiveRole()==='daughter')).map(ev=>({...ev,d:ddayFromDate(eventOccurrence(ev))})).filter(e=>e.d>=0).sort((a,b)=>a.d-b.d)[0];
  const upcomingRenew = state.vehicle.renewals.map(r=>({...r,d:dday(r.date)})).filter(r=>r.d>=0).sort((a,b)=>a.d-b.d)[0];
  const todayTodos = todosForToday();
  const todoPct = todoProgressPct(todayTodos);

  el.innerHTML = `
    ${renderDayTimelines()}
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:8px;">
        <div class="row" style="gap:4px;flex-shrink:0;">
          <button class="iconbtn" id="homePrev">‹</button>
          <div class="d" style="white-space:nowrap;${dLabelColor?'color:'+dLabelColor+';':''}">${dLabel}</div>
          <button class="iconbtn" id="homeNext">›</button>
          ${homeDate!==todayStr()?`<button class="btn small" id="homeToday">오늘</button>`:''}
        </div>
        <div class="mood-row" id="moodRow" style="flex:1;justify-content:flex-end;min-width:0;overflow-x:auto;">
          ${MOODS.map(m=>`<button data-m="${m}" class="${mine.mood===m?'sel':''}">${m}</button>`).join('')}
        </div>
      </div>
      <div class="field" style="margin-top:10px;">
        <div class="row" style="justify-content:space-between;align-items:center;">
          <label style="margin:0;">Comment</label>
          <div class="row" style="gap:8px;">
            <span class="meta" id="diarySaveStatus">${mine.diary?'✓ 저장됨':''}</span>
            <button class="btn small primary" id="diarySaveBtn">저장</button>
          </div>
        </div>
        <textarea id="diaryInput" placeholder="오늘 하루는 어땠나요?">${escapeHtml(mine.diary)}</textarea>
        <div class="row" style="justify-content:space-between;align-items:center;margin-top:8px;">
          <label id="diaryArchiveToggle" style="cursor:pointer;">${diaryArchiveOpen?'▲':'▼'} Comment 모아보기</label>
          ${diaryArchiveOpen?`<label class="pill" style="cursor:pointer;"><input type="checkbox" id="diaryArchiveFamilyToggle" ${diaryArchiveIncludeFamily?'checked':''} style="margin-right:4px;">가족 Comment 포함</label>`:''}
        </div>
        ${diaryArchiveOpen?`<div id="diaryArchiveBox" style="margin-top:6px;">${diaryArchiveRowsHtml()}</div>`:''}
      </div>
    </div>

    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <h3 style="margin:0;">✅ ${Number(homeDate.slice(5,7))}.${Number(homeDate.slice(8,10))} To do list</h3>
        ${todoPct!=null?`<span class="meta">오늘 진행률 ${todoPct}%</span>`:''}
      </div>
      ${todoPct!=null?`<div class="bar-track" style="margin:8px 0;"><div class="bar-fill" style="width:${todoPct}%"></div></div>`:''}
      ${todayTodos.map(t=>{
        const d=dday(t.dueDate);
        return `
        <div class="list-item" style="align-items:center;">
          <div class="row" style="flex:1;gap:8px;min-width:0;">
            <input type="checkbox" data-todo-id="${t.id}" ${t.done?'checked':''} style="flex-shrink:0;">
            <span class="content-text" style="${t.done?'text-decoration:line-through;color:var(--muted);':''}flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(t.task)}</span>
          </div>
          <div class="row" style="flex-shrink:0;">
            <span class="pill ${ddayPillClass(d)}">${ddayLabel(d)}</span>
            <button class="icon-btn" data-edit-todo="${t.id}" title="수정">✏️</button>
          </div>
        </div>`;
      }).join('')}
      <div class="list-item" style="align-items:center;">
        <div class="row" style="flex:1;gap:8px;">
          <span style="width:16px;flex-shrink:0;"></span>
          <input id="newTodoTask" placeholder="할 일을 입력하고 Enter" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-size:13px;">
        </div>
        <input type="text" readonly class="date-input" id="newTodoDue" placeholder="D-day" style="width:110px;flex-shrink:0;" value="">
      </div>
    </div>

    ${achievementLogHtml()}

    ${effectiveRole()!=='daughter'?`
    <div class="stat-grid">
      <div class="stat"><div class="v">${todaySchedule.length}</div><div class="l">오늘 일정</div></div>
      <div class="stat"><div class="v">${monthBudget.toLocaleString()}원</div><div class="l">이번달 지출</div></div>
      <div class="stat"><div class="v">${upcomingEvent?ddayLabel(upcomingEvent.d):'-'}</div><div class="l">${upcomingEvent?escapeHtml(upcomingEvent.name):'다가오는 경조사'}</div></div>
      <div class="stat"><div class="v">${upcomingRenew?ddayLabel(upcomingRenew.d):'-'}</div><div class="l">${upcomingRenew?escapeHtml(upcomingRenew.name):'차량 갱신'}</div></div>
    </div>

    <div class="card">
      <h3>📅 ${Number(homeDate.slice(5,7))}.${Number(homeDate.slice(8,10))}${homeDate===todayStr()?'(오늘)':''} 일정</h3>
      ${todaySchedule.length? todaySchedule.map(s=>{
        const badge = authorBadge(s.createdBy);
        return `<div class="list-item"><div><div>${timeRangeLabel(s)?`<b>${timeRangeLabel(s)}</b> `:''}${badge}${escapeHtml(s.title)}</div>${s.memo?`<div class="content-text">${escapeHtml(s.memo)}</div>`:''}</div></div>`;
      }).join('') : `<div class="empty">등록된 일정이 없어요</div>`}
    </div>`:''}
  `;
  document.getElementById('homePrev').onclick=()=>{ homeDate=fmtDate(addDays(parseDate(homeDate),-1)); renderHome(); };
  document.getElementById('homeNext').onclick=()=>{ homeDate=fmtDate(addDays(parseDate(homeDate),1)); renderHome(); };
  const tb=document.getElementById('homeToday'); if(tb) tb.onclick=()=>{ homeDate=todayStr(); renderHome(); };
  document.getElementById('moodRow').addEventListener('click', e=>{
    const b=e.target.closest('button[data-m]'); if(!b) return;
    ensureDay(homeDate);
    const cur=state.daily[homeDate].entries[myKey]||{};
    cur.mood = cur.mood===b.dataset.m ? '' : b.dataset.m;
    cur.name = user ? (user.displayName||user.email) : '나';
    cur.updatedAt = Date.now();
    state.daily[homeDate].entries[myKey]=cur;
    queueSave(); renderHome();
  });
  document.getElementById('diaryInput').addEventListener('input', ()=>{
    document.getElementById('diarySaveStatus').textContent='';
  });
  document.getElementById('diarySaveBtn').onclick=()=>{
    ensureDay(homeDate);
    const cur=state.daily[homeDate].entries[myKey]||{};
    cur.diary = document.getElementById('diaryInput').value;
    cur.name = user ? (user.displayName||user.email) : '나';
    cur.updatedAt = Date.now();
    state.daily[homeDate].entries[myKey]=cur;
    queueSave();
    const now=new Date();
    document.getElementById('diarySaveStatus').textContent = `✓ 저장됨 (${now.getHours()}:${pad2(now.getMinutes())})`;
  };
  document.getElementById('diaryArchiveToggle').onclick=()=>{
    diaryArchiveOpen=!diaryArchiveOpen;
    renderHome();
  };
  if(diaryArchiveOpen){
    document.getElementById('diaryArchiveFamilyToggle').addEventListener('change', e=>{
      diaryArchiveIncludeFamily=e.target.checked;
      renderHome();
    });
    document.querySelectorAll('[data-jump]').forEach(row=>row.onclick=()=>{
      homeDate=row.dataset.jump; diaryArchiveOpen=false; renderHome();
    });
    document.querySelectorAll('[data-edit-diary]').forEach(btn=>btn.onclick=(ev)=>{
      ev.stopPropagation();
      const [d,k]=btn.dataset.editDiary.split('|');
      openDiaryEntryEditModal(d,k);
    });
  }
  el.querySelectorAll('[data-todo-id]').forEach(cb=>cb.addEventListener('change', e=>{
    const t=myTodos().find(x=>x.id===cb.dataset.todoId);
    if(!t) return;
    t.done=cb.checked;
    t.doneDate = cb.checked ? todayStr() : '';
    queueSave(); renderHome();
  }));
  el.querySelectorAll('[data-edit-todo]').forEach(btn=>btn.onclick=()=>openTodoEditModal(btn.dataset.editTodo));
  const newTodoDueEl=document.getElementById('newTodoDue');
  if(newTodoDueEl){
    attachDatePicker('newTodoDue');
    newTodoDueEl.addEventListener('change', commitNewTodo);
  }
  const newTodoTaskEl=document.getElementById('newTodoTask');
  if(newTodoTaskEl){
    newTodoTaskEl.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commitNewTodo(); } });
  }
  bindDayTimelineEvents();
}
function diaryArchiveRowsHtml(){
  const myKey=currentAuthorKey();
  const rows=[];
  Object.keys(state.daily).sort().reverse().forEach(d=>{
    const entries=(state.daily[d]||{}).entries||{};
    Object.keys(entries).forEach(k=>{
      const e=entries[k];
      if(!diaryArchiveIncludeFamily && k!==myKey) return;
      if(e && (e.mood || e.diary)) rows.push({date:d, key:k, ...e});
    });
  });
  if(!rows.length) return `<div class="empty">아직 작성된 Comment가 없어요</div>`;
  return rows.map(r=>`
    <div class="list-item" data-jump="${r.date}" style="cursor:pointer;">
      <div class="content-text" style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.date} ${r.mood||''} <span class="pill">${escapeHtml(authorLabel(r,r.key))}</span>${r.diary?' '+escapeHtml(r.diary):''}</div>
      ${r.key===myKey?`<button class="icon-btn" data-edit-diary="${escapeHtml(r.date)}|${escapeHtml(r.key)}" title="수정">✏️</button>`:''}
    </div>`).join('');
}
function openDiaryEntryEditModal(date, key){
  const day=state.daily[date]||{};
  const e=(day.entries&&day.entries[key])||{};
  openModal(`
    <h3>${date} · ${escapeHtml(authorLabel(e,key))} Comment 수정</h3>
    <div class="mood-row" id="editMoodRow">
      ${MOODS.map(m=>`<button data-m="${m}" class="${e.mood===m?'sel':''}">${m}</button>`).join('')}
    </div>
    <div class="field" style="margin-top:10px;">
      <label>Comment</label>
      <textarea id="editDiaryInput">${escapeHtml(e.diary)}</textarea>
    </div>
    <div class="modal-actions">
      <button class="btn danger" id="mDelete">삭제</button>
      <button class="btn" id="mCancel">취소</button>
      <button class="btn primary" id="mSave">저장</button>
    </div>
  `);
  let curMood=e.mood||'';
  document.getElementById('editMoodRow').addEventListener('click', ev=>{
    const b=ev.target.closest('button[data-m]'); if(!b) return;
    curMood = curMood===b.dataset.m ? '' : b.dataset.m;
    document.querySelectorAll('#editMoodRow button').forEach(x=>x.classList.toggle('sel', x.dataset.m===curMood));
  });
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    ensureDay(date);
    const rec=state.daily[date].entries[key]||{};
    rec.mood=curMood;
    rec.diary=document.getElementById('editDiaryInput').value;
    rec.updatedAt=Date.now();
    state.daily[date].entries[key]=rec;
    queueSave(); closeModal(); renderHome();
  };
  document.getElementById('mDelete').onclick=()=>{
    if(!confirm('이 기록을 삭제할까요?')) return;
    delete state.daily[date].entries[key];
    queueSave(); closeModal(); renderHome();
  };
}

/* ---------- SCHEDULE ---------- */
let scheduleMonth = new Date(); scheduleMonth.setDate(1);
let scheduleSel = todayStr();
let scheduleFilter = 'all';
function getScheduleOwners(){ return [{key:'common',label:'가족공통'}].concat(FAMILY_MEMBERS); }
function ownerLabel(key){ if(!key||key==='common') return '가족공통'; const m=FAMILY_MEMBERS.find(x=>x.key===key); return m?m.label:key; }
function getAllowedScheduleFilters(){
  const myRole=effectiveRole();
  if(myRole==='dad') return ['all','common'].concat(FAMILY_MEMBERS.map(m=>m.key));
  if(myRole) return [myRole, 'common'];
  return ['common'];
}
function getAllowedOwners(){
  const allowed=getAllowedScheduleFilters().filter(f=>f!=='all');
  const owners=getScheduleOwners();
  return allowed.map(key=>owners.find(o=>o.key===key)).filter(Boolean);
}
function scheduleFilterLabel(key){
  const myRole=effectiveRole();
  if(myRole && myRole!=='dad'){
    if(key===myRole) return '나의 일정';
    if(key==='common') return '가족공통 일정';
  }
  if(key==='all') return '전체';
  return ownerLabel(key);
}
function renderProgressChart(y, m){
  const key=currentAuthorKey();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const todayS=todayStr();
  const pcts=[];
  let bars='';
  for(let d=1; d<=daysInMonth; d++){
    const dateStr=`${y}-${pad2(m+1)}-${pad2(d)}`;
    let pct=null;
    if(dateStr<=todayS) pct=computeDailyProgress(dateStr, key);
    if(pct!=null) pcts.push(pct);
    const h = pct==null ? 3 : Math.max(3, Math.round(pct*0.6));
    bars += `<div title="${dateStr}: ${pct==null?'기록 없음':pct+'%'}" style="flex:1;min-width:3px;height:${h}px;border-radius:2px;background:${pct==null?'var(--border)':'linear-gradient(180deg,var(--accent),var(--accent2))'};"></div>`;
  }
  const avg = pcts.length ? Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length) : null;
  return `
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">📊 월별 To do 진행률</h3>${avg!=null?`<span class="meta">월 평균 ${avg}%</span>`:''}</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:64px;">${bars}</div>
    </div>
  `;
}
function renderSchedule(){
  const el=document.getElementById('tab-schedule');
  const y=scheduleMonth.getFullYear(), m=scheduleMonth.getMonth();
  const firstDow=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const totalCells=Math.ceil((firstDow+daysInMonth)/7)*7;
  const allowedFilters=getAllowedScheduleFilters();
  const myRole=effectiveRole();
  if(myRole && myRole!=='dad'){
    scheduleFilter = showCommonOnHome ? 'common' : myRole;
  } else if(!allowedFilters.includes(scheduleFilter)){
    scheduleFilter = allowedFilters[0];
  }
  const virtualEventItems=state.events.filter(ev=>!(ev.hiddenFromDaughter && effectiveRole()==='daughter')).map(ev=>({id:'evt-'+ev.id, date:fmtDate(eventOccurrence(ev)), time:'', title:'🎉 '+ev.name, memo:ev.memo, owner:'common', virtual:true}));
  const allItems=state.schedule.map(s=>({...s, owner:s.owner||'common'})).concat(virtualEventItems);
  const filtered = scheduleFilter==='all' ? allItems : allItems.filter(s=>s.owner===scheduleFilter);
  const holidays=getHolidaysForViewer(y);
  const todayS=todayStr();
  const MAX_SHOWN=3;
  let grid='';
  for(let i=0;i<totalCells;i++){
    const dayNum=i-firstDow+1;
    const dateObj=new Date(y,m,dayNum);
    const dateStr=fmtDate(dateObj);
    const inMonth = dayNum>=1 && dayNum<=daysInMonth;
    const dayEvents=filtered.filter(s=>scheduleItemOccursOn(s,dateStr)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    const holidayName=holidays[dateStr];
    const shown=dayEvents.slice(0,MAX_SHOWN).map(s=>`<span class="cal-evt">${s.time?escapeHtml(s.time)+' ':''}${escapeHtml(s.title)}</span>`).join('');
    const more = dayEvents.length>MAX_SHOWN ? `<span class="cal-evt more">+${dayEvents.length-MAX_SHOWN}개 더</span>` : '';
    const dayEntry=((state.daily[dateStr]||{}).entries||{})[currentAuthorKey()];
    const commentText=dayEntry&&dayEntry.diary?dayEntry.diary:'';
    const commentHtml=commentText?`<div class="cal-comment" title="${escapeHtml(commentText)}">📝 ${escapeHtml(commentText)}</div>`:'';
    grid += `<div class="cal-cell ${inMonth?'':'other'} ${dateStr===todayS?'today':''} ${dateStr===scheduleSel?'sel':''} ${holidayName?'holiday':''}" data-date="${dateStr}">
      <div class="day-row"><span class="day-num">${dateObj.getDate()}</span>${holidayName?`<span class="cal-holiday">${escapeHtml(holidayName)}</span>`:''}</div>${commentHtml}${shown}${more}
    </div>`;
  }
  const dayItems = filtered.filter(s=>scheduleItemOccursOn(s,scheduleSel)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:flex-end;margin-bottom:4px;">
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="showCommonToggleSchedule" ${showCommonOnHome?'checked':''} style="margin-right:4px;">가족공통</label>
      </div>
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div class="datebar" style="margin-bottom:0;"><button class="iconbtn" id="sPrev">‹</button><div class="d">${y}년 ${m+1}월</div><button class="iconbtn" id="sNext">›</button></div>
        ${myRole==='dad'?`<div class="row" id="schedFilterRow" style="gap:6px;">
          ${allowedFilters.map(f=>`<button class="btn small ${scheduleFilter===f?'active':''}" data-owner="${f}">${scheduleFilterLabel(f)}</button>`).join('')}
        </div>`:''}
      </div>
      <div class="cal-grid" style="margin-top:10px;">${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('')}${grid}</div>
    </div>
    ${renderProgressChart(y, m)}
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">${weekdayColor(scheduleSel)?`<span style="color:${weekdayColor(scheduleSel)};">${scheduleSel}</span>`:scheduleSel} 일정${holidays[scheduleSel]?` <span class="pill">${escapeHtml(holidays[scheduleSel])}</span>`:''}</h3><button class="btn primary small" id="addSchedBtn">+ 일정 추가</button></div>
      ${dayItems.length? dayItems.map(s=>{
        const canManage = !s.virtual && canManageSchedule(s);
        const badge = authorBadge(s.createdBy);
        return `
        <div class="list-item sched-item">
          <div><div style="font-size:14px;">${timeRangeLabel(s)?escapeHtml(timeRangeLabel(s))+' ':''}${badge}${escapeHtml(s.title)} <span class="pill">${ownerLabel(s.owner)}</span></div>${s.memo?`<div class="content-text" style="font-size:12.5px;">${escapeHtml(s.memo)}</div>`:''}</div>
          <div class="row">${s.virtual? `<span class="meta">경조사 탭에서 수정</span>` : (canManage?`<button class="btn small" data-edit="${s.id}">수정</button><button class="btn small danger" data-del="${s.id}">삭제</button>`:`<span class="meta">작성자만 관리 가능</span>`)}</div>
        </div>`;
      }).join('') : `<div class="empty">일정이 없어요</div>`}
    </div>
  `;
  bindShowCommonToggle('showCommonToggleSchedule');
  document.getElementById('sPrev').onclick=()=>{ scheduleMonth=new Date(y,m-1,1); renderSchedule(); };
  document.getElementById('sNext').onclick=()=>{ scheduleMonth=new Date(y,m+1,1); renderSchedule(); };
  const schedFilterRow=document.getElementById('schedFilterRow');
  if(schedFilterRow) schedFilterRow.addEventListener('click', e=>{
    const b=e.target.closest('button[data-owner]'); if(!b) return;
    scheduleFilter=b.dataset.owner; renderSchedule();
  });
  el.querySelector('.cal-grid').addEventListener('click', e=>{
    const c=e.target.closest('.cal-cell'); if(!c) return;
    scheduleSel=c.dataset.date; renderSchedule();
  });
  document.getElementById('addSchedBtn').onclick=()=>openScheduleModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openScheduleModal(state.schedule.find(x=>x.id===b.dataset.edit), null, scheduleSel));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    const item=state.schedule.find(x=>x.id===b.dataset.del);
    if(!item) return;
    confirmDeleteScheduleItem(item, scheduleSel);
  });
}
function confirmDeleteScheduleItem(item, occurDate){
  const isRepeating = item.repeat && item.repeat!=='none';
  if(!isRepeating){
    if(confirm('일정을 삭제할까요?')){ state.schedule=state.schedule.filter(x=>x.id!==item.id); queueSave(); closeModal(); renderSchedule(); renderHome(); }
    return;
  }
  openModal(`
    <h3>반복 일정 삭제</h3>
    <div class="content-text" style="margin-bottom:14px;">'${escapeHtml(item.title)}'은(는) 반복되는 일정이에요. 어떻게 삭제할까요?</div>
    <div class="modal-actions" style="flex-direction:column;align-items:stretch;gap:8px;">
      <button class="btn danger" id="delOne">${occurDate} 이 날짜만 삭제</button>
      <button class="btn danger" id="delFuture">${occurDate}부터 이후 반복 모두 삭제</button>
      <button class="btn" id="delCancel">취소</button>
    </div>
  `);
  document.getElementById('delCancel').onclick=closeModal;
  document.getElementById('delOne').onclick=()=>{
    if(!item.excludeDates) item.excludeDates=[];
    if(!item.excludeDates.includes(occurDate)) item.excludeDates.push(occurDate);
    queueSave(); closeModal(); renderSchedule(); renderHome();
  };
  document.getElementById('delFuture').onclick=()=>{
    if(occurDate===item.date){
      state.schedule=state.schedule.filter(x=>x.id!==item.id);
    } else {
      item.repeatUntil=fmtDate(addDays(parseDate(occurDate),-1));
    }
    queueSave(); closeModal(); renderSchedule(); renderHome();
  };
}
function addOneHour(timeStr){
  if(!timeStr) return '';
  const [h,mi]=timeStr.split(':').map(Number);
  const total=(h*60+mi+60)%1440;
  return pad2(Math.floor(total/60))+':'+pad2(total%60);
}
function canManageSchedule(item){
  return !item || item.owner!=='common' || !item.createdBy || item.createdBy===currentAuthorKey();
}
const REPEAT_LABELS={none:'안함',weekday:'매일(평일)',daily:'매일(휴일포함)',weekly:'매주',yearly:'매년'};
function scheduleItemOccursOn(item, dateStr){
  if(item.excludeDates && item.excludeDates.includes(dateStr)) return false;
  if(item.date===dateStr) return true;
  if(!item.repeat || item.repeat==='none') return false;
  if(dateStr<item.date) return false;
  if(item.repeatUntil && dateStr>item.repeatUntil) return false;
  const base=parseDate(item.date), target=parseDate(dateStr);
  if(item.repeat==='daily') return true;
  if(item.repeat==='weekday'){
    const dow=target.getDay();
    if(dow===0||dow===6) return false;
    const holidays=getHolidaysForViewer(target.getFullYear());
    return !holidays[dateStr];
  }
  if(item.repeat==='weekly') return base.getDay()===target.getDay();
  if(item.repeat==='yearly') return base.getMonth()===target.getMonth() && base.getDate()===target.getDate();
  return false;
}
function openScheduleModal(existing, prefill, occurDate){
  if(existing && !canManageSchedule(existing)){ showToast('가족공통 일정은 작성자만 수정·삭제할 수 있어요'); return; }
  const myOwners=getAllowedOwners();
  const role=effectiveRole();
  const defaultOwner = (prefill&&prefill.owner) ? prefill.owner
    : (role && role!=='dad' && myOwners.some(o=>o.key===role)) ? role
    : ((scheduleFilter!=='all' && myOwners.some(o=>o.key===scheduleFilter)) ? scheduleFilter : (myOwners[0]?myOwners[0].key:'common'));
  const s=existing||{id:null,date:(prefill&&prefill.date)||scheduleSel,time:(prefill&&prefill.time)||'',endTime:(prefill&&prefill.endTime)||'',title:'',contacts:'',memo:'',owner:defaultOwner,repeat:'none',repeatUntil:''};
  if(!s.id && s.time && !s.endTime) s.endTime=addOneHour(s.time);
  const ownerOptions = myOwners.some(o=>o.key===(s.owner||'common')) ? myOwners : myOwners.concat([{key:s.owner||'common',label:ownerLabel(s.owner)}]);
  const curRepeat=s.repeat||'none';
  let selectedColor=s.bgColor||null;
  openModal(`
    <div class="row" style="justify-content:space-between;align-items:center;padding-right:30px;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;">${existing?'일정 수정':'일정 추가'}</h3>
      <div class="row" style="gap:6px;">
        ${ownerOptions.map(o=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mOwner" value="${o.key}" ${(s.owner||'common')===o.key?'checked':''} style="margin-right:4px;">${scheduleFilterLabel(o.key)}</label>`).join('')}
      </div>
    </div>
    <div class="field"><label>배경색상</label>${renderColorSwatches(selectedColor, 'modal')}</div>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${s.date}"></div>
    <div class="grid2">
      <div class="field"><label>시작 시간 (선택)</label><input type="time" step="600" id="mTime" value="${s.time||''}"></div>
      <div class="field"><label>종료 시간 (선택)</label><input type="time" step="600" id="mEndTime" value="${s.endTime||''}"></div>
    </div>
    <div class="field"><label>제목</label><input id="mTitle" value="${escapeHtml(s.title)}"></div>
    <div class="field"><label>인맥 (쉼표로 구분, 예: 홍길동, 김철수)</label><input id="mContacts" value="${escapeHtml(s.contacts)}"></div>
    <div class="field"><label>메모</label><textarea id="mMemo">${escapeHtml(s.memo)}</textarea></div>
    <div id="repeatOptions" style="display:${curRepeat!=='none'?'':'none'};margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">
      <div class="field"><label>반복</label>
        <div class="row" style="gap:6px;">
          ${['none','weekday','daily','weekly','yearly'].map(r=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mRepeat" value="${r}" ${curRepeat===r?'checked':''} style="margin-right:4px;">${REPEAT_LABELS[r]}</label>`).join('')}
        </div>
      </div>
      <div class="field"><label>반복 기한 (선택, 비우면 계속 반복)</label><input type="text" readonly class="date-input" id="mRepeatUntil" value="${s.repeatUntil||''}"></div>
    </div>
    <div class="modal-actions" style="justify-content:space-between;">
      <button type="button" class="btn small" id="repeatToggleBtn">🔁 반복${curRepeat!=='none'?': '+REPEAT_LABELS[curRepeat]:''}</button>
      <div class="row" style="gap:8px;">
        ${existing?`<button class="btn danger" id="mDelete">삭제</button>`:''}
        <button class="btn" id="mCancel">취소</button>
        <button class="btn primary" id="mSave">저장</button>
      </div>
    </div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  attachDatePicker('mRepeatUntil');
  document.getElementById('mTime').addEventListener('change', e=>{
    if(e.target.value) document.getElementById('mEndTime').value=addOneHour(e.target.value);
  });
  document.getElementById('repeatToggleBtn').onclick=()=>{
    const el=document.getElementById('repeatOptions');
    el.style.display = el.style.display==='none' ? '' : 'none';
  };
  document.querySelectorAll('[data-swatch-group="modal"] .color-swatch').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedColor = (selectedColor===btn.dataset.color) ? null : btn.dataset.color;
      document.querySelectorAll('[data-swatch-group="modal"] .color-swatch').forEach(b=>{
        b.style.border = (b.dataset.color===selectedColor) ? '3px solid var(--text)' : '2px solid transparent';
      });
    });
  });
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const title=document.getElementById('mTitle').value.trim();
    if(!date||!title){ showToast('날짜와 제목을 입력해주세요'); return; }
    const owner=(document.querySelector('input[name="mOwner"]:checked')||{}).value || 'common';
    const repeat=(document.querySelector('input[name="mRepeat"]:checked')||{}).value || 'none';
    const repeatUntil=document.getElementById('mRepeatUntil').value;
    const rec={id:s.id||uid(),date,time:document.getElementById('mTime').value,endTime:document.getElementById('mEndTime').value,title,contacts:document.getElementById('mContacts').value,memo:document.getElementById('mMemo').value,owner,repeat,repeatUntil,color:s.color||null,bgColor:selectedColor,createdBy:s.createdBy||currentAuthorKey()};
    if(s.id){ const idx=state.schedule.findIndex(x=>x.id===s.id); state.schedule[idx]=rec; }
    else state.schedule.push(rec);
    scheduleSel=date;
    queueSave(); closeModal(); renderSchedule(); renderHome();
  };
  const delBtn=document.getElementById('mDelete');
  if(delBtn) delBtn.onclick=()=>{ confirmDeleteScheduleItem(s, occurDate||s.date); };
}

/* ---------- HEALTH ---------- */
const FAMILY_MEMBERS=[{key:'dad',label:'아빠'},{key:'mom',label:'엄마'},{key:'daughter',label:'딸'}];
const MEAL_TYPES=['아침','점심','저녁','간식'];
const MEAL_AMOUNTS=['조금 적게','적당하게','조금 많이','너무 많이'];
function openMealEditModal(id){
  const meals=(state.daily[healthDate] && state.daily[healthDate].health && state.daily[healthDate].health[healthPerson] && state.daily[healthDate].health[healthPerson].meals) || [];
  const m=meals.find(x=>x.id===id);
  if(!m) return;
  openModal(`
    <h3>식단 기록 수정</h3>
    <div class="field"><label>식사 종류</label>
      <div class="row" style="gap:6px;">
        ${MEAL_TYPES.map(t=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mMealType" value="${t}" ${m.mealType===t?'checked':''} style="margin-right:4px;">${t}</label>`).join('')}
      </div>
    </div>
    <div class="field"><label>내용</label><input id="mMealContent" value="${escapeHtml(m.content)}"></div>
    <div class="field"><label>양</label><select id="mMealAmount">${MEAL_AMOUNTS.map(a=>`<option ${m.amount===a?'selected':''}>${a}</option>`).join('')}</select></div>
    <div class="modal-actions"><button class="btn danger" id="mDelete">삭제</button><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    m.mealType=(document.querySelector('input[name="mMealType"]:checked')||{}).value||m.mealType;
    m.content=document.getElementById('mMealContent').value;
    m.amount=document.getElementById('mMealAmount').value;
    queueSave(); closeModal(); renderHealth();
  };
  document.getElementById('mDelete').onclick=()=>{
    if(!confirm('삭제할까요?')) return;
    state.daily[healthDate].health[healthPerson].meals=meals.filter(x=>x.id!==id);
    queueSave(); closeModal(); renderHealth();
  };
}
const EMAIL_ROLE={'juseok.ha@gmail.com':'dad','jinahkim2023@gmail.com':'mom','loraha5416@gmail.com':'daughter'};
let healthDate = todayStr();
let healthPerson = null;
let weightChartOthers = [];
let showActivityTrend = false;
function memberLabel(key){ const m=FAMILY_MEMBERS.find(x=>x.key===key); return m?m.label:key; }
function calcHourDiff(startHHMM, endHHMM){
  if(!startHHMM || !endHHMM) return null;
  const [sh,sm]=startHHMM.split(':').map(Number);
  const [eh,em]=endHHMM.split(':').map(Number);
  let startMin=sh*60+sm, endMin=eh*60+em;
  if(endMin<=startMin) endMin+=24*60;
  return Math.round(((endMin-startMin)/60)*10)/10;
}
function weightGoalsFor(key){
  if(!state.weightGoals) state.weightGoals={};
  if(!state.weightGoals[key]) state.weightGoals[key]={target:'',weeklyLoss:'',finalTarget:''};
  return state.weightGoals[key];
}
function weightGoalSummaryText(goals){
  const parts=[];
  if(goals.target) parts.push(`1차 목표 ${goals.target}kg`);
  if(goals.weeklyLoss) parts.push(`주당 ${goals.weeklyLoss}g 감량`);
  if(goals.finalTarget) parts.push(`최종목표 ${goals.finalTarget}kg`);
  return parts.length ? parts.join(', ') : '목표 미설정';
}
function openWeightGoalModal(key){
  const goals=weightGoalsFor(key);
  openModal(`
    <h3>${memberLabel(key)} 체중 목표 설정</h3>
    <div class="field"><label>1차 목표 (kg)</label><input type="number" step="0.1" id="mWgTarget" value="${goals.target}"></div>
    <div class="field"><label>주당 감량 목표 (g)</label><input type="number" step="10" id="mWgWeekly" value="${goals.weeklyLoss}"></div>
    <div class="field"><label>최종 목표 (kg)</label><input type="number" step="0.1" id="mWgFinal" value="${goals.finalTarget}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const oldTarget=goals.target, oldFinal=goals.finalTarget;
    goals.target=document.getElementById('mWgTarget').value;
    goals.weeklyLoss=document.getElementById('mWgWeekly').value;
    goals.finalTarget=document.getElementById('mWgFinal').value;
    const flags=gamificationFlags(key);
    if(goals.target!==oldTarget) flags.weightGoalCelebrated.target=false;
    if(goals.finalTarget!==oldFinal) flags.weightGoalCelebrated.finalTarget=false;
    queueSave(); closeModal(); renderHealth();
  };
}
function latestWeightEntryFor(key){
  const today=todayStr();
  const dates=Object.keys(state.daily).filter(d=>d<=today && state.daily[d].health && state.daily[d].health[key] && state.daily[d].health[key].weight).sort();
  if(!dates.length) return null;
  const d=dates[dates.length-1];
  return {date:d, weight:Number(state.daily[d].health[key].weight)};
}
function latestWeightFor(key){
  const entry=latestWeightEntryFor(key);
  return entry ? entry.weight : null;
}
function fmtKoreanDate(dateStr){
  const d=parseDate(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
}
function projectedAchievementDate(currentWeight, targetWeight, weeklyLossGrams){
  if(currentWeight==null || !targetWeight || !weeklyLossGrams || Number(weeklyLossGrams)<=0) return null;
  const diffGrams = (currentWeight - Number(targetWeight))*1000;
  if(diffGrams<=0) return todayStr();
  const daysNeeded = Math.ceil((diffGrams/Number(weeklyLossGrams))*7);
  return fmtDate(addDays(parseDate(todayStr()), daysNeeded));
}
function renderHealth(){
  healthPerson = effectiveRole() || 'mom';
  const day=state.daily[healthDate]||{};
  const rec=(day.health&&day.health[healthPerson])||{};
  const mealList=(rec.meals||[]).slice().sort((a,b)=>a.time.localeCompare(b.time));
  const el=document.getElementById('tab-health');
  const dLabel = parseDate(healthDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const dLabelColor = weekdayColor(healthDate);
  const schedList = ((state.healthSchedule&&state.healthSchedule[healthPerson])||[]).map(it=>({...it,d:dday(it.date)})).sort((a,b)=>a.d-b.d);
  const otherMembers=FAMILY_MEMBERS.filter(m=>m.key!==healthPerson);
  const goals = weightGoalsFor(healthPerson);
  const curWeight = latestWeightFor(healthPerson);
  const targetDate = projectedAchievementDate(curWeight, goals.target, goals.weeklyLoss);
  const finalDate = projectedAchievementDate(curWeight, goals.finalTarget, goals.weeklyLoss);
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div class="row" style="gap:8px;align-items:center;flex-wrap:wrap;">
          <h3 style="margin:0;">📈 체중 추이</h3>
          <span class="meta">${weightGoalSummaryText(goals)}</span>
          <button class="icon-btn" id="editWeightGoalBtn" title="목표 수정" style="padding:0 2px;font-size:13px;">✏️</button>
        </div>
        <div class="row" style="gap:10px;">
          ${otherMembers.map(m=>`<label class="pill" style="cursor:pointer;"><input type="checkbox" class="weightExtraToggle" value="${m.key}" ${weightChartOthers.includes(m.key)?'checked':''} style="margin-right:4px;transform:scale(0.5);vertical-align:middle;">${m.label}</label>`).join('')}
        </div>
      </div>
      <div style="margin-top:10px;">${renderWeightChart([healthPerson].concat(weightChartOthers), [healthPerson].concat(weightChartOthers).map(k=>{ const g=weightGoalsFor(k); return {key:k, weeklyLoss:g.weeklyLoss, finalTarget:g.finalTarget}; }))}</div>
      <div style="margin-top:8px;text-align:right;">
        ${targetDate?`<div class="meta">🎯 1차 목표 ${goals.target}kg, ${fmtKoreanDate(targetDate)} 달성 목표</div>`:''}
        ${finalDate?`<div class="meta" style="margin-top:2px;">🏁 최종목표 ${goals.finalTarget}kg, ${fmtKoreanDate(finalDate)} 달성 목표</div>`:''}
      </div>
    </div>
    <div class="card">
      <div class="datebar"><button class="iconbtn" id="hPrev">‹</button><div class="d" style="${dLabelColor?'color:'+dLabelColor+';':''}">${dLabel}</div><button class="iconbtn" id="hNext">›</button>
        ${healthDate!==todayStr()?todayPillBtn('hToday'):''}
      </div>
      <div class="row" style="justify-content:flex-end;align-items:center;gap:8px;margin-bottom:8px;">
        <span class="meta" id="healthSaveStatus">${(rec.weight||rec.sleep||rec.fasting||rec.calories)?'✓ 저장됨':''}</span>
        <button class="icon-btn" id="toggleActivityTrendBtn" title="추이 그래프">📈</button>
        <button class="btn small primary" id="healthSaveBtn">저장</button>
      </div>
      <div class="grid2">
        <div class="field"><label>체중 (kg)</label><input type="number" step="0.1" id="hWeight" value="${rec.weight||''}"></div>
        <div class="field"><label>총칼로리 (kcal)</label><input type="number" step="10" id="hCalories" value="${rec.calories||''}"></div>
      </div>
      <div class="grid2" style="margin-top:10px;">
        <div class="field">
          <label>수면 시간 (취침 → 기상)</label>
          <div class="row" style="gap:4px;flex-wrap:nowrap;">
            <input type="time" id="hSleepStart" value="${rec.sleepStart||''}" style="flex:1;min-width:0;">
            <input type="time" id="hSleepEnd" value="${rec.sleepEnd||''}" style="flex:1;min-width:0;">
          </div>
          <div class="meta" id="sleepCalcResult" style="margin-top:2px;">${rec.sleep?rec.sleep+'시간':''}</div>
        </div>
        <div class="field">
          <label>공복시간 (Last Meal → First Meal)</label>
          <div class="row" style="gap:4px;flex-wrap:nowrap;">
            <input type="time" id="hLastMeal" value="${rec.lastMeal||''}" style="flex:1;min-width:0;">
            <input type="time" id="hFirstMeal" value="${rec.firstMeal||''}" style="flex:1;min-width:0;">
          </div>
          <div class="meta" id="fastingCalcResult" style="margin-top:2px;">${rec.fasting?rec.fasting+'시간':''}</div>
        </div>
      </div>
      ${showActivityTrend?renderActivityTrendPanel(healthPerson):''}
      <div class="field" style="margin-top:8px;">
        <label>Activity Comment</label>
        <textarea id="hSymptom" placeholder="컨디션, 증상 등을 기록해보세요" style="overflow:hidden;">${escapeHtml(rec.symptom)}</textarea>
      </div>
      <div class="field" style="margin-top:8px;">
        <label>Network (오늘 만난 사람 등)</label>
        <input id="hNetwork" placeholder="쉼표로 구분 (예: 홍길동, 김철수)" value="${escapeHtml(rec.network||'')}">
      </div>
      <div class="field" style="margin-top:8px;">
        <div class="row" style="justify-content:space-between;align-items:center;">
          <label style="margin:0;">식단 기록</label>
          <div class="row" style="gap:6px;">
            ${MEAL_TYPES.map((t,i)=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mealTypeDraft" value="${t}" ${i===0?'checked':''} style="margin-right:4px;">${t}</label>`).join('')}
          </div>
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap;">
          <input id="mealContentInput" placeholder="어디서 무엇을 먹었는지" style="flex:1;min-width:140px;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-size:13px;">
          <select id="mealAmountInput" style="background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-size:13px;">
            ${MEAL_AMOUNTS.map(a=>`<option>${a}</option>`).join('')}
          </select>
          <button class="btn small primary" id="addMealBtn">추가</button>
        </div>
        <div style="margin-top:8px;">
          ${mealList.length? mealList.map(mEntry=>`
            <div class="list-item">
              <div class="content-text">${mEntry.time} ${mEntry.mealType} · ${escapeHtml(mEntry.content)} · ${mEntry.amount}</div>
              <button class="icon-btn" data-edit-meal="${mEntry.id}" title="수정">✏️</button>
            </div>`).join('') : `<div class="empty">아직 기록된 식단이 없어요</div>`}
        </div>
      </div>
    </div>
    ${healthPerson!=='daughter'?`
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🩺 ${memberLabel(healthPerson)} 주요 검진 일정</h3><button class="btn primary small" id="addHealthSchedBtn">+ 추가</button></div>
      ${schedList.length? schedList.map(it=>`
        <div class="list-item">
          <div><div>${escapeHtml(it.name)}</div><div class="meta">${it.date}${it.memo?' · '+escapeHtml(it.memo):''}</div></div>
          <div class="row"><span class="pill ${ddayPillClass(it.d)}">${ddayLabel(it.d)}</span>
            <button class="icon-btn" data-edit-hsched="${it.id}" title="수정">✏️</button>
            <button class="btn small danger" data-del-hsched="${it.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">건강검진, 정기검사 등 예정된 일정을 등록해보세요</div>`}
    </div>`:''}
  `;
  document.getElementById('editWeightGoalBtn').onclick=()=>openWeightGoalModal(healthPerson);
  el.querySelectorAll('.weightExtraToggle').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      const key=cb.value;
      if(cb.checked){ if(!weightChartOthers.includes(key)) weightChartOthers.push(key); }
      else { weightChartOthers=weightChartOthers.filter(k=>k!==key); }
      renderHealth();
    });
  });
  el.querySelectorAll('.wt-point').forEach(pt=>{
    pt.addEventListener('mouseenter', ()=>showDtTooltip(pt, pt.dataset.tip));
    pt.addEventListener('mouseleave', hideDtTooltip);
  });
  document.getElementById('hPrev').onclick=()=>{ healthDate=fmtDate(addDays(parseDate(healthDate),-1)); renderHealth(); };
  document.getElementById('hNext').onclick=()=>{ healthDate=fmtDate(addDays(parseDate(healthDate),1)); renderHealth(); };
  const tb=document.getElementById('hToday'); if(tb) tb.onclick=()=>{ healthDate=todayStr(); renderHealth(); };
  const save=(k,v)=>{
    ensureDay(healthDate);
    if(!state.daily[healthDate].health) state.daily[healthDate].health={};
    if(!state.daily[healthDate].health[healthPerson]) state.daily[healthDate].health[healthPerson]={};
    state.daily[healthDate].health[healthPerson][k]=v;
    queueSave();
  };
  document.getElementById('hWeight').addEventListener('change',e=>{
    const newVal=e.target.value?Number(e.target.value):'';
    save('weight', newVal);
    if(newVal) checkWeightGoalReached(healthPerson, newVal);
    renderHealth();
  });
  document.getElementById('hCalories').addEventListener('change',e=>save('calories', e.target.value?Number(e.target.value):''));
  document.getElementById('hSymptom').addEventListener('change',e=>save('symptom', e.target.value));
  document.getElementById('hNetwork').addEventListener('change',e=>save('network', e.target.value));
  const recalcSleep=()=>{
    const s=document.getElementById('hSleepStart').value, en=document.getElementById('hSleepEnd').value;
    save('sleepStart', s); save('sleepEnd', en);
    const hrs=calcHourDiff(s, en);
    save('sleep', hrs==null?'':hrs);
    document.getElementById('sleepCalcResult').textContent = hrs!=null ? hrs+'시간' : '';
  };
  const recalcFasting=()=>{
    const lm=document.getElementById('hLastMeal').value, fm=document.getElementById('hFirstMeal').value;
    save('lastMeal', lm); save('firstMeal', fm);
    const hrs=calcHourDiff(lm, fm);
    save('fasting', hrs==null?'':hrs);
    document.getElementById('fastingCalcResult').textContent = hrs!=null ? hrs+'시간' : '';
  };
  document.getElementById('hSleepStart').addEventListener('change', recalcSleep);
  document.getElementById('hSleepEnd').addEventListener('change', recalcSleep);
  document.getElementById('hLastMeal').addEventListener('change', recalcFasting);
  document.getElementById('hFirstMeal').addEventListener('change', recalcFasting);
  const hSymptomEl=document.getElementById('hSymptom');
  const autoResize=()=>{ hSymptomEl.style.height='auto'; hSymptomEl.style.height=hSymptomEl.scrollHeight+'px'; };
  autoResize();
  hSymptomEl.addEventListener('input', autoResize);
  ['hWeight','hSleepStart','hSleepEnd','hLastMeal','hFirstMeal','hCalories','hSymptom','hNetwork'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{
      document.getElementById('healthSaveStatus').textContent='';
    });
  });
  document.getElementById('toggleActivityTrendBtn').onclick=()=>{
    showActivityTrend=!showActivityTrend;
    renderHealth();
  };
  document.getElementById('healthSaveBtn').onclick=()=>{
    save('weight', document.getElementById('hWeight').value?Number(document.getElementById('hWeight').value):'');
    recalcSleep();
    recalcFasting();
    save('calories', document.getElementById('hCalories').value?Number(document.getElementById('hCalories').value):'');
    save('symptom', document.getElementById('hSymptom').value);
    save('network', document.getElementById('hNetwork').value);
    const now=new Date();
    document.getElementById('healthSaveStatus').textContent = `✓ 저장됨 (${now.getHours()}:${pad2(now.getMinutes())})`;
  };
  document.getElementById('addMealBtn').onclick=()=>{
    const content=document.getElementById('mealContentInput').value.trim();
    if(!content){ showToast('내용을 입력해주세요'); return; }
    const mealType=(document.querySelector('input[name="mealTypeDraft"]:checked')||{}).value||MEAL_TYPES[0];
    const amount=document.getElementById('mealAmountInput').value;
    const now=new Date();
    const entry={id:uid(), time:pad2(now.getHours())+':'+pad2(now.getMinutes()), mealType, content, amount};
    ensureDay(healthDate);
    if(!state.daily[healthDate].health) state.daily[healthDate].health={};
    if(!state.daily[healthDate].health[healthPerson]) state.daily[healthDate].health[healthPerson]={};
    if(!state.daily[healthDate].health[healthPerson].meals) state.daily[healthDate].health[healthPerson].meals=[];
    state.daily[healthDate].health[healthPerson].meals.push(entry);
    queueSave(); renderHealth();
  };
  el.querySelectorAll('[data-edit-meal]').forEach(b=>b.onclick=()=>openMealEditModal(b.dataset.editMeal));
  const addHealthSchedBtn=document.getElementById('addHealthSchedBtn');
  if(addHealthSchedBtn) addHealthSchedBtn.onclick=()=>openHealthSchedModal();
  el.querySelectorAll('[data-edit-hsched]').forEach(b=>b.onclick=()=>openHealthSchedModal((state.healthSchedule[healthPerson]||[]).find(x=>x.id===b.dataset.editHsched)));
  el.querySelectorAll('[data-del-hsched]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.healthSchedule[healthPerson]=(state.healthSchedule[healthPerson]||[]).filter(x=>x.id!==b.dataset.delHsched); queueSave(); renderHealth(); }
  });
}
function openHealthSchedModal(existing){
  const it=existing||{id:null,date:todayStr(),name:'',memo:''};
  const others=FAMILY_MEMBERS.filter(m=>m.key!==healthPerson);
  openModal(`
    <h3>${existing?'검진 일정 수정':'검진 일정 추가'}</h3>
    <div class="field"><label>검진명 (예: 건강검진, 치과 정기검진)</label><input id="mName" value="${escapeHtml(it.name)}"></div>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${it.date}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(it.memo)}"></div>
    ${!existing?`
    <div class="field">
      <label>함께 기록할 구성원 (같이 받는 검진인 경우)</label>
      <div class="row">
        ${others.map(m=>`<label class="pill" style="cursor:pointer;"><input type="checkbox" class="mAlsoMember" value="${m.key}" style="margin-right:4px;">${m.label}</label>`).join('')}
      </div>
    </div>`:''}
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mName').value.trim();
    const date=document.getElementById('mDate').value;
    if(!name||!date){ showToast('검진명과 날짜를 입력해주세요'); return; }
    const memo=document.getElementById('mMemo').value;
    const rec={id:it.id||uid(),name,date,memo};
    if(!state.healthSchedule) state.healthSchedule={dad:[],mom:[],daughter:[]};
    if(!state.healthSchedule[healthPerson]) state.healthSchedule[healthPerson]=[];
    if(it.id){
      const idx=state.healthSchedule[healthPerson].findIndex(x=>x.id===it.id);
      state.healthSchedule[healthPerson][idx]=rec;
    } else {
      state.healthSchedule[healthPerson].push(rec);
      const also=Array.from(document.querySelectorAll('.mAlsoMember:checked')).map(cb=>cb.value);
      also.forEach(k=>{
        if(!state.healthSchedule[k]) state.healthSchedule[k]=[];
        state.healthSchedule[k].push({id:uid(),name,date,memo});
      });
    }
    queueSave(); closeModal(); renderHealth();
  };
}
function renderWeightChart(keys, goalProjections){
  const pastDays=31, futureDays=10;
  const totalDays=pastDays+futureDays;
  const todayIdx=pastDays-1;
  const today=parseDate(todayStr());
  const dateList=Array.from({length:totalDays},(_,i)=>fmtDate(addDays(today, i-todayIdx)));
  const series=keys.map(key=>({
    key, label:memberLabel(key), color:ROLE_BADGE_COLOR[key]||'#8b7cf6',
    pts:dateList.map((d,i)=>{
      if(i>todayIdx) return null;
      const w=state.daily[d] && state.daily[d].health && state.daily[d].health[key] && state.daily[d].health[key].weight;
      return w?Number(w):null;
    })
  }));
  const goals=(goalProjections||[]).map(gp=>{
    if(!gp || !gp.weeklyLoss) return null;
    const anchorEntry=latestWeightEntryFor(gp.key);
    if(!anchorEntry) return null;
    let anchorIdx=dateList.indexOf(anchorEntry.date);
    if(anchorIdx===-1) anchorIdx=todayIdx;
    const color=ROLE_BADGE_COLOR[gp.key]||'#8b7cf6';
    const pts=dateList.map((d,i)=>{
      if(i<anchorIdx) return null;
      const daysAhead=i-anchorIdx;
      let w=anchorEntry.weight-(Number(gp.weeklyLoss)/1000)*(daysAhead/7);
      if(gp.finalTarget && w<Number(gp.finalTarget)) w=Number(gp.finalTarget);
      return w;
    });
    return {key:gp.key, color, pts};
  }).filter(Boolean);
  const allVals=series.flatMap(s=>s.pts.filter(v=>v!=null)).concat(goals.flatMap(g=>g.pts.filter(v=>v!=null)));
  if(!allVals.length) return `<div class="empty">체중 기록이 아직 없어요</div>`;
  let min=Math.min(...allVals), max=Math.max(...allVals);
  if(min===max){ min-=1; max+=1; }
  const pad=(max-min)*0.15; min-=pad; max+=pad;
  const W=600,H=180,ML=32,MR=8,MT=28,MB=26;
  const plotW=W-ML-MR, plotH=H-MT-MB;
  const x=i=>ML+(i/(totalDays-1))*plotW;
  const y=v=>MT+plotH-((v-min)/(max-min))*plotH;
  const gridLines=[0,0.25,0.5,0.75,1].map(t=>{
    const val=min+(max-min)*t;
    const yy=MT+plotH-(t*plotH);
    return `<line x1="${ML}" y1="${yy}" x2="${W-MR}" y2="${yy}" stroke="var(--border)" stroke-width="1"/><text x="${ML-5}" y="${yy+3}" font-size="9" fill="var(--muted)" text-anchor="end">${val.toFixed(1)}</text>`;
  }).join('');
  const todayX=x(todayIdx);
  const todayLine=`<line x1="${todayX}" y1="${MT}" x2="${todayX}" y2="${MT+plotH}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  const seriesSvg=series.map(s=>{
    let pathD='', dots='', maxIdx=-1, maxVal=-Infinity;
    s.pts.forEach((v,i)=>{
      if(v==null) return;
      const px=x(i), py=y(v);
      pathD += (pathD?'L':'M')+px+' '+py+' ';
      dots+=`<circle class="wt-point" data-tip="${escapeHtml(s.label)} ${v}kg (${dateList[i].slice(5)})" cx="${px}" cy="${py}" r="4" fill="${s.color}" style="cursor:pointer;"/>`;
      if(v>maxVal){ maxVal=v; maxIdx=i; }
    });
    const maxLabel = maxIdx>=0 ? `<text x="${x(maxIdx)}" y="${y(maxVal)-20}" font-size="9" fill="${s.color}" text-anchor="middle"><tspan x="${x(maxIdx)}" dy="0">${dateList[maxIdx].slice(5)}</tspan><tspan x="${x(maxIdx)}" dy="11">${maxVal}kg</tspan></text>` : '';
    return pathD ? `<path d="${pathD.trim()}" fill="none" stroke="${s.color}" stroke-width="2"/>${dots}${maxLabel}` : '';
  }).join('');
  const goalSvg=goals.map(g=>{
    let pathD='', lastIdx=-1, lastVal=null;
    g.pts.forEach((v,i)=>{
      if(v==null) return;
      pathD += (pathD?'L':'M')+x(i)+' '+y(v)+' ';
      lastIdx=i; lastVal=v;
    });
    if(!pathD) return '';
    let svg=`<path d="${pathD.trim()}" fill="none" stroke="${g.color}" stroke-width="2" stroke-dasharray="4 3" opacity="0.7"/>`;
    if(lastIdx>=0){
      const ex=x(lastIdx), ey=y(lastVal);
      svg+=`<circle cx="${ex}" cy="${ey}" r="4" fill="var(--panel)" stroke="${g.color}" stroke-width="2"/><text x="${ex-2}" y="${ey-10}" font-size="9" fill="${g.color}" text-anchor="end">목표치 ${lastVal.toFixed(1)}kg</text>`;
    }
    return svg;
  }).join('');
  const xLabels=dateList.map((d,i)=>{
    if(i%7!==0 && i!==totalDays-1 && i!==todayIdx) return '';
    const anchor = i===totalDays-1 ? 'end' : 'middle';
    return `<text x="${x(i)}" y="${H-4}" font-size="9" fill="var(--muted)" text-anchor="${anchor}">${d.slice(5)}</text>`;
  }).join('');
  return `
    <div style="overflow-x:auto;">
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;min-width:320px;">
        ${gridLines}${todayLine}${goalSvg}${seriesSvg}${xLabels}
      </svg>
    </div>
    <div class="row" style="gap:14px;margin-top:6px;align-items:center;">
      ${series.map(s=>`<span class="meta" style="display:flex;align-items:center;gap:4px;"><span style="width:9px;height:9px;border-radius:50%;background:${s.color};display:inline-block;"></span>${s.label}</span>`).join('')}
      ${goals.map(g=>`<span class="meta" style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:0;border-top:2px dashed ${g.color};display:inline-block;"></span>${memberLabel(g.key)} 목표선</span>`).join('')}
    </div>
  `;
}
function renderMiniTrendChart(label, values, dateList, color, suffix){
  const pts=values.map((v,i)=>({i,v})).filter(p=>p.v!=null);
  if(!pts.length) return `<div class="meta" style="padding:3px 0;">${label}: 기록 없음</div>`;
  const vals=pts.map(p=>p.v);
  let min=Math.min(...vals), max=Math.max(...vals);
  if(min===max){ min-=1; max+=1; }
  const pad=(max-min)*0.15; min-=pad; max+=pad;
  const n=values.length;
  const W=560,H=54,ML=2,MR=2,MT=6,MB=6;
  const x=i=>ML+(i/(n-1))*(W-ML-MR);
  const y=v=>MT+(H-MT-MB)-((v-min)/(max-min))*(H-MT-MB);
  let pathD='', dots='';
  pts.forEach(p=>{
    const px=x(p.i), py=y(p.v);
    pathD += (pathD?'L':'M')+px+' '+py+' ';
    dots+=`<circle cx="${px}" cy="${py}" r="2.5" fill="${color}"/>`;
  });
  const last=pts[pts.length-1];
  return `
    <div style="margin-top:8px;">
      <div class="meta">${label} · ${dateList[last.i].slice(5)} 기준 ${last.v}${suffix}</div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block;">
        <path d="${pathD.trim()}" fill="none" stroke="${color}" stroke-width="2"/>${dots}
      </svg>
    </div>
  `;
}
function renderActivityTrendPanel(key){
  const days=14;
  const today=parseDate(todayStr());
  const dateList=Array.from({length:days},(_,i)=>fmtDate(addDays(today,-(days-1-i))));
  const getVal=(d,field)=>{
    const rec=state.daily[d] && state.daily[d].health && state.daily[d].health[key];
    const v=rec ? rec[field] : '';
    return (v===''||v==null) ? null : Number(v);
  };
  const sleepVals=dateList.map(d=>getVal(d,'sleep'));
  const fastingVals=dateList.map(d=>getVal(d,'fasting'));
  const calVals=dateList.map(d=>getVal(d,'calories'));
  return `
    <div class="card" style="margin-top:8px;">
      ${renderMiniTrendChart('수면 시간', sleepVals, dateList, '#8b7cf6', '시간')}
      ${renderMiniTrendChart('공복시간', fastingVals, dateList, '#4dd0c4', '시간')}
      ${renderMiniTrendChart('총칼로리', calVals, dateList, '#ff7a94', 'kcal')}
    </div>
  `;
}

/* ---------- BUDGET ---------- */
let budgetMonth = todayStr().slice(0,7);
const BUDGET_CATS=['식비','생활용품','의료/건강','쇼핑','문화/여가','교통','기타'];
const DAUGHTER_EXPENSE_CATS=['밥값','Tea 등 음료','문화생활비','체육활동비','기타'];
const INCOME_CATS=['용돈','상여금','환급','기타'];
const DAUGHTER_INCOME_CATS=['주급(토스)','주급(로이드)','학습·운동 인센티브','체중감량 인센티브','기타'];
function myBudgetCategories(){
  const key=currentAuthorKey();
  if(!state.budgetCategories) state.budgetCategories={};
  if(!state.budgetCategories[key]) state.budgetCategories[key]=[...(key==='daughter'?DAUGHTER_EXPENSE_CATS:BUDGET_CATS)];
  return state.budgetCategories[key];
}
function myIncomeCategories(){
  const key=currentAuthorKey();
  if(!state.incomeCategories) state.incomeCategories={};
  if(!state.incomeCategories[key]) state.incomeCategories[key]=[...(key==='daughter'?DAUGHTER_INCOME_CATS:INCOME_CATS)];
  return state.incomeCategories[key];
}
function fmtCurrency(v,cur){ return cur==='GBP' ? '£'+Number(v).toLocaleString() : Number(v).toLocaleString()+'원'; }
function fmtCurrencyColored(v,cur){
  const text=fmtCurrency(v,cur);
  return Number(v)<0 ? `<span style="color:var(--bad);">${text}</span>` : text;
}
function ensureBudgetOwnershipMigrated(){
  const before=JSON.stringify(state.budget)+'|'+!!state.weeklyPaymentResetV2;
  migrateBudgetOwnership(state);
  resetWeeklyPaymentDataOnce(state);
  const after=JSON.stringify(state.budget)+'|'+!!state.weeklyPaymentResetV2;
  if(after!==before) queueSave();
}
function budgetCarryoverFor(key){
  if(!state.budgetCarryover) state.budgetCarryover={};
  if(!state.budgetCarryover[key]) state.budgetCarryover[key]={KRW:0,GBP:0};
  return state.budgetCarryover[key];
}
function openCarryoverModal(){
  const key=currentAuthorKey();
  const c=budgetCarryoverFor(key);
  openModal(`
    <h3>전월 이월 금액 설정</h3>
    <div class="meta" style="margin-bottom:10px;">앱으로 기록하기 전까지의 잔액을 시작 금액으로 입력해두면 총잔액에 반영돼요.</div>
    <div class="grid2">
      <div class="field"><label>이월 금액 (원)</label><input type="number" id="mCarryKRW" value="${c.KRW}"></div>
      <div class="field"><label>이월 금액 (£)</label><input type="number" id="mCarryGBP" value="${c.GBP}"></div>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    c.KRW=Number(document.getElementById('mCarryKRW').value||0);
    c.GBP=Number(document.getElementById('mCarryGBP').value||0);
    queueSave(); closeModal(); renderBudget();
  };
}
function mondayWeekRange(dateStr){
  const d=parseDate(dateStr);
  const dow=d.getDay();
  const offset = dow===0 ? -6 : 1-dow;
  const start=addDays(d, offset);
  return Array.from({length:7},(_,i)=>fmtDate(addDays(start,i)));
}
function weekActivityMinutes(key, weekDates){
  return weekDates.reduce((acc,d)=>{
    const s=studySummary(studyBlocksFor(key,d));
    return acc+s.study+s.exercise;
  },0);
}
const WEEKLY_ALLOWANCE_KRW=200000, WEEKLY_ALLOWANCE_GBP=50;
function currentPayableWeekRange(){
  const lastWeek=mondayWeekRange(fmtDate(addDays(parseDate(todayStr()),-7)));
  const release=addDays(parseDate(lastWeek[6]), 2);
  release.setHours(6,0,0,0);
  if(new Date()>=release) return lastWeek;
  return mondayWeekRange(fmtDate(addDays(parseDate(todayStr()),-14)));
}
function weeklyPayableBreakdown(){
  const week=currentPayableWeekRange();
  const weekMin=weekActivityMinutes('daughter', week);
  const gbpIncentive=Math.round((weekMin/60)*2*100)/100;
  const gbpAllowance=WEEKLY_ALLOWANCE_GBP;
  return {
    weekStart: week[0],
    weekEnd: week[6],
    krw: WEEKLY_ALLOWANCE_KRW,
    gbpAllowance,
    gbpIncentive,
    gbpTotal: Math.round((gbpAllowance+gbpIncentive)*100)/100
  };
}
function isWeeklyPaymentPaid(weekStart){
  return !!(state.weeklyPaymentStatus && state.weeklyPaymentStatus[weekStart]);
}
function markWeeklyPaymentPaid(){
  const b=weeklyPayableBreakdown();
  const dateStr=todayStr();
  const label=`딸 주급 (${b.weekStart.slice(5)}~${b.weekEnd.slice(5)})`;
  const myKey=currentAuthorKey();
  state.budget.push({id:uid(), date:dateStr, category:'용돈', amount:b.krw, currency:'KRW', memo:label, type:'expense', owner:myKey, paymentWeek:b.weekStart});
  if(b.gbpTotal>0) state.budget.push({id:uid(), date:dateStr, category:'용돈', amount:b.gbpTotal, currency:'GBP', memo:label, type:'expense', owner:myKey, paymentWeek:b.weekStart});
  if(!state.weeklyPaymentStatus) state.weeklyPaymentStatus={};
  state.weeklyPaymentStatus[b.weekStart]=true;
  queueSave();
  showToast('딸 용돈 지급을 확정했어요');
}
function revertWeeklyPayment(weekStart){
  const myKey=currentAuthorKey();
  state.budget = state.budget.filter(b=>!(b.paymentWeek===weekStart && b.owner===myKey && b.type==='expense'));
  if(state.weeklyPaymentStatus) delete state.weeklyPaymentStatus[weekStart];
  queueSave();
  showToast('지급전 상태로 되돌렸어요');
}
function openWeeklyPaymentEditModal(weekStart){
  const myKey=currentAuthorKey();
  const entries=state.budget.filter(b=>b.paymentWeek===weekStart && b.owner===myKey && b.type==='expense');
  const krwEntry=entries.find(e=>(e.currency||'KRW')==='KRW');
  const gbpEntry=entries.find(e=>e.currency==='GBP');
  openModal(`
    <h3>딸 용돈 지급 내역 수정</h3>
    <div class="grid2">
      <div class="field"><label>금액 (원)</label><input type="number" id="mEditKRW" value="${krwEntry?krwEntry.amount:0}"></div>
      <div class="field"><label>금액 (£)</label><input type="number" id="mEditGBP" value="${gbpEntry?gbpEntry.amount:0}"></div>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const krw=Number(document.getElementById('mEditKRW').value||0);
    const gbp=Number(document.getElementById('mEditGBP').value||0);
    if(krwEntry) krwEntry.amount=krw;
    if(gbpEntry) gbpEntry.amount=gbp;
    queueSave(); closeModal(); renderBudget(); renderHome();
  };
}
function ensureDaughterWeeklyIncomePlaceholders(){
  const b=weeklyPayableBreakdown();
  const dateStr=todayStr();
  const exists=cat=>state.budget.some(x=>x.paymentWeek===b.weekStart && x.owner==='daughter' && x.category===cat);
  let added=false;
  if(!exists('주급(토스)')){
    state.budget.push({id:uid(), date:dateStr, category:'주급(토스)', amount:b.krw, currency:'KRW', memo:'', type:'income', owner:'daughter', paymentWeek:b.weekStart, confirmed:false});
    added=true;
  }
  if(!exists('주급(로이드)')){
    state.budget.push({id:uid(), date:dateStr, category:'주급(로이드)', amount:b.gbpAllowance, currency:'GBP', memo:'', type:'income', owner:'daughter', paymentWeek:b.weekStart, confirmed:false});
    added=true;
  }
  if(b.gbpIncentive>0 && !exists('학습·운동 인센티브')){
    state.budget.push({id:uid(), date:dateStr, category:'학습·운동 인센티브', amount:b.gbpIncentive, currency:'GBP', memo:'', type:'income', owner:'daughter', paymentWeek:b.weekStart, confirmed:false});
    added=true;
  }
  if(added) queueSave();
}
function renderIncomeEstimateCard(){
  const thisWeek=mondayWeekRange(todayStr());
  const lastWeek=mondayWeekRange(fmtDate(addDays(parseDate(todayStr()),-7)));
  const lastWeekMin=weekActivityMinutes('daughter', lastWeek);
  const thisWeekMin=weekActivityMinutes('daughter', thisWeek);
  const lastIncentive=Math.round((lastWeekMin/60)*2*100)/100;
  const thisIncentive=Math.round((thisWeekMin/60)*2*100)/100;
  const latestWeight = latestWeightFor('daughter');
  const milestones=[{w:49,bonus:20},{w:48,bonus:50},{w:45,bonus:100}];
  const myKey=currentAuthorKey();
  const loggedTexts=state.budget.filter(b=>b.type==='income'&&b.category==='체중감량 인센티브'&&(b.owner===undefined||b.owner===myKey)).map(b=>(b.memo||'')+' '+b.amount);
  const reached=latestWeight==null?[]:milestones.filter(ms=>latestWeight<=ms.w);
  const unpaid=reached.filter(ms=>!loggedTexts.some(t=>t.includes(String(ms.w))));
  const mobile=isMobileViewport();
  const headerBase=`주급 ₩200,000 + 주급 £${WEEKLY_ALLOWANCE_GBP}`;
  const rowBase=`₩200,000 + £${WEEKLY_ALLOWANCE_GBP}`;
  const weekRow=(icon, labelHtml, weekWord, weekRange, min, incentive)=>{
    const headline=`${labelHtml}: (${rowBase})${incentive>0?` + £${incentive}`:''}`;
    const detail=`${weekWord}(${weekRange}) <b style="color:${SB_COLORS.exercise};">운동시간 ${fmtStudyMin(min)}</b> × £2 = £${incentive.toFixed(2)}`;
    if(mobile) return `<div style="display:flex;margin-top:4px;"><span style="flex-shrink:0;">${icon} </span><span>${headline}<br>${detail}</span></div>`;
    return `<div style="margin-top:4px;white-space:nowrap;">${icon} ${headline}, ${detail}</div>`;
  };
  const headerLine = mobile
    ? `<div style="font-size:13px;display:flex;"><span style="flex-shrink:0;">💡 예상 수입 = </span><span>(${headerBase})<br>+ 지난주(월~일) 운동시간 × £2 + Weight Incentive</span></div>`
    : `<div style="font-size:13px;white-space:nowrap;">💡 예상 수입 = (${headerBase}) + 지난주(월~일) 운동시간 × £2 + Weight Incentive</div>`;
  return `
    <div class="card">
      <div style="overflow-x:auto;">
      ${headerLine}
      <div style="margin-top:8px;margin-left:22px;font-size:13px;line-height:1.5;color:var(--muted);">
        ${weekRow('✅', `<b style="color:var(--accent);">이번 주 예상</b>`, '지난주', `${lastWeek[0].slice(5)}~${lastWeek[6].slice(5)}`, lastWeekMin, lastIncentive)}
        ${weekRow('🔮', `<b style="color:var(--accent2);">다음 주 예상</b>`, '이번주', `${thisWeek[0].slice(5)}~${thisWeek[6].slice(5)}`, thisWeekMin, thisIncentive)}
      </div>
      </div>
      ${unpaid.length?`<div class="meta" style="margin-top:10px;color:var(--good);">🎉 체중 감량 목표 달성: ${unpaid.map(ms=>`${ms.w}kg 이하 → £${ms.bonus}`).join(', ')} (아직 수입 내역에 기록 안 됨)</div>`:''}
    </div>
  `;
}
function renderBudget(){
  const el=document.getElementById('tab-budget');
  ensureBudgetOwnershipMigrated();
  const myKey=currentAuthorKey();
  const myRole=effectiveRole();
  const isDaughter=myRole==='daughter';
  const isMom=myRole==='mom';
  if(isDaughter) ensureDaughterWeeklyIncomePlaceholders();
  const myBudget=state.budget.filter(b=>b.owner===undefined || b.owner===myKey);
  const monthItems=myBudget.filter(b=>b.date.startsWith(budgetMonth));
  const items=monthItems.filter(b=>b.type!=='income').sort((a,b)=>b.date.localeCompare(a.date));
  const incomeItems=monthItems.filter(b=>b.type==='income').sort((a,b)=>b.date.localeCompare(a.date));
  const expenseByCur={KRW:0,GBP:0};
  items.forEach(b=>{ const cur=b.currency||'KRW'; expenseByCur[cur]=(expenseByCur[cur]||0)+Number(b.amount||0); });
  const incomeByCur={KRW:0,GBP:0};
  incomeItems.filter(b=>b.confirmed!==false).forEach(b=>{ const cur=b.currency||'KRW'; incomeByCur[cur]=(incomeByCur[cur]||0)+Number(b.amount||0); });
  const byCat={};
  items.filter(b=>(b.currency||'KRW')==='KRW').forEach(b=>{ byCat[b.category]=(byCat[b.category]||0)+Number(b.amount||0); });
  const [y,m]=budgetMonth.split('-');
  const monthBalanceKRW = incomeByCur.KRW - expenseByCur.KRW;
  const monthBalanceGBP = incomeByCur.GBP - expenseByCur.GBP;
  const allIncomeByCur={KRW:0,GBP:0};
  myBudget.filter(b=>b.type==='income' && b.confirmed!==false).forEach(b=>{ const cur=b.currency||'KRW'; allIncomeByCur[cur]=(allIncomeByCur[cur]||0)+Number(b.amount||0); });
  const allExpenseByCur={KRW:0,GBP:0};
  myBudget.filter(b=>b.type!=='income').forEach(b=>{ const cur=b.currency||'KRW'; allExpenseByCur[cur]=(allExpenseByCur[cur]||0)+Number(b.amount||0); });
  const carryover=budgetCarryoverFor(myKey);
  const totalBalanceKRW = carryover.KRW + allIncomeByCur.KRW - allExpenseByCur.KRW;
  const totalBalanceGBP = carryover.GBP + allIncomeByCur.GBP - allExpenseByCur.GBP;
  const pendingPayment = isMom ? weeklyPayableBreakdown() : null;
  const showPendingPayment = pendingPayment && !isWeeklyPaymentPaid(pendingPayment.weekStart);
  const weeklyPaymentIsPaid = pendingPayment && isWeeklyPaymentPaid(pendingPayment.weekStart);
  el.innerHTML=`
    <div class="card">
      <div class="datebar"><button class="iconbtn" id="bPrev">‹</button><div class="d">${y}년 ${Number(m)}월</div><button class="iconbtn" id="bNext">›</button></div>
      <div class="stat-grid">
        <div class="stat"><div class="v">${fmtCurrencyColored(expenseByCur.KRW,'KRW')}${expenseByCur.GBP?' / '+fmtCurrencyColored(expenseByCur.GBP,'GBP'):''}</div><div class="l">이번달 총 지출</div></div>
        <div class="stat"><div class="v">${fmtCurrencyColored(incomeByCur.KRW,'KRW')}${incomeByCur.GBP?' / '+fmtCurrencyColored(incomeByCur.GBP,'GBP'):''}</div><div class="l">이번달 총 수입</div></div>
        <div class="stat"><div class="v">${fmtCurrencyColored(monthBalanceKRW,'KRW')}${monthBalanceGBP?' / '+fmtCurrencyColored(monthBalanceGBP,'GBP'):''}</div><div class="l">이번달 잔액</div></div>
        <div class="stat" id="totalBalanceStat" style="cursor:pointer;" title="클릭해서 전월 이월 금액 입력"><div class="v">${fmtCurrencyColored(totalBalanceKRW,'KRW')}${totalBalanceGBP?' / '+fmtCurrencyColored(totalBalanceGBP,'GBP'):''}</div><div class="l">총잔액(전월 이월 포함)</div></div>
      </div>
    </div>
    ${isDaughter?renderIncomeEstimateCard():''}
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">💰 수입</h3>
        <div class="row"><button class="btn small" id="manageIncCatBtn">카테고리 관리</button><button class="btn primary small" id="addIncomeBtn">+ 수입 추가</button></div>
      </div>
      ${incomeItems.length? incomeItems.map(b=>`
        <div class="list-item">
          <div><div><span class="pill">${escapeHtml(b.category)}</span> ${escapeHtml(b.memo)}</div><div class="meta">${b.date}${b.confirmed===false?' · 입금 전':''}</div></div>
          <div class="row"><b>${fmtCurrency(b.amount,b.currency||'KRW')}</b>
            <button class="btn small ${b.confirmed===false?'primary':''}" data-edit-inc="${b.id}">${b.confirmed===false?'입금확정':'수정'}</button><button class="btn small danger" data-del-inc="${b.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">이번달 수입 내역이 없어요</div>`}
    </div>
    <div class="card">
      <h3>지출 카테고리별</h3>
      ${Object.keys(byCat).length? Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
        <div class="bar-row"><span style="width:70px;">${c}</span><div class="bar-track"><div class="bar-fill" style="width:${expenseByCur.KRW?Math.round(v/expenseByCur.KRW*100):0}%"></div></div><span style="width:80px;text-align:right;">${v.toLocaleString()}원</span></div>
      `).join('') : `<div class="empty">지출 내역이 없어요</div>`}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">지출 내역</h3>
        <div class="row"><button class="btn small" id="manageCatBtn">카테고리 관리</button><button class="btn primary small" id="addBudgetBtn">+ 지출 추가</button></div>
      </div>
      ${showPendingPayment?`
        <div class="list-item sched-item" style="margin:12px 0;">
          <div><div class="content-text"><b>딸 주급 (${pendingPayment.weekStart.slice(5)}~${pendingPayment.weekEnd.slice(5)})</b></div><div class="meta" style="margin-top:2px;">토스 ₩${pendingPayment.krw.toLocaleString()} · 로이드 £${pendingPayment.gbpAllowance} · 인센티브 £${pendingPayment.gbpIncentive.toFixed(2)}</div></div>
          <button class="btn small primary" id="markWeeklyPaidBtn">지급하시겠습니까?</button>
        </div>`:''}
      ${weeklyPaymentIsPaid?`
        <div class="list-item sched-item" style="margin:12px 0;">
          <div><div class="content-text"><b>딸 주급 (${pendingPayment.weekStart.slice(5)}~${pendingPayment.weekEnd.slice(5)})</b></div><div class="meta" style="margin-top:2px;color:var(--good);">✅ 지급완료</div></div>
          <div class="row"><button class="btn small" id="editWeeklyPaidBtn">수정</button><button class="btn small danger" id="revertWeeklyPaidBtn">지급전으로 되돌리기</button></div>
        </div>`:''}
      ${items.length? items.map(b=>`
        <div class="list-item">
          <div><div><span class="pill">${b.category}</span> ${escapeHtml(b.memo)}</div><div class="meta">${b.date}</div></div>
          <div class="row"><b>${fmtCurrency(b.amount,b.currency||'KRW')}</b>
            <button class="btn small" data-edit="${b.id}">수정</button><button class="btn small danger" data-del="${b.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">이번달 지출 내역이 없어요</div>`}
    </div>
  `;
  document.getElementById('bPrev').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,-1); renderBudget(); };
  document.getElementById('bNext').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,1); renderBudget(); };
  document.getElementById('totalBalanceStat').onclick=()=>openCarryoverModal();
  const markWeeklyPaidBtn=document.getElementById('markWeeklyPaidBtn');
  if(markWeeklyPaidBtn) markWeeklyPaidBtn.onclick=()=>{ markWeeklyPaymentPaid(); renderBudget(); };
  const editWeeklyPaidBtn=document.getElementById('editWeeklyPaidBtn');
  if(editWeeklyPaidBtn) editWeeklyPaidBtn.onclick=()=>openWeeklyPaymentEditModal(pendingPayment.weekStart);
  const revertWeeklyPaidBtn=document.getElementById('revertWeeklyPaidBtn');
  if(revertWeeklyPaidBtn) revertWeeklyPaidBtn.onclick=()=>{
    if(confirm('지급완료를 취소하고 지급전 상태로 되돌릴까요? 자동 생성된 지출 내역도 함께 삭제돼요.')){
      revertWeeklyPayment(pendingPayment.weekStart); renderBudget();
    }
  };
  document.getElementById('addBudgetBtn').onclick=()=>openBudgetModal();
  document.getElementById('manageCatBtn').onclick=()=>openCategoryManageModal();
  document.getElementById('addIncomeBtn').onclick=()=>openIncomeModal();
  document.getElementById('manageIncCatBtn').onclick=()=>openIncomeCategoryManageModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openBudgetModal(state.budget.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.del); queueSave(); renderBudget(); renderHome(); }
  });
  el.querySelectorAll('[data-edit-inc]').forEach(b=>b.onclick=()=>openIncomeModal(state.budget.find(x=>x.id===b.dataset.editInc)));
  el.querySelectorAll('[data-del-inc]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.delInc); queueSave(); renderBudget(); renderHome(); }
  });
}
function openCategoryManageModal(){
  const cats=myBudgetCategories();
  openModal(`
    <h3>내 카테고리 관리</h3>
    <div class="meta" style="margin-bottom:10px;">여기서 관리하는 카테고리는 지금 로그인한 계정에만 적용돼요.</div>
    ${cats.map(c=>{
      const cnt=state.budget.filter(x=>x.category===c && x.type!=='income').length;
      return `<div class="list-item"><div>${escapeHtml(c)}${cnt?` <span class="meta">(${cnt}건 사용중)</span>`:''}</div><button class="btn small danger" data-del-cat="${escapeHtml(c)}">삭제</button></div>`;
    }).join('')}
    <div class="row" style="margin-top:12px;">
      <div class="field" style="margin:0;"><input id="newCatInput" placeholder="새 카테고리 이름"></div>
      <button class="btn primary small" id="addCatBtn">추가</button>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">닫기</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('addCatBtn').onclick=()=>{
    const v=document.getElementById('newCatInput').value.trim();
    if(!v) return;
    const list=myBudgetCategories();
    if(list.includes(v)){ showToast('이미 있는 카테고리예요'); return; }
    list.push(v);
    queueSave(); openCategoryManageModal();
  };
  document.querySelectorAll('[data-del-cat]').forEach(b=>b.onclick=()=>{
    const cat=b.dataset.delCat;
    const cnt=state.budget.filter(x=>x.category===cat && x.type!=='income').length;
    const msg = cnt>0 ? `"${cat}" 카테고리를 사용한 지출 내역이 ${cnt}건 있어요. 그래도 내 카테고리 목록에서 삭제할까요? (기존 지출 내역은 그대로 유지돼요)` : `"${cat}" 카테고리를 삭제할까요?`;
    if(!confirm(msg)) return;
    const list=myBudgetCategories();
    const idx=list.indexOf(cat);
    if(idx>=0) list.splice(idx,1);
    queueSave(); openCategoryManageModal();
  });
}
function shiftMonth(ym, delta){
  let [y,m]=ym.split('-').map(Number);
  m+=delta;
  if(m<1){m=12;y--;} if(m>12){m=1;y++;}
  return `${y}-${pad2(m)}`;
}
function openBudgetModal(existing){
  const myCats=myBudgetCategories();
  const b=existing||{id:null,date:budgetMonth+'-'+pad2(new Date().getDate()),category:myCats[0]||'기타',amount:'',currency:'KRW',memo:''};
  const catOptions = myCats.includes(b.category) ? myCats : myCats.concat([b.category]);
  openModal(`
    <h3>${existing?'지출 수정':'지출 추가'}</h3>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${b.date}"></div>
    <div class="field"><label>카테고리</label><select id="mCat">${catOptions.map(c=>`<option ${c===b.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></div>
    <div class="grid2">
      <div class="field"><label>금액</label><input type="number" id="mAmount" value="${b.amount}"></div>
      <div class="field"><label>통화</label><select id="mCurrency"><option value="KRW" ${(b.currency||'KRW')==='KRW'?'selected':''}>원 (KRW)</option><option value="GBP" ${b.currency==='GBP'?'selected':''}>£ (GBP)</option></select></div>
    </div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(b.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const amount=Number(document.getElementById('mAmount').value||0);
    if(!date||!amount){ showToast('날짜와 금액을 입력해주세요'); return; }
    const rec={...b,id:b.id||uid(),date,category:document.getElementById('mCat').value,amount,currency:document.getElementById('mCurrency').value,memo:document.getElementById('mMemo').value,owner:b.owner||currentAuthorKey()};
    if(b.id){ const idx=state.budget.findIndex(x=>x.id===b.id); state.budget[idx]=rec; }
    else state.budget.push(rec);
    budgetMonth=date.slice(0,7);
    queueSave(); closeModal(); renderBudget(); renderHome();
  };
}
function incomeCategoryDefaults(key, category){
  if(category==='주급(토스)') return {amount:WEEKLY_ALLOWANCE_KRW, currency:'KRW', memo:''};
  if(category==='주급(로이드)') return {amount:WEEKLY_ALLOWANCE_GBP, currency:'GBP', memo:''};
  if(category==='학습·운동 인센티브'){
    const lastWeek=mondayWeekRange(fmtDate(addDays(parseDate(todayStr()),-7)));
    const min=weekActivityMinutes(key, lastWeek);
    const gbp=Math.round((min/60)*2*100)/100;
    return {amount:gbp, currency:'GBP', memo:`지난주 ${pad2(Math.floor(min/60))}시 ${pad2(min%60)}분 달성! 💗`};
  }
  return null;
}
function openIncomeModal(existing){
  const myCats=myIncomeCategories();
  const isConfirmStep = !!(existing && existing.confirmed===false);
  const b=existing||{id:null,date:budgetMonth+'-'+pad2(new Date().getDate()),category:myCats[0]||'기타',amount:'',currency:'KRW',memo:''};
  const catOptions = myCats.includes(b.category) ? myCats : myCats.concat([b.category]);
  if(!existing){
    const d=incomeCategoryDefaults(currentAuthorKey(), b.category);
    if(d){ b.amount=d.amount; b.currency=d.currency; b.memo=d.memo; }
  }
  openModal(`
    <h3>${isConfirmStep?'입금 확정':(existing?'수입 수정':'수입 추가')}</h3>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${b.date}"></div>
    <div class="field"><label>카테고리</label><select id="mCat">${catOptions.map(c=>`<option ${c===b.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></div>
    <div class="grid2">
      <div class="field"><label>금액</label><input type="number" id="mAmount" value="${b.amount}"></div>
      <div class="field"><label>통화</label><select id="mCurrency"><option value="KRW" ${(b.currency||'KRW')==='KRW'?'selected':''}>원 (KRW)</option><option value="GBP" ${b.currency==='GBP'?'selected':''}>£ (GBP)</option></select></div>
    </div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(b.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">${isConfirmStep?'입금확정':'저장'}</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  if(!existing){
    document.getElementById('mCat').addEventListener('change', e=>{
      const d=incomeCategoryDefaults(currentAuthorKey(), e.target.value);
      if(d){
        document.getElementById('mAmount').value=d.amount;
        document.getElementById('mCurrency').value=d.currency;
        document.getElementById('mMemo').value=d.memo;
      }
    });
  }
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const amount=Number(document.getElementById('mAmount').value||0);
    if(!date||!amount){ showToast('날짜와 금액을 입력해주세요'); return; }
    const rec={...b,id:b.id||uid(),date,category:document.getElementById('mCat').value,amount,currency:document.getElementById('mCurrency').value,memo:document.getElementById('mMemo').value,type:'income',owner:b.owner||currentAuthorKey()};
    if(isConfirmStep) rec.confirmed=true;
    if(b.id){ const idx=state.budget.findIndex(x=>x.id===b.id); state.budget[idx]=rec; }
    else state.budget.push(rec);
    budgetMonth=date.slice(0,7);
    queueSave(); closeModal(); renderBudget(); renderHome();
  };
}
function openIncomeCategoryManageModal(){
  const cats=myIncomeCategories();
  openModal(`
    <h3>내 수입 카테고리 관리</h3>
    <div class="meta" style="margin-bottom:10px;">여기서 관리하는 카테고리는 지금 로그인한 계정에만 적용돼요.</div>
    ${cats.map(c=>{
      const cnt=state.budget.filter(x=>x.type==='income' && x.category===c).length;
      return `<div class="list-item"><div>${escapeHtml(c)}${cnt?` <span class="meta">(${cnt}건 사용중)</span>`:''}</div><button class="btn small danger" data-del-inccat="${escapeHtml(c)}">삭제</button></div>`;
    }).join('')}
    <div class="row" style="margin-top:12px;">
      <div class="field" style="margin:0;"><input id="newIncCatInput" placeholder="새 카테고리 이름"></div>
      <button class="btn primary small" id="addIncCatBtn">추가</button>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">닫기</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('addIncCatBtn').onclick=()=>{
    const v=document.getElementById('newIncCatInput').value.trim();
    if(!v) return;
    const list=myIncomeCategories();
    if(list.includes(v)){ showToast('이미 있는 카테고리예요'); return; }
    list.push(v);
    queueSave(); openIncomeCategoryManageModal();
  };
  document.querySelectorAll('[data-del-inccat]').forEach(b=>b.onclick=()=>{
    const cat=b.dataset.delInccat;
    const cnt=state.budget.filter(x=>x.type==='income' && x.category===cat).length;
    const msg = cnt>0 ? `"${cat}" 카테고리를 사용한 수입 내역이 ${cnt}건 있어요. 그래도 내 카테고리 목록에서 삭제할까요? (기존 수입 내역은 그대로 유지돼요)` : `"${cat}" 카테고리를 삭제할까요?`;
    if(!confirm(msg)) return;
    const list=myIncomeCategories();
    const idx=list.indexOf(cat);
    if(idx>=0) list.splice(idx,1);
    queueSave(); openIncomeCategoryManageModal();
  });
}

/* ---------- GAMIFICATION ---------- */
function gamificationFlags(key){
  if(!state.gamification) state.gamification={};
  if(!state.gamification[key]) state.gamification[key]={studyHourMilestone:{}, weightGoalCelebrated:{target:false,finalTarget:false}, lastNudgeDate:''};
  if(!state.gamification[key].weightGoalCelebrated) state.gamification[key].weightGoalCelebrated={target:false,finalTarget:false};
  return state.gamification[key];
}
function celebrate(title, message){
  const logKey=effectiveRole()||currentAuthorKey();
  const sub = logKey==='daughter' ? '우리딸💗 정말 잘하고 있어요! 💪' : '정말 잘하고 있어요! 💪';
  if(logKey){
    if(!state.achievementLog) state.achievementLog={};
    if(!state.achievementLog[logKey]) state.achievementLog[logKey]=[];
    state.achievementLog[logKey].push({date:todayStr(), message, sub});
    if(state.achievementLog[logKey].length>20) state.achievementLog[logKey]=state.achievementLog[logKey].slice(-20);
    queueSave();
  }
  openModal(`
    <div style="text-align:center;padding:20px 10px;position:relative;overflow:hidden;">
      <div class="confetti-burst">${Array.from({length:24},(_,i)=>`<span class="confetti-piece" style="--i:${i};--hue:${(i*47)%360};"></span>`).join('')}</div>
      <div style="font-size:40px;">🎉</div>
      <h3 style="margin:10px 0 4px;">${title}</h3>
      <div style="font-size:14px;color:var(--text);">${message}</div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px;">${sub}</div>
      <button class="btn primary" style="margin-top:16px;" id="celebrateCloseBtn">좋아요!</button>
    </div>
  `);
  document.getElementById('celebrateCloseBtn').onclick=closeModal;
}
function encourageNudge(title, message){
  openModal(`
    <div style="text-align:center;padding:20px 10px;">
      <div style="font-size:36px;">💪</div>
      <h3 style="margin:10px 0 4px;">${title}</h3>
      <div style="font-size:14px;color:var(--text);">${message}</div>
      <button class="btn primary" style="margin-top:16px;" id="nudgeCloseBtn">알겠어요!</button>
    </div>
  `);
  document.getElementById('nudgeCloseBtn').onclick=closeModal;
}
function checkStudyHourMilestone(key, dateStr){
  const s=studySummary(studyBlocksFor(key,dateStr));
  const totalMin=s.study+s.exercise;
  const hours=Math.floor(totalMin/60);
  if(hours<1) return;
  const flags=gamificationFlags(key);
  const prevCelebrated=flags.studyHourMilestone[dateStr]||0;
  if(hours>prevCelebrated){
    flags.studyHourMilestone[dateStr]=hours;
    queueSave();
    celebrate('기록 달성! 🎉', `${dateStr===todayStr()?'오늘':dateStr} 학습·운동 ${hours}시간을 기록했어요!`);
  }
}
function checkWeightGoalReached(key, newWeight){
  const goals=weightGoalsFor(key);
  const flags=gamificationFlags(key);
  if(goals.target && Number(newWeight)<=Number(goals.target) && !flags.weightGoalCelebrated.target){
    flags.weightGoalCelebrated.target=true;
    queueSave();
    celebrate('1차 목표 달성! 🎯', `${memberLabel(key)} ${goals.target}kg 목표를 달성했어요!`);
    return;
  }
  if(goals.finalTarget && Number(newWeight)<=Number(goals.finalTarget) && !flags.weightGoalCelebrated.finalTarget){
    flags.weightGoalCelebrated.finalTarget=true;
    queueSave();
    celebrate('최종 목표 달성! 🏁', `${memberLabel(key)} 최종 목표 ${goals.finalTarget}kg 달성! 정말 대단해요!`);
  }
}
function weeklyWeightTrend(key){
  const today=todayStr();
  const weekAgo=fmtDate(addDays(parseDate(today),-7));
  const dates=Object.keys(state.daily)
    .filter(d=>d>=weekAgo && d<=today && state.daily[d].health && state.daily[d].health[key] && state.daily[d].health[key].weight)
    .sort();
  if(dates.length<2) return null;
  const startW=Number(state.daily[dates[0]].health[key].weight);
  const endW=Number(state.daily[dates[dates.length-1]].health[key].weight);
  return {changeGrams:(startW-endW)*1000};
}
function checkWeightPaceNudge(key){
  if(!key) return;
  const goals=weightGoalsFor(key);
  if(!goals.weeklyLoss) return;
  const flags=gamificationFlags(key);
  const today=todayStr();
  if(flags.lastNudgeDate===today) return;
  const trend=weeklyWeightTrend(key);
  if(!trend) return;
  flags.lastNudgeDate=today;
  queueSave();
  if(trend.changeGrams < Number(goals.weeklyLoss)*0.5){
    const changeText = trend.changeGrams>=0 ? Math.round(trend.changeGrams)+'g 감량' : Math.round(-trend.changeGrams)+'g 증가';
    encourageNudge('조금만 더 힘내요! 💪', `최근 일주일간 ${changeText}했어요. 목표(주당 ${goals.weeklyLoss}g 감량)까지 조금 더 힘내봐요!`);
  }
}
function currentStreak(key){
  let streakThroughYesterday=0;
  let d=fmtDate(addDays(parseDate(todayStr()),-1));
  while(true){
    const arr = state.studyBlocks && state.studyBlocks[key] && state.studyBlocks[key][d];
    const hasLog = arr && arr.some(v=>v!=='');
    if(!hasLog) break;
    streakThroughYesterday++;
    d=fmtDate(addDays(parseDate(d),-1));
  }
  const todayArr = state.studyBlocks && state.studyBlocks[key] && state.studyBlocks[key][todayStr()];
  const todayLogged = !!(todayArr && todayArr.some(v=>v!==''));
  return { streak: todayLogged ? streakThroughYesterday+1 : streakThroughYesterday, todayLogged };
}
function achievementLogHtml(){
  const key=effectiveRole()||currentAuthorKey();
  const log=(state.achievementLog && state.achievementLog[key]) || [];
  if(!log.length) return '';
  return `
    <div class="card">
      <h3>🎉 최근 성취</h3>
      ${log.slice(-5).reverse().map(e=>`
        <div class="list-item">
          <div><div class="content-text">${escapeHtml(e.message)}</div><div class="meta" style="margin-top:2px;">${escapeHtml(e.sub)}</div></div>
        </div>`).join('')}
    </div>
  `;
}

/* ---------- STUDY ---------- */
function studyBlocksFor(authorKey, dateStr){
  if(!state.studyBlocks) state.studyBlocks={};
  if(!state.studyBlocks[authorKey]) state.studyBlocks[authorKey]={};
  if(!state.studyBlocks[authorKey][dateStr]) state.studyBlocks[authorKey][dateStr]=new Array(144).fill('');
  return state.studyBlocks[authorKey][dateStr];
}
function studySummary(arr){
  let study=0, exercise=0;
  arr.forEach(v=>{ if(v==='study') study+=10; else if(v==='exercise') exercise+=10; });
  return {study, exercise};
}
function fmtStudyMin(min){ return `${Math.floor(min/60)}시간 ${min%60}분`; }
function weekRangeContaining(dateStr){
  const d=parseDate(dateStr);
  const start=addDays(d,-d.getDay());
  return Array.from({length:7},(_,i)=>fmtDate(addDays(start,i)));
}
function weekAgoLabel(i){
  if(i===0) return 'This Week';
  if(i===1) return 'Last Week';
  return `${i} Weeks Ago`;
}
function weeklyLogRows(key){
  const rows=[];
  let weekStart=weekRangeContaining(todayStr())[0];
  for(let i=0;i<8;i++){
    const weekDates=Array.from({length:7},(_,j)=>fmtDate(addDays(parseDate(weekStart),j)));
    const sum=weekDates.reduce((acc,d)=>{
      const s=studySummary(studyBlocksFor(key,d));
      acc.study+=s.study; acc.exercise+=s.exercise;
      return acc;
    },{study:0,exercise:0});
    if(i===0 || sum.study>0 || sum.exercise>0){
      rows.push({start:weekDates[0], end:weekDates[6], study:sum.study, exercise:sum.exercise});
    }
    weekStart=fmtDate(addDays(parseDate(weekStart),-7));
  }
  return rows;
}
function renderStudy(){
  const el=document.getElementById('tab-study');
  if(!el) return;
  const key=currentAuthorKey();
  const streakInfo=currentStreak(key);
  const dayCount=multiDayCount();
  const days=Array.from({length:dayCount},(_,i)=>dayCount-1-i).map(n=>fmtDate(addDays(parseDate(studyAnchor), -n)));
  const arrays=days.map(d=>studyBlocksFor(key,d));
  const summaries=arrays.map(studySummary);
  let rows='';
  for(let h=0; h<24; h++){
    const cells=days.map((d,di)=>{
      const gap=di>0?'<td class="dt-gap"></td>':'';
      let segs='';
      for(let s=0;s<6;s++){
        const idx=h*6+s;
        const val=arrays[di][idx];
        segs+=`<div class="sb-seg${val?' sb-'+val:''}" data-day="${di}" data-idx="${idx}"></div>`;
      }
      return gap+`<td class="sb-cell"><div class="sb-row">${segs}</div></td>`;
    }).join('');
    rows+=`<tr><td class="dt-time-col">${pad2(h)}:00</td>${cells}</tr>`;
  }
  const showNext = studyAnchor!==todayStr();
  const headCells=days.map((d,i)=>{
    const gap = i>0 ? '<th class="dt-gap"></th>' : '';
    const isFirst = i===0;
    const isLast = i===days.length-1;
    const dateText = headerDateHtml(d);
    const prevBtn = isFirst ? `<button class="iconbtn" id="studyPrevBtn" style="font-size:13px;width:20px;height:20px;flex-shrink:0;">◀</button>` : '';
    const nextBtn = (isLast && showNext) ? `<button class="iconbtn" id="studyNextBtn" style="font-size:13px;width:20px;height:20px;flex-shrink:0;">▶</button>` : '';
    const justify = isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center';
    return gap+`<th><div class="row" style="justify-content:${justify};flex-wrap:nowrap;gap:4px;">${prevBtn}${dateText}${nextBtn}</div></th>`;
  }).join('');
  const summaryCells=days.map((d,di)=>{
    const gap=di>0?'<td class="dt-gap"></td>':'';
    return gap+`<td class="sb-summary-cell">공부 ${fmtStudyMin(summaries[di].study)}<br>운동 ${fmtStudyMin(summaries[di].exercise)}</td>`;
  }).join('');
  const logRows=weeklyLogRows(key);
  el.innerHTML=`
    <div class="card">
      ${streakInfo.streak>0?`<div class="row" style="margin-bottom:8px;"><span class="pill" style="background:var(--panel2);">🔥 ${streakInfo.streak}일 연속 기록${!streakInfo.todayLogged?' (오늘 기록하면 갱신!)':''}</span></div>`:''}
      <div class="row" style="gap:10px;margin-bottom:10px;flex-wrap:wrap;justify-content:flex-end;">
        <span class="pill" style="background:${SB_COLORS.study};color:#3a2e00;border:none;">🟡 공부</span>
        <span class="pill" style="background:${SB_COLORS.exercise};color:#08321a;border:none;">🟢 운동</span>
        <span class="meta">칸을 눌러 색칠 (공부 → 운동 → 지우기)</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="dt-table sb-table">
          <thead><tr><th class="dt-time-col"></th>${headCells}</tr></thead>
          <tbody>
            <tr class="sb-summary-row"><td class="dt-time-col"></td>${summaryCells}</tr>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tbody>
            ${logRows.map((w,i)=>{
              const range=`(${w.start.slice(5)} ~ ${w.end.slice(5)})`;
              const total=fmtStudyMin(w.study+w.exercise);
              const studyT=fmtStudyMin(w.study), exT=fmtStudyMin(w.exercise);
              const detailCell = isMobileViewport()
                ? `<div>${range} 총 ${total}</div><div style="color:var(--muted);">(학습 ${studyT} / 운동 ${exT})</div>`
                : `<b>${range} 총 ${total}</b> (<span style="color:${SB_COLORS.study};">학습 ${studyT}</span> / <span style="color:${SB_COLORS.exercise};">운동 ${exT}</span>)`;
              return `
              <tr>
                <td style="width:18px;padding:4px 2px 4px 0;vertical-align:top;">${i===0?'📅':''}</td>
                <td style="white-space:nowrap;padding:4px 10px 4px 0;font-weight:${i===0?'700':'400'};color:${i===0?'var(--text)':'var(--muted)'};vertical-align:top;">${weekAgoLabel(i)}</td>
                <td style="padding:4px 0;white-space:nowrap;">${detailCell}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  el.querySelectorAll('.sb-seg').forEach(seg=>{
    seg.addEventListener('click', ()=>{
      const di=Number(seg.dataset.day), idx=Number(seg.dataset.idx);
      const arr=arrays[di];
      const cur=arr[idx];
      arr[idx] = cur==='' ? 'study' : cur==='study' ? 'exercise' : '';
      queueSave();
      checkStudyHourMilestone(key, days[di]);
      renderStudy();
    });
  });
  document.getElementById('studyPrevBtn').onclick=()=>{
    studyAnchor=fmtDate(addDays(parseDate(studyAnchor),-1));
    renderStudy();
  };
  const nextBtn=document.getElementById('studyNextBtn');
  if(nextBtn) nextBtn.onclick=()=>{
    studyAnchor=fmtDate(addDays(parseDate(studyAnchor),1));
    if(studyAnchor>todayStr()) studyAnchor=todayStr();
    renderStudy();
  };
}

/* ---------- VEHICLE ---------- */
let maintHistoryOpen=false;
function renderVehicle(){
  const el=document.getElementById('tab-vehicle');
  const v=state.vehicle;
  const renewals=v.renewals.map(r=>({...r,d:dday(r.date)})).sort((a,b)=>a.d-b.d);
  const maintSorted=[...v.maint].sort((a,b)=>b.date.localeCompare(a.date));
  const maintRows=MAINT_ITEMS.map(item=>{
    const records=v.maint.filter(mt=>mt.item===item).sort((a,b)=>b.date.localeCompare(a.date));
    return {item, latest:records[0]};
  });
  el.innerHTML=`
    <div class="card">
      <h3>🚗 차량 정보</h3>
      <div class="grid2">
        <div class="field"><label>차종/모델</label><input id="vModel" value="${escapeHtml(v.model)}"></div>
        <div class="field"><label>번호판</label><input id="vPlate" value="${escapeHtml(v.plate)}"></div>
      </div>
      <div class="grid2" style="margin-top:10px;">
        <div class="field"><label>차량등록일</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="vRegDate" value="${v.regDate||''}"></div>
        <div class="field"><label>타이어 사이즈</label><input id="vTireSize" value="${escapeHtml(v.tireSize)}" placeholder="예: 225/55R18"></div>
      </div>
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">⏰ 갱신·만기 알림</h3><button class="btn primary small" id="addRenewBtn">+ 추가</button></div>
      ${renewals.length? renewals.map(r=>`
        <div class="list-item">
          <div><div>${escapeHtml(r.name)}</div><div class="meta">${r.date}${r.memo?' · '+escapeHtml(r.memo):''}</div></div>
          <div class="row"><span class="pill ${ddayPillClass(r.d)}">${ddayLabel(r.d)}</span>
            <button class="btn small" data-edit-renew="${r.id}">수정</button><button class="btn small danger" data-del-renew="${r.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">보험/자동차세/정기검사 만기일을 등록해보세요</div>`}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🔧 정비 기록</h3><button class="btn primary small" id="addMaintBtn">+ 추가</button></div>
      <div style="overflow-x:auto;">
        <table class="maint-table">
          <thead><tr><th>점검항목</th><th>점검일시</th><th>주행거리</th><th>비용</th><th>비고</th><th>점검주기</th><th></th></tr></thead>
          <tbody>
            ${maintRows.map(({item,latest})=>`
              <tr>
                <td>${escapeHtml(item)}</td>
                <td>${latest?shortDate(latest.date):'-'}</td>
                <td>${latest&&latest.odo?Number(latest.odo).toLocaleString()+'km':'-'}</td>
                <td>${latest&&latest.cost?Number(latest.cost).toLocaleString()+'원':'-'}</td>
                <td class="wrap">${latest?(escapeHtml([latest.place,latest.memo].filter(Boolean).join(' · '))||'-'):'-'}</td>
                <td><input class="cycle-input" data-cycle-item="${escapeHtml(item)}" value="${escapeHtml((v.maintCycle||{})[item]||'')}" placeholder="예: 6개월"></td>
                <td><button class="icon-btn" data-maint-item="${escapeHtml(item)}" title="기록 추가/수정">✏️</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${maintSorted.length?`<button class="link-btn" id="toggleMaintHistory" style="margin-top:10px;">${maintHistoryOpen?'전체 이력 접기':`전체 이력 보기 (${maintSorted.length}건)`}</button>`:''}
      ${maintHistoryOpen? maintSorted.map(mt=>`
        <div class="list-item">
          <div><div>${escapeHtml(mt.item)}${mt.cost?' · '+Number(mt.cost).toLocaleString()+'원':''}</div><div class="meta">${mt.date}${mt.odo?' · '+Number(mt.odo).toLocaleString()+'km':''}${mt.place?' · '+escapeHtml(mt.place):''}${mt.memo?' · '+escapeHtml(mt.memo):''}</div></div>
          <div class="row"><button class="btn small" data-edit-maint="${mt.id}">수정</button><button class="btn small danger" data-del-maint="${mt.id}">삭제</button></div>
        </div>`).join('') : ''}
    </div>
  `;
  document.getElementById('vModel').addEventListener('change',e=>{ state.vehicle.model=e.target.value; queueSave(); });
  document.getElementById('vPlate').addEventListener('change',e=>{ state.vehicle.plate=e.target.value; queueSave(); });
  document.getElementById('vRegDate').addEventListener('change',e=>{ state.vehicle.regDate=e.target.value; queueSave(); renderVehicle(); });
  attachDatePicker('vRegDate');
  document.getElementById('vTireSize').addEventListener('change',e=>{ state.vehicle.tireSize=e.target.value; queueSave(); });
  document.getElementById('addRenewBtn').onclick=()=>openRenewModal();
  el.querySelectorAll('[data-edit-renew]').forEach(b=>b.onclick=()=>openRenewModal(v.renewals.find(x=>x.id===b.dataset.editRenew)));
  el.querySelectorAll('[data-del-renew]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.renewals=v.renewals.filter(x=>x.id!==b.dataset.delRenew); queueSave(); renderVehicle(); renderHome(); } });
  document.getElementById('addMaintBtn').onclick=()=>openMaintModal();
  el.querySelectorAll('[data-edit-maint]').forEach(b=>b.onclick=()=>openMaintModal(v.maint.find(x=>x.id===b.dataset.editMaint)));
  el.querySelectorAll('[data-del-maint]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.maint=v.maint.filter(x=>x.id!==b.dataset.delMaint); queueSave(); renderVehicle(); } });
  const toggleBtn=document.getElementById('toggleMaintHistory');
  if(toggleBtn) toggleBtn.onclick=()=>{ maintHistoryOpen=!maintHistoryOpen; renderVehicle(); };
  el.querySelectorAll('[data-maint-item]').forEach(b=>b.onclick=()=>{
    const item=b.dataset.maintItem;
    const records=v.maint.filter(mt=>mt.item===item).sort((a,b)=>b.date.localeCompare(a.date));
    if(records.length) openMaintModal(records[0]);
    else openMaintModal({id:null,date:todayStr(),item,place:'',cost:'',odo:'',memo:''});
  });
  el.querySelectorAll('[data-cycle-item]').forEach(inp=>inp.addEventListener('change',e=>{
    if(!state.vehicle.maintCycle) state.vehicle.maintCycle={};
    state.vehicle.maintCycle[e.target.dataset.cycleItem]=e.target.value;
    queueSave();
  }));
}
function openRenewModal(existing){
  const r=existing||{id:null,name:'',date:todayStr(),memo:''};
  openModal(`
    <h3>${existing?'만기 알림 수정':'만기 알림 추가'}</h3>
    <div class="field"><label>항목명 (예: 자동차보험, 자동차세, 정기검사)</label><input id="mName" value="${escapeHtml(r.name)}"></div>
    <div class="field"><label>만기일</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${r.date}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(r.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mName').value.trim();
    const date=document.getElementById('mDate').value;
    if(!name||!date){ showToast('항목명과 날짜를 입력해주세요'); return; }
    const rec={id:r.id||uid(),name,date,memo:document.getElementById('mMemo').value};
    if(r.id){ const idx=state.vehicle.renewals.findIndex(x=>x.id===r.id); state.vehicle.renewals[idx]=rec; }
    else state.vehicle.renewals.push(rec);
    queueSave(); closeModal(); renderVehicle(); renderHome();
  };
}
function openMaintModal(existing){
  const mt=existing||{id:null,date:todayStr(),item:MAINT_ITEMS[0],place:'',cost:'',odo:'',memo:''};
  openModal(`
    <h3>${existing?'정비 기록 수정':'정비 기록 추가'}</h3>
    <div class="field"><label>점검 항목</label><select id="mItem">${MAINT_ITEMS.map(i=>`<option ${i===mt.item?'selected':''}>${i}</option>`).join('')}</select></div>
    <div class="grid2">
      <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${mt.date}"></div>
      <div class="field"><label>주행거리 (km, 선택)</label><input type="number" id="mOdo" value="${mt.odo}"></div>
    </div>
    <div class="grid2">
      <div class="field"><label>점검 장소 (선택)</label><input id="mPlace" value="${escapeHtml(mt.place)}" placeholder="예: 형주카센터"></div>
      <div class="field"><label>비용 (선택)</label><input type="number" id="mCost" value="${mt.cost}"></div>
    </div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(mt.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const item=document.getElementById('mItem').value;
    if(!date||!item){ showToast('날짜와 점검 항목을 입력해주세요'); return; }
    const rec={id:mt.id||uid(),date,item,place:document.getElementById('mPlace').value,cost:document.getElementById('mCost').value,odo:document.getElementById('mOdo').value,memo:document.getElementById('mMemo').value};
    if(mt.id){ const idx=state.vehicle.maint.findIndex(x=>x.id===mt.id); state.vehicle.maint[idx]=rec; }
    else state.vehicle.maint.push(rec);
    queueSave(); closeModal(); renderVehicle();
  };
}

/* ---------- EVENTS (경조사) ---------- */
function renderEvents(){
  const el=document.getElementById('tab-events');
  const withD = state.events.map(ev=>({...ev, d: ddayFromDate(eventOccurrence(ev))}));
  const upcoming = withD.filter(e=>e.d>=0).sort((a,b)=>a.d-b.d);
  const past = withD.filter(e=>e.d<0).sort((a,b)=>b.d-a.d);
  const row = ev => `
    <div class="list-item" style="align-items:center;">
      <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <b>${escapeHtml(ev.name)}</b>
        <span class="meta">${ev.lunar?`음력 ${ev.lunarMonth}/${ev.lunarDay}${ev.lunarLeap?'(윤)':''}`:ev.date}${ev.recurring?' (매년)':''}${ev.hiddenFromDaughter?' 🙈':''}${ev.memo?' · '+escapeHtml(ev.memo):''}</span>
      </div>
      <div class="row" style="flex-wrap:nowrap;flex-shrink:0;">
        <span class="pill ${ddayPillClass(ev.d)}">${ddayLabel(ev.d)}</span>
        <button class="btn small" data-edit="${ev.id}">수정</button><button class="btn small danger" data-del="${ev.id}">삭제</button>
      </div>
    </div>`;
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🎉 다가오는 경조사</h3><button class="btn primary small" id="addEventBtn">+ 추가</button></div>
      ${upcoming.length? upcoming.map(row).join('') : `<div class="empty">예정된 경조사가 없어요</div>`}
    </div>
    ${past.length?`<div class="card"><h3>지난 경조사</h3>${past.map(row).join('')}</div>`:''}
  `;
  document.getElementById('addEventBtn').onclick=()=>openEventModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEventModal(state.events.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.events=state.events.filter(x=>x.id!==b.dataset.del); queueSave(); renderEvents(); renderHome(); renderSchedule(); }
  });
}
function openEventModal(existing){
  const ev=existing||{id:null,name:'',date:todayStr(),recurring:true,memo:'',lunar:false,lunarYear:new Date().getFullYear(),lunarMonth:'',lunarDay:'',lunarLeap:false,hiddenFromDaughter:false};
  openModal(`
    <h3>${existing?'경조사 수정':'경조사 추가'}</h3>
    <div class="field"><label>이름</label><input id="mName" value="${escapeHtml(ev.name)}"></div>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mLunar" ${ev.lunar?'checked':''} style="margin-right:4px;">음력 날짜</label>
    <div class="field" id="solarDateWrap" style="${ev.lunar?'display:none':''}">
      <label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${ev.date}">
    </div>
    <div id="lunarDateWrap" style="${ev.lunar?'':'display:none'}">
      <div class="grid2">
        <div class="field"><label>음력 년</label><input type="number" id="mLYear" value="${ev.lunarYear||new Date().getFullYear()}"></div>
        <div class="field"><label>음력 월</label><input type="number" id="mLMonth" min="1" max="12" value="${ev.lunarMonth||''}"></div>
      </div>
      <div class="grid2">
        <div class="field"><label>음력 일</label><input type="number" id="mLDay" min="1" max="30" value="${ev.lunarDay||''}"></div>
        <div class="field"><label>&nbsp;</label><label class="pill" style="cursor:pointer;"><input type="checkbox" id="mLeap" ${ev.lunarLeap?'checked':''} style="margin-right:4px;">윤달</label></div>
      </div>
    </div>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mRecurring" ${ev.recurring?'checked':''} style="margin-right:4px;">매년 반복 (생일/기념일)</label>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0 6px 6px;"><input type="checkbox" id="mHideDaughter" ${ev.hiddenFromDaughter?'checked':''} style="margin-right:4px;">🙈 딸에게 비공개</label>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(ev.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mLunar').addEventListener('change', e=>{
    document.getElementById('solarDateWrap').style.display = e.target.checked ? 'none' : '';
    document.getElementById('lunarDateWrap').style.display = e.target.checked ? '' : 'none';
  });
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mName').value.trim();
    const isLunar=document.getElementById('mLunar').checked;
    let date, lunarYear='', lunarMonth='', lunarDay='', lunarLeap=false;
    if(isLunar){
      lunarYear=Number(document.getElementById('mLYear').value);
      lunarMonth=Number(document.getElementById('mLMonth').value);
      lunarDay=Number(document.getElementById('mLDay').value);
      lunarLeap=document.getElementById('mLeap').checked;
      if(!name||!lunarYear||!lunarMonth||!lunarDay){ showToast('이름과 음력 날짜를 입력해주세요'); return; }
      const solar=lunar2solar(lunarYear,lunarMonth,lunarDay,lunarLeap);
      if(!solar){ showToast('음력 날짜를 변환할 수 없어요. 날짜를 확인해주세요'); return; }
      date=fmtDate(solar);
    } else {
      date=document.getElementById('mDate').value;
      if(!name||!date){ showToast('이름과 날짜를 입력해주세요'); return; }
    }
    const rec={id:ev.id||uid(),name,date,lunar:isLunar,lunarYear,lunarMonth,lunarDay,lunarLeap,recurring:document.getElementById('mRecurring').checked,hiddenFromDaughter:document.getElementById('mHideDaughter').checked,memo:document.getElementById('mMemo').value};
    if(ev.id){ const idx=state.events.findIndex(x=>x.id===ev.id); state.events[idx]=rec; }
    else state.events.push(rec);
    queueSave(); closeModal(); renderEvents(); renderHome(); renderSchedule();
  };
}

/* ---------- theme ---------- */
const THEME_KEY='ahha-family-theme';
function applyTheme(theme){
  if(theme==='light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  const btn=document.getElementById('themeToggle');
  if(btn) btn.textContent = theme==='light' ? '🌙' : '☀️';
}
function initTheme(){
  const saved=localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
  document.getElementById('themeToggle').addEventListener('click', ()=>{
    const cur=document.documentElement.getAttribute('data-theme')==='light' ? 'light' : 'dark';
    const next = cur==='light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

/* ---------- view-as (dev preview) ---------- */
function updateViewAsButtons(){
  const momBtn=document.getElementById('viewAsMomBtn');
  const daughterBtn=document.getElementById('viewAsDaughterBtn');
  const realRole = user ? EMAIL_ROLE[user.email] : null;
  const isDadOrGuest = !realRole || realRole==='dad';
  if(momBtn) momBtn.classList.toggle('active', viewAsOverride==='mom');
  if(daughterBtn) daughterBtn.classList.toggle('active', viewAsOverride==='daughter');
  if(!isDadOrGuest){
    if(momBtn) momBtn.style.display='none';
    if(daughterBtn) daughterBtn.style.display='none';
    return;
  }
  const isPreviewing = viewAsOverride==='daughter' || viewAsOverride==='mom';
  const authArea=document.getElementById('authArea');
  const themeToggle=document.getElementById('themeToggle');
  if(authArea) authArea.style.display = isPreviewing ? 'none' : '';
  if(themeToggle) themeToggle.style.display = isPreviewing ? 'none' : '';
  if(momBtn) momBtn.style.display = viewAsOverride==='daughter' ? 'none' : '';
  if(daughterBtn) daughterBtn.style.display = viewAsOverride==='mom' ? 'none' : '';
}
function setViewAs(role){
  viewAsOverride = viewAsOverride===role ? null : role;
  weightChartOthers=[];
  scheduleFilter='all';
  updateViewAsButtons();
  renderAll();
}
function initViewAs(){
  document.getElementById('viewAsMomBtn').addEventListener('click', ()=>setViewAs('mom'));
  document.getElementById('viewAsDaughterBtn').addEventListener('click', ()=>setViewAs('daughter'));
}
function bindShowCommonToggle(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.addEventListener('change', e=>{
    showCommonOnHome=e.target.checked;
    renderHome();
    renderSchedule();
  });
}
const FLAG_KR_SVG=`<svg width="18" height="13" viewBox="0 0 16 11" style="vertical-align:-2px;"><rect width="16" height="11" fill="#fff"/><circle cx="8" cy="5.5" r="3" fill="#c60c30"/><path d="M8 2.5a3 3 0 0 0 0 6 1.5 1.5 0 0 1 0-3 1.5 1.5 0 0 0 0-3z" fill="#003478"/></svg>`;
const FLAG_GB_SVG=`<svg width="18" height="13" viewBox="0 0 16 11" style="vertical-align:-2px;"><rect width="16" height="11" fill="#00247d"/><path d="M0,0 L16,11 M16,0 L0,11" stroke="#fff" stroke-width="2.2"/><path d="M0,0 L16,11 M16,0 L0,11" stroke="#cf142b" stroke-width="1.1"/><path d="M8,0 V11 M0,5.5 H16" stroke="#fff" stroke-width="3.6"/><path d="M8,0 V11 M0,5.5 H16" stroke="#cf142b" stroke-width="2.2"/></svg>`;
function updateWorldClock(){
  const el=document.getElementById('worldClock');
  if(!el) return;
  const now=new Date();
  const kr=now.toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
  const uk=now.toLocaleTimeString('ko-KR',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hour12:false});
  el.innerHTML = `${FLAG_GB_SVG} ${uk} · ${FLAG_KR_SVG} ${kr}`;
}

/* ---------- init ---------- */
function renderAll(){
  renderTabs();
  renderHome(); renderSchedule(); renderHealth(); renderBudget(); renderVehicle(); renderEvents(); renderStudy();
  if(!viewAsOverride) checkWeightPaceNudge(effectiveRole());
}
initTheme();
initViewAs();
initAuth();
updateWorldClock();
setInterval(updateWorldClock, 10000);
renderAll();
let lastMultiDayCount=multiDayCount();
let resizeTimer=null;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    const cur=multiDayCount();
    if(cur!==lastMultiDayCount){
      lastMultiDayCount=cur;
      renderHome();
      renderStudy();
      renderBudget();
    }
  }, 200);
});
