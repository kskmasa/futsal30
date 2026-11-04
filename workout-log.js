(function workoutJournal() {
  'use strict';
  const KEY='futsal30-workout-journal-v1', DATE='2026-11-04';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const original=[
    {id:'chat-ball',name:'ボールタッチ（前後・左右）',reps:20,sets:2,note:'前後・左右それぞれ20回'},
    {id:'chat-side',name:'インタッチ→サイドステップ→インタッチ',reps:10,sets:1,note:''},
    {id:'chat-abs',name:'腹筋',reps:20,sets:2,note:''},
    {id:'chat-push',name:'腕立て伏せ',reps:10,sets:2,note:''},
    {id:'chat-kick',name:'キックフォーム（右・左）',reps:10,sets:1,note:'右・左それぞれ10回'}
  ];
  const proposed=[
    {name:'ショルダープレス（座位）',reps:10,sets:2,note:'肩／ペットボトルなど軽い負荷'},
    {name:'アームカール（座位）',reps:12,sets:2,note:'腕／ペットボトルなど軽い負荷'},
    {name:'サイドレイズ（座位）',reps:10,sets:2,note:'肩の側面／軽い負荷'},
    {name:'肩甲骨寄せ（座位）',reps:15,sets:2,note:'背中上部／器具なし'}
  ];
  let db={};try{const val=JSON.parse(localStorage.getItem(KEY)||'{}');if(val&&typeof val==='object'&&!Array.isArray(val))db=val;}catch{}
  let selected=typeof localISO==='function'?localISO():DATE;
  function userId(){try{const d=JSON.parse(localStorage.getItem('futsal30-users-v2')||'{}');return typeof d.active==='string'?d.active:'default';}catch{return 'default';}}
  function get(date=selected){const a=db[userId()]?.[date];return Array.isArray(a)?a:[];}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));return true;}catch{alert('保存できませんでした。ブラウザーの保存設定を確認してください。');return false;}}
  function mutate(date,fn){const id=userId();if(!db[id])db[id]={};const old=get(date),next=fn(old.map(x=>({...x})));db[id][date]=next;if(!persist()){db[id][date]=old;return false;}return true;}
  function add(item){const id='entry-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);return mutate(selected,a=>[...a,{id,name:String(item.name),reps:Number(item.reps),sets:Number(item.sets),note:item.note||''}]);}
  const css=document.createElement('style');css.textContent=`
    .workout-journal,.upperbody-card{margin:22px 0}.workout-log-stats{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
    .workout-log-stats span{background:#edf7f0;color:#316848;border-radius:8px;padding:8px 12px;font-weight:700;font-size:11px}
    .workout-log-list,.upperbody-options{display:grid;gap:8px;margin:14px 0}
    .workout-log-item,.upperbody-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px;border:1px solid #e0ebe3;border-radius:10px;background:#fff}
    .workout-log-item strong,.upperbody-item strong{display:block;color:#28533f;font-size:12px}
    .workout-log-item small,.upperbody-item small{display:block;font-size:10px;color:#829589;line-height:1.7;margin-top:3px}
    .workout-log-item button{background:#f9eae9;color:#995e5e;border:0;border-radius:8px;padding:8px 12px;font-size:11px;cursor:pointer}
    .upperbody-item button,.workout-import button{border:0;border-radius:8px;padding:9px 12px;background:#276044;color:#fff;font-size:11px;font-weight:700;cursor:pointer}
    .upperbody-item button{max-width:108px}
    .workout-import[hidden]{display:none}.workout-import{background:#f3f9f3;border:1px solid #d4e8d7;border-radius:11px;padding:15px;margin:15px 0}
    .workout-import h3{font-size:13px;color:#346b4c}.workout-import p,.workout-import li{font-size:11px;color:#698774;line-height:1.8}
    .workout-import ul{padding-left:20px;margin-bottom:14px}
    .workout-log-form{padding-top:16px;border-top:1px solid #e7eee8}
    .upperbody-label{background:#edf2ed;border-radius:20px;padding:7px 11px;color:#799080;font-weight:700;font-size:10px}
    .home-exercise-journal{margin-top:14px;padding:14px;background:#f0f7f1;border-radius:9px;color:#376d4e;font-size:11px}
    .home-exercise-journal strong{display:block}.home-exercise-journal small{display:block;color:#769383;line-height:1.8;margin-top:5px}
    @media(max-width:680px){.upperbody-card .section-head,.workout-journal .section-head{flex-wrap:wrap}.workout-log-item,.upperbody-item{align-items:flex-start}.upperbody-item button{min-width:82px}}
  `;document.head.appendChild(css);
  const place=document.querySelector('#page-training .week-select-head');if(!place)return;
  place.insertAdjacentHTML('beforebegin',`
    <div class="card workout-journal">
     <div class="section-head"><div><div class="eyebrow">TRAINING JOURNAL</div><h2>実施した運動の記録</h2></div><label class="date-control">記録日 <input id="workout-log-date" type="date" min="2026-11-03"></label></div>
     <p class="diary-hint">実際に行った種目・回数・セット数をユーザーごとに保存。日別メニューのチェックとは別の実績です。</p>
     <div id="workout-log-stats" class="workout-log-stats"></div><div id="workout-log-items" class="workout-log-list"></div><div id="workout-import" class="workout-import"></div>
     <form id="workout-log-form" class="diary-form workout-log-form">
      <label class="diary-wide">種目<input id="workout-name" type="text" maxlength="80" required placeholder="例：アームカール"></label>
      <label>回数／セット<input id="workout-reps" type="number" min="1" max="1000" step="1" required placeholder="例：12"></label>
      <label>セット数<input id="workout-sets" type="number" min="1" max="100" step="1" value="2" required></label>
      <label class="diary-wide">メモ（任意）<input id="workout-note" type="text" maxlength="160" placeholder="左右各10回、など"></label>
      <button class="primary-action" type="submit">＋ 実施した運動を保存</button>
     </form>
    </div>
    <div class="card upperbody-card">
     <div class="section-head"><div><div class="eyebrow">UPPER BODY / OPTIONAL</div><h2>追加の上半身メニュー</h2></div><span class="upperbody-label">未実施・提案</span></div>
     <p class="diary-hint">太ももの裏が痛む間は座位でできる種目を。今日は腕立て・腹筋も行っているので追加は任意です。実施した種目だけ記録できます。</p>
     <div id="upperbody-options" class="upperbody-options"></div>
    </div>
  `);
  const home=$('today-activity-blocks');if(home)home.insertAdjacentHTML('afterend','<div id="home-exercise-journal" class="home-exercise-journal"></div>');
  function render(){
    $('workout-log-date').value=selected;
    const entries=get();const sum=entries.reduce((a,b)=>a+(Number(b.sets)||0),0);
    $('workout-log-stats').innerHTML=`<span>${esc(selected)}</span><span>${entries.length}種目</span><span>${sum}セット</span>`;
    $('workout-log-items').innerHTML=entries.length?entries.map(x=>`<div class="workout-log-item"><div><strong>${esc(x.name)}</strong><small>${esc(x.reps)}回 × ${esc(x.sets)}セット${x.note?' ／ '+esc(x.note):''}</small></div><button type="button" data-remove-exercise="${esc(x.id)}">削除</button></div>`).join(''):'<p class="diary-hint">まだこの日の実績はありません。</p>';
    const box=$('workout-import');
    {
      const pending=original.filter(x=>!get(DATE).some(y=>y.id===x.id));
      box.hidden=!pending.length;
      box.innerHTML=pending.length?`<h3>11月4日に実施した5種目（会話の記録）</h3><p>端末内の記録はGitHubから直接書き換えられないため、ワンタップでこのユーザーに保存できます。</p><ul>${pending.map(x=>`<li>${esc(x.name)}：${x.reps}回 × ${x.sets}セット</li>`).join('')}</ul><button type="button" id="import-nov4-exercises">11/4の実績を取り込む（残り${pending.length}種目）</button>`:'';
    }
    $('upperbody-options').innerHTML=proposed.map((x,i)=>`<div class="upperbody-item"><div><strong>${esc(x.name)}</strong><small>${x.reps}回 × ${x.sets}セット・${esc(x.note)}</small></div><button type="button" data-add-upper="${i}">実施したら記録</button></div>`).join('');
    const dash=$('home-exercise-journal');
    if(dash){const d=typeof localISO==='function'?localISO():DATE;const today=db[userId()]?.[d]||[];dash.innerHTML=`<strong>今日の実績：${today.length}種目・${today.reduce((n,x)=>n+(Number(x.sets)||0),0)}セット</strong><small>運動タブで実施記録を追加・確認できます。未実施の提案は含まれません。</small>`;}
  }
  $('workout-log-date').addEventListener('change',e=>{selected=e.target.value||selected;render();});
  $('workout-log-form').addEventListener('submit',e=>{
    e.preventDefault();const name=$('workout-name').value.trim(),reps=Number($('workout-reps').value),sets=Number($('workout-sets').value),note=$('workout-note').value.trim();
    if(!name||!Number.isInteger(reps)||reps<1||reps>1000||!Number.isInteger(sets)||sets<1||sets>100){alert('種目名・回数・セット数を確認してください');return;}
    if(add({name,reps,sets,note})){$('workout-log-form').reset();$('workout-sets').value=2;render();}
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('#import-nov4-exercises')){
      const rest=original.filter(x=>!get(DATE).some(y=>y.id===x.id));mutate(DATE,a=>[...a,...rest]);selected=DATE;render();return;
    }
    const remove=e.target.closest('[data-remove-exercise]');
    if(remove){mutate(selected,a=>a.filter(x=>x.id!==remove.dataset.removeExercise));render();return;}
    const addUpper=e.target.closest('[data-add-upper]');
    if(addUpper){const x=proposed[Number(addUpper.dataset.addUpper)];if(x&&add(x))render();return;}
    if(e.target.closest('#add-profile'))queueMicrotask(render);
  });
  document.addEventListener('change',e=>{if(e.target.matches('#profile-selector'))queueMicrotask(render);});
  window.addEventListener('storage',e=>{if(e.key===KEY){try{db=JSON.parse(e.newValue||'{}')||{};}catch{db={};}render();}if(e.key==='futsal30-users-v2')render();});
  render();
})();