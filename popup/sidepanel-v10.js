// =====================================================
// RH Pharma — Side Panel UI for v0.10.0 modules
// =====================================================
// ฉีด tab ใหม่เข้า sidepanel โดยไม่กระทบของเดิม
// แท็บที่เพิ่ม:
//   📦 คลังสื่อ  → ClipWarehouse
//   📅 ซีรีส์    → StorySeries
//   ⏰ ตาราง    → ScheduleQueue
//   🎙️ Podcast → PodcastGenerator
//   🛡️ ตรวจ    → ContentValidator
// =====================================================

(function() {
  'use strict';

  const V10Tabs = {
    'v10-warehouse': { label: '📦', tip: 'คลังสื่อ', renderer: renderWarehouse },
    'v10-series':    { label: '📅', tip: 'ซีรีส์',  renderer: renderSeries },
    'v10-schedule':  { label: '⏰', tip: 'ตาราง',  renderer: renderSchedule },
    'v10-podcast':   { label: '🎙️', tip: 'Podcast', renderer: renderPodcast },
    'v10-validator': { label: '🛡️', tip: 'ตรวจสอบ', renderer: renderValidator }
  };

  // v0.10.0 fix: guard กรณี DOMContentLoaded fire ไปแล้ว (script อยู่ end of body)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // 1. รอ DOM พร้อม + tab bar เดิม
    const tabBar = document.querySelector('.tab-bar');
    const tabContent = document.querySelector('.tab-content');
    if (!tabBar || !tabContent) {
      console.warn('[v10-ui] ไม่พบ .tab-bar / .tab-content — skip');
      return;
    }

    injectTabButtons(tabBar);
    injectTabPanes(tabContent);
    wireUpClicks();

    // initial render
    refreshAllTabs();

    // refresh ทุก 10 วินาที สำหรับ warehouse/schedule
    setInterval(refreshAllTabs, 10000);

    console.log('[v10-ui] tabs initialized');
  }

  // ===== Tab buttons เพิ่มท้าย tab bar =====
  function injectTabButtons(tabBar) {
    const sepStyle = 'flex: 0 0 1px; background: var(--border-color); margin: 4px 4px;';
    const sep = document.createElement('div');
    sep.style.cssText = sepStyle;
    tabBar.appendChild(sep);

    for (const [id, def] of Object.entries(V10Tabs)) {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.dataset.tab = id;
      btn.title = def.tip;
      btn.style.flex = '0 0 38px';
      btn.style.padding = '10px 4px';
      btn.style.fontSize = '16px';
      btn.textContent = def.label;
      tabBar.appendChild(btn);
    }
  }

  // ===== Tab panes ใหม่ =====
  function injectTabPanes(tabContent) {
    for (const id of Object.keys(V10Tabs)) {
      const pane = document.createElement('section');
      pane.className = 'tab-pane';
      pane.id = id;
      pane.innerHTML = '<div class="v10-empty"><div class="v10-loading"></div></div>';
      tabContent.appendChild(pane);
    }
  }

  // ===== Hook click ของแท็บใหม่ — handle เฉพาะของ v10 =====
  // เหตุผล: sidepanel.js เดิมมี setupTabs() ที่ผูก click กับทุก .tab-btn ไปแล้ว
  //         และใช้ pattern "tab" + capitalize(tab) ในการหา pane ของตัวเอง
  //         ถ้าเราทำ active-toggle ทับแบบไม่เลือก จะไปลบ .active ของ pane เดิมตอนคลิกแท็บเดิม
  //         ดังนั้นเราจัดการเฉพาะแท็บของ v10 + ใช้ stopImmediatePropagation บนแท็บ v10
  //         เพื่อไม่ให้ listener ของเดิมไปหา pane "tabV10-xxx" ที่ไม่มีอยู่
  function wireUpClicks() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.dataset.tab;
      if (!tab || !V10Tabs[tab]) return;   // ปล่อยให้ของเดิม handle

      // capture phase + stopImmediatePropagation → กัน setupTabs ของเดิมรันต่อ
      btn.addEventListener('click', (ev) => {
        ev.stopImmediatePropagation();

        // toggle .active บนทุก tab-btn
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        // toggle .active บนทุก pane (ลบของเดิมและของ v10 ออกหมด แล้วเปิดของ v10 ที่เลือก)
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === tab));

        safeRender(tab, V10Tabs[tab].renderer, document.getElementById(tab));
      }, true);
    });
  }

  // ===== Wrapper เพื่อกัน render ตัวใดล้มแล้วทำลายทั้ง side panel =====
  async function safeRender(label, renderer, pane) {
    if (!pane) return;
    try {
      await renderer(pane);
    } catch (e) {
      console.error(`[v10-ui] render(${label}) failed:`, e);
      pane.innerHTML = `<div class="v10-empty">
        <span class="v10-empty-icon">⚠️</span>
        <div>เกิดข้อผิดพลาด — เปิด DevTools console ดู</div>
        <div style="font-size:11px;margin-top:6px;opacity:.7;">${String(e && e.message || e).replace(/[<>]/g, '')}</div>
      </div>`;
    }
  }

  async function refreshAllTabs() {
    for (const [id, def] of Object.entries(V10Tabs)) {
      const pane = document.getElementById(id);
      if (!pane || !pane.classList.contains('active')) continue;
      safeRender(id, def.renderer, pane);
    }
  }

  // ============================================================
  // 📦 WAREHOUSE TAB
  // ============================================================
  let _warehouseFilter = 'all';

  async function renderWarehouse(pane) {
    if (!window.ClipWarehouse) {
      pane.innerHTML = empty('⚠️ ยังไม่ได้โหลด ClipWarehouse');
      return;
    }
    const stats = await window.ClipWarehouse.getStats();
    const items = await window.ClipWarehouse.getAll(
      _warehouseFilter === 'all' ? {} : { status: _warehouseFilter }
    );

    pane.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📦</span>
          <h3>คลังสื่อสุขภาพ</h3>
          <span class="badge">${stats.total}/${window.ClipWarehouse.MAX_ITEMS}</span>
        </div>

        <div class="v10-stats-bar">
          <div class="v10-stat" data-status="waiting"><span class="v10-stat-num">${stats.waiting||0}</span><span class="v10-stat-label">รอ</span></div>
          <div class="v10-stat" data-status="approved"><span class="v10-stat-num">${stats.approved||0}</span><span class="v10-stat-label">อนุมัติ</span></div>
          <div class="v10-stat" data-status="scheduled"><span class="v10-stat-num">${stats.scheduled||0}</span><span class="v10-stat-label">นัด</span></div>
          <div class="v10-stat" data-status="posted"><span class="v10-stat-num">${stats.posted||0}</span><span class="v10-stat-label">โพสต์แล้ว</span></div>
          <div class="v10-stat" data-status="failed"><span class="v10-stat-num">${stats.failed||0}</span><span class="v10-stat-label">ล้มเหลว</span></div>
        </div>

        <div class="v10-chips" id="v10-wh-chips">
          ${chip('all', 'ทั้งหมด', _warehouseFilter)}
          ${chip('waiting', 'รอ', _warehouseFilter)}
          ${chip('approved', 'อนุมัติ', _warehouseFilter)}
          ${chip('scheduled', 'นัด', _warehouseFilter)}
          ${chip('posted', 'โพสต์แล้ว', _warehouseFilter)}
        </div>

        <div id="v10-wh-list"></div>

        <div style="display:flex; gap:6px; margin-top:10px;">
          <button class="v10-btn-mini" id="v10-wh-cleanup">🧹 ลบที่โพสต์แล้ว</button>
          <button class="v10-btn-mini danger" id="v10-wh-clearAll">🗑️ ล้างทั้งคลัง</button>
        </div>
      </div>
    `;

    // Filter chips
    pane.querySelectorAll('#v10-wh-chips .v10-chip').forEach(c => {
      c.addEventListener('click', () => { _warehouseFilter = c.dataset.value; renderWarehouse(pane); });
    });

    // Item list
    const list = pane.querySelector('#v10-wh-list');
    if (items.length === 0) {
      list.innerHTML = empty('📭 ยังไม่มีสื่อในคลัง', 'สร้างจากแท็บ Infographic / วิดีโอ / Podcast');
    } else {
      list.innerHTML = items.slice(0, 50).map(itemCard).join('');
      list.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', () => onItemAction(el.dataset.id, el.dataset.action, pane));
      });
    }

    pane.querySelector('#v10-wh-cleanup').onclick = async () => {
      if (!confirm('ลบรายการที่โพสต์แล้วทั้งหมด?')) return;
      const n = await window.ClipWarehouse.removePosted();
      toast(`ลบ ${n} รายการ`);
      renderWarehouse(pane);
    };
    pane.querySelector('#v10-wh-clearAll').onclick = async () => {
      if (!confirm('⚠️ ล้างคลังทั้งหมด? ไม่สามารถกู้คืนได้')) return;
      await window.ClipWarehouse.clearAll();
      toast('ล้างคลังเรียบร้อย');
      renderWarehouse(pane);
    };
  }

  function itemCard(item) {
    const thumbIcon = item.mediaType === 'image' ? '🖼️' : item.mediaType === 'video' ? '🎬' : item.mediaType === 'audio' ? '🎙️' : '📄';
    const dateStr = new Date(item.addedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    return `
      <div class="v10-item">
        <div class="v10-item-thumb">${thumbIcon}</div>
        <div class="v10-item-body">
          <div class="v10-item-title">${escapeHtml(item.topicTitle || 'ไม่มีชื่อ')}</div>
          <div class="v10-item-meta">
            <span class="v10-tag status-${item.status}">${statusLabel(item.status)}</span>
            <span class="v10-tag">${item.mediaType}</span>
            <span class="v10-tag">${item.target}</span>
            <span class="v10-tag">${dateStr}</span>
          </div>
          <div class="v10-item-actions">
            <button class="v10-btn-mini" data-id="${item.id}" data-action="preview">👁️ ดู</button>
            ${item.status !== 'posted' ? `<button class="v10-btn-mini primary" data-id="${item.id}" data-action="post-fb">📘 โพสต์ FB</button>` : ''}
            ${item.mediaType === 'video' && item.status !== 'posted' ? `<button class="v10-btn-mini" data-id="${item.id}" data-action="post-tt">🎵 TikTok</button>` : ''}
            ${item.status !== 'posted' && item.status !== 'scheduled' ? `<button class="v10-btn-mini" data-id="${item.id}" data-action="schedule">⏰ นัด</button>` : ''}
            <button class="v10-btn-mini" data-id="${item.id}" data-action="download">⬇️</button>
            <button class="v10-btn-mini danger" data-id="${item.id}" data-action="delete">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  async function onItemAction(idStr, action, pane) {
    const id = Number(idStr);
    if (action === 'delete') {
      if (!confirm('ลบรายการนี้?')) return;
      await window.ClipWarehouse.removeItem(id);
      toast('ลบแล้ว');
      renderWarehouse(pane);
      return;
    }
    if (action === 'preview') {
      const item = await window.ClipWarehouse.getItem(id);
      showPreviewModal(item);
      return;
    }
    if (action === 'download') {
      const item = await window.ClipWarehouse.getItem(id);
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rh-pharma-${id}.${guessExt(item.mimeType)}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return;
    }
    if (action === 'post-fb') {
      toast('กำลังเปิด Facebook composer...');
      try {
        const r = await window.RHToolbox.publishToFacebook(id);
        if (r?.success) toast('✓ โพสต์ FB สำเร็จ', 'success');
        else if (r?.canceled) toast('ยกเลิกการโพสต์');
        else toast('โพสต์ล้มเหลว: ' + (r?.error || 'unknown'), 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
      renderWarehouse(pane);
      return;
    }
    if (action === 'post-tt') {
      toast('กำลังเปิด TikTok Studio...');
      try {
        const r = await window.RHToolbox.publishToTikTok(id);
        if (r?.success) toast('✓ โพสต์ TikTok สำเร็จ', 'success');
        else toast('ล้มเหลว: ' + (r?.error || ''), 'error');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
      renderWarehouse(pane);
      return;
    }
    if (action === 'schedule') {
      const at = await promptScheduleTime();
      if (!at) return;
      const target = await promptTarget();
      if (!target) return;
      try {
        await window.ScheduleQueue.schedule({ clipId: id, target, scheduledAt: at });
        toast('นัดเวลาเรียบร้อย', 'success');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
      renderWarehouse(pane);
    }
  }

  // ============================================================
  // 📅 SERIES TAB
  // ============================================================
  async function renderSeries(pane) {
    if (!window.StorySeries) {
      pane.innerHTML = empty('⚠️ ยังไม่ได้โหลด StorySeries');
      return;
    }
    const templates = window.StorySeries.listTemplates();
    const saved = await window.StorySeries.loadAllSeries();

    pane.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">📅</span>
          <h3>สร้างซีรีส์สื่อสุขภาพ</h3>
        </div>
        <p class="hint" style="margin-bottom:10px;">สร้างชุดความรู้ต่อเนื่องหลายตอน เช่น "รู้จักยาเบาหวาน 7 วัน"</p>

        <div class="v10-label">📋 เลือก Template</div>
        <select id="v10-series-tpl" class="v10-form-row" style="margin-bottom:10px;">
          <option value="">-- เลือก --</option>
          ${templates.map(t => `<option value="${t.id}">${escapeHtml(t.label)} (${t.episodes} ตอน)</option>`).join('')}
        </select>

        <div class="v10-label">💊 ชื่อยา / หัวข้อหลัก</div>
        <input type="text" id="v10-series-drug" placeholder="เช่น Metformin, ความดันโลหิตสูง" class="v10-form-row" style="margin-bottom:10px;" />

        <div class="v10-form-row">
          <div>
            <div class="v10-label">👥 กลุ่มเป้าหมาย</div>
            <select id="v10-series-aud">
              <option value="public">ประชาชน</option>
              <option value="elderly">ผู้สูงอายุ</option>
              <option value="pregnancy">หญิงตั้งครรภ์</option>
              <option value="pediatric-parent">ผู้ปกครองเด็ก</option>
              <option value="pharmacist">เภสัชกร</option>
              <option value="nurse">พยาบาล</option>
              <option value="doctor">แพทย์</option>
            </select>
          </div>
          <div>
            <div class="v10-label">🌐 ภาษา</div>
            <select id="v10-series-lang">
              <option value="th">ไทย</option>
              <option value="ms">มลายู</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button class="btn-primary btn-full" id="v10-series-gen" style="margin-top:8px;">
          ✨ สร้างซีรีส์
        </button>

        <div class="v10-section-title">📚 ซีรีส์ที่บันทึกไว้ (${saved.length})</div>
        <div id="v10-series-list"></div>
      </div>
    `;

    pane.querySelector('#v10-series-gen').onclick = () => doGenerateSeries(pane);

    const list = pane.querySelector('#v10-series-list');
    if (saved.length === 0) {
      list.innerHTML = empty('📭 ยังไม่มีซีรีส์', 'สร้างใหม่จากด้านบน');
    } else {
      list.innerHTML = saved.map(seriesCard).join('');
      list.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', () => onSeriesAction(el.dataset.id, el.dataset.action, pane));
      });
    }
  }

  function seriesCard(s) {
    return `
      <div class="v10-series-card">
        <div class="v10-series-title">${escapeHtml(s.title)}</div>
        <div class="v10-series-meta">${s.totalEpisodes} ตอน · ${s.audience} · ${s.language} · ${new Date(s.createdAt).toLocaleDateString('th-TH')}</div>
        <div class="v10-series-eps">
          ${s.episodes.map(ep => `<div class="v10-ep-pill" title="${escapeHtml(ep.theme)}"><span class="day-num">${ep.day}</span>${escapeHtml((ep.theme || '').slice(0, 8))}</div>`).join('')}
        </div>
        <div class="v10-item-actions">
          <button class="v10-btn-mini" data-id="${s.seriesId}" data-action="preview">👁️ ดูเนื้อหา</button>
          <button class="v10-btn-mini primary" data-id="${s.seriesId}" data-action="campaign">🚀 ตั้ง campaign</button>
          <button class="v10-btn-mini danger" data-id="${s.seriesId}" data-action="delete">🗑️</button>
        </div>
      </div>
    `;
  }

  async function doGenerateSeries(pane) {
    const tplId = pane.querySelector('#v10-series-tpl').value;
    const drug = pane.querySelector('#v10-series-drug').value.trim();
    const aud = pane.querySelector('#v10-series-aud').value;
    const lang = pane.querySelector('#v10-series-lang').value;

    if (!tplId && !drug) {
      toast('กรุณาเลือก template หรือใส่หัวข้อ', 'error');
      return;
    }

    const btn = pane.querySelector('#v10-series-gen');
    btn.disabled = true;
    btn.innerHTML = '<span class="v10-loading"></span> กำลังสร้าง...';

    try {
      const series = await window.StorySeries.generateSeries({
        templateId: tplId || null,
        drugName: drug,
        customTopic: drug,
        audience: aud,
        language: lang
      });
      await window.StorySeries.saveSeries(series);
      toast('✓ สร้างซีรีส์ ' + series.totalEpisodes + ' ตอนสำเร็จ', 'success');
      renderSeries(pane);
    } catch (e) {
      toast('Error: ' + e.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '✨ สร้างซีรีส์';
    }
  }

  async function onSeriesAction(seriesId, action, pane) {
    if (action === 'delete') {
      if (!confirm('ลบซีรีส์นี้?')) return;
      await window.StorySeries.deleteSeries(seriesId);
      toast('ลบแล้ว');
      renderSeries(pane);
      return;
    }
    if (action === 'preview') {
      const s = await window.StorySeries.loadSeries(seriesId);
      showSeriesPreview(s);
      return;
    }
    if (action === 'campaign') {
      const s = await window.StorySeries.loadSeries(seriesId);
      const at = await promptScheduleTime('เริ่มโพสต์ตอนแรกเวลา');
      if (!at) return;
      const target = await promptTarget();
      if (!target) return;
      const interval = parseInt(prompt('ระยะห่างระหว่างตอน (ชั่วโมง):', '24'), 10) || 24;
      try {
        const results = await window.RHToolbox.publishSeriesAsCampaign({
          series: s, startAt: at, intervalHours: interval, target
        });
        toast(`✓ ตั้ง campaign ${results.length} ตอนสำเร็จ`, 'success');
      } catch (e) { toast('Error: ' + e.message, 'error'); }
    }
  }

  // ============================================================
  // ⏰ SCHEDULE TAB
  // ============================================================
  async function renderSchedule(pane) {
    if (!window.ScheduleQueue) {
      pane.innerHTML = empty('⚠️ ยังไม่ได้โหลด ScheduleQueue');
      return;
    }
    const upcoming = await window.ScheduleQueue.listUpcoming();
    const history = await window.ScheduleQueue.listHistory();

    pane.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">⏰</span>
          <h3>ตารางโพสต์</h3>
          <span class="badge">${upcoming.length}</span>
        </div>
        <div class="v10-section-title">🟢 คิวที่จะโพสต์</div>
        <div id="v10-sch-upcoming"></div>

        <div class="v10-section-title" style="margin-top:14px;">📜 ประวัติ (30 วัน)</div>
        <div id="v10-sch-history"></div>
      </div>
    `;

    const up = pane.querySelector('#v10-sch-upcoming');
    if (upcoming.length === 0) {
      up.innerHTML = empty('📭 ยังไม่มีคิว');
    } else {
      up.innerHTML = upcoming.map(scheduleRow).join('');
      up.querySelectorAll('[data-action]').forEach(el => {
        el.addEventListener('click', () => onScheduleAction(el.dataset.qid, el.dataset.action, pane));
      });
    }

    const his = pane.querySelector('#v10-sch-history');
    if (history.length === 0) {
      his.innerHTML = empty('—');
    } else {
      his.innerHTML = history.slice(0, 20).map(scheduleRow).join('');
    }
  }

  function scheduleRow(e) {
    const time = new Date(e.scheduledAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
    return `
      <div class="v10-schedule-item">
        <div class="v10-schedule-time">${time}</div>
        <div class="v10-schedule-body">${e.target} · clip#${e.clipId} ${e.seriesId ? '· ตอน ' + e.episodeIndex : ''}</div>
        <span class="v10-tag status-${e.status}">${statusLabel(e.status)}</span>
        ${e.status === 'scheduled' ? `<button class="v10-btn-mini danger" data-qid="${e.queueId}" data-action="cancel">ยกเลิก</button>` : ''}
      </div>
    `;
  }

  async function onScheduleAction(qid, action, pane) {
    if (action === 'cancel') {
      if (!confirm('ยกเลิกการโพสต์ที่นัดไว้?')) return;
      await window.ScheduleQueue.cancel(qid);
      toast('ยกเลิกแล้ว');
      renderSchedule(pane);
    }
  }

  // ============================================================
  // 🎙️ PODCAST TAB
  // ============================================================
  async function renderPodcast(pane) {
    if (!window.PodcastGenerator) {
      pane.innerHTML = empty('⚠️ ยังไม่ได้โหลด PodcastGenerator');
      return;
    }
    const voices = window.PodcastGenerator.listVoices();

    pane.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🎙️</span>
          <h3>Health Podcast Generator</h3>
        </div>
        <p class="hint" style="margin-bottom:10px;">สร้างเสียงสื่อสุขภาพสำหรับผู้สูงอายุ/ตาบอด/ฟังผ่าน LINE OA</p>

        <div class="v10-label">📝 หัวข้อ / เนื้อหา</div>
        <textarea id="v10-pod-content" rows="5" placeholder="เนื้อหาความรู้สุขภาพ เช่น 'การกินยาความดันสม่ำเสมอ...'" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary); font-family:inherit; font-size:13px;"></textarea>

        <div class="v10-form-row" style="margin-top:10px;">
          <div>
            <div class="v10-label">🎤 น้ำเสียง</div>
            <select id="v10-pod-voice">
              ${voices.map(v => `<option value="${v.id}">${escapeHtml(v.label)}</option>`).join('')}
            </select>
          </div>
          <div>
            <div class="v10-label">⏱️ ความยาว</div>
            <select id="v10-pod-dur">
              <option value="1">1 นาที</option>
              <option value="2" selected>2 นาที</option>
              <option value="3">3 นาที</option>
              <option value="5">5 นาที</option>
            </select>
          </div>
        </div>

        <div class="v10-form-row" style="margin-top:6px;">
          <div>
            <div class="v10-label">⚙️ วิธีสร้าง</div>
            <select id="v10-pod-method">
              <option value="browser">Browser TTS (ฟรี/ทดสอบ)</option>
              <option value="openai">OpenAI TTS (คุณภาพสูง)</option>
            </select>
          </div>
          <div>
            <div class="v10-label">👥 กลุ่มเป้าหมาย</div>
            <select id="v10-pod-aud">
              <option value="public">ประชาชน</option>
              <option value="elderly">ผู้สูงอายุ</option>
              <option value="pediatric-parent">ผู้ปกครอง</option>
            </select>
          </div>
        </div>

        <button class="btn-primary btn-full" id="v10-pod-gen" style="margin-top:10px;">
          🎙️ สร้าง Podcast
        </button>

        <div id="v10-pod-result"></div>
      </div>
    `;

    pane.querySelector('#v10-pod-gen').onclick = () => doGeneratePodcast(pane);
  }

  async function doGeneratePodcast(pane) {
    const content = pane.querySelector('#v10-pod-content').value.trim();
    const voiceId = pane.querySelector('#v10-pod-voice').value;
    const dur = parseInt(pane.querySelector('#v10-pod-dur').value, 10);
    const method = pane.querySelector('#v10-pod-method').value;
    const aud = pane.querySelector('#v10-pod-aud').value;

    if (!content) { toast('กรุณาใส่เนื้อหา', 'error'); return; }

    const btn = pane.querySelector('#v10-pod-gen');
    btn.disabled = true;
    btn.innerHTML = '<span class="v10-loading"></span> กำลังสร้าง...';

    try {
      const r = await window.PodcastGenerator.generatePodcast(content, {
        voicePresetId: voiceId,
        method,
        durationMinutes: dur,
        audience: aud,
        topicTitle: content.slice(0, 50)
      });
      const result = pane.querySelector('#v10-pod-result');
      let html = '<div class="v10-podcast-preview">';
      html += '<div class="v10-label">📝 สคริปต์</div>';
      html += '<pre style="font-size:12px; white-space:pre-wrap; max-height:200px; overflow:auto; padding:10px; background:var(--bg-input); border-radius:6px; font-family:inherit;">' + escapeHtml(r.script) + '</pre>';
      if (r.audioBlob) {
        const url = URL.createObjectURL(r.audioBlob);
        html += '<audio controls src="' + url + '"></audio>';
        html += '<div style="margin-top:8px;">';
        html += '<a class="v10-btn-mini" href="' + url + '" download="rh-pharma-podcast.mp3">⬇️ ดาวน์โหลด MP3</a>';
        html += '</div>';
      } else {
        html += '<p class="hint" style="margin-top:8px;">✓ เล่นเสียงผ่าน Browser TTS แล้ว (ไม่ได้บันทึกไฟล์ — เปลี่ยนเป็น OpenAI TTS เพื่อได้ไฟล์ MP3)</p>';
      }
      html += '</div>';
      result.innerHTML = html;
      toast('✓ สร้าง podcast สำเร็จ', 'success');
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🎙️ สร้าง Podcast';
    }
  }

  // ============================================================
  // 🛡️ VALIDATOR TAB
  // ============================================================
  async function renderValidator(pane) {
    if (!window.ContentValidator) {
      pane.innerHTML = empty('⚠️ ยังไม่ได้โหลด ContentValidator');
      return;
    }

    pane.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-icon">🛡️</span>
          <h3>ตรวจสอบเนื้อหาก่อนโพสต์</h3>
        </div>
        <p class="hint" style="margin-bottom:8px;">เช็คคำต้องห้ามตาม พ.ร.บ. ยา + อย. + PDPA ก่อนโพสต์</p>

        <div class="v10-label">📝 ข้อความที่จะตรวจ</div>
        <textarea id="v10-val-text" rows="8" placeholder="วางข้อความที่จะโพสต์ที่นี่..." style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary); font-family:inherit; font-size:13px;"></textarea>

        <div style="display:flex; gap:6px; margin-top:8px;">
          <button class="btn-primary" id="v10-val-check" style="flex:1;">🛡️ ตรวจสอบ</button>
          <button class="btn-secondary" id="v10-val-fix">✨ AI ช่วยแก้</button>
        </div>

        <div id="v10-val-result"></div>

        <div class="v10-section-title">🚫 คำต้องห้าม (${window.ContentValidator.BANNED_WORDS.length} คำ)</div>
        <details>
          <summary style="cursor:pointer; padding:8px; background:var(--bg-section); border-radius:8px; font-size:12px;">ดูรายการคำทั้งหมด</summary>
          <div style="max-height:300px; overflow:auto; padding:10px; background:var(--bg-section); border-radius:8px; margin-top:4px;">
            ${window.ContentValidator.BANNED_WORDS.map(w => `<div style="font-size:11px; padding:3px 0;"><span class="v10-tag status-${w.level === 'BLOCK' ? 'failed' : w.level === 'WARN' ? 'waiting' : 'approved'}">${w.level}</span> <b>${escapeHtml(w.word)}</b> — ${escapeHtml(w.reason)}</div>`).join('')}
          </div>
        </details>
      </div>
    `;

    pane.querySelector('#v10-val-check').onclick = () => doValidate(pane);
    pane.querySelector('#v10-val-fix').onclick = () => doFixWithAI(pane);
  }

  function doValidate(pane) {
    const text = pane.querySelector('#v10-val-text').value;
    const result = window.ContentValidator.validate(text);
    const out = pane.querySelector('#v10-val-result');
    let cls = 'ok';
    if (result.summary.block > 0) cls = 'block';
    else if (result.summary.warn > 0) cls = 'warn';
    out.innerHTML = `
      <div class="v10-validator-result ${cls}">
        <pre style="white-space:pre-wrap; margin:0; font-family:inherit;">${escapeHtml(window.ContentValidator.formatReport(result))}</pre>
      </div>
    `;
  }

  async function doFixWithAI(pane) {
    const text = pane.querySelector('#v10-val-text').value;
    if (!text.trim()) { toast('ใส่ข้อความก่อน', 'error'); return; }
    const result = window.ContentValidator.validate(text);
    if (result.issues.length === 0) { toast('ไม่มีจุดที่ต้องแก้', 'success'); return; }

    const btn = pane.querySelector('#v10-val-fix');
    btn.disabled = true;
    btn.innerHTML = '<span class="v10-loading"></span>';
    try {
      const fixed = await window.ContentValidator.suggestRewrite(text, result.issues);
      pane.querySelector('#v10-val-text').value = fixed;
      doValidate(pane);
      toast('✓ AI แก้เรียบร้อย', 'success');
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '✨ AI ช่วยแก้';
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function chip(value, label, current) {
    return `<button class="v10-chip ${value === current ? 'active' : ''}" data-value="${value}">${label}</button>`;
  }
  function statusLabel(s) {
    return { waiting: 'รอ', approved: 'อนุมัติ', scheduled: 'นัด', posted: 'โพสต์แล้ว', failed: 'ล้มเหลว', canceled: 'ยกเลิก', fired: 'กำลังโพสต์' }[s] || s;
  }
  function empty(text, hint) {
    return `<div class="v10-empty"><span class="v10-empty-icon">📭</span><div>${escapeHtml(text)}</div>${hint ? '<div style="font-size:11px; margin-top:4px; opacity:0.7;">' + escapeHtml(hint) + '</div>' : ''}</div>`;
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function guessExt(mt) {
    if (!mt) return 'bin';
    if (mt.startsWith('image/png')) return 'png';
    if (mt.startsWith('image/jpeg')) return 'jpg';
    if (mt.startsWith('video/mp4')) return 'mp4';
    if (mt.startsWith('audio/mpeg')) return 'mp3';
    return 'bin';
  }

  function toast(msg, type = 'info') {
    let t = document.querySelector('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 18px;border-radius:8px;background:var(--brand-blue);color:white;font-size:13px;z-index:99999;box-shadow:0 4px 14px rgba(0,0,0,.2);opacity:0;transition:opacity .2s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--brand-blue)';
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.style.opacity = '0'; }, 2500);
  }

  // ===== Modal helpers =====
  function showPreviewModal(item) {
    const url = URL.createObjectURL(item.blob);
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;';
    let mediaHtml = '';
    if (item.mediaType === 'image') mediaHtml = `<img src="${url}" style="max-width:100%;max-height:60vh;border-radius:8px;" />`;
    else if (item.mediaType === 'video') mediaHtml = `<video controls src="${url}" style="max-width:100%;max-height:60vh;border-radius:8px;"></video>`;
    else if (item.mediaType === 'audio') mediaHtml = `<audio controls src="${url}" style="width:100%;"></audio>`;
    else mediaHtml = `<pre style="background:var(--bg-input);padding:12px;border-radius:8px;color:var(--text-primary);max-height:60vh;overflow:auto;">${escapeHtml(item.caption || '(ไม่มีเนื้อหา)')}</pre>`;

    wrap.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:18px;max-width:600px;width:100%;max-height:90vh;overflow:auto;">
        <h3 style="margin:0 0 10px;color:var(--text-primary);font-size:15px;">${escapeHtml(item.topicTitle)}</h3>
        ${mediaHtml}
        <div style="margin-top:10px;padding:10px;background:var(--bg-section);border-radius:8px;font-size:12px;color:var(--text-secondary);max-height:200px;overflow:auto;white-space:pre-wrap;">${escapeHtml(item.caption || '')}</div>
        <button class="btn-secondary" style="margin-top:12px;width:100%;" id="v10-pv-close">ปิด</button>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector('#v10-pv-close').onclick = () => { wrap.remove(); URL.revokeObjectURL(url); };
  }

  function showSeriesPreview(s) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;';
    wrap.innerHTML = `
      <div style="background:var(--bg-card);border-radius:12px;padding:18px;max-width:680px;width:100%;max-height:90vh;overflow:auto;">
        <h3 style="margin:0 0 10px;color:var(--brand-blue);font-size:16px;">📅 ${escapeHtml(s.title)}</h3>
        <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:14px;">${s.totalEpisodes} ตอน · ${s.audience} · ${s.language}</div>
        ${s.episodes.map(ep => {
          let parsed;
          try { parsed = typeof ep.content === 'string' ? JSON.parse(ep.content) : ep.content; } catch { parsed = { body: ep.content }; }
          return `
            <details style="margin-bottom:8px;background:var(--bg-section);border-radius:8px;padding:10px;">
              <summary style="cursor:pointer;font-weight:600;color:var(--text-primary);">
                <span style="color:var(--brand-blue);">Day ${ep.day}</span> · ${escapeHtml(ep.theme || '')}
              </summary>
              <div style="margin-top:8px;font-size:13px;color:var(--text-secondary);line-height:1.6;">
                ${parsed.cover_headline ? '<b>🌟 ' + escapeHtml(parsed.cover_headline) + '</b><br><br>' : ''}
                <div style="white-space:pre-wrap;">${escapeHtml(parsed.body || '')}</div>
                ${parsed.takehome ? '<div style="margin-top:8px;padding:8px;background:rgba(74,143,181,.1);border-radius:6px;"><b>💡 Take-home:</b> ' + escapeHtml(parsed.takehome) + '</div>' : ''}
                ${parsed.next_tease ? '<div style="margin-top:6px;font-style:italic;opacity:0.8;">👉 ' + escapeHtml(parsed.next_tease) + '</div>' : ''}
              </div>
            </details>
          `;
        }).join('')}
        <button class="btn-secondary" style="margin-top:12px;width:100%;" id="v10-sp-close">ปิด</button>
      </div>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector('#v10-sp-close').onclick = () => wrap.remove();
  }

  async function promptScheduleTime(label = 'เลือกเวลาที่จะโพสต์') {
    const local = new Date(Date.now() + 3600 * 1000);
    const def = local.toISOString().slice(0, 16);
    const v = prompt(label + ' (YYYY-MM-DD HH:MM):', def.replace('T', ' '));
    if (!v) return null;
    const d = new Date(v.replace(' ', 'T'));
    if (isNaN(d.getTime())) { toast('รูปแบบเวลาผิด', 'error'); return null; }
    if (d.getTime() < Date.now() + 60_000) { toast('เวลาต้องอย่างน้อย 1 นาทีจากนี้', 'error'); return null; }
    return d.toISOString();
  }

  async function promptTarget() {
    const v = prompt('โพสต์ไปที่ไหน?\n  fb = Facebook\n  tt = TikTok\n  manual = ดาวน์โหลดเอง', 'fb');
    if (!v) return null;
    const map = { fb: 'facebook', facebook: 'facebook', tt: 'tiktok', tiktok: 'tiktok', manual: 'manual' };
    return map[v.toLowerCase()] || 'facebook';
  }

})();
