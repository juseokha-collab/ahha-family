/* ---------- utils ---------- */
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function pad2(n){ return String(n).padStart(2,'0'); }
function fmtDate(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function shortDate(s){ const [y,m,d]=s.split('-'); return y.slice(2)+'.'+m+'.'+d; }
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
    budgetCategories:{}
  };
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
function loadLocal(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      const base=defaultState();
      base.vehicle=Object.assign(base.vehicle, parsed.vehicle||{});
      return migrateVehicle(migrateDaily(Object.assign(base, parsed, {vehicle:base.vehicle})));
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
function currentAuthorKey(){ return user ? user.email : 'local'; }
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

function initAuth(){
  renderAuthArea();
  if(!auth) return;
  auth.onAuthStateChanged(async u=>{
    user=u;
    renderAuthArea();
    if(u && db){
      setSyncStatus('syncing');
      try{
        const doc = await familyDocRef().get();
        if(doc.exists){
          const data=doc.data();
          const base=defaultState();
          base.vehicle=Object.assign(base.vehicle, data.vehicle||{});
          state=migrateVehicle(migrateDaily(Object.assign(base, data, {vehicle:base.vehicle})));
        } else {
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
document.getElementById('tabs').addEventListener('click', e=>{
  const btn=e.target.closest('button[data-tab]'); if(!btn) return;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  ['home','schedule','health','budget','vehicle','events'].forEach(t=>{
    document.getElementById('tab-'+t).style.display = (t===btn.dataset.tab) ? '' : 'none';
  });
});

/* ---------- HOME ---------- */
let homeDate = todayStr();
const MOODS=['😊','🥰','🙂','😐','😫','😢','😠','🤒'];
let diaryArchiveOpen=false;
function renderHome(){
  const day = state.daily[homeDate] || {};
  const entries = day.entries || {};
  const myKey = currentAuthorKey();
  const mine = entries[myKey] || {};
  const others = Object.keys(entries).filter(k=>k!==myKey && (entries[k].mood||entries[k].diary));
  const el=document.getElementById('tab-home');
  const dLabel = parseDate(homeDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const todaySchedule = state.schedule.filter(s=>s.date===homeDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const ym=homeDate.slice(0,7);
  const monthBudget = state.budget.filter(b=>b.date.startsWith(ym)).reduce((s,b)=>s+Number(b.amount||0),0);
  const upcomingEvent = state.events.map(ev=>({...ev,d:ddayFromDate(eventOccurrence(ev))})).filter(e=>e.d>=0).sort((a,b)=>a.d-b.d)[0];
  const upcomingRenew = state.vehicle.renewals.map(r=>({...r,d:dday(r.date)})).filter(r=>r.d>=0).sort((a,b)=>a.d-b.d)[0];

  el.innerHTML = `
    <div class="card">
      <div class="datebar">
        <button class="iconbtn" id="homePrev">‹</button>
        <div class="d">${dLabel}</div>
        <button class="iconbtn" id="homeNext">›</button>
        ${homeDate!==todayStr()?`<button class="btn small" id="homeToday">오늘</button>`:''}
      </div>
      <div class="meta" style="margin-bottom:6px;">${escapeHtml(authorLabel(mine,myKey))}의 기록</div>
      <div class="mood-row" id="moodRow">
        ${MOODS.map(m=>`<button data-m="${m}" class="${mine.mood===m?'sel':''}">${m}</button>`).join('')}
      </div>
      <div class="field" style="margin-top:10px;">
        <div class="row" style="justify-content:space-between;align-items:center;">
          <label style="margin:0;">한 줄 일기</label>
          <div class="row" style="gap:8px;">
            <span class="meta" id="diarySaveStatus">${mine.diary?'✓ 저장됨':''}</span>
            <button class="btn small primary" id="diarySaveBtn">저장</button>
          </div>
        </div>
        <textarea id="diaryInput" placeholder="오늘 하루는 어땠나요?">${escapeHtml(mine.diary)}</textarea>
        <label id="diaryArchiveToggle" style="cursor:pointer;margin-top:8px;display:inline-block;">${diaryArchiveOpen?'▲':'▼'} 일기 모아보기</label>
        ${diaryArchiveOpen?`<div id="diaryArchiveBox" style="margin-top:6px;">${diaryArchiveRowsHtml()}</div>`:''}
      </div>
    </div>

    ${others.length?`
    <div class="card">
      <h3>💌 가족 기록</h3>
      ${others.map(k=>`
        <div class="list-item">
          <div><div>${entries[k].mood?entries[k].mood+' ':''}<b>${escapeHtml(authorLabel(entries[k],k))}</b></div>${entries[k].diary?`<div class="meta">${escapeHtml(entries[k].diary)}</div>`:''}</div>
        </div>`).join('')}
    </div>`:''}

    <div class="stat-grid">
      <div class="stat"><div class="v">${todaySchedule.length}</div><div class="l">오늘 일정</div></div>
      <div class="stat"><div class="v">${monthBudget.toLocaleString()}원</div><div class="l">이번달 지출</div></div>
      <div class="stat"><div class="v">${upcomingEvent?ddayLabel(upcomingEvent.d):'-'}</div><div class="l">${upcomingEvent?escapeHtml(upcomingEvent.name):'다가오는 경조사'}</div></div>
      <div class="stat"><div class="v">${upcomingRenew?ddayLabel(upcomingRenew.d):'-'}</div><div class="l">${upcomingRenew?escapeHtml(upcomingRenew.name):'차량 갱신'}</div></div>
    </div>

    <div class="card">
      <h3>📅 오늘 일정</h3>
      ${todaySchedule.length? todaySchedule.map(s=>`<div class="list-item"><div><div>${s.time?`<b>${s.time}</b> `:''}${escapeHtml(s.title)}</div>${s.memo?`<div class="meta">${escapeHtml(s.memo)}</div>`:''}</div></div>`).join('') : `<div class="empty">등록된 일정이 없어요</div>`}
    </div>
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
    document.querySelectorAll('[data-jump]').forEach(row=>row.onclick=()=>{
      homeDate=row.dataset.jump; diaryArchiveOpen=false; renderHome();
    });
    document.querySelectorAll('[data-edit-diary]').forEach(btn=>btn.onclick=(ev)=>{
      ev.stopPropagation();
      const [d,k]=btn.dataset.editDiary.split('|');
      openDiaryEntryEditModal(d,k);
    });
  }
}
function diaryArchiveRowsHtml(){
  const rows=[];
  Object.keys(state.daily).sort().reverse().forEach(d=>{
    const entries=(state.daily[d]||{}).entries||{};
    Object.keys(entries).forEach(k=>{
      const e=entries[k];
      if(e && (e.mood || e.diary)) rows.push({date:d, key:k, ...e});
    });
  });
  if(!rows.length) return `<div class="empty">아직 작성된 일기가 없어요</div>`;
  const myKey=currentAuthorKey();
  return rows.map(r=>`
    <div class="list-item" data-jump="${r.date}" style="cursor:pointer;">
      <div>
        <div><b>${r.date}</b> ${r.mood||''} <span class="pill">${escapeHtml(authorLabel(r,r.key))}</span></div>
        ${r.diary?`<div class="meta">${escapeHtml(r.diary)}</div>`:''}
      </div>
      ${r.key===myKey?`<button class="icon-btn" data-edit-diary="${escapeHtml(r.date)}|${escapeHtml(r.key)}" title="수정">✏️</button>`:''}
    </div>`).join('');
}
function openDiaryEntryEditModal(date, key){
  const day=state.daily[date]||{};
  const e=(day.entries&&day.entries[key])||{};
  openModal(`
    <h3>${date} · ${escapeHtml(authorLabel(e,key))} 일기 수정</h3>
    <div class="mood-row" id="editMoodRow">
      ${MOODS.map(m=>`<button data-m="${m}" class="${e.mood===m?'sel':''}">${m}</button>`).join('')}
    </div>
    <div class="field" style="margin-top:10px;">
      <label>한 줄 일기</label>
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
function getScheduleOwners(){ return [{key:'common',label:'공통'}].concat(FAMILY_MEMBERS); }
function ownerLabel(key){ if(!key||key==='common') return '공통'; const m=FAMILY_MEMBERS.find(x=>x.key===key); return m?m.label:key; }
function getAllowedScheduleFilters(){
  const myRole=EMAIL_ROLE[user&&user.email];
  if(myRole==='dad') return ['all','common'].concat(FAMILY_MEMBERS.map(m=>m.key));
  if(myRole) return ['common', myRole];
  return ['common'];
}
function getAllowedOwners(){
  const allowed=getAllowedScheduleFilters().filter(f=>f!=='all');
  return getScheduleOwners().filter(o=>allowed.includes(o.key));
}
function renderSchedule(){
  const el=document.getElementById('tab-schedule');
  const y=scheduleMonth.getFullYear(), m=scheduleMonth.getMonth();
  const firstDow=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const totalCells=Math.ceil((firstDow+daysInMonth)/7)*7;
  const allowedFilters=getAllowedScheduleFilters();
  if(!allowedFilters.includes(scheduleFilter)) scheduleFilter = allowedFilters.includes('common') ? 'common' : allowedFilters[0];
  const virtualEventItems=state.events.map(ev=>({id:'evt-'+ev.id, date:fmtDate(eventOccurrence(ev)), time:'', title:'🎉 '+ev.name, memo:ev.memo, owner:'common', virtual:true}));
  const allItems=state.schedule.map(s=>({...s, owner:s.owner||'common'})).concat(virtualEventItems);
  const filtered = scheduleFilter==='all' ? allItems : allItems.filter(s=>s.owner===scheduleFilter);
  const eventsByDate={};
  filtered.forEach(s=>{ (eventsByDate[s.date]=eventsByDate[s.date]||[]).push(s); });
  Object.values(eventsByDate).forEach(list=>list.sort((a,b)=>(a.time||'').localeCompare(b.time||'')));
  const holidays=getHolidaysAround(y);
  const todayS=todayStr();
  const MAX_SHOWN=3;
  let grid='';
  for(let i=0;i<totalCells;i++){
    const dayNum=i-firstDow+1;
    const dateObj=new Date(y,m,dayNum);
    const dateStr=fmtDate(dateObj);
    const inMonth = dayNum>=1 && dayNum<=daysInMonth;
    const dayEvents=eventsByDate[dateStr]||[];
    const holidayName=holidays[dateStr];
    const shown=dayEvents.slice(0,MAX_SHOWN).map(s=>`<span class="cal-evt">${s.time?escapeHtml(s.time)+' ':''}${escapeHtml(s.title)}</span>`).join('');
    const more = dayEvents.length>MAX_SHOWN ? `<span class="cal-evt more">+${dayEvents.length-MAX_SHOWN}개 더</span>` : '';
    grid += `<div class="cal-cell ${inMonth?'':'other'} ${dateStr===todayS?'today':''} ${dateStr===scheduleSel?'sel':''} ${holidayName?'holiday':''}" data-date="${dateStr}">
      <div class="day-row"><span class="day-num">${dateObj.getDate()}</span>${holidayName?`<span class="cal-holiday">${escapeHtml(holidayName)}</span>`:''}</div>${shown}${more}
    </div>`;
  }
  const dayItems = filtered.filter(s=>s.date===scheduleSel).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  el.innerHTML=`
    <div class="member-row" id="schedFilterRow">
      ${allowedFilters.map(f=>`<button data-owner="${f}" class="${scheduleFilter===f?'active':''}">${f==='all'?'전체':ownerLabel(f)}</button>`).join('')}
    </div>
    <div class="card">
      <div class="datebar"><button class="iconbtn" id="sPrev">‹</button><div class="d">${y}년 ${m+1}월</div><button class="iconbtn" id="sNext">›</button></div>
      <div class="cal-grid">${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('')}${grid}</div>
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">${scheduleSel} 일정${holidays[scheduleSel]?` <span class="pill">${escapeHtml(holidays[scheduleSel])}</span>`:''}</h3><button class="btn primary small" id="addSchedBtn">+ 일정 추가</button></div>
      ${dayItems.length? dayItems.map(s=>`
        <div class="list-item">
          <div><div>${s.time?`<b>${s.time}</b> `:''}${escapeHtml(s.title)} <span class="pill">${ownerLabel(s.owner)}</span></div>${s.memo?`<div class="meta">${escapeHtml(s.memo)}</div>`:''}</div>
          <div class="row">${s.virtual? `<span class="meta">경조사 탭에서 수정</span>` : `<button class="btn small" data-edit="${s.id}">수정</button><button class="btn small danger" data-del="${s.id}">삭제</button>`}</div>
        </div>`).join('') : `<div class="empty">일정이 없어요</div>`}
    </div>
  `;
  document.getElementById('sPrev').onclick=()=>{ scheduleMonth=new Date(y,m-1,1); renderSchedule(); };
  document.getElementById('sNext').onclick=()=>{ scheduleMonth=new Date(y,m+1,1); renderSchedule(); };
  document.getElementById('schedFilterRow').addEventListener('click', e=>{
    const b=e.target.closest('button[data-owner]'); if(!b) return;
    scheduleFilter=b.dataset.owner; renderSchedule();
  });
  el.querySelector('.cal-grid').addEventListener('click', e=>{
    const c=e.target.closest('.cal-cell'); if(!c) return;
    scheduleSel=c.dataset.date; renderSchedule();
  });
  document.getElementById('addSchedBtn').onclick=()=>openScheduleModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openScheduleModal(state.schedule.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('일정을 삭제할까요?')){ state.schedule=state.schedule.filter(x=>x.id!==b.dataset.del); queueSave(); renderSchedule(); renderHome(); }
  });
}
function openScheduleModal(existing){
  const myOwners=getAllowedOwners();
  const defaultOwner = (scheduleFilter!=='all' && myOwners.some(o=>o.key===scheduleFilter)) ? scheduleFilter : (myOwners[0]?myOwners[0].key:'common');
  const s=existing||{id:null,date:scheduleSel,time:'',title:'',memo:'',owner:defaultOwner};
  const ownerOptions = myOwners.some(o=>o.key===(s.owner||'common')) ? myOwners : myOwners.concat([{key:s.owner||'common',label:ownerLabel(s.owner)}]);
  openModal(`
    <h3>${existing?'일정 수정':'일정 추가'}</h3>
    <div class="field">
      <label>공통 / 개인</label>
      <div class="row">
        ${ownerOptions.map(o=>`<label class="pill" style="cursor:pointer;"><input type="radio" name="mOwner" value="${o.key}" ${(s.owner||'common')===o.key?'checked':''} style="margin-right:4px;">${o.label}</label>`).join('')}
      </div>
    </div>
    <div class="grid2">
      <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${s.date}"></div>
      <div class="field"><label>시간 (선택)</label><input type="time" id="mTime" value="${s.time||''}"></div>
    </div>
    <div class="field"><label>제목</label><input id="mTitle" value="${escapeHtml(s.title)}"></div>
    <div class="field"><label>메모</label><textarea id="mMemo">${escapeHtml(s.memo)}</textarea></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const title=document.getElementById('mTitle').value.trim();
    if(!date||!title){ showToast('날짜와 제목을 입력해주세요'); return; }
    const owner=(document.querySelector('input[name="mOwner"]:checked')||{}).value || 'common';
    const rec={id:s.id||uid(),date,time:document.getElementById('mTime').value,title,memo:document.getElementById('mMemo').value,owner};
    if(s.id){ const idx=state.schedule.findIndex(x=>x.id===s.id); state.schedule[idx]=rec; }
    else state.schedule.push(rec);
    scheduleSel=date;
    queueSave(); closeModal(); renderSchedule(); renderHome();
  };
}

/* ---------- HEALTH ---------- */
const FAMILY_MEMBERS=[{key:'dad',label:'아빠'},{key:'mom',label:'엄마'},{key:'daughter',label:'딸'}];
const EMAIL_ROLE={'juseok.ha@gmail.com':'dad','jinahkim2023@gmail.com':'mom'};
let healthDate = todayStr();
let healthPerson = null;
function memberLabel(key){ const m=FAMILY_MEMBERS.find(x=>x.key===key); return m?m.label:key; }
function renderHealth(){
  if(!healthPerson) healthPerson = EMAIL_ROLE[user&&user.email] || 'mom';
  const day=state.daily[healthDate]||{};
  const rec=(day.health&&day.health[healthPerson])||{};
  const el=document.getElementById('tab-health');
  const dLabel = parseDate(healthDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const schedList = ((state.healthSchedule&&state.healthSchedule[healthPerson])||[]).map(it=>({...it,d:dday(it.date)})).sort((a,b)=>a.d-b.d);
  el.innerHTML=`
    <div class="member-row" id="memberRow">
      ${FAMILY_MEMBERS.map(m=>`<button data-member="${m.key}" class="${healthPerson===m.key?'active':''}">${m.label}</button>`).join('')}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">🩺 ${memberLabel(healthPerson)} 주요 검진 일정</h3><button class="btn primary small" id="addHealthSchedBtn">+ 추가</button></div>
      ${schedList.length? schedList.map(it=>`
        <div class="list-item">
          <div><div>${escapeHtml(it.name)}</div><div class="meta">${it.date}${it.memo?' · '+escapeHtml(it.memo):''}</div></div>
          <div class="row"><span class="pill ${ddayPillClass(it.d)}">${ddayLabel(it.d)}</span>
            <button class="icon-btn" data-edit-hsched="${it.id}" title="수정">✏️</button>
            <button class="btn small danger" data-del-hsched="${it.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">건강검진, 정기검사 등 예정된 일정을 등록해보세요</div>`}
    </div>
    <div class="card">
      <div class="datebar"><button class="iconbtn" id="hPrev">‹</button><div class="d">${dLabel}</div><button class="iconbtn" id="hNext">›</button>
        ${healthDate!==todayStr()?`<button class="btn small" id="hToday">오늘</button>`:''}
      </div>
      <div class="grid2">
        <div class="field"><label>체중 (kg)</label><input type="number" step="0.1" id="hWeight" value="${rec.weight||''}"></div>
        <div class="field"><label>수면 시간</label><input type="number" step="0.5" id="hSleep" value="${rec.sleep||''}"></div>
      </div>
      <div class="row" style="margin-top:8px;">
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="hExercise" ${rec.exercise?'checked':''} style="margin-right:4px;">운동</label>
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="hMeds" ${rec.meds?'checked':''} style="margin-right:4px;">복약</label>
      </div>
      <div class="field" style="margin-top:8px;">
        <label>증상 / 컨디션 메모</label>
        <textarea id="hSymptom" placeholder="컨디션, 증상 등을 기록해보세요">${escapeHtml(rec.symptom)}</textarea>
      </div>
    </div>
    <div class="card">
      <h3>📈 가족 체중 흐름</h3>
      ${renderFamilyWeightTable()}
    </div>
  `;
  document.getElementById('memberRow').addEventListener('click', e=>{
    const b=e.target.closest('button[data-member]'); if(!b) return;
    healthPerson=b.dataset.member; renderHealth();
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
  document.getElementById('hWeight').addEventListener('change',e=>{ save('weight', e.target.value?Number(e.target.value):''); renderHealth(); });
  document.getElementById('hSleep').addEventListener('change',e=>save('sleep', e.target.value?Number(e.target.value):''));
  document.getElementById('hExercise').addEventListener('change',e=>save('exercise', e.target.checked));
  document.getElementById('hMeds').addEventListener('change',e=>save('meds', e.target.checked));
  document.getElementById('hSymptom').addEventListener('change',e=>save('symptom', e.target.value));
  document.getElementById('addHealthSchedBtn').onclick=()=>openHealthSchedModal();
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
function renderFamilyWeightTable(){
  const dateSet=new Set();
  Object.entries(state.daily).forEach(([d,v])=>{
    FAMILY_MEMBERS.forEach(m=>{ if(v.health && v.health[m.key] && v.health[m.key].weight) dateSet.add(d); });
  });
  const dates=Array.from(dateSet).sort().slice(-14);
  if(!dates.length) return `<div class="empty">체중 기록이 아직 없어요</div>`;
  return `
    <div style="overflow-x:auto;">
      <table class="maint-table">
        <thead><tr><th>날짜</th>${FAMILY_MEMBERS.map(m=>`<th>${m.label}</th>`).join('')}</tr></thead>
        <tbody>
          ${dates.slice().reverse().map(d=>`
            <tr>
              <td>${d.slice(5)}</td>
              ${FAMILY_MEMBERS.map(m=>{
                const w=state.daily[d] && state.daily[d].health && state.daily[d].health[m.key] && state.daily[d].health[m.key].weight;
                return `<td>${w?w+'kg':'-'}</td>`;
              }).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ---------- BUDGET ---------- */
let budgetMonth = todayStr().slice(0,7);
const BUDGET_CATS=['식비','생활용품','의료/건강','쇼핑','문화/여가','교통','기타'];
function myBudgetCategories(){
  const key=currentAuthorKey();
  if(!state.budgetCategories) state.budgetCategories={};
  if(!state.budgetCategories[key]) state.budgetCategories[key]=[...BUDGET_CATS];
  return state.budgetCategories[key];
}
function renderBudget(){
  const el=document.getElementById('tab-budget');
  const items=state.budget.filter(b=>b.date.startsWith(budgetMonth)).sort((a,b)=>b.date.localeCompare(a.date));
  const total=items.reduce((s,b)=>s+Number(b.amount||0),0);
  const byCat={};
  items.forEach(b=>{ byCat[b.category]=(byCat[b.category]||0)+Number(b.amount||0); });
  const [y,m]=budgetMonth.split('-');
  el.innerHTML=`
    <div class="card">
      <div class="datebar"><button class="iconbtn" id="bPrev">‹</button><div class="d">${y}년 ${Number(m)}월</div><button class="iconbtn" id="bNext">›</button></div>
      <div class="stat-grid" style="grid-template-columns:1fr;"><div class="stat"><div class="v">${total.toLocaleString()}원</div><div class="l">이번달 총 지출</div></div></div>
    </div>
    <div class="card">
      <h3>카테고리별</h3>
      ${Object.keys(byCat).length? Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
        <div class="bar-row"><span style="width:70px;">${c}</span><div class="bar-track"><div class="bar-fill" style="width:${total?Math.round(v/total*100):0}%"></div></div><span style="width:80px;text-align:right;">${v.toLocaleString()}원</span></div>
      `).join('') : `<div class="empty">지출 내역이 없어요</div>`}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">내역</h3>
        <div class="row"><button class="btn small" id="manageCatBtn">카테고리 관리</button><button class="btn primary small" id="addBudgetBtn">+ 지출 추가</button></div>
      </div>
      ${items.length? items.map(b=>`
        <div class="list-item">
          <div><div><span class="pill">${b.category}</span> ${escapeHtml(b.memo)}</div><div class="meta">${b.date}</div></div>
          <div class="row"><b>${Number(b.amount).toLocaleString()}원</b>
            <button class="btn small" data-edit="${b.id}">수정</button><button class="btn small danger" data-del="${b.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">이번달 지출 내역이 없어요</div>`}
    </div>
  `;
  document.getElementById('bPrev').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,-1); renderBudget(); };
  document.getElementById('bNext').onclick=()=>{ budgetMonth=shiftMonth(budgetMonth,1); renderBudget(); };
  document.getElementById('addBudgetBtn').onclick=()=>openBudgetModal();
  document.getElementById('manageCatBtn').onclick=()=>openCategoryManageModal();
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openBudgetModal(state.budget.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.del); queueSave(); renderBudget(); renderHome(); }
  });
}
function openCategoryManageModal(){
  const cats=myBudgetCategories();
  openModal(`
    <h3>내 카테고리 관리</h3>
    <div class="meta" style="margin-bottom:10px;">여기서 관리하는 카테고리는 지금 로그인한 계정에만 적용돼요.</div>
    ${cats.map(c=>{
      const cnt=state.budget.filter(x=>x.category===c).length;
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
    const cnt=state.budget.filter(x=>x.category===cat).length;
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
  const b=existing||{id:null,date:budgetMonth+'-'+pad2(new Date().getDate()),category:myCats[0]||'기타',amount:'',memo:''};
  const catOptions = myCats.includes(b.category) ? myCats : myCats.concat([b.category]);
  openModal(`
    <h3>${existing?'지출 수정':'지출 추가'}</h3>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${b.date}"></div>
    <div class="field"><label>카테고리</label><select id="mCat">${catOptions.map(c=>`<option ${c===b.category?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></div>
    <div class="field"><label>금액</label><input type="number" id="mAmount" value="${b.amount}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(b.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const amount=Number(document.getElementById('mAmount').value||0);
    if(!date||!amount){ showToast('날짜와 금액을 입력해주세요'); return; }
    const rec={id:b.id||uid(),date,category:document.getElementById('mCat').value,amount,memo:document.getElementById('mMemo').value};
    if(b.id){ const idx=state.budget.findIndex(x=>x.id===b.id); state.budget[idx]=rec; }
    else state.budget.push(rec);
    budgetMonth=date.slice(0,7);
    queueSave(); closeModal(); renderBudget(); renderHome();
  };
}

/* ---------- VEHICLE ---------- */
let maintHistoryOpen=false;
function renderVehicle(){
  const el=document.getElementById('tab-vehicle');
  const v=state.vehicle;
  const renewals=v.renewals.map(r=>({...r,d:dday(r.date)})).sort((a,b)=>a.d-b.d);
  const fuelSorted=[...v.fuel].sort((a,b)=>b.date.localeCompare(a.date));
  const maintSorted=[...v.maint].sort((a,b)=>b.date.localeCompare(a.date));
  const maintRows=MAINT_ITEMS.map(item=>{
    const records=v.maint.filter(mt=>mt.item===item).sort((a,b)=>b.date.localeCompare(a.date));
    return {item, latest:records[0]};
  });
  const fuelTotal=v.fuel.reduce((s,f)=>s+Number(f.cost||0),0);
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
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">⛽ 주유 기록 (누적 ${fuelTotal.toLocaleString()}원)</h3><button class="btn primary small" id="addFuelBtn">+ 추가</button></div>
      ${fuelSorted.length? fuelSorted.slice(0,12).map(f=>`
        <div class="list-item">
          <div><div>${f.liters?f.liters+'L · ':''}${Number(f.cost).toLocaleString()}원</div><div class="meta">${f.date}${f.odo?' · '+f.odo+'km':''}</div></div>
          <div class="row"><button class="btn small" data-edit-fuel="${f.id}">수정</button><button class="btn small danger" data-del-fuel="${f.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">주유 기록이 없어요</div>`}
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
  document.getElementById('addFuelBtn').onclick=()=>openFuelModal();
  el.querySelectorAll('[data-edit-fuel]').forEach(b=>b.onclick=()=>openFuelModal(v.fuel.find(x=>x.id===b.dataset.editFuel)));
  el.querySelectorAll('[data-del-fuel]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.fuel=v.fuel.filter(x=>x.id!==b.dataset.delFuel); queueSave(); renderVehicle(); } });
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
function openFuelModal(existing){
  const f=existing||{id:null,date:todayStr(),liters:'',cost:'',odo:''};
  openModal(`
    <h3>${existing?'주유 기록 수정':'주유 기록 추가'}</h3>
    <div class="field"><label>날짜</label><input type="text" readonly class="date-input" placeholder="YYYY-MM-DD" id="mDate" value="${f.date}"></div>
    <div class="grid2">
      <div class="field"><label>주유량 (L)</label><input type="number" step="0.1" id="mLiters" value="${f.liters}"></div>
      <div class="field"><label>금액 (원)</label><input type="number" id="mCost" value="${f.cost}"></div>
    </div>
    <div class="field"><label>누적 주행거리 (km, 선택)</label><input type="number" id="mOdo" value="${f.odo}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  attachDatePicker('mDate');
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const cost=Number(document.getElementById('mCost').value||0);
    if(!date||!cost){ showToast('날짜와 금액을 입력해주세요'); return; }
    const rec={id:f.id||uid(),date,liters:document.getElementById('mLiters').value,cost,odo:document.getElementById('mOdo').value};
    if(f.id){ const idx=state.vehicle.fuel.findIndex(x=>x.id===f.id); state.vehicle.fuel[idx]=rec; }
    else state.vehicle.fuel.push(rec);
    queueSave(); closeModal(); renderVehicle();
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
    <div class="list-item">
      <div><div>${escapeHtml(ev.name)}</div>
      <div class="meta">${ev.lunar?`음력 ${ev.lunarMonth}/${ev.lunarDay}${ev.lunarLeap?'(윤)':''}`:ev.date}${ev.recurring?' (매년)':''}${ev.memo?' · '+escapeHtml(ev.memo):''}</div></div>
      <div class="row"><span class="pill ${ddayPillClass(ev.d)}">${ddayLabel(ev.d)}</span>
        <button class="btn small" data-edit="${ev.id}">수정</button><button class="btn small danger" data-del="${ev.id}">삭제</button></div>
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
  const ev=existing||{id:null,name:'',date:todayStr(),recurring:true,memo:'',lunar:false,lunarYear:new Date().getFullYear(),lunarMonth:'',lunarDay:'',lunarLeap:false};
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
    const rec={id:ev.id||uid(),name,date,lunar:isLunar,lunarYear,lunarMonth,lunarDay,lunarLeap,recurring:document.getElementById('mRecurring').checked,memo:document.getElementById('mMemo').value};
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

/* ---------- init ---------- */
function renderAll(){
  renderHome(); renderSchedule(); renderHealth(); renderBudget(); renderVehicle(); renderEvents();
}
initTheme();
initAuth();
renderAll();
