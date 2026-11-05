(function installFeatures(){
'use strict';
const KEY='futsal30-users-v2';
const $=id=>document.getElementById(id);
const escapeText=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const deepCopy=x=>JSON.parse(JSON.stringify(x));
const uid=()=>('id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
let db;
try{db=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
if(!db||!Array.isArray(db.users)||db.users.length===0){
 db={active: 'default',users:[{id:'default',name:'ユーザー1',height:null,weight:null,age:null,data:deepCopy(state),foods:{},weights:{},activityDone:{}}]};
}
function normalize(u){
 u.data=u.data&&typeof u.data==='object'?u.data:deepCopy(DEFAULT_STATE);
 u.data.workouts=u.data.workouts||{};
 u.data.meals=u.data.meals||{};
 u.data.shoppingChecked=Array.isArray(u.data.shoppingChecked)?u.data.shoppingChecked:[];
 u.data.dinner=dinnerOptions[u.data.dinner]?u.data.dinner:'A';
 u.data.shoppingMode=u.data.shoppingMode||'allA';
 u.foods=u.foods&&typeof u.foods==='object'?u.foods:{};
 u.weights=u.weights&&typeof u.weights==='object'?u.weights:{};
 u.activityDone=u.activityDone&&typeof u.activityDone==='object'?u.activityDone:{};
 return u;
}
db.users.forEach(normalize);
if(!db.users.some(u=>u.id===db.active))db.active=db.users[0].id;
const active=()=>db.users.find(u=>u.id===db.active)||db.users[0];
function persist(){
 try{active().data=deepCopy(state);localStorage.setItem(KEY,JSON.stringify(db));}
 catch{showToast('記録を保存できませんでした。ストレージ容量とブラウザー設定を確認してください。');}
}
window.futsalPersist=persist;
state=deepCopy(active().data);
const presets=[
 ['','その他（手入力）',0,0],
 ['protein','プロテイン（粉末30g・1回分）',120,23],
 ['milk','牛乳（200ml）',130,6.6],
 ['yogurt','ヨーグルト（100g）',65,3.5],
 ['banana','バナナ（1本）',90,1],
 ['cup','カップ麺（1個）',380,9],
 ['salad','サラダチキン（110g）',125,25],
 ['rice','冷凍焼きおにぎり（1個）',125,2.5],
 ['chahan','冷凍チャーハン（400g）',850,21],
 ['chicken','加熱済み冷凍チキン（200g）',330,50],
 ['broccoli','冷凍ブロッコリー（150g）',50,6],
 ['edamame','冷凍枝豆（可食部100g）',135,12],
 ['ramen','冷凍具付きラーメン（1食）',450,16],
 ['pasta','冷凍ミートソースパスタ（1食）',450,18]
];
const blocks={
 futsal:[['準備運動',10,'足首・股関節を動かす'],['実戦',40,'当日のプレー時間に応じて調整'],['整理運動',10,'軽く歩いてストレッチ']],
 recovery:[['ゆっくり散歩',30,'10分ずつ分けてもOK'],['関節の可動域づくり',15,'足首・股関節・背中をゆっくり動かす'],['ストレッチと呼吸',15,'負担の少ない範囲で']],
 rest:[['気分転換の散歩',30,'きつい日は短縮・省略してOK'],['軽いモビリティ',15,'足首・股関節・肩をゆっくり動かす'],['リラックス・ストレッチ',15,'疲労回復を最優先']],
 strength:[['ウォームアップ',10,'足踏みと軽い歩行'],['脚と体幹の筋トレ',25,'スクワット・ランジ・カーフレイズ・ヒップリフト・プランク'],['ボールタッチ',10,'足裏・インサイドでゆっくり'],['軽いウォーキング',10,'会話できる強度'],['クールダウン',5,'呼吸を整える']],
 agility:[['ウォームアップ',10,'散歩と関節の動作'],['フットワーク',12,'その場足踏み・横と前後のステップ'],['ボールタッチ',13,'足裏とインサイド'],['軽いウォーキング',20,'会話できる強度'],['ストレッチ',5,'ふくらはぎ・太もも']],
 aerobicA:[['ウォームアップ',8,'軽いウォーキング'],['歩きとジョグ',28,'走る1分＋歩く2分×6、前後に各5分歩く'],['ボールタッチ',14,'ゆっくり確実に'],['ストレッチ',10,'クールダウン']],
 aerobicB:[['ウォームアップ',8,'軽い足踏み'],['歩きとジョグ',34,'走る2分＋歩く2分×6、前後に各5分歩く'],['フットワーク',10,'小刻みな足の置き換え'],['ストレッチ',8,'クールダウン']],
 aerobicC:[['ウォームアップ',8,'軽い足踏み'],['歩きとジョグ',34,'走る3分＋歩く1分×6、前後に各5分歩く'],['ボールタッチ',10,'低速で行う'],['ストレッチ',8,'クールダウン']],
 aerobicD:[['ウォームアップ',10,'軽いウォーキング'],['軽い有酸素運動',20,'会話できる程度で。無理なら歩く'],['ボールタッチ',15,'足裏・インサイド'],['ウォーキング',10,'呼吸を整える'],['ストレッチ',5,'クールダウン']],
 ball:[['ウォームアップ',10,'ゆっくり歩く'],['ボールタッチ練習',20,'インサイド左右・足裏'],['足運び',10,'正確なステップ'],['ウォーキング',15,'軽い有酸素'],['ストレッチ',5,'クールダウン']],
 shuttle:[['ウォームアップ',10,'軽いジョグ・足運び'],['5m加速・減速',15,'低〜中強度で4〜6本。止まり方を重視'],['ボールタッチ',15,'ゆっくり正確に'],['ウォーキング',15,'軽く歩く'],['ストレッチ',5,'クールダウン']],
 repeat:[['ウォームアップ',10,'軽いジョグとステップ'],['反復移動',15,'20秒移動＋60秒休憩を4〜6回、残りは十分休む'],['ボールタッチ',15,'軽い動きで調整'],['ウォーキング',15,'会話できる強度'],['ストレッチ',5,'クールダウン']],
 easy:[['ウォームアップ',8,'軽く歩く'],['関節の可動域づくり',20,'足首・股関節・肩をほぐす'],['ゆっくり散歩',22,'負担の少ない速さ'],['ストレッチ',10,'疲労を抜く']],
 match:[['ウォームアップ',10,'軽いジョグ・ストレッチ・ステップ'],['試合・交代を含む時間',40,'実際の試合予定にあわせて調整'],['クールダウン',10,'軽い歩行・水分補給']]
};
Object.keys(trainingTypes).forEach(k=>{trainingTypes[k].duration=k==='rest'||k==='recovery'?'約60分（回復活動）':k==='futsal'||k==='match'?'実際のプレーに合わせる':'約60分';});
let selectedDate=localISO();
let foodDate=localISO();
function currentWeight(){
 const weights=Object.entries(active().weights).filter(([date,v])=>date<=localISO()&&Number.isFinite(Number(v))&&Number(v)>0).sort((a,b)=>a[0].localeCompare(b[0]));
 return weights.length?Number(weights[weights.length-1][1]):Number(active().weight)||0;
}
function targets(){
 const w=currentWeight();
 return w?{weight:w,kcalLow:Math.round(w*35/50)*50,kcalHigh:Math.round(w*42/50)*50,proteinLow:Math.round(w*1.4),proteinHigh:Math.round(w*1.8)}:null;
}
function renderTargets(){
 const t=targets();const show=t?`${t.kcalLow.toLocaleString('ja-JP')}–${t.kcalHigh.toLocaleString('ja-JP')}`:'—';
 $('home-kcal-target').textContent=show;
 $('meal-kcal-target').textContent=show;
 $('home-protein-target').textContent=t?`たんぱく質：約${t.proteinLow}〜${t.proteinHigh}g / 日（暫定）`:'プロフィールから体重を設定';
 $('meal-protein-target').textContent=t?`${t.proteinLow}–${t.proteinHigh}`:'—';
 $('meal-body-value').textContent=active().height&&t?`${active().height} cm / ${t.weight.toFixed(1)} kg`:'プロフィールで設定';
 $('topbar-user').textContent=active().name;
}
function activityPlan(date){
 const item=plan.find(x=>x.date===date);if(!item)return null;
 return {item,detail:blocks[item.type]||blocks.easy};
}
function blockHtml(date,compact=false){
 const p=activityPlan(date);
 if(!p)return '<p class="diary-hint">計画期間外です。</p>';
 const marks=active().activityDone[date]||[];
 const total=p.detail.reduce((s,x)=>s+x[1],0);
 const checked=p.detail.reduce((s,x,i)=>s+(marks.includes(i)?x[1]:0),0);
 return `<div class="activity-head"><strong>${displayDate(date)} · 約${total}分</strong><span>${checked}/${total}分 記録</span></div>
 <div class="activity-track"><span style="width:${checked/total*100}%"></span></div>
 <div class="activity-list">${p.detail.map(([name,mins,note],i)=>`<label class="activity-line"><input type="checkbox" data-activity-date="${date}" data-activity-index="${i}" ${marks.includes(i)?'checked':''}><span><strong>${escapeText(name)}</strong><small>${escapeText(note)}</small></span><b>${mins}分</b></label>`).join('')}</div>
 ${p.item.type==='rest'||p.item.type==='recovery'?'<p class="diary-hint">回復日は合計60分にこだわらず、疲労に応じて短縮できます。</p>':''}
 ${p.item.type==='match'||p.item.type==='futsal'?'<p class="diary-hint">実際のプレー時間にあわせて調整してください。</p>':''}`;
}
function renderTodayExtras(){
 const el=$('today-activity-blocks');if(el)el.innerHTML=activityPlan(localISO())?`<h3 class="subsection-title">60分の内訳</h3>${blockHtml(localISO(),true)}`:'';
 renderFoodSummary();
}
function renderTrainingDetail(){
 const p=activityPlan(selectedDate);
 const week=weeks[currentWeek];
 if(!p||selectedDate<week.range[0]||selectedDate>week.range[1]){
 selectedDate=plan.find(x=>x.date>=week.range[0]&&x.date<=week.range[1])?.date||localISO();
 }
 const el=$('training-detail');if(!el)return;
 el.innerHTML=`<div class="section-head"><div><div class="eyebrow">DAY PLAN / 60 MIN</div><h2>日別メニューの内訳</h2></div></div>${blockHtml(selectedDate)}`;
}
window.futsalRenderTodayExtras=renderTodayExtras;
window.futsalRenderTrainingDetail=renderTrainingDetail;
function toggleActivity(date,index,checked){
 const p=activityPlan(date);if(!p||!p.detail[index])return;
 let arr=active().activityDone[date]||[];
 arr=checked?[...new Set([...arr,index])]:arr.filter(x=>x!==index);
 active().activityDone[date]=arr;
 if(arr.length===p.detail.length)state.workouts[date]=true;
 else if(state.workouts[date]&&date!=='2026-11-03')state.workouts[date]=false;
 save();renderMetrics();renderToday();renderWeeks();
}
function renderProfile(){
 const sel=$('profile-selector');
 sel.innerHTML=db.users.map(u=>`<option value="${escapeText(u.id)}">${escapeText(u.name)}</option>`).join('');
 sel.value=db.active;
 $('profile-name').value=active().name||'';
 $('profile-height').value=active().height??'';
 $('profile-weight').value=active().weight??'';
 $('profile-age').value=active().age??'';
 const t=targets();
 const bmi=active().height&&t?(t.weight/((Number(active().height)/100)**2)).toFixed(1):'—';
 $('profile-overview').innerHTML=`<div class="profile-stat"><small>現在の体重</small><strong>${t?t.weight.toFixed(1)+' kg':'未記録'}</strong></div><div class="profile-stat"><small>BMI</small><strong>${bmi}</strong></div><div class="profile-stat"><small>摂取目安</small><strong>${t?`${t.kcalLow}〜${t.kcalHigh} kcal`:'要設定'}</strong></div>`;
 renderWeight();
}
function renderAll(){
 renderMetrics();renderToday();renderWeeks();renderExerciseLibrary();renderMeals();renderShopping();renderTargets();renderProfile();renderFoodDiary();
}
const weightEntries=()=>Object.entries(active().weights).filter(([date,w])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number(w)>0).sort(([a],[b])=>a.localeCompare(b));
function renderWeight(){
 const values=weightEntries();const latest=values.slice(-1)[0];const d=new Date();const threshold=localISO(new Date(d.getFullYear(),d.getMonth(),d.getDate()-6));
 const week=values.filter(([date])=>date>=threshold&&date<=localISO());
 const avg=week.length?week.reduce((s,x)=>s+Number(x[1]),0)/week.length:null;
 const initial=values[0];const diff=latest&&initial?Number(latest[1])-Number(initial[1]):0;
 $('weight-stats').innerHTML=`<div><small>最新</small><strong>${latest?Number(latest[1]).toFixed(1)+' kg':'—'}</strong></div><div><small>直近7日の平均（${week.length}件）</small><strong>${avg!==null?avg.toFixed(1)+' kg':'—'}</strong></div><div><small>最初の記録との差</small><strong>${values.length>1?`${diff>=0?'+':''}${diff.toFixed(1)} kg`:'—'}</strong></div>`;
 const subset=values.slice(-14);
 if(!subset.length){$('weight-chart').innerHTML='<p class="diary-hint">体重を保存すると推移が表示されます。</p>';}
 else{
 const ys=subset.map(x=>Number(x[1]));const lo=Math.min(...ys)-0.5,hi=Math.max(...ys)+0.5;
 const pts=subset.map((x,i)=>({x:40+(subset.length===1?220:i*440/(subset.length-1)),y:125-(Number(x[1])-lo)/(hi-lo)*98,date:x[0],value:x[1]}));
 const points=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
 $('weight-chart').innerHTML=`<svg class="weight-svg" viewBox="0 0 520 165" role="img" aria-label="記録された体重の推移"><line x1="30" y1="27" x2="490" y2="27" stroke="#e9efea"/><line x1="30" y1="76" x2="490" y2="76" stroke="#e9efea"/><line x1="30" y1="125" x2="490" y2="125" stroke="#e9efea"/><text x="3" y="30" fill="#82968c" font-size="11">${hi.toFixed(1)}</text><text x="3" y="128" fill="#82968c" font-size="11">${lo.toFixed(1)}</text><polyline points="${points}" fill="none" stroke="#39885f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#39885f"><title>${p.date}: ${p.value} kg</title></circle>`).join('')}<text x="40" y="153" font-size="11" fill="#82968c">${escapeText(subset[0][0].slice(5))}</text><text x="475" y="153" text-anchor="end" font-size="11" fill="#82968c">${escapeText(subset[subset.length-1][0].slice(5))}</text></svg>`;
 }
 $('weight-records').innerHTML=values.slice(-10).reverse().map(([date,w])=>`<div class="log-row"><span>${escapeText(date)}</span><strong>${Number(w).toFixed(1)} kg</strong><button type="button" data-delete-weight="${date}" aria-label="${date}の体重記録を削除">削除</button></div>`).join('');

 const importEl=$('weight-import-nov5');
 if(importEl){
  const date='2026-11-05',hasRecord=Object.prototype.hasOwnProperty.call(active().weights,date);
  importEl.innerHTML=!hasRecord
   ? '<div class="weight-import-inner"><div><strong>11月5日 朝の体重：60.7kg</strong><small>会話で報告した計測値を、このユーザーの記録に保存できます。</small></div><button type="button" class="outline-btn" id="import-nov5-weight">11/5の体重を記録</button></div>'
   : '<div class="weight-import-inner"><div><strong>11月5日の体重は記録済み</strong><small>現在の記録：'+Number(active().weights[date]).toFixed(1)+'kg。数値を変更する場合は上の入力欄から保存してください。</small></div></div>';
 }

}
function foodRecords(date=foodDate){return Array.isArray(active().foods[date])?active().foods[date]:[];}
function foodTotals(date=foodDate){return foodRecords(date).reduce((a,r)=>({cal:a.cal+Number(r.kcal||0)*Number(r.qty||1),protein:a.protein+Number(r.protein||0)*Number(r.qty||1)}),{cal:0,protein:0});}
function renderFoodSummary(){
 const el=$('home-food-totals');if(!el)return;
 const t=foodTotals(localISO());const n=foodRecords(localISO()).length;
 el.innerHTML=`<strong>今日の記録：${Math.round(t.cal).toLocaleString('ja-JP')} kcal / ${t.protein.toFixed(1)} g</strong><small>${n}件の食事を登録済み。食事チェックとは別に記録されます。</small>`;
}
function renderFoodDiary(){
 const t=foodTotals(),n=foodRecords().length,targetsNow=targets();
 $('food-log-date').value=foodDate;
 $('food-summary').innerHTML=`<div><small>摂取カロリー</small><strong>${Math.round(t.cal).toLocaleString('ja-JP')} <small>kcal</small></strong><span>${targetsNow?`目安 ${targetsNow.kcalLow}〜${targetsNow.kcalHigh}`:'体重を設定すると目標が表示されます'}</span></div><div><small>タンパク質</small><strong>${t.protein.toFixed(1)} <small>g</small></strong><span>${targetsNow?`目安 ${targetsNow.proteinLow}〜${targetsNow.proteinHigh}g`:'栄養値は食品表示を優先'}</span></div><div><small>記録数</small><strong>${n} <small>件</small></strong><span>${escapeText(foodDate)}</span></div>`;
 const records=foodRecords();
 $('food-log-list').innerHTML=records.length?records.map(r=>`<div class="log-row"><div><small>${escapeText(r.meal)}</small><strong>${escapeText(r.name)}</strong><span>${Number(r.qty)}回 × ${Number(r.kcal)}kcal ・ P${Number(r.protein)}g</span></div><button type="button" data-delete-food="${escapeText(r.id)}">削除</button></div>`).join(''):'<p class="diary-hint">まだこの日の食事記録はありません。</p>';
 renderFoodSummary();
}
function resetFoodPreset(){
 const p=presets.find(x=>x[0]===$('food-preset').value)||presets[0];
 $('food-name').value=p[1]==='その他（手入力）'?'':p[1];
 $('food-kcal').value=p[2]||'';
 $('food-protein').value=p[3]||'';
 $('food-quantity').value=1;
}
function initFeatures(){
 $('food-preset').innerHTML=presets.map(p=>`<option value="${escapeText(p[0])}">${escapeText(p[1])}</option>`).join('');
 $('food-preset').value='protein';resetFoodPreset();
 $('food-log-date').value=foodDate;
 $('weight-date').value=localISO();
 $('weight-kg').value=active().weight||'';
 $('profile-selector').addEventListener('change',ev=>{persist();db.active=ev.target.value;state=deepCopy(normalize(active()).data);persist();renderAll();showToast('ユーザーを切り替えました');});
 $('add-profile').addEventListener('click',()=>{
  if(db.users.length>=20){showToast('登録できるユーザーは20人までです');return;}
  persist();
  const id=uid();
  db.users.push(normalize({id,name:`ユーザー${db.users.length+1}`,height:null,weight:null,age:null,data:{...deepCopy(DEFAULT_STATE),workouts:{}},foods:{},weights:{},activityDone:{}}));
  db.active=id;state=deepCopy(active().data);persist();renderAll();showToast('新しいユーザーを追加しました');
 });
 $('profile-form').addEventListener('submit',ev=>{
  ev.preventDefault();
  const u=active();const name=$('profile-name').value.trim();
  if(!name){showToast('ユーザー名を入力してください');return;}
  u.name=name;
  for(const [key,id,min,max] of [['height','profile-height',100,240],['weight','profile-weight',25,250],['age','profile-age',10,110]]){
   const raw=$(id).value.trim();const v=raw===''?null:Number(raw);
   if(v!==null&&(!Number.isFinite(v)||v<min||v>max)){showToast('数値を確認してください');return;}
   u[key]=v;
  }
  persist();renderTargets();renderProfile();renderFoodDiary();showToast('プロフィールを保存しました');
 });
 $('weight-form').addEventListener('submit',ev=>{
  ev.preventDefault();const date=$('weight-date').value,w=Number($('weight-kg').value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(w)||w<25||w>250){showToast('計測日と体重を確認してください');return;}
  active().weights[date]=Number(w.toFixed(1));
  persist();renderWeight();renderTargets();renderFoodDiary();renderProfile();showToast('体重を保存しました');
 });
 $('food-preset').addEventListener('change',resetFoodPreset);
 $('food-log-date').addEventListener('change',ev=>{foodDate=ev.target.value||localISO();renderFoodDiary();});
 $('food-log-form').addEventListener('submit',ev=>{
  ev.preventDefault();
  const name=$('food-name').value.trim(),qty=Number($('food-quantity').value),kcal=Number($('food-kcal').value),protein=Number($('food-protein').value);
  if(!name||!Number.isFinite(qty)||qty<=0||qty>20||!Number.isFinite(kcal)||kcal<0||kcal>5000||!Number.isFinite(protein)||protein<0||protein>300){showToast('入力内容を確認してください');return;}
  const records=active().foods[foodDate]||[];
  records.push({id:uid(),name,meal:$('food-log-meal').value,qty,kcal,protein});
  active().foods[foodDate]=records;
  persist();renderFoodDiary();showToast('食事を記録しました');
 });
 document.addEventListener('change',ev=>{
  const el=ev.target;if(el.matches('[data-activity-date]'))toggleActivity(el.dataset.activityDate,Number(el.dataset.activityIndex),el.checked);
 });
 document.addEventListener('click',ev=>{
  if(ev.target.closest('#import-nov5-weight')){
   const date='2026-11-05';
   if(Object.prototype.hasOwnProperty.call(active().weights,date)){showToast('この日付の記録はすでにあります');return;}
   active().weights[date]=60.7;
   persist();renderWeight();renderTargets();renderFoodDiary();renderProfile();
   showToast('11月5日の体重60.7kgを記録しました');
   return;
  }
  const weightButton=ev.target.closest('[data-delete-weight]');
  if(weightButton){delete active().weights[weightButton.dataset.deleteWeight];persist();renderWeight();renderTargets();renderFoodDiary();renderProfile();return;}
  const foodButton=ev.target.closest('[data-delete-food]');
  if(foodButton){active().foods[foodDate]=foodRecords().filter(r=>r.id!==foodButton.dataset.deleteFood);persist();renderFoodDiary();return;}
  const row=ev.target.closest('[data-plan-date]');
  if(row&&!ev.target.closest('button')){selectedDate=row.dataset.planDate;renderTrainingDetail();$('training-detail')?.scrollIntoView({behavior:'smooth',block:'center'});}
 });
 window.futsalRenderTodayExtras=renderTodayExtras;
 window.futsalRenderTrainingDetail=renderTrainingDetail;
 renderAll();
}
initFeatures();
})();