/* ---------- utils ---------- */
function isMobileViewport(){ return window.innerWidth <= 600; }
function multiDayCount(){ return isMobileViewport() ? 2 : 3; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function pad2(n){ return String(n).padStart(2,'0'); }
function nowTimeStr10(){
  const d=new Date();
  let h=d.getHours(), m=Math.round(d.getMinutes()/10)*10;
  if(m===60){ m=0; h=(h+1)%24; }
  return pad2(h)+':'+pad2(m);
}
const TIME10_MINUTES=['00','10','20','30','40','50'];
function snapMin10(m){ let s=Math.round((Number(m)||0)/10)*10; if(s>=60) s=0; return s; }
function to12Hour(h24){ let h12=h24%12; if(h12===0) h12=12; return {ampm: h24<12?'오전':'오후', h12}; }
function to24Hour(ampm, h12){ let h24=Number(h12)%12; if(ampm==='오후') h24+=12; return h24; }
function timeSelect10Html(id, value){
  const [hRaw,mRaw]=(value||'00:00').split(':');
  const {ampm,h12}=to12Hour(Number(hRaw)||0);
  const m=pad2(snapMin10(mRaw));
  const ampmOpts=['오전','오후'].map(a=>`<option value="${a}" ${a===ampm?'selected':''}>${a}</option>`).join('');
  const hourOpts=Array.from({length:12},(_,i)=>i+1).map(hh=>`<option value="${hh}" ${hh===h12?'selected':''}>${hh}</option>`).join('');
  const minOpts=TIME10_MINUTES.map(mm=>`<option value="${mm}" ${mm===m?'selected':''}>${mm}</option>`).join('');
  return `<span class="row time10-pair" style="gap:2px;flex:1;min-width:0;flex-wrap:nowrap;">
    <select id="${id}_ap" class="time10-select">${ampmOpts}</select><select id="${id}_h" class="time10-select">${hourOpts}</select><span>:</span><select id="${id}_m" class="time10-select">${minOpts}</select>
  </span>`;
}
function getTimeSelect10Value(id){
  const ap=document.getElementById(id+'_ap'), h=document.getElementById(id+'_h'), m=document.getElementById(id+'_m');
  return (ap && h && m) ? pad2(to24Hour(ap.value, h.value))+':'+m.value : '';
}
function setTimeSelect10Value(id, value){
  const [hRaw,mRaw]=(value||'00:00').split(':');
  const {ampm,h12}=to12Hour(Number(hRaw)||0);
  const apEl=document.getElementById(id+'_ap'), hEl=document.getElementById(id+'_h'), mEl=document.getElementById(id+'_m');
  if(apEl) apEl.value=ampm;
  if(hEl) hEl.value=String(h12);
  if(mEl) mEl.value=pad2(snapMin10(mRaw));
}
function bindTimeSelect10(id, onChange){
  ['_ap','_h','_m'].forEach(suf=>{
    const el=document.getElementById(id+suf);
    if(el) el.addEventListener('change', onChange);
  });
}
function fmtDate(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function fmtSlashMD(mmdd){ const [mm,dd]=mmdd.split('-').map(Number); return `${mm}/${dd}`; }
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
    healthSchedule:{dad:[],mom:[],daughter:[],couple:[]},
    budgetCategories:{},
    study:[],
    todos:{},
    studyBlocks:{},
    calendarDayColors:{},
    todoCategories:{},
    deletedIds:[],
    habits:{daily:[], weekly:[]},
    habitLog:{},
    monthNotes:{},
    letters:[],
    daughterActivity:[]
  };
}
function markDeleted(id){
  if(!id) return;
  if(!state.deletedIds) state.deletedIds=[];
  state.deletedIds.push(id);
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
  st.budget = (st.budget||[]).filter(b=>b.confirmed!==false);
  st.budget.forEach(b=>{
    if(b.paymentWeek && b.owner===undefined){
      if(b.type==='income'){ b.owner='daughter'; }
      else { b.owner='jinahkim2023@gmail.com'; }
    }
    if(b.category==='학습·운동 인센티브' && b.memo==='지난주 활동 기준') b.memo='';
    if(b.confirmed!==undefined) delete b.confirmed;
  });
  return st;
}
function migrateCalendarDayColors(st){
  if(!st.calendarDayColors) st.calendarDayColors={};
  Object.keys(st.calendarDayColors).forEach(k=>{
    if(typeof st.calendarDayColors[k]!=='object' || st.calendarDayColors[k]===null){
      delete st.calendarDayColors[k];
    }
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
      return migrateCalendarDayColors(resetWeeklyPaymentDataOnce(migrateBudgetOwnership(migrateTodos(migrateVehicle(migrateDaily(Object.assign(base, parsed, {vehicle:base.vehicle})))))));
    }
  }catch(e){}
  return defaultState();
}
let state=loadLocal();
let saveTimer=null;
let daughterSessionLogged=false;
let currentSessionActivityEntry=null;
const TAB_LOG_NAMES={home:'홈',schedule:'일정',health:'건강',budget:'가계부',study:'Learning'};
function activityContentFor(tab){
  try{
    const d=todayStr();
    const key=currentAuthorKey();
    if(tab==='schedule'){
      const arr=state.schedule||[];
      return arr.length ? arr[arr.length-1].title : '';
    }
    if(tab==='budget'){
      const arr=state.budget||[];
      if(!arr.length) return '';
      const b=arr[arr.length-1];
      return `${b.category||''} ${fmtCurrency(b.amount||0, b.currency||'KRW')}`.trim();
    }
    if(tab==='health'){
      const rec=((state.daily[d]||{}).health||{})[key] || {};
      if(rec.weight) return `체중 ${rec.weight}kg`;
      if(rec.symptom) return rec.symptom.slice(0,20);
      return '';
    }
    if(tab==='home'){
      const entries=((state.daily[d]||{}).entries)||{};
      const mine=entries[key]||{};
      return mine.diary ? mine.diary.slice(0,20) : '';
    }
    if(tab==='study'){
      const arr=(state.studyBlocks && state.studyBlocks[key] && state.studyBlocks[key][d]) || [];
      return arr.some(x=>x) ? '학습시간 기록' : '';
    }
  }catch(e){}
  return '';
}
function logDaughterActivity(){
  if(!(user && EMAIL_ROLE[user.email]==='daughter')) return;
  const now=new Date();
  const ts=`${pad2(now.getMonth()+1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  const tabName=TAB_LOG_NAMES[activeTab]||activeTab;
  const content=activityContentFor(activeTab);
  const desc = content ? `${tabName}탭 '${content}'` : `${tabName}탭 수정`;
  if(!state.daughterActivity) state.daughterActivity=[];
  if(!daughterSessionLogged){
    daughterSessionLogged=true;
    currentSessionActivityEntry={id:uid(), startTs:ts, startDesc:desc, endTs:ts, endDesc:desc};
    state.daughterActivity.unshift(currentSessionActivityEntry);
    state.daughterActivity=state.daughterActivity.slice(0,50);
  } else if(currentSessionActivityEntry){
    currentSessionActivityEntry.endTs=ts;
    currentSessionActivityEntry.endDesc=desc;
  }
}
function saveLocal(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){} }
function familyDocRef(){ return db.collection('shared').doc('family-state'); }
function queueSave(){
  logDaughterActivity();
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

function mergeById(localArr, cloudArr, deletedSet){
  const cloud=(cloudArr||[]).filter(x=>!(deletedSet && x && deletedSet.has(x.id)));
  const cloudIds=new Set(cloud.map(x=>x&&x.id));
  const onlyLocal=(localArr||[]).filter(x=>x && x.id && !cloudIds.has(x.id) && !(deletedSet && deletedSet.has(x.id)));
  return cloud.concat(onlyLocal);
}
function mergeKeyedArrays(localObj, cloudObj, deletedSet){
  const merged={};
  const keys=new Set([...Object.keys(localObj||{}), ...Object.keys(cloudObj||{})]);
  keys.forEach(k=>{ merged[k]=mergeById((localObj||{})[k], (cloudObj||{})[k], deletedSet); });
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
function mergeKeyedColorMaps(localObj, cloudObj){
  const merged={};
  const keys=new Set([...Object.keys(localObj||{}), ...Object.keys(cloudObj||{})]);
  keys.forEach(k=>{ merged[k]=Object.assign({}, (localObj||{})[k]||{}, (cloudObj||{})[k]||{}); });
  return merged;
}
function mergeTodoCategories(localObj, cloudObj){
  const merged={};
  const keys=new Set([...Object.keys(localObj||{}), ...Object.keys(cloudObj||{})]);
  keys.forEach(k=>{
    const cloudList=(cloudObj||{})[k]||[];
    const localList=(localObj||{})[k]||[];
    const names=new Set(cloudList.map(c=>c.name));
    merged[k]=cloudList.concat(localList.filter(c=>!names.has(c.name)));
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
function mergeVehicle(localV, cloudV, deletedSet){
  const merged=JSON.parse(JSON.stringify(cloudV||{}));
  merged.fuel=mergeById(localV&&localV.fuel, cloudV&&cloudV.fuel, deletedSet);
  merged.maint=mergeById(localV&&localV.maint, cloudV&&cloudV.maint, deletedSet);
  merged.renewals=mergeById(localV&&localV.renewals, cloudV&&cloudV.renewals, deletedSet);
  merged.maintCycle=Object.assign({}, (localV&&localV.maintCycle)||{}, (cloudV&&cloudV.maintCycle)||{});
  ['plate','model','regDate','tireSize'].forEach(f=>{
    if(!merged[f] && localV && localV[f]) merged[f]=localV[f];
  });
  return merged;
}
function mergeHabitLog(localLog, cloudLog){
  const merged=JSON.parse(JSON.stringify(cloudLog||{}));
  Object.keys(localLog||{}).forEach(id=>{
    if(!merged[id]) merged[id]={};
    Object.keys(localLog[id]).forEach(k=>{ if(merged[id][k]===undefined) merged[id][k]=localLog[id][k]; });
  });
  return merged;
}
function mergeStates(localState, cloudState){
  const merged=JSON.parse(JSON.stringify(cloudState));
  const deletedSet=new Set([...(localState.deletedIds||[]), ...(cloudState.deletedIds||[])]);
  merged.deletedIds=[...deletedSet];
  merged.schedule=mergeById(localState.schedule, cloudState.schedule, deletedSet);
  merged.budget=mergeById(localState.budget, cloudState.budget, deletedSet);
  merged.events=mergeById(localState.events, cloudState.events, deletedSet);
  merged.study=mergeById(localState.study, cloudState.study, deletedSet);
  merged.todos=mergeKeyedArrays(localState.todos, cloudState.todos, deletedSet);
  merged.healthSchedule=mergeKeyedArrays(localState.healthSchedule, cloudState.healthSchedule, deletedSet);
  merged.budgetCategories=mergeCategoryLists(localState.budgetCategories, cloudState.budgetCategories);
  merged.daily=mergeDaily(localState.daily, cloudState.daily);
  merged.studyBlocks=mergeStudyBlocks(localState.studyBlocks, cloudState.studyBlocks);
  merged.vehicle=mergeVehicle(localState.vehicle, cloudState.vehicle, deletedSet);
  merged.calendarDayColors=mergeKeyedColorMaps(localState.calendarDayColors, cloudState.calendarDayColors);
  merged.todoCategories=mergeTodoCategories(localState.todoCategories, cloudState.todoCategories);
  merged.habits={
    daily: mergeById(localState.habits&&localState.habits.daily, cloudState.habits&&cloudState.habits.daily, deletedSet),
    weekly: mergeById(localState.habits&&localState.habits.weekly, cloudState.habits&&cloudState.habits.weekly, deletedSet)
  };
  merged.habitLog=mergeHabitLog(localState.habitLog, cloudState.habitLog);
  merged.monthNotes=mergeKeyedColorMaps(localState.monthNotes, cloudState.monthNotes);
  merged.letters=mergeById(localState.letters, cloudState.letters, deletedSet);
  merged.daughterActivity=mergeById(localState.daughterActivity, cloudState.daughterActivity, deletedSet);
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
          const cloudState=migrateCalendarDayColors(resetWeeklyPaymentDataOnce(migrateBudgetOwnership(migrateTodos(migrateVehicle(migrateDaily(Object.assign(base, data, {vehicle:base.vehicle})))))));
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
  const modalEl=document.querySelector('.modal-bg .modal');
  modalEl.style.position='';
  modalEl.style.left='';
  modalEl.style.top='';
  modalEl.style.margin='';
  modalEl.scrollTop=0;
  document.getElementById('modalBg').classList.add('show');
}
function closeModal(){ document.getElementById('modalBg').classList.remove('show'); closeDatePicker(); }
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
(function initModalDrag(){
  const modalEl=document.querySelector('.modal-bg .modal');
  let dragging=false, startX=0, startY=0, startLeft=0, startTop=0;
  modalEl.addEventListener('pointerdown', e=>{
    if(e.pointerType!=='mouse') return;
    if(e.target.closest('button,input,textarea,select,label,a,.color-swatch')) return;
    dragging=true;
    const rect=modalEl.getBoundingClientRect();
    startLeft=rect.left; startTop=rect.top;
    startX=e.clientX; startY=e.clientY;
    modalEl.style.position='fixed';
    modalEl.style.margin='0';
    modalEl.style.left=startLeft+'px';
    modalEl.style.top=startTop+'px';
    modalEl.classList.add('dragging');
    modalEl.setPointerCapture(e.pointerId);
  });
  modalEl.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    let newLeft=startLeft+dx, newTop=startTop+dy;
    newLeft=Math.max(-modalEl.offsetWidth+60, Math.min(newLeft, window.innerWidth-60));
    newTop=Math.max(0, Math.min(newTop, window.innerHeight-40));
    modalEl.style.left=newLeft+'px';
    modalEl.style.top=newTop+'px';
  });
  const endDrag=e=>{ dragging=false; modalEl.classList.remove('dragging'); try{modalEl.releasePointerCapture(e.pointerId);}catch(_){} };
  modalEl.addEventListener('pointerup', endDrag);
  modalEl.addEventListener('pointercancel', endDrag);
})();

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
    {key:'home',label:'🏠',title:'Home'},
    {key:'schedule',label:'📅',title:'Calendar'},
    {key:'health',label:'🏃',title:'Health'},
    {key:'budget',label:'💰',title:'Budget'},
    {key:'vehicle',label:'🚗',title:'Vehicle'},
    {key:'events',label:'⏳',title:'D-day'}
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
const SCHED_COLORS=['rgba(255,173,173,0.55)','rgba(255,214,165,0.55)','rgba(202,255,191,0.55)','rgba(160,196,255,0.55)','rgba(189,178,255,0.55)'];
let scheduleColorPick=null;
let calendarColorPick=null;
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
const MOODS=['😊','🥰','🙂','😐','😫','😢','😠','🤒','😴','🥳'];
let diaryArchiveOpen=false;
let diaryArchiveIncludeFamily=false;
let letterViewMode=false;
function lettersRowsHtml(){
  const letters=(state.letters||[]).slice().reverse();
  if(!letters.length) return `<div class="empty">아직 받은 편지가 없어요</div>`;
  return letters.map(l=>`
    <div class="list-item">
      <div class="content-text" style="flex:1;min-width:0;white-space:normal;word-break:break-word;">${escapeHtml(l.date)} <span class="pill">${escapeHtml(l.fromLabel||'')}</span> ${escapeHtml(l.text)}</div>
    </div>`).join('');
}
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
const ROLE_EMOJI={dad:'🍷',mom:'💐',daughter:'🍼'};
const ROLE_BADGE_COLOR={dad:'#4d7fe0',mom:'#e0538f',daughter:'#9a5be0'};
function authorRoleOf(key){
  if(!key) return null;
  if(key==='daughter') return 'daughter';
  return EMAIL_ROLE[key] || null;
}
function authorBadge(key){
  const role=authorRoleOf(key);
  if(!role) return '';
  return `<span class="author-badge" style="background:#fff;border:1px solid rgba(0,0,0,0.15);">${ROLE_EMOJI[role]}</span>`;
}
function dtChip(it){
  const isVirtual = typeof it.id==='string' && it.id.startsWith('evt-');
  const memoAttr = it.memo ? ` data-memo="${escapeHtml(it.memo)}"` : '';
  if(isVirtual) return `<div class="dt-evt" data-virtual="1"${memoAttr}>${escapeHtml(it.title)}</div>`;
  const badge = authorBadge(it.createdBy);
  const commonCls = (!it.color && it.owner==='common') ? ' dt-evt-common' : '';
  const colorAttr = it.color ? ` style="background:${it.color};color:#181820;"` : '';
  return `<div class="dt-evt${commonCls}" draggable="true" data-item-id="${it.id}"${memoAttr}${colorAttr}>${badge}${timeRangeLabel(it)?escapeHtml(timeRangeLabel(it))+' ':''}${escapeHtml(it.title)}</div>`;
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
let momHomeDefaultsApplied=false;
let momWeightDefaultsApplied=false;
let daughterWeightDefaultsApplied=false;
let studyAnchor=todayStr();
function resolveItemColors(s, dateStr){
  const ov=s.colorOverrides && s.colorOverrides[dateStr];
  return {
    color: (ov && ov.color!==undefined) ? ov.color : s.color,
    bgColor: (ov && ov.bgColor!==undefined) ? ov.bgColor : s.bgColor
  };
}
function myHomeVisibleScheduleItems(dateStr){
  const role=effectiveRole();
  const virtualEventItems=state.events
    .filter(ev=>!(ev.hiddenFromDaughter && role==='daughter'))
    .map(ev=>({id:'evt-'+ev.id, date:fmtDate(eventOccurrence(ev)), time:'', title:'🎉 '+ev.name, owner:'common'}));
  const allItems=state.schedule.map(s=>({...s, owner:s.owner||'common', ...resolveItemColors(s,dateStr)})).concat(virtualEventItems);
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
  const dayCount=multiDayCount();
  const dayOffset=Math.floor((dayCount-1)/2);
  const days=Array.from({length:dayCount},(_,n)=>fmtDate(addDays(parseDate(homeDate), n-dayOffset)));
  const layouts=days.map(d=>computeDayLayoutFromItems(myHomeVisibleScheduleItems(d).filter(it=>!String(it.id).startsWith('evt-'))));
  const indices=[-1].concat(Array.from({length:DT_ROWS},(_,i)=>i)).concat([DT_ROWS]);
  const nowInfo=nowInfoForRole(effectiveRole());
  const showNowMarker=days.includes(nowInfo.dateStr);
  const nowIdx = nowInfo.hour>=19 ? DT_ROWS : (nowInfo.hour>=8 ? nowInfo.hour-8 : -1);
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
    const nowMarker=(showNowMarker && idx===nowIdx) ? `<span style="color:#e5383b;">▶</span> ` : '';
    rows += `<tr class="${meta.isEdge?'dt-edge-row':''}"><td class="dt-time-col">${nowMarker}${meta.label}</td>${cells}</tr>`;
  });
  const ddayRole=effectiveRole();
  const ddayCells=days.map((d,i)=>{
    const gap = i>0 ? '<td class="dt-gap"></td>' : '';
    const evs=state.events.filter(ev=>!(ev.hiddenFromDaughter && ddayRole==='daughter') && fmtDate(eventOccurrence(ev))===d)
      .map(ev=>({id:'evt-dday-'+ev.id, title:ev.name, memo:ev.memo}));
    if(!evs.length) return gap+`<td class="dt-cell"></td>`;
    return gap+`<td class="dt-cell filled">${evs.map(dtChip).join('')}</td>`;
  }).join('');
  rows += `<tr class="dt-edge-row"><td class="dt-time-col" style="font-weight:700;">D-day</td>${ddayCells}</tr>`;
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
          ${role && role!=='daughter' ? `<label class="pill" style="cursor:pointer;"><input type="checkbox" id="showDaughterToggleHome" ${showDaughterOnHome?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">딸</label>` : ''}
          <label class="pill" style="cursor:pointer;"><input type="checkbox" id="showCommonToggleHome" ${showCommonOnHome?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">가족공통</label>
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
      const cell=chip.closest('.dt-cell');
      const occurDate=cell?cell.dataset.addDate:null;
      if(scheduleColorPick){
        const isRepeating = item.repeat && item.repeat!=='none';
        if(isRepeating && occurDate){
          if(!item.colorOverrides) item.colorOverrides={};
          const curColor=(item.colorOverrides[occurDate]||{}).color;
          if(curColor===scheduleColorPick){
            item.colorOverrides[occurDate]={...(item.colorOverrides[occurDate]||{}), color:null};
            scheduleColorPick=null;
          } else {
            item.colorOverrides[occurDate]={...(item.colorOverrides[occurDate]||{}), color:scheduleColorPick};
          }
        } else {
          if(item.color===scheduleColorPick){
            item.color=null;
            scheduleColorPick=null;
          } else {
            item.color=scheduleColorPick;
          }
        }
        queueSave(); renderHome();
        return;
      }
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
      showToast('D-day 탭에서 수정할 수 있어요');
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
const TODO_CATEGORY_DEFAULT=[
  {name:'학습', color:'#FFADAD'},
  {name:'다이어트', color:'#FFD6A5'},
  {name:'건강/운동', color:'#CAFFBF'},
  {name:'기타', color:'#A0C4FF'}
];
function myTodoCategories(){
  const key=currentAuthorKey();
  if(!state.todoCategories) state.todoCategories={};
  if(!state.todoCategories[key]) state.todoCategories[key]=TODO_CATEGORY_DEFAULT.map(c=>({...c}));
  return state.todoCategories[key];
}
let todoSortBy='dueDate';
let expenseSortKey=null;
let incomeSortKey=null;
function todosForToday(){
  const list=myTodos().filter(t=>t.dueDate>=homeDate);
  return list.sort((a,b)=>{
    if(todoSortBy==='task') return a.task.localeCompare(b.task);
    if(todoSortBy==='category') return (a.category||'').localeCompare(b.category||'') || a.dueDate.localeCompare(b.dueDate);
    return a.dueDate.localeCompare(b.dueDate);
  });
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
  const catEl=document.getElementById('newTodoCat');
  if(!taskEl||!dueEl) return;
  const task=taskEl.value.trim();
  const due=dueEl.value||todayStr();
  if(!task){ showToast('할 일을 입력해주세요'); return; }
  const defaultCat=myTodoCategories()[myTodoCategories().length-1];
  const category=(catEl && catEl.value) ? catEl.value : (defaultCat?defaultCat.name:'');
  myTodos().push({id:uid(), task, dueDate:due, dueTime:'', category, done:false, doneDate:'', createdDate:todayStr()});
  queueSave(); renderHome();
  showToast('할 일이 추가되었어요');
}
const TODO_REPEAT_LABELS={none:'반복 안함',daily:'매일',weekly:'매주',monthly:'매월',yearly:'매년'};
function nextTodoRepeatDate(dateStr, repeat){
  const d=parseDate(dateStr);
  if(repeat==='daily') return fmtDate(addDays(d,1));
  if(repeat==='weekly') return fmtDate(addDays(d,7));
  if(repeat==='monthly'){ const nd=new Date(d); nd.setMonth(nd.getMonth()+1); return fmtDate(nd); }
  if(repeat==='yearly'){ const nd=new Date(d); nd.setFullYear(nd.getFullYear()+1); return fmtDate(nd); }
  return null;
}
function spawnNextTodoOccurrence(t){
  if(!t.repeat || t.repeat==='none') return;
  const nextDate=nextTodoRepeatDate(t.dueDate, t.repeat);
  if(!nextDate) return;
  myTodos().push({id:uid(), task:t.task, dueDate:nextDate, dueTime:t.dueTime||'', category:t.category, done:false, doneDate:'', createdDate:todayStr(), repeat:t.repeat});
}
function openTodoEditModal(id){
  const list=myTodos();
  const t=list.find(x=>x.id===id);
  if(!t) return;
  const cats=myTodoCategories();
  const catOptions = (t.category && !cats.some(c=>c.name===t.category)) ? cats.concat([{name:t.category,color:'#ddd'}]) : cats;
  const [curH,curM]=(t.dueTime||'18:00').split(':');
  const hourOptions=Array.from({length:24},(_,h)=>pad2(h));
  const minOptions=['00','10','20','30','40','50'];
  openModal(`
    <h3>To do 수정</h3>
    <div class="field"><label>할 일</label><input id="mTask" value="${escapeHtml(t.task)}"></div>
    <div class="grid2" style="margin-top:18px;">
      <div class="field"><label>D-day 날짜</label><input type="text" readonly class="date-input" id="mDue" value="${t.dueDate}"></div>
      <div class="field"><label>시간 (선택)</label>
        <div class="row" style="gap:4px;">
          <select id="mDueHour" style="flex:1;min-width:0;"><option value="">--시</option>${hourOptions.map(h=>`<option value="${h}" ${curH===h?'selected':''}>${h}시</option>`).join('')}</select>
          <select id="mDueMin" style="flex:1;min-width:0;"><option value="">--분</option>${minOptions.map(m=>`<option value="${m}" ${curM===m?'selected':''}>${m}분</option>`).join('')}</select>
        </div>
      </div>
    </div>
    <div class="field" style="margin-top:18px;">
      <div class="row" style="justify-content:space-between;align-items:center;">
        <label style="margin:0;">카테고리</label>
        <button type="button" class="link-btn" id="manageTodoCatBtn">카테고리 관리</button>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap;">
        ${catOptions.map(c=>`<label class="pill" style="cursor:pointer;background:${t.category===c.name?c.color:'var(--panel2)'};border-color:${c.color};"><input type="radio" name="mCat" value="${escapeHtml(c.name)}" ${t.category===c.name?'checked':''} style="margin-right:4px;">${escapeHtml(c.name)}</label>`).join('')}
      </div>
    </div>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mDone" ${t.done?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">완료</label>
    <div class="row" style="justify-content:space-between;align-items:center;margin-top:6px;">
      <button type="button" class="btn small" id="repeatToggleBtn">🔁 ${TODO_REPEAT_LABELS[t.repeat||'none']}</button>
    </div>
    <div id="repeatOptions" style="display:${(t.repeat&&t.repeat!=='none')?'':'none'};margin-top:8px;">
      <div class="row" style="gap:6px;flex-wrap:wrap;">
        ${Object.keys(TODO_REPEAT_LABELS).map(r=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mTodoRepeat" value="${r}" ${((t.repeat||'none')===r)?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">${TODO_REPEAT_LABELS[r]}</label>`).join('')}
      </div>
      <div class="meta" style="margin-top:4px;">완료 체크할 때마다 다음 일정으로 새 할 일이 자동 생성돼요</div>
    </div>
    <div class="modal-actions">
      <button class="btn danger" id="mDelete">삭제</button>
      <button class="btn" id="mCancel">취소</button>
      <button class="btn primary" id="mSave">저장</button>
    </div>
  `);
  attachDatePicker('mDue');
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('manageTodoCatBtn').onclick=()=>openTodoCategoryManageModal();
  document.getElementById('repeatToggleBtn').onclick=()=>{
    const el=document.getElementById('repeatOptions');
    el.style.display = el.style.display==='none' ? '' : 'none';
  };
  document.getElementById('mSave').onclick=()=>{
    t.task=document.getElementById('mTask').value.trim()||t.task;
    t.dueDate=document.getElementById('mDue').value||t.dueDate;
    const h=document.getElementById('mDueHour').value, mi=document.getElementById('mDueMin').value;
    t.dueTime=(h&&mi)?`${h}:${mi}`:'';
    t.category=(document.querySelector('input[name="mCat"]:checked')||{}).value||t.category;
    t.repeat=(document.querySelector('input[name="mTodoRepeat"]:checked')||{}).value||'none';
    const doneNow=document.getElementById('mDone').checked;
    if(doneNow && !t.done){ t.doneDate=todayStr(); spawnNextTodoOccurrence(t); }
    if(!doneNow) t.doneDate='';
    t.done=doneNow;
    queueSave(); closeModal(); renderHome();
  };
  document.getElementById('mDelete').onclick=()=>{
    if(!confirm('이 할 일을 삭제할까요?')) return;
    const key=currentAuthorKey();
    state.todos[key]=state.todos[key].filter(x=>x.id!==id);
    markDeleted(id);
    queueSave(); closeModal(); renderHome();
  };
}
function openTodoCategoryManageModal(){
  const cats=myTodoCategories();
  openModal(`
    <h3>할 일 카테고리 관리</h3>
    <div class="meta" style="margin-bottom:10px;">여기서 관리하는 카테고리는 지금 로그인한 계정에만 적용돼요.</div>
    ${cats.map((c,i)=>{
      const cnt=myTodos().filter(t=>t.category===c.name).length;
      return `<div class="list-item"><div class="row" style="gap:8px;align-items:center;"><span style="width:14px;height:14px;border-radius:50%;background:${c.color};display:inline-block;flex-shrink:0;"></span>${escapeHtml(c.name)}${cnt?` <span class="meta">(${cnt}건 사용중)</span>`:''}</div><div class="row" style="gap:4px;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-todocat="${i}" title="수정">✏️</button><button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-todocat="${i}" title="삭제">✕</button></div></div>`;
    }).join('')}
    <div class="modal-actions" style="justify-content:flex-start;">
      <button class="btn primary small" id="addTodoCatBtn">+ 새 카테고리</button>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">닫기</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('addTodoCatBtn').onclick=()=>openTodoCategoryEditModal(null);
  document.querySelectorAll('[data-edit-todocat]').forEach(b=>b.onclick=()=>openTodoCategoryEditModal(Number(b.dataset.editTodocat)));
  document.querySelectorAll('[data-del-todocat]').forEach(b=>b.onclick=()=>{
    const idx=Number(b.dataset.delTodocat);
    const cat=cats[idx];
    const cnt=myTodos().filter(t=>t.category===cat.name).length;
    const msg = cnt>0 ? `"${cat.name}" 카테고리를 사용한 할 일이 ${cnt}건 있어요. 그래도 삭제할까요? (기존 할 일은 카테고리 없음으로 남아요)` : `"${cat.name}" 카테고리를 삭제할까요?`;
    if(!confirm(msg)) return;
    cats.splice(idx,1);
    queueSave(); openTodoCategoryManageModal();
  });
}
function openTodoCategoryEditModal(idx){
  const cats=myTodoCategories();
  const existing = idx!=null ? cats[idx] : null;
  let selectedColor = existing ? existing.color : SCHED_COLORS[0];
  openModal(`
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h3 style="margin:0;">${existing?'카테고리 수정':'카테고리 추가'}</h3>
      ${renderColorSwatches(selectedColor, 'todocat')}
    </div>
    <div class="field"><label>이름</label><input id="mCatName" value="${existing?escapeHtml(existing.name):''}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.querySelectorAll('[data-swatch-group="todocat"] .color-swatch').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      selectedColor=btn.dataset.color;
      document.querySelectorAll('[data-swatch-group="todocat"] .color-swatch').forEach(b=>{
        b.style.border=(b.dataset.color===selectedColor)?'3px solid var(--text)':'2px solid transparent';
      });
    });
  });
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mCatName').value.trim();
    if(!name){ showToast('이름을 입력해주세요'); return; }
    if(existing){
      const oldName=existing.name;
      existing.name=name; existing.color=selectedColor;
      if(oldName!==name){ myTodos().forEach(t=>{ if(t.category===oldName) t.category=name; }); }
    } else {
      if(cats.some(c=>c.name===name)){ showToast('이미 있는 카테고리예요'); return; }
      cats.push({name, color:selectedColor});
    }
    queueSave(); closeModal(); openTodoCategoryManageModal();
  };
}
/* ---------- HABITS (딸 전용) ---------- */
const HABIT_ICONS=['💧','🍎','🧘','😴','📖','💪','🛏️','🧹','💰','📅','🚶','🦷','⏰','🌙','🧴','✍️'];
let habitAnchor={daily:todayStr(), weekly:todayStr()};
function weekStartOf(dateStr){
  const d=parseDate(dateStr);
  const dow=d.getDay();
  const diff = dow===0 ? -6 : 1-dow;
  return fmtDate(addDays(d, diff));
}
function myHabits(type){
  if(!state.habits) state.habits={daily:[],weekly:[]};
  if(!state.habits[type]) state.habits[type]=[];
  return state.habits[type];
}
function habitLogFor(id){
  if(!state.habitLog) state.habitLog={};
  if(!state.habitLog[id]) state.habitLog[id]={};
  return state.habitLog[id];
}
function habitPeriodKeys(type, anchorDate, count){
  const keys=[];
  if(type==='daily'){
    const monday=weekStartOf(anchorDate);
    for(let i=0;i<count;i++) keys.push(fmtDate(addDays(parseDate(monday), i)));
  } else {
    const anchorWeek=weekStartOf(anchorDate);
    for(let i=0;i<count;i++) keys.push(fmtDate(addDays(parseDate(anchorWeek), -7*i)));
  }
  return keys;
}
function fmtShortDateSlashDow(dateStr){
  const d=parseDate(dateStr);
  const dow=['일','월','화','수','목','금','토'][d.getDay()];
  return `${d.getMonth()+1}/${d.getDate()}(${dow})`;
}
function habitStreak(id, type){
  const log=habitLogFor(id);
  let streak=0;
  let cursor = type==='daily' ? todayStr() : weekStartOf(todayStr());
  const step = type==='daily' ? -1 : -7;
  while(log[cursor]){
    streak++;
    cursor=fmtDate(addDays(parseDate(cursor), step));
  }
  return streak;
}
function habitBestStreak(id, type){
  const log=habitLogFor(id);
  const keys=Object.keys(log).filter(k=>log[k]).sort();
  if(!keys.length) return 0;
  const step=type==='daily'?1:7;
  let best=1, cur=1;
  for(let i=1;i<keys.length;i++){
    const diffDays=Math.round((parseDate(keys[i])-parseDate(keys[i-1]))/86400000);
    cur = diffDays===step ? cur+1 : 1;
    if(cur>best) best=cur;
  }
  return best;
}
function habitMiniRingSvg(done, total, type){
  const size=42, r=(size-8)/2, c=size/2, circ=2*Math.PI*r;
  const pct=total?done/total:0;
  const dash=circ*pct;
  const full = total>0 && done>=total;
  const color = type==='weekly' ? 'var(--accent2)' : (full ? 'var(--good)' : 'var(--accent)');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--panel2)" stroke-width="6"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${dash} ${circ}" transform="rotate(-90 ${c} ${c})"/>
  </svg>`;
}
function achievementRingSvg(size){
  const s=size||12, r=(s-3)/2, c=s/2;
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" style="flex-shrink:0;" title="Daily/Weekly Habit 전부 완료"><circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--good)" stroke-width="2.2"/></svg>`;
}
function dayHabitsFullyDone(dateStr){
  const daily=myHabits('daily');
  const weekly=myHabits('weekly');
  if(!daily.length || !weekly.length) return false;
  const dailyDone = daily.every(h=>!!habitLogFor(h.id)[dateStr]);
  const wk=weekStartOf(dateStr);
  const weeklyDone = weekly.every(h=>!!habitLogFor(h.id)[wk]);
  return dailyDone && weeklyDone;
}
function habitRingStripHtml(habits, type, anchorDate){
  const periods=habitPeriodKeys(type, anchorDate, 7);
  const total=habits.length;
  const todayKey = type==='daily' ? todayStr() : weekStartOf(todayStr());
  return `<div class="habit-ring-strip">
    ${periods.map(k=>{
      const done=habits.filter(h=>habitLogFor(h.id)[k]).length;
      const isCurrent = k===todayKey;
      const labelDate = type==='daily' ? k : fmtDate(addDays(parseDate(k),6));
      const label = type==='daily' ? fmtShortDateSlashDow(labelDate) : fmtSlashMD(labelDate.slice(5));
      const wc=weekdayColor(labelDate);
      const badgeText = type==='daily' ? 'Today' : 'This Week';
      return `<div class="habit-ring-col${isCurrent?' habit-col-current':''}" title="${done}/${total}"><div class="habit-today-slot">${isCurrent?`<span class="habit-today-badge">${badgeText}</span>`:''}</div>${habitMiniRingSvg(done,total,type)}<div class="habit-ring-date" style="${wc?'color:'+wc+';':''}">${label}</div></div>`;
    }).join('')}
  </div>`;
}
function habitRowHtml(h, type, anchorDate, idx, total){
  const periods=habitPeriodKeys(type, anchorDate, 7);
  const log=habitLogFor(h.id);
  const streak=habitStreak(h.id,type);
  const best=habitBestStreak(h.id,type);
  const todayKey = type==='daily'?todayStr():weekStartOf(todayStr());
  const unit = type==='daily'?'일':'주';
  const cells=periods.map(k=>{
    const isFuture = k>todayKey;
    const colCls = k===todayKey ? ' habit-col-current' : '';
    if(isFuture) return `<div class="habit-cell-col${colCls}"><span class="habit-cell habit-future">○</span></div>`;
    const done=!!log[k];
    const checkColor = type==='weekly' ? 'var(--accent2)' : 'var(--good)';
    const mark = done ? `<span style="color:${checkColor};font-weight:800;font-size:15px;">✓</span>` : '❌';
    return `<div class="habit-cell-col${colCls}"><button type="button" class="habit-cell ${done?'habit-done':'habit-undone'} ${type==='weekly'?'habit-weekly':''}" data-habit-toggle="${h.id}" data-habit-key="${k}" title="${k}">${mark}</button></div>`;
  }).join('');
  return `
  <div class="habit-row">
    <div class="habit-row-head">
      <span class="habit-icon">${escapeHtml(h.icon||'⭐')}</span>
      <span class="habit-row-name">${escapeHtml(h.name)}</span>
      <button class="icon-btn" data-habit-edit="${h.id}" data-habit-type="${type}" title="수정">✏️</button>
      <span class="meta habit-row-streak">(⚡ ${streak}${unit} 연속 · 🔥 최고 ${best}${unit})</span>
    </div>
    <div class="row" style="align-items:center;gap:4px;">
      <span class="habit-cells-spacer"></span>
      <div class="habit-cells" style="flex:1;min-width:0;">${cells}</div>
      <div class="habit-move-btns">
        <button type="button" class="icon-btn" data-habit-move-up="${h.id}" data-habit-type="${type}" title="위로" ${idx===0?'disabled':''}>▲</button>
        <button type="button" class="icon-btn" data-habit-move-down="${h.id}" data-habit-type="${type}" title="아래로" ${idx===total-1?'disabled':''}>▼</button>
      </div>
    </div>
  </div>`;
}
function habitSectionHtml(type, title, icon){
  const habits=myHabits(type);
  const anchorDate = habitAnchor[type] || todayStr();
  return `
  <div class="card">
    <div class="row" style="justify-content:space-between;align-items:center;">
      <h3 style="margin:0;">${icon} ${title} <span class="meta">${habits.length}</span></h3>
      <button class="btn small primary" data-habit-add="${type}">+ 습관 추가</button>
    </div>
    ${habits.length?`
    <div class="row" style="align-items:center;gap:4px;margin-top:8px;">
      <button class="iconbtn habit-nav-btn ${type==='weekly'?'habit-nav-btn-weekly':''}" data-habit-prev="${type}">◀</button>
      <div style="flex:1;min-width:0;">${habitRingStripHtml(habits, type, anchorDate)}</div>
      <button class="iconbtn habit-nav-btn ${type==='weekly'?'habit-nav-btn-weekly':''}" data-habit-next="${type}">▶</button>
    </div>
    ${habits.map((h,idx)=>habitRowHtml(h,type,anchorDate,idx,habits.length)).join('')}
    ` : `<div class="empty" style="margin-top:10px;">아직 등록된 습관이 없어요</div>`}
  </div>`;
}
function moveHabit(type, id, dir){
  const habits=myHabits(type);
  const idx=habits.findIndex(h=>h.id===id);
  if(idx<0) return;
  const swapIdx=idx+dir;
  if(swapIdx<0 || swapIdx>=habits.length) return;
  [habits[idx], habits[swapIdx]] = [habits[swapIdx], habits[idx]];
  queueSave(); renderHome();
}
function openHabitEditModal(type, id){
  const habits=myHabits(type);
  const h = id ? habits.find(x=>x.id===id) : null;
  let selectedIcon = h ? (h.icon||HABIT_ICONS[0]) : HABIT_ICONS[0];
  openModal(`
    <h3>${h?'습관 수정':'습관 추가'} (${type==='daily'?'Daily':'Weekly'})</h3>
    <div class="field"><label>이름</label><input id="mHabitName" value="${h?escapeHtml(h.name):''}" placeholder="예: 일찍 자기"></div>
    <div class="field" style="margin-top:10px;"><label>아이콘</label>
      <div class="row" style="gap:6px;flex-wrap:wrap;">
        ${HABIT_ICONS.map(ic=>`<button type="button" class="habit-icon-pick ${ic===selectedIcon?'sel':''}" data-icon="${ic}">${ic}</button>`).join('')}
      </div>
      <div class="meta" style="margin-top:8px;">원하는 이모지가 없으면 아래에 직접 입력하거나 붙여넣으세요</div>
      <input id="mHabitIcon" value="${escapeHtml(selectedIcon)}" placeholder="이모지 직접 입력" style="margin-top:4px;width:60px;text-align:center;font-size:18px;">
    </div>
    <div class="modal-actions">
      ${h?`<button class="btn danger" id="mDelete">삭제</button>`:''}
      <button class="btn" id="mCancel">취소</button>
      <button class="btn primary" id="mSave">저장</button>
    </div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.querySelectorAll('.habit-icon-pick').forEach(btn=>{
    btn.onclick=()=>{
      selectedIcon=btn.dataset.icon;
      document.getElementById('mHabitIcon').value=selectedIcon;
      document.querySelectorAll('.habit-icon-pick').forEach(b=>b.classList.toggle('sel', b.dataset.icon===selectedIcon));
    };
  });
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mHabitName').value.trim();
    if(!name){ showToast('이름을 입력해주세요'); return; }
    const icon=document.getElementById('mHabitIcon').value.trim()||'⭐';
    if(h){ h.name=name; h.icon=icon; }
    else { habits.push({id:uid(), name, icon, createdDate:todayStr()}); }
    queueSave(); closeModal(); renderHome();
  };
  const delBtn=document.getElementById('mDelete');
  if(delBtn) delBtn.onclick=()=>{
    if(!confirm('이 습관을 삭제할까요? (기록도 함께 삭제돼요)')) return;
    const idx=habits.findIndex(x=>x.id===id);
    if(idx>=0) habits.splice(idx,1);
    markDeleted(id);
    if(state.habitLog) delete state.habitLog[id];
    queueSave(); closeModal(); renderHome();
  };
}
function bindHabitEvents(el){
  el.querySelectorAll('[data-habit-add]').forEach(b=>b.onclick=()=>openHabitEditModal(b.dataset.habitAdd, null));
  el.querySelectorAll('[data-habit-edit]').forEach(b=>b.onclick=()=>openHabitEditModal(b.dataset.habitType, b.dataset.habitEdit));
  el.querySelectorAll('[data-habit-toggle]').forEach(b=>b.onclick=()=>{
    const log=habitLogFor(b.dataset.habitToggle);
    const k=b.dataset.habitKey;
    if(log[k]) delete log[k]; else log[k]=true;
    queueSave(); renderHome();
  });
  el.querySelectorAll('[data-habit-move-up]').forEach(b=>b.onclick=()=>moveHabit(b.dataset.habitType, b.dataset.habitMoveUp, -1));
  el.querySelectorAll('[data-habit-move-down]').forEach(b=>b.onclick=()=>moveHabit(b.dataset.habitType, b.dataset.habitMoveDown, 1));
  el.querySelectorAll('[data-habit-prev]').forEach(b=>b.onclick=()=>{
    const type=b.dataset.habitPrev;
    const n = type==='daily'?7:49;
    habitAnchor[type]=fmtDate(addDays(parseDate(habitAnchor[type]||todayStr()), -n));
    renderHome();
  });
  el.querySelectorAll('[data-habit-next]').forEach(b=>b.onclick=()=>{
    const type=b.dataset.habitNext;
    const n = type==='daily'?7:49;
    const next=fmtDate(addDays(parseDate(habitAnchor[type]||todayStr()), n));
    if(type==='daily'){
      habitAnchor[type] = weekStartOf(next)>weekStartOf(todayStr()) ? todayStr() : next;
    } else {
      habitAnchor[type] = next>todayStr() ? todayStr() : next;
    }
    renderHome();
  });
}
function renderHome(){
  if(effectiveRole()==='mom' && !momHomeDefaultsApplied){
    momHomeDefaultsApplied=true;
    showCommonOnHome=true;
    showDaughterOnHome=true;
  }
  const day = state.daily[homeDate] || {};
  const entries = day.entries || {};
  const myKey = currentAuthorKey();
  const mine = entries[myKey] || {};
  const unreadLetterCount = (state.letters||[]).filter(l=>!l.read).length;
  const el=document.getElementById('tab-home');
  const dLabel = fmtShortDateDow(homeDate);
  const dLabelColor = weekdayColor(homeDate);
  const todaySchedule = myHomeVisibleScheduleItems(homeDate);
  const todayTodos = todosForToday();
  const todoPct = todoProgressPct(todayTodos);

  el.innerHTML = `
    ${renderDayTimelines()}
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:8px;">
        <div class="row" style="gap:4px;flex-shrink:0;">
          <button class="iconbtn" id="homePrev">◀</button>
          <div class="d" style="white-space:nowrap;font-size:15px;font-weight:700;${dLabelColor?'color:'+dLabelColor+';':''}">${dLabel}</div>
          <button class="iconbtn" id="homeNext">▶</button>
          ${homeDate!==todayStr()?todayPillBtn('homeToday'):''}
        </div>
        <div class="mood-row" id="moodRow" style="flex:1;justify-content:flex-end;min-width:0;overflow-x:auto;">
          ${MOODS.map(m=>`<button data-m="${m}" class="${mine.mood===m?'sel':''}">${m}</button>`).join('')}
        </div>
      </div>
      ${(user && effectiveRole()!=='daughter')?`
      <div class="field" style="margin-top:10px;">
        <label>👀 Lora's Activities</label>
        <div style="margin-top:4px;">
          ${(()=>{
            const sorted=[...(state.daughterActivity||[])].sort((a,b)=>(b.startTs||b.ts||'').localeCompare(a.startTs||a.ts||'')).slice(0,6);
            if(!sorted.length) return `<div class="meta">아직 접속 기록이 없어요</div>`;
            return sorted.map(e=>{
              if(e.startTs===undefined) return `<div class="meta" style="margin-top:2px;">${escapeHtml(e.ts)} ${escapeHtml(e.text)}</div>`;
              const sameEnd = e.startTs===e.endTs && e.startDesc===e.endDesc;
              const endDisplay = e.endTs.slice(0,5)===e.startTs.slice(0,5) ? e.endTs.slice(6) : e.endTs;
              return `<div class="meta" style="margin-top:2px;">${escapeHtml(e.startTs)} ${escapeHtml(e.startDesc)}${sameEnd?'':` / ${escapeHtml(endDisplay)} ${escapeHtml(e.endDesc)}`}</div>`;
            }).join('');
          })()}
        </div>
      </div>`:''}
      <div class="field" style="margin-top:10px;">
        <div class="row" style="justify-content:space-between;align-items:center;">
          <label style="margin:0;">Comment</label>
          <div class="row" style="gap:8px;">
            <span class="meta" id="diarySaveStatus">${mine.diary?'✓ 저장됨':''}</span>
            ${effectiveRole()!=='daughter'?`<button class="btn small" id="sendLetterBtn" title="쓴 내용을 딸에게 편지로 보내기">✉️ 딸에게</button>`:''}
            <button class="btn small primary" id="diarySaveBtn">저장</button>
          </div>
        </div>
        <textarea id="diaryInput" placeholder="오늘 하루는 어땠나요?" style="overflow:hidden;">${escapeHtml(mine.diary)}</textarea>
        <div class="row" style="justify-content:space-between;align-items:center;margin-top:8px;">
          <label id="diaryArchiveToggle" style="cursor:pointer;">${diaryArchiveOpen?'▲':'▼'} ${letterViewMode?'편지 모아보기':'Comment 모아보기'}</label>
          <div class="row" style="gap:6px;">
            ${effectiveRole()==='daughter'?`<button class="btn small" id="lettersBtn">📮 ${unreadLetterCount>0?'편지가 도착했어요':'우체통'}</button>`:''}
            ${diaryArchiveOpen && !letterViewMode?`<label class="pill" style="cursor:pointer;"><input type="checkbox" id="diaryArchiveFamilyToggle" ${diaryArchiveIncludeFamily?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">엄빠 메시지 보기</label>`:''}
          </div>
        </div>
        ${diaryArchiveOpen?`<div id="diaryArchiveBox" style="margin-top:6px;">${letterViewMode?lettersRowsHtml():diaryArchiveRowsHtml()}</div>`:''}
      </div>

      <div class="row" style="justify-content:flex-end;align-items:center;gap:6px;margin-top:14px;">
        <span class="meta">정렬</span>
        <select id="todoSortSelect" style="font-size:12px;padding:2px 6px;border-radius:6px;background:var(--panel2);border:1px solid var(--border);color:var(--text);">
          <option value="dueDate" ${todoSortBy==='dueDate'?'selected':''}>D-day순</option>
          <option value="task" ${todoSortBy==='task'?'selected':''}>이름순</option>
          <option value="category" ${todoSortBy==='category'?'selected':''}>카테고리순</option>
        </select>
      </div>
      ${todoPct!=null?`<div class="bar-row" style="margin:6px 0;"><span class="meta" style="flex-shrink:0;">Today's things to do 진행율 ${todoPct}%</span><div class="bar-track"><div class="bar-fill" style="width:${todoPct}%"></div></div></div>`:''}
      ${todayTodos.map(t=>{
        const d=dday(t.dueDate);
        const cat=myTodoCategories().find(c=>c.name===t.category);
        const catLabel=cat ? (cat.name.length>3?cat.name.slice(0,3):cat.name) : '';
        const catPill=cat ? `<span class="pill" style="background:${cat.color};color:rgba(0,0,0,0.5);border:none;" title="${escapeHtml(cat.name)}">${escapeHtml(catLabel)}</span>` : '';
        return `
        <div class="list-item" style="align-items:center;">
          <div class="row" style="flex:1;gap:8px;min-width:0;">
            <input type="checkbox" data-todo-id="${t.id}" ${t.done?'checked':''} style="flex-shrink:0;">
            <span class="content-text" style="${t.done?'text-decoration:line-through;color:var(--muted);':''}flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(t.task)}</span>
          </div>
          <div class="row" style="flex-shrink:0;">
            ${catPill}
            <span class="pill ${ddayPillClass(d)}">${ddayLabel(d)}</span>
            <button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-todo="${t.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-todo="${t.id}" title="삭제">✕</button>
          </div>
        </div>`;
      }).join('')}
      <div class="list-item" style="align-items:center;flex-wrap:wrap;">
        <div class="row" style="flex:1;gap:8px;min-width:140px;">
          <span style="width:16px;flex-shrink:0;"></span>
          <input id="newTodoTask" placeholder="할 일을 입력하고 Enter" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-size:13px;">
        </div>
        <select id="newTodoCat" style="flex-shrink:0;width:80px;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 4px;font-size:12px;">
          ${myTodoCategories().map((c,i,arr)=>`<option value="${escapeHtml(c.name)}" ${i===arr.length-1?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}
        </select>
        <input type="text" readonly class="date-input" id="newTodoDue" placeholder="D-day" style="width:110px;flex-shrink:0;" value="">
        <button class="btn small primary" id="newTodoSaveBtn" style="flex-shrink:0;">저장</button>
      </div>
    </div>

    ${effectiveRole()==='daughter'?habitSectionHtml('daily','Daily Habits','🎯')+habitSectionHtml('weekly','Weekly Habits','📅'):''}

    ${achievementLogHtml()}

    ${effectiveRole()!=='daughter'?`
    <div class="card">
      <h3>📅 ${Number(homeDate.slice(5,7))}.${Number(homeDate.slice(8,10))}${homeDate===todayStr()?'(오늘)':''} 일정</h3>
      ${todaySchedule.length? todaySchedule.map(s=>{
        const badge = authorBadge(s.createdBy);
        return `<div class="list-item"><div><div style="font-size:14px;">${timeRangeLabel(s)?`<b>${timeRangeLabel(s)}</b> `:''}${badge}${escapeHtml(s.title)}</div>${s.memo?`<div class="content-text" style="font-size:12px;">${escapeHtml(s.memo)}</div>`:''}</div></div>`;
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
  const diaryInputEl=document.getElementById('diaryInput');
  const autoResizeDiary=()=>{ diaryInputEl.style.height='auto'; diaryInputEl.style.height=diaryInputEl.scrollHeight+'px'; };
  autoResizeDiary();
  diaryInputEl.addEventListener('input', ()=>{
    document.getElementById('diarySaveStatus').textContent='';
    autoResizeDiary();
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
    letterViewMode=false;
    renderHome();
  };
  const sendLetterBtn=document.getElementById('sendLetterBtn');
  if(sendLetterBtn) sendLetterBtn.onclick=()=>{
    const text=document.getElementById('diaryInput').value.trim();
    if(!text){ showToast('내용을 입력해주세요'); return; }
    ensureDay(homeDate);
    const cur=state.daily[homeDate].entries[myKey]||{};
    cur.diary=text;
    cur.name = user ? (user.displayName||user.email) : '나';
    cur.updatedAt=Date.now();
    state.daily[homeDate].entries[myKey]=cur;
    if(!state.letters) state.letters=[];
    const now=new Date();
    state.letters.push({id:uid(), fromKey:myKey, fromLabel:cur.name, text, date:`${pad2(now.getMonth()+1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`, read:false});
    queueSave();
    showToast('딸에게 편지를 보냈어요 💌');
    renderHome();
  };
  const lettersBtn=document.getElementById('lettersBtn');
  if(lettersBtn) lettersBtn.onclick=()=>{
    diaryArchiveOpen=true;
    letterViewMode=true;
    (state.letters||[]).forEach(l=>{ l.read=true; });
    queueSave();
    renderHome();
  };
  if(diaryArchiveOpen && !letterViewMode){
    const familyToggleEl=document.getElementById('diaryArchiveFamilyToggle');
    if(familyToggleEl) familyToggleEl.addEventListener('change', e=>{
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
    if(cb.checked && !t.done) spawnNextTodoOccurrence(t);
    t.done=cb.checked;
    t.doneDate = cb.checked ? todayStr() : '';
    queueSave(); renderHome();
  }));
  el.querySelectorAll('[data-edit-todo]').forEach(btn=>btn.onclick=()=>openTodoEditModal(btn.dataset.editTodo));
  el.querySelectorAll('[data-del-todo]').forEach(btn=>btn.onclick=()=>{
    if(!confirm('이 할 일을 삭제할까요?')) return;
    const key=currentAuthorKey(), id=btn.dataset.delTodo;
    state.todos[key]=state.todos[key].filter(x=>x.id!==id);
    markDeleted(id);
    queueSave(); renderHome();
  });
  const todoSortSelectEl=document.getElementById('todoSortSelect');
  if(todoSortSelectEl) todoSortSelectEl.addEventListener('change', e=>{ todoSortBy=e.target.value; renderHome(); });
  const newTodoDueEl=document.getElementById('newTodoDue');
  if(newTodoDueEl){
    attachDatePicker('newTodoDue');
    newTodoDueEl.addEventListener('change', commitNewTodo);
  }
  const newTodoTaskEl=document.getElementById('newTodoTask');
  if(newTodoTaskEl){
    newTodoTaskEl.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commitNewTodo(); } });
  }
  const newTodoSaveBtn=document.getElementById('newTodoSaveBtn');
  if(newTodoSaveBtn) newTodoSaveBtn.onclick=commitNewTodo;
  if(effectiveRole()==='daughter') bindHabitEvents(el);
  bindDayTimelineEvents();
}
function diaryArchiveRowsHtml(){
  const myKey=currentAuthorKey();
  const rows=[];
  Object.keys(state.daily).sort().reverse().forEach(d=>{
    const entries=(state.daily[d]||{}).entries||{};
    Object.keys(entries).forEach(k=>{
      const e=entries[k];
      if(diaryArchiveIncludeFamily ? k===myKey : k!==myKey) return;
      if(e && (e.mood || e.diary)) rows.push({date:d, key:k, ...e});
    });
  });
  if(!rows.length) return `<div class="empty">아직 작성된 Comment가 없어요</div>`;
  return rows.map(r=>`
    <div class="list-item" data-jump="${r.date}" style="cursor:pointer;">
      <div class="content-text" style="flex:1;min-width:0;white-space:normal;word-break:break-word;">${r.date} ${r.mood||''} <span class="pill">${escapeHtml(authorLabel(r,r.key))}</span>${r.diary?' '+escapeHtml(r.diary):''}</div>
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
function myMonthNotes(ym){
  const key=currentAuthorKey();
  if(!state.monthNotes) state.monthNotes={};
  if(!state.monthNotes[key]) state.monthNotes[key]={};
  if(!state.monthNotes[key][ym]) state.monthNotes[key][ym]=[];
  return state.monthNotes[key][ym];
}
function monthNoteRowHtml(idx, value){
  return `<div class="row" data-month-note-row="${idx}" style="gap:6px;align-items:center;margin-top:4px;flex-wrap:nowrap;">
    <span style="width:20px;flex-shrink:0;text-align:right;color:var(--muted);font-size:12px;">${idx+1}.</span>
    <input data-month-note-idx="${idx}" value="${escapeHtml(value)}" placeholder="일정 메모 입력" style="flex:1;min-width:0;background:var(--panel2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:6px 10px;font-size:13px;">
  </div>`;
}
function monthNotesHtml(ym){
  const notes=myMonthNotes(ym);
  const lines=(notes.length && notes[notes.length-1].trim()!=='') ? notes.concat(['']) : (notes.length?notes:['']);
  return `
  <div class="field" id="monthNotesField" style="margin-top:14px;">
    <label>📌 주요일정 메모</label>
    <div id="monthNotesList">${lines.map((v,i)=>monthNoteRowHtml(i,v)).join('')}</div>
  </div>`;
}
function bindMonthNoteInput(inp, ym){
  inp.addEventListener('input', ()=>{
    const idx=Number(inp.dataset.monthNoteIdx);
    const notes=myMonthNotes(ym);
    notes[idx]=inp.value;
    queueSave();
    const list=document.getElementById('monthNotesList');
    if(!list) return;
    const rowCount=list.querySelectorAll('[data-month-note-idx]').length;
    if(idx===rowCount-1 && inp.value.trim()!==''){
      list.insertAdjacentHTML('beforeend', monthNoteRowHtml(idx+1, ''));
      bindMonthNoteInput(list.querySelector(`[data-month-note-idx="${idx+1}"]`), ym);
    }
  });
}
function bindMonthNotesEvents(el, ym){
  el.querySelectorAll('[data-month-note-idx]').forEach(inp=>bindMonthNoteInput(inp, ym));
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
  const myKeyCal=currentAuthorKey();
  if(!state.calendarDayColors) state.calendarDayColors={};
  const myDayColors=state.calendarDayColors[myKeyCal]||{};
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
    const defaultDayBg = dateStr<todayS ? 'rgba(255,105,180,0.04)' : (dateStr>todayS ? 'rgba(128,128,128,0.03)' : '');
    const dayColor=myDayColors[dateStr]||defaultDayBg;
    const colorAttr=dayColor?` style="background:${dayColor};"`:'';
    grid += `<div class="cal-cell ${inMonth?'':'other'} ${dateStr===todayS?'today':''} ${dateStr===scheduleSel?'sel':''} ${holidayName?'holiday':''}" data-date="${dateStr}"${colorAttr}>
      <div class="day-row"><span class="day-num">${dateObj.getDate()}</span>${(effectiveRole()==='daughter'&&dayHabitsFullyDone(dateStr))?achievementRingSvg(12):''}${holidayName?`<span class="cal-holiday">${escapeHtml(holidayName)}</span>`:''}</div>${commentHtml}${shown}${more}
    </div>`;
  }
  const dayItems = filtered.filter(s=>scheduleItemOccursOn(s,scheduleSel)).sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(s=>({...s, ...resolveItemColors(s,scheduleSel)}));
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:4px;gap:10px;">
        ${renderColorSwatches(calendarColorPick, 'cal-paint')}
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="showCommonToggleSchedule" ${showCommonOnHome?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">가족공통</label>
      </div>
      ${calendarColorPick?`<div class="meta" style="margin-bottom:6px;">🎨 색상을 적용할 날짜를 클릭하세요</div>`:''}
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div class="datebar" style="margin-bottom:0;"><button class="iconbtn" id="sPrev">‹</button><div class="d" style="font-size:15px;font-weight:700;">${y}년 ${m+1}월</div><button class="iconbtn" id="sNext">›</button></div>
        ${myRole==='dad'?`<div class="row" id="schedFilterRow" style="gap:6px;">
          ${allowedFilters.map(f=>`<button class="btn small ${scheduleFilter===f?'active':''}" data-owner="${f}">${scheduleFilterLabel(f)}</button>`).join('')}
        </div>`:''}
      </div>
      <div class="cal-grid" style="margin-top:10px;">${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('')}${grid}</div>
      ${monthNotesHtml(`${y}-${pad2(m+1)}`)}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;margin-bottom:14px;"><h3 style="margin:0;">${weekdayColor(scheduleSel)?`<span style="color:${weekdayColor(scheduleSel)};">${scheduleSel}</span>`:scheduleSel} 일정${holidays[scheduleSel]?` <span class="pill">${escapeHtml(holidays[scheduleSel])}</span>`:''}</h3><button class="btn primary small" id="addSchedBtn">+ 일정 추가</button></div>
      ${dayItems.length? dayItems.map(s=>{
        const canManage = !s.virtual && canManageSchedule(s);
        const badge = authorBadge(s.createdBy);
        const showOwnerPill = s.owner==='common' || s.owner!==effectiveRole();
        return `
        <div class="list-item sched-item"${s.bgColor?` style="background:${s.bgColor};"`:''}>
          <div><div style="font-size:14px;">${timeRangeLabel(s)?escapeHtml(timeRangeLabel(s))+' ':''}${badge}${escapeHtml(s.title)} ${showOwnerPill?`<span class="pill">${ownerLabel(s.owner)}</span>`:''}</div>${s.memo?`<div class="content-text" style="font-size:12.5px;">${escapeHtml(s.memo)}</div>`:''}</div>
          <div class="row">${s.virtual? `<span class="meta">D-day 탭에서 수정</span>` : (canManage?`<button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit="${s.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del="${s.id}" title="삭제">✕</button>`:`<span class="meta">작성자만 관리 가능</span>`)}</div>
        </div>`;
      }).join('') : `<div class="empty">일정이 없어요</div>`}
    </div>
  `;
  bindShowCommonToggle('showCommonToggleSchedule');
  bindMonthNotesEvents(el, `${y}-${pad2(m+1)}`);
  document.getElementById('sPrev').onclick=()=>{ scheduleMonth=new Date(y,m-1,1); renderSchedule(); };
  document.getElementById('sNext').onclick=()=>{ scheduleMonth=new Date(y,m+1,1); renderSchedule(); };
  const schedFilterRow=document.getElementById('schedFilterRow');
  if(schedFilterRow) schedFilterRow.addEventListener('click', e=>{
    const b=e.target.closest('button[data-owner]'); if(!b) return;
    scheduleFilter=b.dataset.owner; renderSchedule();
  });
  el.querySelectorAll('[data-swatch-group="cal-paint"] .color-swatch').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const c=btn.dataset.color;
      calendarColorPick = (calendarColorPick===c) ? null : c;
      renderSchedule();
    });
  });
  el.querySelector('.cal-grid').addEventListener('click', e=>{
    const c=e.target.closest('.cal-cell'); if(!c) return;
    if(calendarColorPick){
      if(!state.calendarDayColors) state.calendarDayColors={};
      if(!state.calendarDayColors[myKeyCal]) state.calendarDayColors[myKeyCal]={};
      const curColor=state.calendarDayColors[myKeyCal][c.dataset.date];
      if(curColor===calendarColorPick){
        delete state.calendarDayColors[myKeyCal][c.dataset.date];
        calendarColorPick=null;
      } else {
        state.calendarDayColors[myKeyCal][c.dataset.date]=calendarColorPick;
      }
      queueSave(); renderSchedule();
      return;
    }
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
    if(confirm('일정을 삭제할까요?')){ state.schedule=state.schedule.filter(x=>x.id!==item.id); markDeleted(item.id); queueSave(); closeModal(); renderSchedule(); renderHome(); }
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
      markDeleted(item.id);
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
  if(!item) return true;
  if(user && EMAIL_ROLE[user.email]==='dad') return true;
  return item.owner!=='common' || !item.createdBy || item.createdBy===currentAuthorKey();
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
    : role==='mom' ? 'common'
    : (role && role!=='dad' && myOwners.some(o=>o.key===role)) ? role
    : ((scheduleFilter!=='all' && myOwners.some(o=>o.key===scheduleFilter)) ? scheduleFilter : (myOwners[0]?myOwners[0].key:'common'));
  const s=existing||{id:null,date:(prefill&&prefill.date)||scheduleSel,time:(prefill&&prefill.time)||'',endTime:(prefill&&prefill.endTime)||'',title:'',contacts:'',memo:'',owner:defaultOwner,repeat:'none',repeatUntil:''};
  if(!s.id && s.time && !s.endTime) s.endTime=addOneHour(s.time);
  const ownerOptions = myOwners.some(o=>o.key===(s.owner||'common')) ? myOwners : myOwners.concat([{key:s.owner||'common',label:ownerLabel(s.owner)}]);
  const curRepeat=s.repeat||'none';
  const wasRepeating = !!(s.id && s.repeat && s.repeat!=='none');
  const targetOccurDate = occurDate||s.date;
  const existingOverride = wasRepeating && s.colorOverrides && s.colorOverrides[targetOccurDate];
  let selectedColor = (existingOverride && existingOverride.bgColor!==undefined) ? existingOverride.bgColor : (s.bgColor||null);
  openModal(`
    <div class="row" style="justify-content:space-between;align-items:center;padding-right:30px;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
      <h3 style="margin:0;">${existing?'일정 수정':'일정 추가'}</h3>
      <div class="row" style="gap:6px;">
        ${ownerOptions.map(o=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mOwner" value="${o.key}" ${(s.owner||'common')===o.key?'checked':''} style="margin-right:4px;">${scheduleFilterLabel(o.key)}</label>`).join('')}
      </div>
    </div>
    <div class="field" style="flex-direction:row;align-items:center;gap:8px;margin-bottom:22px;"><label style="flex-shrink:0;">일정색상</label>${renderColorSwatches(selectedColor, 'modal')}</div>
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
    let bgColor=selectedColor;
    let colorOverrides=s.colorOverrides;
    if(wasRepeating){
      bgColor=s.bgColor;
      colorOverrides={...(s.colorOverrides||{})};
      colorOverrides[targetOccurDate]={...(colorOverrides[targetOccurDate]||{}), bgColor:selectedColor};
    }
    const rec={id:s.id||uid(),date,time:document.getElementById('mTime').value,endTime:document.getElementById('mEndTime').value,title,contacts:document.getElementById('mContacts').value,memo:document.getElementById('mMemo').value,owner,repeat,repeatUntil,color:s.color||null,bgColor,colorOverrides,createdBy:s.createdBy||currentAuthorKey()};
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
const MEMBER_EMOJI={dad:'👨',mom:'👩',daughter:'👧'};
const MEAL_TYPES=['아침','점심','저녁','간식'];
const MEAL_AMOUNTS=['쫌쫌따리','알잘딱','쫌많이','레전드'];
const MEAL_ICONS={아침:'☀️',점심:'🌤️',저녁:'🌙',간식:'🍰'};
const MEAL_FAST_TEXT={아침:'단식했어요',점심:'단식했어요',저녁:'단식했어요',간식:'참았어요'};
const MEAL_AMOUNT_POINTS={'쫌쫌따리':20,'알잘딱':10,'쫌많이':-10,'레전드':-30};
const MEAL_AMOUNT_IMAGES={'쫌쫌따리':'amounts/jjomjjomttari.png','알잘딱':'amounts/aljaldak.png','쫌많이':'amounts/jjommanhi.png','레전드':'amounts/legend.png'};
const MEAL_AMOUNT_IMAGE_STYLE={
  '쫌쫌따리':{x:50, y:15, scale:1.0},
  '알잘딱':{x:50, y:15, scale:0.80},
  '쫌많이':{x:50, y:60, scale:0.55},
  '레전드':{x:60, y:15, scale:0.85}
};
const MEAL_FAST_POINTS=10;
function mealScoreForEntries(entries){
  let sum=0, any=false;
  MEAL_TYPES.forEach(t=>{
    const m=entries.find(x=>x.mealType===t);
    if(m && m.content){ sum+=(MEAL_AMOUNT_POINTS[m.amount]||0); any=true; }
    else if(m && m.fasted){ sum+=MEAL_FAST_POINTS; any=true; }
  });
  return {score:100+sum, any};
}
const MEAL_MOODS={
  ajoota:{img:'moods/ajoota.png', label:'아주 좋아'},
  baegopa:{img:'moods/baegopa.png', label:'배고파'},
  gibunjoa:{img:'moods/gibunjoa.png', label:'기분 좋아'},
  baebureungeol:{img:'moods/baebureungeol.png', label:'배부른걸'},
  neomeogeotda:{img:'moods/neomeogeotda.png', label:'넘 먹었다'}
};
function mealMoodKey(entries){
  const {score,any}=mealScoreForEntries(entries);
  if(!any) return null;
  if(score<=60) return 'ajoota';
  if(score<=70) return 'baegopa';
  if(score>=130) return 'neomeogeotda';
  if(score>=110) return 'baebureungeol';
  return 'gibunjoa';
}
function mealMoodImgHtml(entries){
  const key=mealMoodKey(entries);
  if(!key) return `<img src="moods/norecord.png" alt="기록 없음" class="meal-mood-icon" title="기록 없음">`;
  const mood=MEAL_MOODS[key];
  return `<img src="${mood.img}" alt="${escapeHtml(mood.label)}" class="meal-mood-icon" title="${escapeHtml(mood.label)}">`;
}
function mealEntryLineHtml(m){
  const hasContent = !!m.content;
  const points = hasContent ? MEAL_AMOUNT_POINTS[m.amount] : (m.fasted ? MEAL_FAST_POINTS : null);
  const pointsHtml = points!=null ? ` <span style="color:${points<0?'var(--bad)':'var(--good)'};font-weight:700;">${points>0?'+':''}${points}점</span>` : '';
  const statusText = hasContent ? m.amount : (m.fasted ? MEAL_FAST_TEXT[m.mealType] : '');
  const showContent = hasContent && !isMobileViewport();
  return `${escapeHtml(m.mealType)} · ${escapeHtml(statusText)}${showContent?' · '+escapeHtml(m.content):''}${pointsHtml}`;
}
function openMealDayModal(dateStr){
  const meals=(state.daily[dateStr] && state.daily[dateStr].health && state.daily[dateStr].health[healthPerson] && state.daily[dateStr].health[healthPerson].meals) || [];
  const dLabel=`${dateStr.slice(5)}(${parseDate(dateStr).toLocaleDateString('ko-KR',{weekday:'short'})})`;
  openModal(`
    <h3>식단 기록 (${dLabel})</h3>
    ${meals.length? meals.map(m=>`
      <div class="list-item">
        <div class="content-text">${mealEntryLineHtml(m)}</div>
        <div class="row" style="flex-shrink:0;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-day-edit-meal="${m.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-day-del-meal="${m.id}" title="삭제">✕</button></div>
      </div>`).join('') : `<div class="empty">기록된 식단이 없어요</div>`}
    <div class="modal-actions"><button class="btn" id="mCancel">닫기</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.querySelectorAll('[data-day-edit-meal]').forEach(b=>b.onclick=()=>openMealEditModal(dateStr, b.dataset.dayEditMeal));
  document.querySelectorAll('[data-day-del-meal]').forEach(b=>b.onclick=()=>{
    if(!confirm('삭제할까요?')) return;
    state.daily[dateStr].health[healthPerson].meals=meals.filter(x=>x.id!==b.dataset.dayDelMeal);
    queueSave(); closeModal(); renderHealth();
  });
}
function openMealEditModal(dateStr, id){
  const meals=(state.daily[dateStr] && state.daily[dateStr].health && state.daily[dateStr].health[healthPerson] && state.daily[dateStr].health[healthPerson].meals) || [];
  const m=meals.find(x=>x.id===id);
  if(!m) return;
  openModal(`
    <h3>식단 기록 수정 (${dateStr.slice(5)})</h3>
    <div class="field"><label>식사 종류</label>
      <div class="row" style="gap:6px;">
        ${MEAL_TYPES.map(t=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mMealType" value="${t}" ${m.mealType===t?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">${t}</label>`).join('')}
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
    state.daily[dateStr].health[healthPerson].meals=meals.filter(x=>x.id!==id);
    queueSave(); closeModal(); renderHealth();
  };
}
function findOrCreateMealSlot(mealType){
  ensureDay(healthDate);
  if(!state.daily[healthDate].health) state.daily[healthDate].health={};
  if(!state.daily[healthDate].health[healthPerson]) state.daily[healthDate].health[healthPerson]={};
  if(!state.daily[healthDate].health[healthPerson].meals) state.daily[healthDate].health[healthPerson].meals=[];
  const meals=state.daily[healthDate].health[healthPerson].meals;
  let entry=meals.find(m=>m.mealType===mealType);
  if(!entry){
    const now=new Date();
    entry={id:uid(), time:pad2(now.getHours())+':'+pad2(now.getMinutes()), mealType, content:'', amount:'', fasted:false};
    meals.push(entry);
  }
  return entry;
}
function dinnerNudgeText(){
  const rec=(state.daily[healthDate] && state.daily[healthDate].health && state.daily[healthDate].health[healthPerson]) || {};
  const prevDate=fmtDate(addDays(parseDate(healthDate),-1));
  const prevRec=(state.daily[prevDate] && state.daily[prevDate].health && state.daily[prevDate].health[healthPerson]) || {};
  return (rec.weight && prevRec.weight && Number(rec.weight)>Number(prevRec.weight)) ? '오늘 저녁은 살찌니까 간단하게 ^^' : '';
}
function openMealSlotModal(mealType){
  const meals=(state.daily[healthDate] && state.daily[healthDate].health && state.daily[healthDate].health[healthPerson] && state.daily[healthDate].health[healthPerson].meals) || [];
  const existing=meals.find(m=>m.mealType===mealType);
  let selectedAmount=existing?existing.amount:'';
  const placeholder=(mealType==='저녁' && dinnerNudgeText()) ? dinnerNudgeText() : '무엇을 먹었는지';
  openModal(`
    <h3>${MEAL_ICONS[mealType]} ${mealType} 기록</h3>
    <div class="field"><label>무엇을 먹었는지</label><textarea id="mMealContent" placeholder="${escapeHtml(placeholder)}" style="overflow:hidden;">${existing?escapeHtml(existing.content):''}</textarea></div>
    <div class="field" style="margin-top:10px;"><label>먹은 양</label>
      <div class="row" style="gap:6px;flex-wrap:wrap;">
        ${MEAL_AMOUNTS.map(a=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mMealAmount" value="${a}" ${selectedAmount===a?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">${a}</label>`).join('')}
      </div>
    </div>
    <div class="modal-actions">
      ${existing?`<button class="btn danger" id="mDelete">삭제</button>`:''}
      <button class="btn" id="mCancel">취소</button>
      <button class="btn primary" id="mSave">저장</button>
    </div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  const contentEl=document.getElementById('mMealContent');
  const autoResizeMeal=()=>{ contentEl.style.height='auto'; contentEl.style.height=contentEl.scrollHeight+'px'; };
  autoResizeMeal();
  contentEl.addEventListener('input', autoResizeMeal);
  document.getElementById('mSave').onclick=()=>{
    const content=contentEl.value.trim();
    const amount=(document.querySelector('input[name="mMealAmount"]:checked')||{}).value||'';
    if(!content){ showToast('내용을 입력해주세요'); return; }
    const entry=findOrCreateMealSlot(mealType);
    entry.content=content;
    entry.amount=amount;
    entry.fasted=false;
    queueSave(); closeModal(); renderHealth();
  };
  const delBtn=document.getElementById('mDelete');
  if(delBtn) delBtn.onclick=()=>{
    if(!confirm('삭제할까요?')) return;
    state.daily[healthDate].health[healthPerson].meals=meals.filter(x=>x.id!==existing.id);
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
function hourMinDiffLabel(startHHMM, endHHMM){
  if(!startHHMM || !endHHMM) return '';
  const [sh,sm]=startHHMM.split(':').map(Number);
  const [eh,em]=endHHMM.split(':').map(Number);
  let startMin=sh*60+sm, endMin=eh*60+em;
  if(endMin<=startMin) endMin+=24*60;
  const diff=endMin-startMin;
  return `${pad2(Math.floor(diff/60))}h ${pad2(diff%60)}m`;
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
function firstWeightEntryFor(key){
  const today=todayStr();
  const dates=Object.keys(state.daily).filter(d=>d<=today && state.daily[d].health && state.daily[d].health[key] && state.daily[d].health[key].weight).sort();
  if(!dates.length) return null;
  const d=dates[0];
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
function coupleHealthSchedKeys(){
  if(!state.healthSchedule) state.healthSchedule={dad:[],mom:[],daughter:[]};
  if(!state.healthSchedule.couple) state.healthSchedule.couple=[];
  return ['dad','mom','couple'];
}
function myHealthSchedList(){
  if(healthPerson==='daughter') return state.healthSchedule.daughter||[];
  return coupleHealthSchedKeys().flatMap(k=>(state.healthSchedule[k]||[]));
}
function findHealthSchedItem(id){
  const keys = healthPerson==='daughter' ? ['daughter'] : coupleHealthSchedKeys();
  for(const k of keys){
    const arr=state.healthSchedule[k]||[];
    const idx=arr.findIndex(x=>x.id===id);
    if(idx>=0) return {key:k, idx, item:arr[idx]};
  }
  return null;
}
function renderHealth(){
  healthPerson = effectiveRole() || 'mom';
  if(effectiveRole()==='mom' && !momWeightDefaultsApplied){
    momWeightDefaultsApplied=true;
    weightChartOthers=['dad','daughter'];
  }
  if(effectiveRole()==='daughter' && !daughterWeightDefaultsApplied){
    daughterWeightDefaultsApplied=true;
    weightChartOthers=['dad'];
  }
  const day=state.daily[healthDate]||{};
  const rec=(day.health&&day.health[healthPerson])||{};
  const todaysMealsByType={};
  (rec.meals||[]).forEach(m=>{ todaysMealsByType[m.mealType]=m; });
  const hasAnyMealRecord = MEAL_TYPES.some(t=>{ const m=todaysMealsByType[t]; return m && (m.content || m.fasted); });
  const mealScore = 100 + MEAL_TYPES.reduce((sum,t)=>{
    const m=todaysMealsByType[t];
    if(m && m.content) return sum + (MEAL_AMOUNT_POINTS[m.amount]||0);
    if(m && m.fasted) return sum + MEAL_FAST_POINTS;
    return sum;
  }, 0);
  const mealWindowDates=Array.from({length:7},(_,i)=>fmtDate(addDays(parseDate(healthDate), -(7-i))));
  const mealGroups=mealWindowDates.slice().reverse().map(d=>{
    const dayRec=(state.daily[d] && state.daily[d].health && state.daily[d].health[healthPerson]) || {};
    const entries=(dayRec.meals||[]).slice().sort((a,b)=>MEAL_TYPES.indexOf(a.mealType)-MEAL_TYPES.indexOf(b.mealType));
    return {date:d, entries};
  });
  const el=document.getElementById('tab-health');
  const dLabel = parseDate(healthDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const dLabelColor = weekdayColor(healthDate);
  const schedList = myHealthSchedList().map(it=>({...it,d:dday(it.date)})).sort((a,b)=>a.d-b.d);
  const otherMembers=FAMILY_MEMBERS.filter(m=>m.key!==healthPerson);
  const goals = weightGoalsFor(healthPerson);
  const curWeight = latestWeightFor(healthPerson);
  const firstEntry = firstWeightEntryFor(healthPerson);
  const targetDate = projectedAchievementDate(curWeight, goals.target, goals.weeklyLoss);
  const finalDate = projectedAchievementDate(curWeight, goals.finalTarget, goals.weeklyLoss);
  let targetNote='', targetNoteColor='', finalNote='', finalNoteColor='';
  const WT_BLUE='#4d7fe0';
  if(firstEntry && curWeight!=null){
    const kgDiff=Math.round((curWeight-firstEntry.weight)*10)/10;
    if(kgDiff!==0){
      targetNote = kgDiff<0 ? `첫 기록에서 ${Math.abs(kgDiff)}kg 줄었어요` : `첫 기록에서 ${kgDiff}kg 늘었어요`;
      targetNoteColor = kgDiff<0 ? WT_BLUE : 'var(--bad)';
    }
  }
  if(firstEntry && goals.finalTarget && goals.weeklyLoss && finalDate){
    const firstProjDate=projectedAchievementDate(firstEntry.weight, goals.finalTarget, goals.weeklyLoss);
    if(firstProjDate){
      const dayDiff=Math.round((parseDate(finalDate)-parseDate(firstProjDate))/86400000);
      if(dayDiff!==0){
        finalNote = dayDiff<0 ? `첫 기록에서 ${Math.abs(dayDiff)}일 줄었어요` : `첫 기록에서 ${dayDiff}일 늘었어요`;
        finalNoteColor = dayDiff<0 ? WT_BLUE : 'var(--bad)';
      }
    }
  }
  const goalLineHtml=(icon, mainText, note, noteColor)=>{
    if(isMobileViewport()){
      const coloredNote=note?`<span style="color:${noteColor};">(${note})</span>`:'';
      return `<div class="meta" style="margin-top:2px;text-align:right;color:var(--text);">${icon} ${mainText}${note?`<br>${coloredNote}`:''}</div>`;
    }
    if(!note) return `<div class="meta" style="margin-top:2px;">${icon} ${mainText}</div>`;
    const coloredNote=`<span style="color:${noteColor};">(${note})</span>`;
    return `<div class="meta" style="margin-top:2px;">${icon} ${mainText} ${coloredNote}</div>`;
  };
  const otherGoalLines = otherMembers.filter(m=>weightChartOthers.includes(m.key) && weightGoalsFor(m.key).weeklyLoss)
    .map(m=>`<div class="meta">${m.label}는 주당 ${weightGoalsFor(m.key).weeklyLoss}g 감량이 목표입니다</div>`).join('');
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <div class="row" style="gap:8px;align-items:center;flex-wrap:wrap;">
            <h3 style="margin:0;">📈 체중 추이</h3>
            <span class="meta">${weightGoalSummaryText(goals)}</span>
            <button class="icon-btn" id="editWeightGoalBtn" title="목표 수정" style="padding:0 2px;font-size:13px;">✏️</button>
          </div>
          ${otherGoalLines}
        </div>
        <div class="row" style="gap:10px;">
          ${otherMembers.map(m=>`<label class="pill" style="cursor:pointer;"><input type="checkbox" class="weightExtraToggle" value="${m.key}" ${weightChartOthers.includes(m.key)?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">${MEMBER_EMOJI[m.key]||''} ${m.label}</label>`).join('')}
        </div>
      </div>
      <div style="margin-top:10px;">${renderWeightChart([healthPerson].concat(weightChartOthers), [healthPerson].concat(weightChartOthers).map(k=>{ const g=weightGoalsFor(k); return {key:k, weeklyLoss:g.weeklyLoss, finalTarget:g.finalTarget, target:g.target}; }))}</div>
      <div style="margin-top:8px;text-align:right;">
        ${targetDate?goalLineHtml('🎯', `1차 목표 ${goals.target}kg, ${fmtKoreanDate(targetDate)} 달성 목표`, targetNote, targetNoteColor):''}
        ${finalDate?goalLineHtml('🏁', `최종목표 ${goals.finalTarget}kg, ${fmtKoreanDate(finalDate)} 달성 목표`, finalNote, finalNoteColor):''}
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
          <div class="row" style="justify-content:space-between;align-items:center;">
            <label id="sleepCalcResult">${rec.sleepStart && rec.sleepEnd ? `취침시간 → 기상시간 : ${hourMinDiffLabel(rec.sleepStart, rec.sleepEnd)}` : '취침시간 → 기상시간'}</label>
            <button type="button" class="btn small" id="hSleepNowBtn">기록하기</button>
          </div>
          <div class="row" style="gap:4px;flex-wrap:nowrap;">
            ${timeSelect10Html('hSleepStart', rec.sleepStart||'23:00')}
            ${timeSelect10Html('hSleepEnd', rec.sleepEnd||'07:00')}
          </div>
        </div>
        <div class="field">
          <div class="row" style="justify-content:space-between;align-items:center;">
            <label id="fastingCalcResult">${rec.lastMeal && rec.firstMeal ? `Last Meal → First Meal : ${hourMinDiffLabel(rec.lastMeal, rec.firstMeal)}` : 'Last Meal → First Meal'}</label>
            <button type="button" class="btn small" id="hFastingNowBtn">기록하기</button>
          </div>
          <div class="row" style="gap:4px;flex-wrap:nowrap;">
            ${timeSelect10Html('hLastMeal', rec.lastMeal||'19:30')}
            ${timeSelect10Html('hFirstMeal', rec.firstMeal||'07:30')}
          </div>
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
        <label>${hasAnyMealRecord ? `오늘의 식단은 <span style="color:var(--accent);font-weight:800;">${mealScore}점</span> 입니다` : `오늘의 식단 <span class="meta" style="font-weight:400;">(오늘 식단을 입력해 볼까 ^^)</span>`}</label>
        <div class="meal-card-grid">
          ${MEAL_TYPES.map(t=>{
            const m=todaysMealsByType[t];
            const hasContent = !!(m && m.content);
            const fasted = !!(m && m.fasted);
            const confirmed = hasContent || fasted;
            const statusText = hasContent ? m.amount : MEAL_FAST_TEXT[t];
            const points = hasContent ? MEAL_AMOUNT_POINTS[m.amount] : (fasted ? MEAL_FAST_POINTS : null);
            const pointsHtml = points!=null ? `<span style="color:${points<0?'#ff8080':'#4ade80'};font-weight:700;">${points>0?'+':''}${points}점</span>` : '';
            const amountImg = hasContent ? MEAL_AMOUNT_IMAGES[m.amount] : null;
            const imgStyle = hasContent ? (MEAL_AMOUNT_IMAGE_STYLE[m.amount] || {x:50,y:15,scale:1.0}) : null;
            const bgImgHtml = amountImg ? `<img src="${amountImg}" class="meal-card-bg" style="object-position:${imgStyle.x}% ${imgStyle.y}%;transform:scale(${imgStyle.scale});"><div class="meal-card-overlay"></div>` : '';
            return `<div class="meal-card${confirmed?' meal-card-done':''}${amountImg?' meal-card-photo':''}">
              ${bgImgHtml}
              <div class="meal-card-top">
                <span class="meal-card-icon">${MEAL_ICONS[t]}</span>
                <div class="meal-card-preview${hasContent?'':' empty'}" title="${hasContent?escapeHtml(m.content):''}">${hasContent?escapeHtml(m.content):''}</div>
                <button type="button" class="meal-card-edit" data-meal-add="${t}" title="${t} 기록">✏️</button>
              </div>
              <div class="meal-card-label">${t}</div>
              <div class="meal-card-status">
                <button type="button" class="meal-card-check" data-meal-check="${t}" ${hasContent?'disabled':''}>${confirmed?'✅':'⚪'}</button>
                <span class="${confirmed?'meal-status-bold':'meal-status-muted'}">${escapeHtml(statusText)}</span>
                ${pointsHtml}
              </div>
            </div>`;
          }).join('')}
        </div>
        <div style="margin-top:8px;">
          ${mealGroups.map(g=>{
            const wc=weekdayColor(g.date);
            const dateLabel=`${g.date.slice(5)}(${parseDate(g.date).toLocaleDateString('ko-KR',{weekday:'short'})})`;
            const lines = g.entries.length ? g.entries.map(mealEntryLineHtml) : ['기록 없음'];
            const gridRows = lines.map((line,i)=>`
              <div style="font-weight:700;font-size:12.5px;white-space:nowrap;${wc?'color:'+wc+';':''}">${i===0?dateLabel:''}</div>
              <div class="content-text">${line}</div>`).join('');
            const actions = g.entries.length ? `<button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-meal-day="${g.date}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-meal-day="${g.date}" title="삭제">✕</button>` : '';
            return `<div class="list-item" style="align-items:flex-start;">
              <div class="row" style="gap:8px;align-items:flex-start;flex:1;min-width:0;">
                ${mealMoodImgHtml(g.entries)}
                <div class="meal-history-grid">${gridRows}</div>
              </div>
              <div class="row" style="flex-shrink:0;">${actions}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>
    ${healthPerson!=='daughter'?`
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🩺 주요 검진 일정</h3><button class="btn primary small" id="addHealthSchedBtn">+ 추가</button></div>
      ${schedList.length? schedList.map(it=>`
        <div class="list-item">
          <div><div>${escapeHtml(it.name)}</div><div class="meta">${it.date}${it.memo?' · '+escapeHtml(it.memo):''}</div></div>
          <div class="row"><span class="pill ${ddayPillClass(it.d)}">${ddayLabel(it.d)}</span>
            <button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-hsched="${it.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-hsched="${it.id}" title="삭제">✕</button></div>
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
    const prevWeight=latestWeightFor(healthPerson);
    const prevDate=(goals.finalTarget && goals.weeklyLoss) ? projectedAchievementDate(prevWeight, goals.finalTarget, goals.weeklyLoss) : null;
    save('weight', newVal);
    const reachedGoal = newVal ? checkWeightGoalReached(healthPerson, newVal) : false;
    if(newVal && !reachedGoal) checkWeightDateChange(healthPerson, prevDate, newVal, goals);
    renderHealth();
  });
  document.getElementById('hCalories').addEventListener('change',e=>save('calories', e.target.value?Number(e.target.value):''));
  document.getElementById('hSymptom').addEventListener('change',e=>save('symptom', e.target.value));
  document.getElementById('hNetwork').addEventListener('change',e=>save('network', e.target.value));
  const recalcSleep=()=>{
    const s=getTimeSelect10Value('hSleepStart'), en=getTimeSelect10Value('hSleepEnd');
    save('sleepStart', s); save('sleepEnd', en);
    const hrs=calcHourDiff(s, en);
    save('sleep', hrs==null?'':hrs);
    document.getElementById('sleepCalcResult').textContent = hrs!=null ? `취침시간 → 기상시간 : ${hourMinDiffLabel(s, en)}` : '취침시간 → 기상시간';
  };
  const recalcFasting=()=>{
    const lm=getTimeSelect10Value('hLastMeal'), fm=getTimeSelect10Value('hFirstMeal');
    save('lastMeal', lm); save('firstMeal', fm);
    const hrs=calcHourDiff(lm, fm);
    save('fasting', hrs==null?'':hrs);
    document.getElementById('fastingCalcResult').textContent = hrs!=null ? `Last Meal → First Meal : ${hourMinDiffLabel(lm, fm)}` : 'Last Meal → First Meal';
  };
  bindTimeSelect10('hSleepStart', recalcSleep);
  bindTimeSelect10('hSleepEnd', recalcSleep);
  bindTimeSelect10('hLastMeal', recalcFasting);
  bindTimeSelect10('hFirstMeal', recalcFasting);
  document.getElementById('hSleepNowBtn').onclick=()=>{
    setTimeSelect10Value('hSleepEnd', nowTimeStr10());
    recalcSleep();
    document.getElementById('healthSaveStatus').textContent='✓ 저장됨';
  };
  document.getElementById('hFastingNowBtn').onclick=()=>{
    setTimeSelect10Value('hFirstMeal', nowTimeStr10());
    recalcFasting();
    document.getElementById('healthSaveStatus').textContent='✓ 저장됨';
  };
  const hSymptomEl=document.getElementById('hSymptom');
  const autoResize=()=>{ hSymptomEl.style.height='auto'; hSymptomEl.style.height=hSymptomEl.scrollHeight+'px'; };
  autoResize();
  hSymptomEl.addEventListener('input', autoResize);
  ['hWeight','hCalories','hSymptom','hNetwork'].forEach(id=>{
    document.getElementById(id).addEventListener('input', ()=>{
      document.getElementById('healthSaveStatus').textContent='';
    });
  });
  ['hSleepStart','hSleepEnd','hLastMeal','hFirstMeal'].forEach(id=>{
    bindTimeSelect10(id, ()=>{ document.getElementById('healthSaveStatus').textContent=''; });
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
  el.querySelectorAll('[data-meal-add]').forEach(b=>b.onclick=()=>openMealSlotModal(b.dataset.mealAdd));
  el.querySelectorAll('[data-meal-check]').forEach(b=>b.onclick=()=>{
    const entry=findOrCreateMealSlot(b.dataset.mealCheck);
    entry.fasted=!entry.fasted;
    queueSave(); renderHealth();
  });
  el.querySelectorAll('[data-edit-meal-day]').forEach(b=>b.onclick=()=>openMealDayModal(b.dataset.editMealDay));
  el.querySelectorAll('[data-del-meal-day]').forEach(b=>b.onclick=()=>{
    if(!confirm('이 날짜의 식단 기록을 모두 삭제할까요?')) return;
    const date=b.dataset.delMealDay;
    if(state.daily[date] && state.daily[date].health && state.daily[date].health[healthPerson]) state.daily[date].health[healthPerson].meals=[];
    queueSave(); renderHealth();
  });
  const addHealthSchedBtn=document.getElementById('addHealthSchedBtn');
  if(addHealthSchedBtn) addHealthSchedBtn.onclick=()=>openHealthSchedModal();
  el.querySelectorAll('[data-edit-hsched]').forEach(b=>b.onclick=()=>{
    const found=findHealthSchedItem(b.dataset.editHsched);
    if(found) openHealthSchedModal(found.item);
  });
  el.querySelectorAll('[data-del-hsched]').forEach(b=>b.onclick=()=>{
    if(!confirm('삭제할까요?')) return;
    const found=findHealthSchedItem(b.dataset.delHsched);
    if(found){ state.healthSchedule[found.key].splice(found.idx,1); markDeleted(b.dataset.delHsched); queueSave(); renderHealth(); }
  });
}
function openHealthSchedModal(existing){
  const it=existing||{id:null,date:todayStr(),name:'',memo:''};
  const others=healthPerson==='daughter' ? FAMILY_MEMBERS.filter(m=>m.key!=='daughter') : FAMILY_MEMBERS.filter(m=>m.key==='daughter');
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
    if(it.id){
      const found=findHealthSchedItem(it.id);
      if(found) state.healthSchedule[found.key][found.idx]=rec;
    } else {
      const writeKey = healthPerson==='daughter' ? 'daughter' : (coupleHealthSchedKeys(), 'couple');
      if(!state.healthSchedule[writeKey]) state.healthSchedule[writeKey]=[];
      state.healthSchedule[writeKey].push(rec);
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
  const midIdx=todayIdx+Math.round(futureDays/2);
  const endIdx=todayIdx+futureDays;
  const today=parseDate(todayStr());
  const dateList=Array.from({length:pastDays},(_,i)=>fmtDate(addDays(today, i-todayIdx)));
  const series=keys.map(key=>({
    key, label:memberLabel(key), color:ROLE_BADGE_COLOR[key]||'#8b7cf6',
    pts:dateList.map(d=>{
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
    const midDate = gp.target ? projectedAchievementDate(anchorEntry.weight, gp.target, gp.weeklyLoss) : null;
    const endDate = gp.finalTarget ? projectedAchievementDate(anchorEntry.weight, gp.finalTarget, gp.weeklyLoss) : null;
    const pts=new Array(totalDays).fill(null);
    pts[anchorIdx]=anchorEntry.weight;
    if(gp.target) pts[midIdx]=Number(gp.target);
    if(gp.finalTarget) pts[endIdx]=Number(gp.finalTarget);
    return {key:gp.key, color, pts, firstTarget:gp.target?Number(gp.target):null, midDate, endDate};
  }).filter(Boolean);
  const allVals=series.flatMap(s=>s.pts.filter(v=>v!=null)).concat(goals.flatMap(g=>g.pts.filter(v=>v!=null)));
  if(!allVals.length) return `<div class="empty">체중 기록이 아직 없어요</div>`;
  const keyBand={};
  keys.forEach(key=>{
    const s=series.find(x=>x.key===key);
    const g=goals.find(x=>x.key===key);
    const vals=(s?s.pts.filter(v=>v!=null):[]).concat(g?g.pts.filter(v=>v!=null):[]);
    if(!vals.length) return;
    const localMax=Math.max(...vals), localMin=Math.min(...vals);
    const bandMax=localMax+1;
    const bandMin=(g && g.firstTarget!=null) ? Math.min(g.firstTarget-1, localMin-0.5) : localMin-1;
    keyBand[key]={min:bandMin, max:bandMax};
  });
  let useBrokenAxis=false;
  if(keys.length>1 && Object.keys(keyBand).length===keys.length){
    const sortedBands=keys.map(k=>keyBand[k]).sort((a,b)=>a.min-b.min);
    useBrokenAxis=true;
    for(let i=1;i<sortedBands.length;i++){
      if(sortedBands[i].min<sortedBands[i-1].max){ useBrokenAxis=false; break; }
    }
  }
  let min,max;
  if(!useBrokenAxis){
    min=Math.min(...allVals); max=Math.max(...allVals);
    if(min===max){ min-=1; max+=1; }
    const pad=(max-min)*0.15; min-=pad; max+=pad;
  }
  const W=600,H=180,ML=36,MR=8,MT=28,MB=26;
  const plotW=W-ML-MR, plotH=H-MT-MB;
  const x=i=>ML+(i/(totalDays-1))*plotW;
  let y, gridLines;
  if(useBrokenAxis){
    const gapH=20;
    const n=keys.length;
    const slotH=(plotH-gapH*(n-1))/n;
    const orderedKeys=[...keys].sort((a,b)=>keyBand[b].max-keyBand[a].max);
    const slotTop={};
    orderedKeys.forEach((k,i)=>{ slotTop[k]=MT+i*(slotH+gapH); });
    y=(v,key)=>{
      const band=keyBand[key];
      return slotTop[key]+slotH-((v-band.min)/(band.max-band.min))*slotH;
    };
    gridLines=orderedKeys.map(k=>{
      const band=keyBand[k];
      return [0,0.5,1].map(t=>{
        const val=band.min+(band.max-band.min)*t;
        const yy=slotTop[k]+slotH-(t*slotH);
        return `<line x1="${ML}" y1="${yy}" x2="${W-MR}" y2="${yy}" stroke="var(--border)" stroke-width="1"/><text x="${ML-5}" y="${yy+3}" font-size="9" fill="var(--muted)" text-anchor="end">${val.toFixed(1)}</text>`;
      }).join('');
    }).join('');
  } else {
    y=v=>MT+plotH-((v-min)/(max-min))*plotH;
    gridLines=[0,0.25,0.5,0.75,1].map(t=>{
      const val=min+(max-min)*t;
      const yy=MT+plotH-(t*plotH);
      return `<line x1="${ML}" y1="${yy}" x2="${W-MR}" y2="${yy}" stroke="var(--border)" stroke-width="1"/><text x="${ML-5}" y="${yy+3}" font-size="9" fill="var(--muted)" text-anchor="end">${val.toFixed(1)}</text>`;
    }).join('');
  }
  const todayX=x(todayIdx);
  const todayLine=`<line x1="${todayX}" y1="${MT}" x2="${todayX}" y2="${MT+plotH}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  const seriesSvg=series.map(s=>{
    let pathD='', dots='', maxIdx=-1, maxVal=-Infinity;
    s.pts.forEach((v,i)=>{
      if(v==null) return;
      const px=x(i), py=useBrokenAxis?y(v,s.key):y(v);
      pathD += (pathD?'L':'M')+px+' '+py+' ';
      dots+=`<circle class="wt-point" data-tip="${escapeHtml(s.label)} ${v}kg (${fmtSlashMD(dateList[i].slice(5))})" cx="${px}" cy="${py}" r="4" fill="${s.color}" style="cursor:pointer;"/>`;
      if(v>maxVal){ maxVal=v; maxIdx=i; }
    });
    const maxLabel = maxIdx>=0 ? `<text x="${x(maxIdx)}" y="${(useBrokenAxis?y(maxVal,s.key):y(maxVal))-20}" font-size="8" fill="${s.color}" text-anchor="middle"><tspan x="${x(maxIdx)}" dy="0">${fmtSlashMD(dateList[maxIdx].slice(5))}</tspan><tspan x="${x(maxIdx)}" dy="11">${maxVal}kg</tspan></text>` : '';
    return pathD ? `<path d="${pathD.trim()}" fill="none" stroke="${s.color}" stroke-width="2"/>${dots}${maxLabel}` : '';
  }).join('');
  const goalSvg=goals.map(g=>{
    let pathD='';
    g.pts.forEach((v,i)=>{
      if(v==null) return;
      const py=useBrokenAxis?y(v,g.key):y(v);
      pathD += (pathD?'L':'M')+x(i)+' '+py+' ';
    });
    if(!pathD) return '';
    let svg=`<path d="${pathD.trim()}" fill="none" stroke="${g.color}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>`;
    const pointLabelAbove=(idx,val,dateStr,prefix)=>{
      if(val==null) return '';
      const ex=x(idx), ey=useBrokenAxis?y(val,g.key):y(val);
      const dLabel=dateStr?fmtSlashMD(dateStr.slice(5)):'';
      return `<circle cx="${ex}" cy="${ey}" r="4" fill="var(--panel)" stroke="${g.color}" stroke-width="2"/><text x="${ex}" y="${ey-10}" font-size="8" fill="${g.color}" text-anchor="middle">${escapeHtml(dLabel)} ${prefix} ${val.toFixed(1)}kg</text>`;
    };
    const pointLabelLeft=(idx,val,dateStr,prefix)=>{
      if(val==null) return '';
      const ex=x(idx), ey=useBrokenAxis?y(val,g.key):y(val);
      const dLabel=dateStr?fmtSlashMD(dateStr.slice(5)):'';
      return `<circle cx="${ex}" cy="${ey}" r="4" fill="var(--panel)" stroke="${g.color}" stroke-width="2"/><text x="${ex-8}" y="${ey+3}" font-size="8" fill="${g.color}" text-anchor="end">${escapeHtml(dLabel)} ${prefix} ${val.toFixed(1)}kg</text>`;
    };
    svg += pointLabelAbove(midIdx, g.pts[midIdx], g.midDate, '1차');
    svg += pointLabelLeft(endIdx, g.pts[endIdx], g.endDate, '최종');
    return svg;
  }).join('');
  const xLabels=dateList.map((d,i)=>{
    if(i%7!==0 && i!==todayIdx) return '';
    return `<text x="${x(i)}" y="${H-4}" font-size="9" fill="var(--muted)" text-anchor="middle">${fmtSlashMD(d.slice(5))}</text>`;
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
function fmtCurrency(v,cur){ return cur==='GBP' ? '£'+Number(v).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}) : Number(v).toLocaleString()+'원'; }
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
function openCurrencyExchangeModal(exchangeId){
  const exKrw = exchangeId ? state.budget.find(b=>b.exchangeId===exchangeId && b.currency==='KRW') : null;
  const exGbp = exchangeId ? state.budget.find(b=>b.exchangeId===exchangeId && b.currency==='GBP') : null;
  openModal(`
    <h3>💱 환전${exchangeId?' 수정':''}</h3>
    <div class="meta" style="margin-bottom:10px;">원화를 파운드로 환전한 내역을 기록해요. 원화 지출과 파운드 수입이 함께 추가되고, 각각의 통화 잔액에 바로 반영돼요.</div>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" id="mDate" value="${exKrw?exKrw.date:todayStr()}"></div>
    <div class="grid2">
      <div class="field"><label>보낸 금액 (원)</label><input type="number" id="mKrw" placeholder="예: 100000" value="${exKrw?exKrw.amount:''}"></div>
      <div class="field"><label>받은 금액 (£)</label><input type="number" id="mGbp" placeholder="예: 58" value="${exGbp?exGbp.amount:''}"></div>
    </div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">${exchangeId?'수정 저장':'환전 기록'}</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const krw=Number(document.getElementById('mKrw').value||0);
    const gbp=Number(document.getElementById('mGbp').value||0);
    if(!date||!krw||!gbp){ showToast('날짜, 원화 금액, 파운드 금액을 모두 입력해주세요'); return; }
    const myKey=currentAuthorKey();
    const rate=Math.round((krw/gbp)*100)/100;
    if(exKrw && exGbp){
      exKrw.date=date; exKrw.amount=krw; exKrw.memo=`£${gbp} 환전 (환율 ${rate.toLocaleString()})`;
      exGbp.date=date; exGbp.amount=gbp; exGbp.memo=`₩${krw.toLocaleString()} 환전`;
    } else {
      const exId=uid();
      state.budget.push({id:uid(), exchangeId:exId, date, category:'환전', amount:krw, currency:'KRW', memo:`£${gbp} 환전 (환율 ${rate.toLocaleString()})`, type:'expense', owner:myKey});
      state.budget.push({id:uid(), exchangeId:exId, date, category:'환전', amount:gbp, currency:'GBP', memo:`₩${krw.toLocaleString()} 환전`, type:'income', owner:myKey});
    }
    budgetMonth=date.slice(0,7);
    queueSave(); closeModal(); renderBudget(); renderHome();
    showToast(exchangeId?'환전 내역이 수정됐어요':'환전 내역이 기록됐어요');
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
const INCENTIVE_RATE_GBP=2.5;
function renderIncomeEstimateCard(label){
  label = label || '예상 수입';
  const thisWeek=mondayWeekRange(todayStr());
  const lastWeek=mondayWeekRange(fmtDate(addDays(parseDate(todayStr()),-7)));
  const lastWeekMin=weekActivityMinutes('daughter', lastWeek);
  const thisWeekMin=weekActivityMinutes('daughter', thisWeek);
  const lastIncentive=Math.round((lastWeekMin/60)*INCENTIVE_RATE_GBP*100)/100;
  const thisIncentive=Math.round((thisWeekMin/60)*INCENTIVE_RATE_GBP*100)/100;
  const latestWeight = latestWeightFor('daughter');
  const milestones=[{w:49,bonus:20},{w:48,bonus:50},{w:45,bonus:100}];
  const myKey='daughter';
  const loggedTexts=state.budget.filter(b=>b.type==='income'&&b.category==='체중감량 인센티브'&&(b.owner===undefined||b.owner===myKey)).map(b=>(b.memo||'')+' '+b.amount);
  const reached=latestWeight==null?[]:milestones.filter(ms=>latestWeight<=ms.w);
  const unpaid=reached.filter(ms=>!loggedTexts.some(t=>t.includes(String(ms.w))));
  const mobile=isMobileViewport();
  const headerBase=`주급 ₩200,000 + 주급 £${WEEKLY_ALLOWANCE_GBP}`;
  const rowBase=`₩200,000 + £${WEEKLY_ALLOWANCE_GBP}`;
  const weekRow=(icon, labelHtml, weekWord, weekRange, min, incentive)=>{
    const headline=`${labelHtml}: (${rowBase})${incentive>0?` + £${incentive}`:''}`;
    const detail=`${weekWord}(${weekRange}) <b style="color:${SB_COLORS.exercise};">운동시간 ${fmtStudyMin(min)}</b>`;
    if(mobile) return `<div style="display:flex;margin-top:4px;"><span style="flex-shrink:0;">${icon} </span><span>${headline}<br>${detail}</span></div>`;
    return `<div style="margin-top:4px;white-space:nowrap;">${icon} ${headline}, ${detail}</div>`;
  };
  const headerLine = mobile
    ? `<div style="font-size:13px;display:flex;"><span style="flex-shrink:0;">💡 ${label} = </span><span>(${headerBase})<br>+ 지난주 운동시간 × £${INCENTIVE_RATE_GBP} + Weight Incentive</span></div>`
    : `<div style="font-size:13px;white-space:nowrap;">💡 ${label} = (${headerBase}) + 지난주 운동시간 × £${INCENTIVE_RATE_GBP} + Weight Incentive</div>`;
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
function ensureExchangeIdsMigrated(){
  const unlinked = state.budget.filter(b=>b.category==='환전' && !b.exchangeId);
  if(!unlinked.length) return false;
  const byKey={};
  unlinked.forEach(b=>{
    const key=b.date+'|'+(b.owner||'');
    if(!byKey[key]) byKey[key]=[];
    byKey[key].push(b);
  });
  let changed=false;
  Object.values(byKey).forEach(group=>{
    const krwItems=group.filter(b=>(b.currency||'KRW')==='KRW');
    const gbpItems=group.filter(b=>b.currency==='GBP');
    const n=Math.min(krwItems.length, gbpItems.length);
    for(let i=0;i<n;i++){
      const exId=uid();
      krwItems[i].exchangeId=exId;
      gbpItems[i].exchangeId=exId;
      changed=true;
    }
  });
  return changed;
}
function renderBudget(){
  const el=document.getElementById('tab-budget');
  ensureBudgetOwnershipMigrated();
  if(ensureExchangeIdsMigrated()) queueSave();
  const myKey=currentAuthorKey();
  const myRole=effectiveRole();
  const isDaughter=myRole==='daughter';
  const myBudget=state.budget.filter(b=>b.owner===undefined || b.owner===myKey);
  const monthItems=myBudget.filter(b=>b.date.startsWith(budgetMonth));
  const items=monthItems.filter(b=>b.type!=='income' && b.category!=='환전').sort((a,b)=>b.date.localeCompare(a.date));
  const incomeItems=monthItems.filter(b=>b.type==='income' && b.category!=='환전').sort((a,b)=>b.date.localeCompare(a.date));
  const expenseByCur={KRW:0,GBP:0};
  items.forEach(b=>{ const cur=b.currency||'KRW'; expenseByCur[cur]=(expenseByCur[cur]||0)+Number(b.amount||0); });
  const incomeByCur={KRW:0,GBP:0};
  incomeItems.forEach(b=>{ const cur=b.currency||'KRW'; incomeByCur[cur]=(incomeByCur[cur]||0)+Number(b.amount||0); });
  const byCatByCur={KRW:{},GBP:{}};
  items.forEach(b=>{ const cur=b.currency||'KRW'; byCatByCur[cur][b.category]=(byCatByCur[cur][b.category]||0)+Number(b.amount||0); });
  let sortedExpenseItems=items;
  if(expenseSortKey){
    sortedExpenseItems=[...items].sort((a,b)=>{
      if(expenseSortKey==='date') return a.date.localeCompare(b.date);
      if(expenseSortKey==='category') return (a.category||'').localeCompare(b.category||'');
      if(expenseSortKey==='memo') return (a.memo||'').localeCompare(b.memo||'');
      if(expenseSortKey==='amount') return Number(a.amount||0)-Number(b.amount||0);
      return 0;
    });
  }
  let sortedIncomeItems=incomeItems;
  if(incomeSortKey){
    sortedIncomeItems=[...incomeItems].sort((a,b)=>{
      if(incomeSortKey==='date') return a.date.localeCompare(b.date);
      if(incomeSortKey==='category') return (a.category||'').localeCompare(b.category||'');
      if(incomeSortKey==='memo') return (a.memo||'').localeCompare(b.memo||'');
      if(incomeSortKey==='amount') return Number(a.amount||0)-Number(b.amount||0);
      return 0;
    });
  }
  const [y,m]=budgetMonth.split('-');
  const carryover=budgetCarryoverFor(myKey);
  const exchangeItemsThisMonth = monthItems.filter(b=>b.category==='환전');
  const exchangedKRWThisMonth = exchangeItemsThisMonth.filter(b=>(b.currency||'KRW')==='KRW').reduce((s,b)=>s+Number(b.amount||0),0);
  const exchangedGBPThisMonth = exchangeItemsThisMonth.filter(b=>b.currency==='GBP').reduce((s,b)=>s+Number(b.amount||0),0);
  const totalSumKRW = carryover.KRW + incomeByCur.KRW;
  const totalSumGBP = carryover.GBP + incomeByCur.GBP;
  const afterExchangeKRW = totalSumKRW - exchangedKRWThisMonth;
  const afterExchangeGBP = totalSumGBP + exchangedGBPThisMonth;
  const monthBalanceKRW = afterExchangeKRW - expenseByCur.KRW;
  const monthBalanceGBP = afterExchangeGBP - expenseByCur.GBP;
  const exchangeRecordMap={};
  myBudget.filter(b=>b.category==='환전' && b.exchangeId).forEach(b=>{
    if(!exchangeRecordMap[b.exchangeId]) exchangeRecordMap[b.exchangeId]={id:b.exchangeId, date:b.date};
    if(b.currency==='KRW') exchangeRecordMap[b.exchangeId].krw=b.amount;
    if(b.currency==='GBP') exchangeRecordMap[b.exchangeId].gbp=b.amount;
  });
  const exchangeRecords=Object.values(exchangeRecordMap).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div class="datebar" style="margin-bottom:0;"><button class="iconbtn" id="bPrev">‹</button><div class="d" style="font-size:15px;font-weight:700;">${y}년 ${Number(m)}월</div><button class="iconbtn" id="bNext">›</button></div>
        <div class="row" style="gap:10px;align-items:center;">
          <span style="font-size:16px;font-weight:700;">💳 이번달 잔액 ${fmtCurrencyColored(monthBalanceKRW,'KRW')}${monthBalanceGBP?' / '+fmtCurrencyColored(monthBalanceGBP,'GBP'):''}</span>
          <button class="btn small" id="exchangeCurBtn">💱 환전</button>
        </div>
      </div>
      <div class="stat-grid budget-stat-grid" style="margin-top:16px;">
        <div class="stat" id="carryoverStat" style="text-align:left;cursor:pointer;" title="클릭해서 전월 이월 금액 입력">
          <div class="l">전월 이월금액</div>
          <div class="v">${fmtCurrencyColored(carryover.KRW,'KRW')}${carryover.GBP?' / '+fmtCurrencyColored(carryover.GBP,'GBP'):''}</div>
          <div class="l" style="margin-top:8px;">이번달 총 수입</div>
          <div class="v">${fmtCurrencyColored(incomeByCur.KRW,'KRW')}${incomeByCur.GBP?' / '+fmtCurrencyColored(incomeByCur.GBP,'GBP'):''}</div>
        </div>
        <div class="stat" style="text-align:left;">
          <div class="l">합계 금액</div>
          <div class="v">${fmtCurrencyColored(totalSumKRW,'KRW')}${totalSumGBP?' / '+fmtCurrencyColored(totalSumGBP,'GBP'):''}</div>
          ${exchangeRecords.length?`<div style="margin-top:8px;">${exchangeRecords.map(r=>`
            <div class="row" style="align-items:center;gap:4px;flex-wrap:nowrap;margin-top:4px;">
              <span class="l" style="white-space:nowrap;">${r.date.slice(5)} ${(r.krw||0).toLocaleString()}원 환전 (+£${Number(r.gbp||0).toFixed(2)})</span>
              <button type="button" class="btn small" style="font-size:10px;padding:1px 4px;flex-shrink:0;" data-edit-exchange="${r.id}" title="수정">✏️</button>
              <button type="button" class="btn small danger" style="font-size:10px;padding:1px 4px;flex-shrink:0;" data-del-exchange="${r.id}" title="삭제">✕</button>
            </div>`).join('')}</div>` : ''}
        </div>
        <div class="stat" style="text-align:left;">
          <div class="l">환전후 금액</div>
          <div class="v">${fmtCurrencyColored(afterExchangeKRW,'KRW')}${afterExchangeGBP?' / '+fmtCurrencyColored(afterExchangeGBP,'GBP'):''}</div>
        </div>
        <div class="stat" style="text-align:left;">
          <div class="l">이번달 지출</div>
          <div class="v">${fmtCurrencyColored(expenseByCur.KRW,'KRW')}${expenseByCur.GBP?' / '+fmtCurrencyColored(expenseByCur.GBP,'GBP'):''}</div>
        </div>
      </div>
    </div>
    ${isDaughter?renderIncomeEstimateCard():''}
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">💰 수입 내역</h3>
        <div class="row"><button class="btn small" id="manageIncCatBtn">카테고리 관리</button><button class="btn primary small" id="addIncomeBtn">+ 수입 추가</button></div>
      </div>
      ${sortedIncomeItems.length?`
      <div style="overflow-x:auto;margin-top:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th data-sort-key-inc="date" style="cursor:pointer;text-align:left;padding:4px 3px 4px 0;white-space:nowrap;width:82px;${incomeSortKey==='date'?'color:var(--accent);':'color:var(--muted);'}">날짜${incomeSortKey==='date'?' ▲':''}</th>
              <th data-sort-key-inc="category" style="cursor:pointer;text-align:left;padding:4px 3px 4px 0;width:156px;${incomeSortKey==='category'?'color:var(--accent);':'color:var(--muted);'}">카테고리${incomeSortKey==='category'?' ▲':''}</th>
              <th data-sort-key-inc="amount" style="cursor:pointer;text-align:right;padding:4px 6px 4px 1px;width:90px;${incomeSortKey==='amount'?'color:var(--accent);':'color:var(--muted);'}">금액${incomeSortKey==='amount'?' ▲':''}</th>
              <th data-sort-key-inc="memo" style="cursor:pointer;text-align:left;padding:4px 4px 4px 24px;${incomeSortKey==='memo'?'color:var(--accent);':'color:var(--muted);'}">비고${incomeSortKey==='memo'?' ▲':''}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${sortedIncomeItems.map(b=>`
              <tr>
                <td style="text-align:left;padding:5px 3px 5px 0;font-size:12px;white-space:nowrap;">${b.date.slice(5)}</td>
                <td style="text-align:left;padding:5px 3px 5px 0;font-size:12px;"><span class="pill">${escapeHtml(b.category)}</span></td>
                <td style="text-align:right;padding:5px 6px 5px 1px;font-size:12px;white-space:nowrap;">${fmtCurrency(b.amount,b.currency||'KRW')}</td>
                <td style="text-align:left;padding:5px 4px 5px 24px;font-size:12px;">${escapeHtml(b.memo)}</td>
                <td style="text-align:right;padding:5px 0 5px 18px;white-space:nowrap;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-inc="${b.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-inc="${b.id}" title="삭제">✕</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty">이번달 수입 내역이 없어요</div>`}
    </div>
    <div class="card">
      <h3>지출 카테고리별</h3>
      ${['KRW','GBP'].some(cur=>Object.keys(byCatByCur[cur]).length) ? ['KRW','GBP'].map(cur=>{
        const byCat=byCatByCur[cur];
        if(!Object.keys(byCat).length) return '';
        const total=expenseByCur[cur]||0;
        return Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
          <div class="bar-row"><span style="width:70px;">${escapeHtml(c)}</span><div class="bar-track"><div class="bar-fill" style="width:${total?Math.round(v/total*100):0}%"></div></div><span style="width:80px;text-align:right;">${fmtCurrency(v,cur)}</span></div>
        `).join('');
      }).join('') : `<div class="empty">지출 내역이 없어요</div>`}
    </div>
    ${myRole==='mom'?renderIncomeEstimateCard('예상 지출'):''}
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🧾 지출 내역</h3>
        <div class="row"><button class="btn small" id="manageCatBtn">카테고리 관리</button><button class="btn primary small" id="addBudgetBtn">+ 지출 추가</button></div>
      </div>
      ${sortedExpenseItems.length?`
      <div style="overflow-x:auto;margin-top:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th data-sort-key="date" style="cursor:pointer;text-align:left;padding:4px 3px 4px 0;white-space:nowrap;width:82px;${expenseSortKey==='date'?'color:var(--accent);':'color:var(--muted);'}">날짜${expenseSortKey==='date'?' ▲':''}</th>
              <th data-sort-key="category" style="cursor:pointer;text-align:left;padding:4px 3px 4px 0;width:156px;${expenseSortKey==='category'?'color:var(--accent);':'color:var(--muted);'}">카테고리${expenseSortKey==='category'?' ▲':''}</th>
              <th data-sort-key="amount" style="cursor:pointer;text-align:right;padding:4px 6px 4px 1px;width:90px;${expenseSortKey==='amount'?'color:var(--accent);':'color:var(--muted);'}">금액${expenseSortKey==='amount'?' ▲':''}</th>
              <th data-sort-key="memo" style="cursor:pointer;text-align:left;padding:4px 4px 4px 24px;${expenseSortKey==='memo'?'color:var(--accent);':'color:var(--muted);'}">비고${expenseSortKey==='memo'?' ▲':''}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${sortedExpenseItems.map(b=>`
              <tr>
                <td style="text-align:left;padding:5px 3px 5px 0;font-size:12px;white-space:nowrap;">${b.date.slice(5)}</td>
                <td style="text-align:left;padding:5px 3px 5px 0;font-size:12px;"><span class="pill">${escapeHtml(b.category)}</span></td>
                <td style="text-align:right;padding:5px 6px 5px 1px;font-size:12px;white-space:nowrap;">${fmtCurrency(b.amount,b.currency||'KRW')}</td>
                <td style="text-align:left;padding:5px 4px 5px 24px;font-size:12px;">${escapeHtml(b.memo)}</td>
                <td style="text-align:right;padding:5px 0 5px 18px;white-space:nowrap;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit="${b.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del="${b.id}" title="삭제">✕</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div class="empty">이번달 지출 내역이 없어요</div>`}
    </div>
  `;
  document.getElementById('bPrev').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,-1); renderBudget(); };
  document.getElementById('bNext').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,1); renderBudget(); };
  document.getElementById('exchangeCurBtn').onclick=()=>openCurrencyExchangeModal();
  document.getElementById('carryoverStat').onclick=()=>openCarryoverModal();
  el.querySelectorAll('[data-edit-exchange]').forEach(b=>b.onclick=()=>openCurrencyExchangeModal(b.dataset.editExchange));
  el.querySelectorAll('[data-del-exchange]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){
      const exId=b.dataset.delExchange;
      state.budget.filter(x=>x.exchangeId===exId).forEach(x=>markDeleted(x.id));
      state.budget=state.budget.filter(x=>x.exchangeId!==exId);
      queueSave(); renderBudget(); renderHome();
    }
  });
  document.getElementById('addBudgetBtn').onclick=()=>openBudgetModal();
  document.getElementById('manageCatBtn').onclick=()=>openCategoryManageModal();
  document.getElementById('addIncomeBtn').onclick=()=>openIncomeModal();
  document.getElementById('manageIncCatBtn').onclick=()=>openIncomeCategoryManageModal();
  el.querySelectorAll('[data-sort-key]').forEach(th=>th.onclick=()=>{
    const k=th.dataset.sortKey;
    expenseSortKey = (expenseSortKey===k) ? null : k;
    renderBudget();
  });
  el.querySelectorAll('[data-sort-key-inc]').forEach(th=>th.onclick=()=>{
    const k=th.dataset.sortKeyInc;
    incomeSortKey = (incomeSortKey===k) ? null : k;
    renderBudget();
  });
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openBudgetModal(state.budget.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.del); markDeleted(b.dataset.del); queueSave(); renderBudget(); renderHome(); }
  });
  el.querySelectorAll('[data-edit-inc]').forEach(b=>b.onclick=()=>openIncomeModal(state.budget.find(x=>x.id===b.dataset.editInc)));
  el.querySelectorAll('[data-del-inc]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.delInc); markDeleted(b.dataset.delInc); queueSave(); renderBudget(); renderHome(); }
  });
}
function openCategoryManageModal(){
  const cats=myBudgetCategories();
  openModal(`
    <h3>내 카테고리 관리</h3>
    <div class="meta" style="margin-bottom:10px;">여기서 관리하는 카테고리는 지금 로그인한 계정에만 적용돼요.</div>
    ${cats.map(c=>{
      const cnt=state.budget.filter(x=>x.category===c && x.type!=='income').length;
      return `<div class="list-item"><div>${escapeHtml(c)}${cnt?` <span class="meta">(${cnt}건 사용중)</span>`:''}</div><div class="row" style="gap:4px;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-cat="${escapeHtml(c)}" title="수정">✏️</button><button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-cat="${escapeHtml(c)}" title="삭제">✕</button></div></div>`;
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
  document.querySelectorAll('[data-edit-cat]').forEach(b=>b.onclick=()=>openCategoryEditModal(b.dataset.editCat));
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
function openCategoryEditModal(oldName){
  openModal(`
    <h3>카테고리 수정</h3>
    <div class="field"><label>이름</label><input id="mCatName" value="${escapeHtml(oldName)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mCatName').value.trim();
    if(!name){ showToast('이름을 입력해주세요'); return; }
    const list=myBudgetCategories();
    if(name!==oldName && list.includes(name)){ showToast('이미 있는 카테고리예요'); return; }
    const idx=list.indexOf(oldName);
    if(idx>=0) list[idx]=name;
    if(name!==oldName){ state.budget.forEach(b=>{ if(b.type!=='income' && b.category===oldName) b.category=name; }); }
    queueSave(); closeModal(); openCategoryManageModal();
  };
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
    const gbp=Math.round((min/60)*INCENTIVE_RATE_GBP*100)/100;
    return {amount:gbp, currency:'GBP', memo:`지난주 ${pad2(Math.floor(min/60))}시 ${pad2(min%60)}분 달성! 💗`};
  }
  if(category==='체중감량 인센티브') return {amount:'', currency:'GBP', memo:'목표 몸무게 달성! 💗'};
  return null;
}
function openIncomeModal(existing){
  const myCats=myIncomeCategories();
  const b=existing||{id:null,date:budgetMonth+'-'+pad2(new Date().getDate()),category:myCats[0]||'기타',amount:'',currency:'KRW',memo:''};
  const catOptions = myCats.includes(b.category) ? myCats : myCats.concat([b.category]);
  if(!existing){
    const d=incomeCategoryDefaults(currentAuthorKey(), b.category);
    if(d){ b.amount=d.amount; b.currency=d.currency; b.memo=d.memo; }
  }
  openModal(`
    <h3>${existing?'수입 수정':'수입 추가'}</h3>
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
      return `<div class="list-item"><div>${escapeHtml(c)}${cnt?` <span class="meta">(${cnt}건 사용중)</span>`:''}</div><div class="row" style="gap:4px;"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-inccat="${escapeHtml(c)}" title="수정">✏️</button><button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-inccat="${escapeHtml(c)}" title="삭제">✕</button></div></div>`;
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
  document.querySelectorAll('[data-edit-inccat]').forEach(b=>b.onclick=()=>openIncomeCategoryEditModal(b.dataset.editInccat));
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
function openIncomeCategoryEditModal(oldName){
  openModal(`
    <h3>카테고리 수정</h3>
    <div class="field"><label>이름</label><input id="mIncCatName" value="${escapeHtml(oldName)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mIncCatName').value.trim();
    if(!name){ showToast('이름을 입력해주세요'); return; }
    const list=myIncomeCategories();
    if(name!==oldName && list.includes(name)){ showToast('이미 있는 카테고리예요'); return; }
    const idx=list.indexOf(oldName);
    if(idx>=0) list[idx]=name;
    if(name!==oldName){ state.budget.forEach(b=>{ if(b.type==='income' && b.category===oldName) b.category=name; }); }
    queueSave(); closeModal(); openIncomeCategoryManageModal();
  };
}

/* ---------- GAMIFICATION ---------- */
function gamificationFlags(key){
  if(!state.gamification) state.gamification={};
  if(!state.gamification[key]) state.gamification[key]={studyHourMilestone:{}, weightGoalCelebrated:{target:false,finalTarget:false}, lastNudgeDate:''};
  if(!state.gamification[key].weightGoalCelebrated) state.gamification[key].weightGoalCelebrated={target:false,finalTarget:false};
  return state.gamification[key];
}
function celebrate(title, message, achievedDate){
  const logKey=effectiveRole()||currentAuthorKey();
  const sub = logKey==='daughter' ? '우리딸💗 정말 잘하고 있어요! 💪' : '정말 잘하고 있어요! 💪';
  if(logKey){
    if(!state.achievementLog) state.achievementLog={};
    if(!state.achievementLog[logKey]) state.achievementLog[logKey]=[];
    state.achievementLog[logKey].push({date:achievedDate||todayStr(), message, sub});
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
    celebrate('기록 달성! 🎉', `학습·운동 ${hours}시간을 기록했어요!`, dateStr);
  }
}
function checkWeightGoalReached(key, newWeight){
  const goals=weightGoalsFor(key);
  const flags=gamificationFlags(key);
  if(goals.target && Number(newWeight)<=Number(goals.target) && !flags.weightGoalCelebrated.target){
    flags.weightGoalCelebrated.target=true;
    queueSave();
    celebrate('1차 목표 달성! 🎯', `${memberLabel(key)} ${goals.target}kg 목표를 달성했어요!`);
    return true;
  }
  if(goals.finalTarget && Number(newWeight)<=Number(goals.finalTarget) && !flags.weightGoalCelebrated.finalTarget){
    flags.weightGoalCelebrated.finalTarget=true;
    queueSave();
    celebrate('최종 목표 달성! 🏁', `${memberLabel(key)} 최종 목표 ${goals.finalTarget}kg 달성! 정말 대단해요!`);
    return true;
  }
  return false;
}
function checkWeightDateChange(key, prevDate, curWeight, goals){
  if(!goals.finalTarget || !goals.weeklyLoss || !prevDate) return;
  const newDate=projectedAchievementDate(curWeight, goals.finalTarget, goals.weeklyLoss);
  if(!newDate) return;
  const diffDays=Math.round((parseDate(newDate)-parseDate(prevDate))/86400000);
  let icon, title, message;
  if(diffDays<0){
    icon='🎉';
    title='목표달성일이 앞당겨졌어요!';
    message=`축하합니다! 목표달성일이 ${-diffDays}일 줄었습니다`;
  } else if(diffDays>0){
    icon='💪';
    title='목표달성일이 늘었어요';
    message=`목표달성일이 ${diffDays}일 늘었군요. 다시 화이팅!!`;
  } else {
    icon='♥';
    title='잘 하고 있어요';
    message='잘 하고 있습니다. 오늘도 행복하세용 ♥';
  }
  openModal(`
    <div style="text-align:center;padding:20px 10px;">
      <div style="font-size:36px;">${icon}</div>
      <h3 style="margin:10px 0 4px;">${title}</h3>
      <div style="font-size:14px;color:var(--text);">${escapeHtml(message)}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:8px;">${fmtKoreanDate(newDate)} 최종목표 달성 예상</div>
      <button class="btn primary" style="margin-top:16px;" id="wtDateCloseBtn">확인</button>
    </div>
  `);
  document.getElementById('wtDateCloseBtn').onclick=closeModal;
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
      ${log.slice(-5).reverse().map(e=>{
        const dateLabel = e.date ? `${Number(e.date.slice(5,7))}.${Number(e.date.slice(8,10))} ` : '';
        return `<div class="list-item"><div class="content-text">${escapeHtml(dateLabel)}${escapeHtml(e.message)} ${escapeHtml(e.sub)}</div></div>`;
      }).join('')}
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
function nowInfoForRole(role){
  const tz = role==='daughter' ? 'Europe/London' : 'Asia/Seoul';
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false}).formatToParts(new Date());
  const y=parts.find(p=>p.type==='year').value, m=parts.find(p=>p.type==='month').value, d=parts.find(p=>p.type==='day').value;
  const hour=Number(parts.find(p=>p.type==='hour').value)%24;
  return { dateStr:`${y}-${m}-${d}`, hour };
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
  const nowInfo=nowInfoForRole(effectiveRole());
  const showNowMarker=days.includes(nowInfo.dateStr);
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
    const nowMarker=(showNowMarker && h===nowInfo.hour) ? `<span style="color:#e5383b;">▶</span> ` : '';
    rows+=`<tr><td class="dt-time-col">${nowMarker}${pad2(h)}:00</td>${cells}</tr>`;
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
    return gap+`<td class="sb-summary-cell"><span style="color:var(--warn);font-weight:700;">🟡 공부 ${fmtStudyMin(summaries[di].study)}</span><br><span style="color:var(--good);font-weight:700;">🟢 운동 ${fmtStudyMin(summaries[di].exercise)}</span></td>`;
  }).join('');
  const gapCells=days.map((d,di)=>{
    const gap=di>0?'<td class="dt-gap"></td>':'';
    return gap+`<td></td>`;
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
            <tr class="sb-gap-row"><td class="dt-time-col"></td>${gapCells}</tr>
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
                : `<b>${range} 총 ${total}</b> (<span style="color:var(--warn);">학습 ${studyT}</span> / <span style="color:var(--good);">운동 ${exT}</span>)`;
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
            <button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-renew="${r.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-renew="${r.id}" title="삭제">✕</button></div>
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
                <td>${escapeHtml((v.maintCycle||{})[item]||'-')}</td>
                <td><button class="icon-btn" data-maint-item="${escapeHtml(item)}" title="기록 추가/수정">✏️</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${maintSorted.length?`<button class="link-btn" id="toggleMaintHistory" style="margin-top:10px;">${maintHistoryOpen?'전체 이력 접기':`전체 이력 보기 (${maintSorted.length}건)`}</button>`:''}
      ${maintHistoryOpen? maintSorted.map(mt=>`
        <div class="list-item">
          <div><div style="font-size:13px;">${escapeHtml(mt.item)}${mt.cost?' · '+Number(mt.cost).toLocaleString()+'원':''}</div><div class="meta">${mt.date}${mt.odo?' · '+Number(mt.odo).toLocaleString()+'km':''}${mt.place?' · '+escapeHtml(mt.place):''}${mt.memo?' · '+escapeHtml(mt.memo):''}</div></div>
          <div class="row"><button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit-maint="${mt.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del-maint="${mt.id}" title="삭제">✕</button></div>
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
  el.querySelectorAll('[data-del-renew]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.renewals=v.renewals.filter(x=>x.id!==b.dataset.delRenew); markDeleted(b.dataset.delRenew); queueSave(); renderVehicle(); renderHome(); } });
  document.getElementById('addMaintBtn').onclick=()=>openMaintModal();
  el.querySelectorAll('[data-edit-maint]').forEach(b=>b.onclick=()=>openMaintModal(v.maint.find(x=>x.id===b.dataset.editMaint)));
  el.querySelectorAll('[data-del-maint]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.maint=v.maint.filter(x=>x.id!==b.dataset.delMaint); markDeleted(b.dataset.delMaint); queueSave(); renderVehicle(); } });
  const toggleBtn=document.getElementById('toggleMaintHistory');
  if(toggleBtn) toggleBtn.onclick=()=>{ maintHistoryOpen=!maintHistoryOpen; renderVehicle(); };
  el.querySelectorAll('[data-maint-item]').forEach(b=>b.onclick=()=>{
    const item=b.dataset.maintItem;
    const records=v.maint.filter(mt=>mt.item===item).sort((a,b)=>b.date.localeCompare(a.date));
    if(records.length) openMaintModal(records[0]);
    else openMaintModal({id:null,date:todayStr(),item,place:'',cost:'',odo:'',memo:''});
  });
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
  const curCycle=(state.vehicle.maintCycle||{})[mt.item]||'';
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
    <div class="field"><label>점검주기 (선택)</label><input id="mCycle" value="${escapeHtml(curCycle)}" placeholder="예: 6개월"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(mt.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mItem').addEventListener('change', e=>{
    document.getElementById('mCycle').value=(state.vehicle.maintCycle||{})[e.target.value]||'';
  });
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const item=document.getElementById('mItem').value;
    if(!date||!item){ showToast('날짜와 점검 항목을 입력해주세요'); return; }
    const rec={id:mt.id||uid(),date,item,place:document.getElementById('mPlace').value,cost:document.getElementById('mCost').value,odo:document.getElementById('mOdo').value,memo:document.getElementById('mMemo').value};
    if(mt.id){ const idx=state.vehicle.maint.findIndex(x=>x.id===mt.id); state.vehicle.maint[idx]=rec; }
    else state.vehicle.maint.push(rec);
    if(!state.vehicle.maintCycle) state.vehicle.maintCycle={};
    state.vehicle.maintCycle[item]=document.getElementById('mCycle').value;
    queueSave(); closeModal(); renderVehicle();
  };
}

/* ---------- EVENTS (경조사) ---------- */
function renderEvents(){
  const el=document.getElementById('tab-events');
  const withD = state.events.map(ev=>({...ev, d: ddayFromDate(eventOccurrence(ev)), occDate: fmtDate(eventOccurrence(ev))}));
  const upcoming = withD.filter(e=>e.d>=0).sort((a,b)=>a.d-b.d);
  const past = withD.filter(e=>e.d<0).sort((a,b)=>b.d-a.d);
  const row = ev => `
    <div class="list-item" style="align-items:center;">
      <div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ${ev.isTax?`<span class="pill" style="background:rgba(255,105,150,0.14);margin-right:4px;">세금</span>`:''}<span style="font-size:13px;font-weight:400;">${escapeHtml(ev.name)}</span>
        <span class="meta">${ev.lunar?`음력 ${ev.lunarMonth}/${ev.lunarDay}${ev.lunarLeap?'(윤)':''}`:ev.date}${ev.recurring?' (매년)':''}${ev.hiddenFromDaughter?` <span class="pill">비공개</span>`:''}${ev.memo?' · '+escapeHtml(ev.memo):''}</span>
      </div>
      <div class="row" style="flex-wrap:nowrap;flex-shrink:0;">
        <span class="meta" style="width:76px;text-align:right;white-space:nowrap;">${ev.occDate}</span>
        <span class="pill ${ddayPillClass(ev.d)}">${ddayLabel(ev.d)}</span>
        <button class="btn small" style="font-size:11px;padding:3px 8px;" data-edit="${ev.id}" title="수정">✏️</button> <button class="btn small danger" style="font-size:11px;padding:3px 8px;" data-del="${ev.id}" title="삭제">✕</button>
      </div>
    </div>`;
  el.innerHTML=`
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🎉 D-day List</h3><button class="btn primary small" id="addEventBtn">+ 추가</button></div>
      ${upcoming.length? upcoming.map(row).join('') : `<div class="empty">예정된 D-day가 없어요</div>`}
    </div>
    ${past.length?`<div class="card"><h3>지난 D-day</h3>${past.map(row).join('')}</div>`:''}
  `;
  document.getElementById('addEventBtn').onclick=()=>openEventModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEventModal(state.events.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.events=state.events.filter(x=>x.id!==b.dataset.del); markDeleted(b.dataset.del); queueSave(); renderEvents(); renderHome(); renderSchedule(); }
  });
}
function openEventModal(existing){
  const ev=existing||{id:null,name:'',date:todayStr(),recurring:true,memo:'',lunar:false,lunarYear:new Date().getFullYear(),lunarMonth:'',lunarDay:'',lunarLeap:false,hiddenFromDaughter:false,isTax:false};
  openModal(`
    <h3>${existing?'D-day 수정':'D-day 추가'}</h3>
    <div class="field"><label>이름</label><input id="mName" value="${escapeHtml(ev.name)}"></div>
    <div class="row" style="gap:6px;margin:6px 0;">
      <label class="pill" style="cursor:pointer;"><input type="checkbox" id="mLunar" ${ev.lunar?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">음력 날짜</label>
      <label class="pill" style="cursor:pointer;"><input type="checkbox" id="mIsTax" ${ev.isTax?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">세금</label>
    </div>
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
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mRecurring" ${ev.recurring?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">매년 반복</label>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0 6px 6px;"><input type="checkbox" id="mHideDaughter" ${ev.hiddenFromDaughter?'checked':''} style="position:absolute;opacity:0;width:0;height:0;">딸에게 비공개</label>
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
    const rec={id:ev.id||uid(),name,date,lunar:isLunar,lunarYear,lunarMonth,lunarDay,lunarLeap,recurring:document.getElementById('mRecurring').checked,hiddenFromDaughter:document.getElementById('mHideDaughter').checked,isTax:document.getElementById('mIsTax').checked,memo:document.getElementById('mMemo').value};
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
  const canViewDaughter = isDadOrGuest || realRole==='mom';
  if(momBtn) momBtn.classList.toggle('active', viewAsOverride==='mom');
  if(daughterBtn) daughterBtn.classList.toggle('active', viewAsOverride==='daughter');
  if(!isDadOrGuest && !canViewDaughter){
    if(momBtn) momBtn.style.display='none';
    if(daughterBtn) daughterBtn.style.display='none';
    return;
  }
  const isPreviewing = viewAsOverride==='daughter' || viewAsOverride==='mom';
  const authArea=document.getElementById('authArea');
  const themeToggle=document.getElementById('themeToggle');
  if(authArea) authArea.style.display = isPreviewing ? 'none' : '';
  if(themeToggle) themeToggle.style.display = isPreviewing ? 'none' : '';
  if(momBtn) momBtn.style.display = (isDadOrGuest && viewAsOverride!=='daughter') ? '' : 'none';
  if(daughterBtn) daughterBtn.style.display = (canViewDaughter && viewAsOverride!=='mom') ? '' : 'none';
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
const FLAG_KR_SVG=`<svg width="14" height="14" viewBox="0 0 100 100" style="vertical-align:-2px;"><circle cx="50" cy="50" r="50" fill="#c60c30"/><path d="M50,0 A50,50 0 0,0 50,100 A25,25 0 0,0 50,50 A25,25 0 0,1 50,0 Z" fill="#003478" stroke="#003478" stroke-width="1.5"/></svg>`;
const FLAG_GB_SVG=`<svg width="18" height="13" viewBox="0 0 16 11" style="vertical-align:-2px;"><rect width="16" height="11" fill="#00247d"/><path d="M0,0 L16,11 M16,0 L0,11" stroke="#fff" stroke-width="2.2"/><path d="M0,0 L16,11 M16,0 L0,11" stroke="#cf142b" stroke-width="1.1"/><path d="M8,0 V11 M0,5.5 H16" stroke="#fff" stroke-width="3.6"/><path d="M8,0 V11 M0,5.5 H16" stroke="#cf142b" stroke-width="2.2"/></svg>`;
function updateWorldClock(){
  const el=document.getElementById('worldClock');
  if(!el) return;
  const now=new Date();
  const kr=now.toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false});
  const uk=now.toLocaleTimeString('ko-KR',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit',hour12:false});
  el.innerHTML = `${FLAG_GB_SVG} ${uk} · ${FLAG_KR_SVG} ${kr}`;
}

function hasContentToday(){
  const role=effectiveRole();
  if(!role) return false;
  const authorKey=currentAuthorKey();
  const today=todayStr();
  const day=state.daily[today];
  if(day){
    const entry=day.entries && day.entries[authorKey];
    if(entry && ((entry.diary||'').trim() || entry.mood)) return true;
    const health=day.health && day.health[role];
    if(health && Object.keys(health).some(k=>{
      if(k==='meals') return Array.isArray(health[k]) && health[k].length>0;
      const v=health[k];
      return v!==undefined && v!=='' && v!==false;
    })) return true;
  }
  const sb=state.studyBlocks && state.studyBlocks[authorKey] && state.studyBlocks[authorKey][today];
  if(sb && sb.some(v=>v)) return true;
  return false;
}
function weightTrendDown(){
  const role=effectiveRole();
  if(!role) return false;
  const today=todayStr();
  const dates=Object.keys(state.daily).filter(d=>d<=today && state.daily[d].health && state.daily[d].health[role] && state.daily[d].health[role].weight!=null && state.daily[d].health[role].weight!=='').sort();
  if(dates.length<2) return false;
  const lastW=Number(state.daily[dates[dates.length-1]].health[role].weight);
  const prevW=Number(state.daily[dates[dates.length-2]].health[role].weight);
  return lastW<prevW;
}
function updateHeartIcon(){
  const el=document.getElementById('heartIcon');
  if(!el) return;
  el.textContent = hasContentToday() ? '💗' : '🩶';
  el.classList.toggle('heart-sparkle', weightTrendDown());
}
/* ---------- init ---------- */
function renderAll(){
  renderTabs();
  renderHome(); renderSchedule(); renderHealth(); renderBudget(); renderVehicle(); renderEvents(); renderStudy();
  updateHeartIcon();
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
