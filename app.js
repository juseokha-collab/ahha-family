/* ---------- utils ---------- */
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function pad2(n){ return String(n).padStart(2,'0'); }
function fmtDate(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
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

/* ---------- state ---------- */
const LS_KEY='damsom-state-v1';
function defaultState(){
  return {
    schedule:[],
    daily:{},
    budget:[],
    vehicle:{plate:'',model:'',fuel:[],maint:[],renewals:[]},
    events:[]
  };
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
      return migrateDaily(Object.assign(base, parsed, {vehicle:base.vehicle}));
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
function ensureDay(d){ if(!state.daily[d]) state.daily[d]={}; if(!state.daily[d].entries) state.daily[d].entries={}; }
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
          state=migrateDaily(Object.assign(base, data, {vehicle:base.vehicle}));
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
function closeModal(){ document.getElementById('modalBg').classList.remove('show'); }
document.getElementById('modalBg').addEventListener('click', e=>{ if(e.target.id==='modalBg') closeModal(); });
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
  const upcomingEvent = state.events.map(ev=>({...ev,d:ddayFromDate(nextOccurrence(ev.date,ev.recurring))})).filter(e=>e.d>=0).sort((a,b)=>a.d-b.d)[0];
  const upcomingRenew = state.vehicle.renewals.map(r=>({...r,d:dday(r.date)})).filter(r=>r.d>=0).sort((a,b)=>a.d-b.d)[0];

  el.innerHTML = `
    <div class="card">
      <div class="datebar">
        <button id="homePrev">‹</button>
        <div class="d">${dLabel}</div>
        <button id="homeNext">›</button>
        ${homeDate!==todayStr()?`<button class="btn small" id="homeToday">오늘</button>`:''}
      </div>
      <div class="meta" style="margin-bottom:6px;">${escapeHtml(authorLabel(mine,myKey))}의 기록</div>
      <div class="mood-row" id="moodRow">
        ${MOODS.map(m=>`<button data-m="${m}" class="${mine.mood===m?'sel':''}">${m}</button>`).join('')}
      </div>
      <div class="field" style="margin-top:10px;">
        <label>한 줄 일기</label>
        <textarea id="diaryInput" placeholder="오늘 하루는 어땠나요?">${escapeHtml(mine.diary)}</textarea>
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
  document.getElementById('diaryInput').addEventListener('change', e=>{
    ensureDay(homeDate);
    const cur=state.daily[homeDate].entries[myKey]||{};
    cur.diary = e.target.value;
    cur.name = user ? (user.displayName||user.email) : '나';
    cur.updatedAt = Date.now();
    state.daily[homeDate].entries[myKey]=cur;
    queueSave();
  });
}

/* ---------- SCHEDULE ---------- */
let scheduleMonth = new Date(); scheduleMonth.setDate(1);
let scheduleSel = todayStr();
function renderSchedule(){
  const el=document.getElementById('tab-schedule');
  const y=scheduleMonth.getFullYear(), m=scheduleMonth.getMonth();
  const firstDow=new Date(y,m,1).getDay();
  const daysInMonth=new Date(y,m+1,0).getDate();
  const totalCells=Math.ceil((firstDow+daysInMonth)/7)*7;
  const eventsByDate={};
  state.schedule.forEach(s=>{ (eventsByDate[s.date]=eventsByDate[s.date]||[]).push(s); });
  Object.values(eventsByDate).forEach(list=>list.sort((a,b)=>(a.time||'').localeCompare(b.time||'')));
  const todayS=todayStr();
  const MAX_SHOWN=3;
  let grid='';
  for(let i=0;i<totalCells;i++){
    const dayNum=i-firstDow+1;
    const dateObj=new Date(y,m,dayNum);
    const dateStr=fmtDate(dateObj);
    const inMonth = dayNum>=1 && dayNum<=daysInMonth;
    const dayEvents=eventsByDate[dateStr]||[];
    const shown=dayEvents.slice(0,MAX_SHOWN).map(s=>`<span class="cal-evt">${s.time?escapeHtml(s.time)+' ':''}${escapeHtml(s.title)}</span>`).join('');
    const more = dayEvents.length>MAX_SHOWN ? `<span class="cal-evt more">+${dayEvents.length-MAX_SHOWN}개 더</span>` : '';
    grid += `<div class="cal-cell ${inMonth?'':'other'} ${dateStr===todayS?'today':''} ${dateStr===scheduleSel?'sel':''}" data-date="${dateStr}">
      <span class="day-num">${dateObj.getDate()}</span>${shown}${more}
    </div>`;
  }
  const dayItems = state.schedule.filter(s=>s.date===scheduleSel).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  el.innerHTML=`
    <div class="card">
      <div class="datebar"><button id="sPrev">‹</button><div class="d">${y}년 ${m+1}월</div><button id="sNext">›</button></div>
      <div class="cal-grid">${['일','월','화','수','목','금','토'].map(d=>`<div class="cal-head">${d}</div>`).join('')}${grid}</div>
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">${scheduleSel} 일정</h3><button class="btn primary small" id="addSchedBtn">+ 일정 추가</button></div>
      ${dayItems.length? dayItems.map(s=>`
        <div class="list-item">
          <div><div>${s.time?`<b>${s.time}</b> `:''}${escapeHtml(s.title)}</div>${s.memo?`<div class="meta">${escapeHtml(s.memo)}</div>`:''}</div>
          <div class="row"><button class="btn small" data-edit="${s.id}">수정</button><button class="btn small danger" data-del="${s.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">일정이 없어요</div>`}
    </div>
  `;
  document.getElementById('sPrev').onclick=()=>{ scheduleMonth=new Date(y,m-1,1); renderSchedule(); };
  document.getElementById('sNext').onclick=()=>{ scheduleMonth=new Date(y,m+1,1); renderSchedule(); };
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
  const s=existing||{id:null,date:scheduleSel,time:'',title:'',memo:''};
  openModal(`
    <h3>${existing?'일정 수정':'일정 추가'}</h3>
    <div class="grid2">
      <div class="field"><label>날짜</label><input type="date" id="mDate" value="${s.date}"></div>
      <div class="field"><label>시간 (선택)</label><input type="time" id="mTime" value="${s.time||''}"></div>
    </div>
    <div class="field"><label>제목</label><input id="mTitle" value="${escapeHtml(s.title)}"></div>
    <div class="field"><label>메모</label><textarea id="mMemo">${escapeHtml(s.memo)}</textarea></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const title=document.getElementById('mTitle').value.trim();
    if(!date||!title){ showToast('날짜와 제목을 입력해주세요'); return; }
    const rec={id:s.id||uid(),date,time:document.getElementById('mTime').value,title,memo:document.getElementById('mMemo').value};
    if(s.id){ const idx=state.schedule.findIndex(x=>x.id===s.id); state.schedule[idx]=rec; }
    else state.schedule.push(rec);
    scheduleSel=date;
    queueSave(); closeModal(); renderSchedule(); renderHome();
  };
}

/* ---------- HEALTH ---------- */
let healthDate = todayStr();
function renderHealth(){
  const day=state.daily[healthDate]||{};
  const el=document.getElementById('tab-health');
  const dLabel = parseDate(healthDate).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const trend = Object.entries(state.daily).filter(([,v])=>v.weight).sort((a,b)=>a[0].localeCompare(b[0])).slice(-14);
  el.innerHTML=`
    <div class="card">
      <div class="datebar"><button id="hPrev">‹</button><div class="d">${dLabel}</div><button id="hNext">›</button>
        ${healthDate!==todayStr()?`<button class="btn small" id="hToday">오늘</button>`:''}
      </div>
      <div class="grid2">
        <div class="field"><label>체중 (kg)</label><input type="number" step="0.1" id="hWeight" value="${day.weight||''}"></div>
        <div class="field"><label>수면 시간</label><input type="number" step="0.5" id="hSleep" value="${day.sleep||''}"></div>
      </div>
      <div class="row" style="margin-top:8px;">
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="hExercise" ${day.exercise?'checked':''} style="margin-right:4px;">운동</label>
        <label class="pill" style="cursor:pointer;"><input type="checkbox" id="hMeds" ${day.meds?'checked':''} style="margin-right:4px;">복약</label>
      </div>
      <div class="field" style="margin-top:8px;">
        <label>증상 / 컨디션 메모</label>
        <textarea id="hSymptom" placeholder="컨디션, 증상 등을 기록해보세요">${escapeHtml(day.symptom)}</textarea>
      </div>
    </div>
    <div class="card">
      <h3>📈 최근 체중 흐름</h3>
      ${trend.length? renderTrendBars(trend) : `<div class="empty">체중 기록이 아직 없어요</div>`}
    </div>
  `;
  document.getElementById('hPrev').onclick=()=>{ healthDate=fmtDate(addDays(parseDate(healthDate),-1)); renderHealth(); };
  document.getElementById('hNext').onclick=()=>{ healthDate=fmtDate(addDays(parseDate(healthDate),1)); renderHealth(); };
  const tb=document.getElementById('hToday'); if(tb) tb.onclick=()=>{ healthDate=todayStr(); renderHealth(); };
  const save=(k,v)=>{ ensureDay(healthDate); state.daily[healthDate][k]=v; queueSave(); };
  document.getElementById('hWeight').addEventListener('change',e=>{ save('weight', e.target.value?Number(e.target.value):''); renderHealth(); });
  document.getElementById('hSleep').addEventListener('change',e=>save('sleep', e.target.value?Number(e.target.value):''));
  document.getElementById('hExercise').addEventListener('change',e=>save('exercise', e.target.checked));
  document.getElementById('hMeds').addEventListener('change',e=>save('meds', e.target.checked));
  document.getElementById('hSymptom').addEventListener('change',e=>save('symptom', e.target.value));
}
function renderTrendBars(trend){
  const weights=trend.map(([,v])=>Number(v.weight));
  const max=Math.max(...weights), min=Math.min(...weights);
  const range=(max-min)||1;
  return trend.map(([d,v])=>{
    const pct=20+((v.weight-min)/range)*80;
    return `<div class="bar-row"><span style="width:44px;color:var(--muted);">${d.slice(5)}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><span style="width:52px;text-align:right;">${v.weight}kg</span></div>`;
  }).join('');
}

/* ---------- BUDGET ---------- */
let budgetMonth = todayStr().slice(0,7);
const BUDGET_CATS=['식비','생활용품','의료/건강','쇼핑','문화/여가','교통','기타'];
function renderBudget(){
  const el=document.getElementById('tab-budget');
  const items=state.budget.filter(b=>b.date.startsWith(budgetMonth)).sort((a,b)=>b.date.localeCompare(a.date));
  const total=items.reduce((s,b)=>s+Number(b.amount||0),0);
  const byCat={};
  items.forEach(b=>{ byCat[b.category]=(byCat[b.category]||0)+Number(b.amount||0); });
  const [y,m]=budgetMonth.split('-');
  el.innerHTML=`
    <div class="card">
      <div class="datebar"><button id="bPrev">‹</button><div class="d">${y}년 ${Number(m)}월</div><button id="bNext">›</button></div>
      <div class="stat-grid" style="grid-template-columns:1fr;"><div class="stat"><div class="v">${total.toLocaleString()}원</div><div class="l">이번달 총 지출</div></div></div>
    </div>
    <div class="card">
      <h3>카테고리별</h3>
      ${Object.keys(byCat).length? Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`
        <div class="bar-row"><span style="width:70px;">${c}</span><div class="bar-track"><div class="bar-fill" style="width:${total?Math.round(v/total*100):0}%"></div></div><span style="width:80px;text-align:right;">${v.toLocaleString()}원</span></div>
      `).join('') : `<div class="empty">지출 내역이 없어요</div>`}
    </div>
    <div class="card">
      <div class="row" style="justify-content:space-between;"><h3 style="margin:0;">내역</h3><button class="btn primary small" id="addBudgetBtn">+ 지출 추가</button></div>
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
  el.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openBudgetModal(state.budget.find(x=>x.id===b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
    if(confirm('삭제할까요?')){ state.budget=state.budget.filter(x=>x.id!==b.dataset.del); queueSave(); renderBudget(); renderHome(); }
  });
}
function shiftMonth(ym, delta){
  let [y,m]=ym.split('-').map(Number);
  m+=delta;
  if(m<1){m=12;y--;} if(m>12){m=1;y++;}
  return `${y}-${pad2(m)}`;
}
function openBudgetModal(existing){
  const b=existing||{id:null,date:budgetMonth+'-'+pad2(new Date().getDate()),category:BUDGET_CATS[0],amount:'',memo:''};
  openModal(`
    <h3>${existing?'지출 수정':'지출 추가'}</h3>
    <div class="field"><label>날짜</label><input type="date" id="mDate" value="${b.date}"></div>
    <div class="field"><label>카테고리</label><select id="mCat">${BUDGET_CATS.map(c=>`<option ${c===b.category?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label>금액</label><input type="number" id="mAmount" value="${b.amount}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(b.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
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
function renderVehicle(){
  const el=document.getElementById('tab-vehicle');
  const v=state.vehicle;
  const renewals=v.renewals.map(r=>({...r,d:dday(r.date)})).sort((a,b)=>a.d-b.d);
  const fuelSorted=[...v.fuel].sort((a,b)=>b.date.localeCompare(a.date));
  const maintSorted=[...v.maint].sort((a,b)=>b.date.localeCompare(a.date));
  const fuelTotal=v.fuel.reduce((s,f)=>s+Number(f.cost||0),0);
  el.innerHTML=`
    <div class="card">
      <h3>🚗 차량 정보</h3>
      <div class="grid2">
        <div class="field"><label>차종/모델</label><input id="vModel" value="${escapeHtml(v.model)}"></div>
        <div class="field"><label>번호판</label><input id="vPlate" value="${escapeHtml(v.plate)}"></div>
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
      ${maintSorted.length? maintSorted.map(mt=>`
        <div class="list-item">
          <div><div>${escapeHtml(mt.type)}${mt.cost?' · '+Number(mt.cost).toLocaleString()+'원':''}</div><div class="meta">${mt.date}${mt.memo?' · '+escapeHtml(mt.memo):''}</div></div>
          <div class="row"><button class="btn small" data-edit-maint="${mt.id}">수정</button><button class="btn small danger" data-del-maint="${mt.id}">삭제</button></div>
        </div>`).join('') : `<div class="empty">정비 기록이 없어요</div>`}
    </div>
  `;
  document.getElementById('vModel').addEventListener('change',e=>{ state.vehicle.model=e.target.value; queueSave(); });
  document.getElementById('vPlate').addEventListener('change',e=>{ state.vehicle.plate=e.target.value; queueSave(); });
  document.getElementById('addRenewBtn').onclick=()=>openRenewModal();
  el.querySelectorAll('[data-edit-renew]').forEach(b=>b.onclick=()=>openRenewModal(v.renewals.find(x=>x.id===b.dataset.editRenew)));
  el.querySelectorAll('[data-del-renew]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.renewals=v.renewals.filter(x=>x.id!==b.dataset.delRenew); queueSave(); renderVehicle(); renderHome(); } });
  document.getElementById('addFuelBtn').onclick=()=>openFuelModal();
  el.querySelectorAll('[data-edit-fuel]').forEach(b=>b.onclick=()=>openFuelModal(v.fuel.find(x=>x.id===b.dataset.editFuel)));
  el.querySelectorAll('[data-del-fuel]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.fuel=v.fuel.filter(x=>x.id!==b.dataset.delFuel); queueSave(); renderVehicle(); } });
  document.getElementById('addMaintBtn').onclick=()=>openMaintModal();
  el.querySelectorAll('[data-edit-maint]').forEach(b=>b.onclick=()=>openMaintModal(v.maint.find(x=>x.id===b.dataset.editMaint)));
  el.querySelectorAll('[data-del-maint]').forEach(b=>b.onclick=()=>{ if(confirm('삭제할까요?')){ state.vehicle.maint=v.maint.filter(x=>x.id!==b.dataset.delMaint); queueSave(); renderVehicle(); } });
}
function openRenewModal(existing){
  const r=existing||{id:null,name:'',date:todayStr(),memo:''};
  openModal(`
    <h3>${existing?'만기 알림 수정':'만기 알림 추가'}</h3>
    <div class="field"><label>항목명 (예: 자동차보험, 자동차세, 정기검사)</label><input id="mName" value="${escapeHtml(r.name)}"></div>
    <div class="field"><label>만기일</label><input type="date" id="mDate" value="${r.date}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(r.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
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
    <div class="field"><label>날짜</label><input type="date" id="mDate" value="${f.date}"></div>
    <div class="grid2">
      <div class="field"><label>주유량 (L)</label><input type="number" step="0.1" id="mLiters" value="${f.liters}"></div>
      <div class="field"><label>금액 (원)</label><input type="number" id="mCost" value="${f.cost}"></div>
    </div>
    <div class="field"><label>누적 주행거리 (km, 선택)</label><input type="number" id="mOdo" value="${f.odo}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
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
  const mt=existing||{id:null,date:todayStr(),type:'',cost:'',memo:''};
  openModal(`
    <h3>${existing?'정비 기록 수정':'정비 기록 추가'}</h3>
    <div class="field"><label>날짜</label><input type="date" id="mDate" value="${mt.date}"></div>
    <div class="field"><label>정비 항목 (예: 엔진오일 교체)</label><input id="mType" value="${escapeHtml(mt.type)}"></div>
    <div class="field"><label>비용 (선택)</label><input type="number" id="mCost" value="${mt.cost}"></div>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(mt.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const date=document.getElementById('mDate').value;
    const type=document.getElementById('mType').value.trim();
    if(!date||!type){ showToast('날짜와 정비 항목을 입력해주세요'); return; }
    const rec={id:mt.id||uid(),date,type,cost:document.getElementById('mCost').value,memo:document.getElementById('mMemo').value};
    if(mt.id){ const idx=state.vehicle.maint.findIndex(x=>x.id===mt.id); state.vehicle.maint[idx]=rec; }
    else state.vehicle.maint.push(rec);
    queueSave(); closeModal(); renderVehicle();
  };
}

/* ---------- EVENTS (경조사) ---------- */
const EVENT_TYPES=['생일','기념일','결혼식','돌잔치','장례식','병문안','기타'];
function renderEvents(){
  const el=document.getElementById('tab-events');
  const withD = state.events.map(ev=>({...ev, d: ddayFromDate(nextOccurrence(ev.date, ev.recurring))}));
  const upcoming = withD.filter(e=>e.d>=0).sort((a,b)=>a.d-b.d);
  const past = withD.filter(e=>e.d<0).sort((a,b)=>b.d-a.d);
  const row = ev => `
    <div class="list-item">
      <div><div>${escapeHtml(ev.name)} <span class="pill">${ev.type}</span>${ev.relation?` <span class="pill">${escapeHtml(ev.relation)}</span>`:''}</div>
      <div class="meta">${ev.date}${ev.recurring?' (매년)':''}${ev.amount?' · '+Number(ev.amount).toLocaleString()+'원':''}${ev.memo?' · '+escapeHtml(ev.memo):''}</div></div>
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
    if(confirm('삭제할까요?')){ state.events=state.events.filter(x=>x.id!==b.dataset.del); queueSave(); renderEvents(); renderHome(); }
  });
}
function openEventModal(existing){
  const ev=existing||{id:null,name:'',relation:'',type:EVENT_TYPES[0],date:todayStr(),recurring:true,amount:'',memo:''};
  openModal(`
    <h3>${existing?'경조사 수정':'경조사 추가'}</h3>
    <div class="field"><label>이름</label><input id="mName" value="${escapeHtml(ev.name)}"></div>
    <div class="grid2">
      <div class="field"><label>관계</label><input id="mRel" value="${escapeHtml(ev.relation)}" placeholder="예: 시댁, 친정, 친구"></div>
      <div class="field"><label>종류</label><select id="mType">${EVENT_TYPES.map(t=>`<option ${t===ev.type?'selected':''}>${t}</option>`).join('')}</select></div>
    </div>
    <div class="grid2">
      <div class="field"><label>날짜</label><input type="date" id="mDate" value="${ev.date}"></div>
      <div class="field"><label>금액 (선택)</label><input type="number" id="mAmount" value="${ev.amount}"></div>
    </div>
    <label class="pill" style="cursor:pointer;display:inline-block;margin:6px 0;"><input type="checkbox" id="mRecurring" ${ev.recurring?'checked':''} style="margin-right:4px;">매년 반복 (생일/기념일)</label>
    <div class="field"><label>메모</label><input id="mMemo" value="${escapeHtml(ev.memo)}"></div>
    <div class="modal-actions"><button class="btn" id="mCancel">취소</button><button class="btn primary" id="mSave">저장</button></div>
  `);
  document.getElementById('mCancel').onclick=closeModal;
  document.getElementById('mSave').onclick=()=>{
    const name=document.getElementById('mName').value.trim();
    const date=document.getElementById('mDate').value;
    if(!name||!date){ showToast('이름과 날짜를 입력해주세요'); return; }
    const rec={id:ev.id||uid(),name,relation:document.getElementById('mRel').value,type:document.getElementById('mType').value,date,recurring:document.getElementById('mRecurring').checked,amount:document.getElementById('mAmount').value,memo:document.getElementById('mMemo').value};
    if(ev.id){ const idx=state.events.findIndex(x=>x.id===ev.id); state.events[idx]=rec; }
    else state.events.push(rec);
    queueSave(); closeModal(); renderEvents(); renderHome();
  };
}

/* ---------- init ---------- */
function renderAll(){
  renderHome(); renderSchedule(); renderHealth(); renderBudget(); renderVehicle(); renderEvents();
}
initAuth();
renderAll();
