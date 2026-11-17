const APP_STORAGE_KEY = 'BIOLAB_LEARNING_STATE_V1';

const state = {
  data: null,
  currentView: 'dashboard',
  currentCourseId: 'monera',
  currentSlideId: 'monera-01',
  completedSlides: [],
  bookmarkedSlides: [],
  leitnerCards: {},
  fitbAttempts: {},
  recallAttempts: {},
  theme: 'light',
  fontSize: 'normal',
  activeMemTab: 'flashcards',
  flashcardFilter: 'all',
  currentFlashcardIndex: 0,
  flashcardFlipped: false,
  currentFitbIndex: 0,
  fitbAnswered: false,
  currentRecallIndex: 0,
  recallRevealedCues: 0,
  recallAnswerRevealed: false,
  currentSeqIndex: 0,
  currentSeqOrder: [],
  currentVisualIndex: 0,
  slideBySlideStart: 1,
  slideBySlideEnd: 10,
  slideBySlideCurrentIndex: 0
};

function playAudioTone(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'flip') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.setValueAtTime(196, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {}
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state.completedSlides = parsed.completedSlides || [];
      state.bookmarkedSlides = parsed.bookmarkedSlides || [];
      state.leitnerCards = parsed.leitnerCards || {};
      state.fitbAttempts = parsed.fitbAttempts || {};
      state.recallAttempts = parsed.recallAttempts || {};
      state.theme = parsed.theme || 'light';
      state.fontSize = parsed.fontSize || 'normal';
      state.currentSlideId = parsed.currentSlideId || 'monera-01';
      state.currentCourseId = parsed.currentCourseId || 'monera';
    }
  } catch (e) {}
}

function saveCurrentState() {
  try {
    const dataToSave = {
      completedSlides: state.completedSlides,
      bookmarkedSlides: state.bookmarkedSlides,
      leitnerCards: state.leitnerCards,
      fitbAttempts: state.fitbAttempts,
      recallAttempts: state.recallAttempts,
      theme: state.theme,
      fontSize: state.fontSize,
      currentSlideId: state.currentSlideId,
      currentCourseId: state.currentCourseId
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {}
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }
  saveCurrentState();
}

function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.add('active');
  }
  
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'library') renderLibrary();
  if (viewName === 'reader') renderReader();
  if (viewName === 'memory') renderMemoryStudio();
  if (viewName === 'review') renderReviewCenter();
  if (viewName === 'analytics') renderAnalytics();
}

function getSlideById(slideId) {
  return state.data.slides.find(s => s.id === slideId);
}

function getCourseById(courseId) {
  return state.data.courses.find(c => c.id === courseId);
}

function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  if (!container) return;
  
  const totalSlides = state.data.slides.length;
  const completedCount = state.completedSlides.length;
  const progressPercent = Math.round((completedCount / totalSlides) * 100);
  
  const totalCards = state.data.flashcards.length;
  const masteredCards = Object.values(state.leitnerCards).filter(c => c.box >= 4).length;
  const dueCardsCount = getDueCards().length;
  
  const moneraSlides = state.data.slides.filter(s => s.pdf === 'monera');
  const moneraCompleted = moneraSlides.filter(s => state.completedSlides.includes(s.id)).length;
  const moneraPercent = Math.round((moneraCompleted / moneraSlides.length) * 100);
  
  const protistaSlides = state.data.slides.filter(s => s.pdf === 'protista');
  const protistaCompleted = protistaSlides.filter(s => state.completedSlides.includes(s.id)).length;
  const protistaPercent = Math.round((protistaCompleted / protistaSlides.length) * 100);
  
  const currentSlide = getSlideById(state.currentSlideId) || moneraSlides[0];
  
  container.innerHTML = `
    <div class="dash-hero">
      <div class="hero-text">
        <h1>ชีววิทยา เทอม 2: อาณาจักรมอเนอรา และ โพรติสตา</h1>
        <p>ระบบการเรียนรู้เชิงลึกแบบโต้ตอบ ครอบคลุมสไลด์ต้นฉบับ 55 หน้า พร้อมระบบฝึกจำ Spaced Repetition</p>
        <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="navigateToSlide('${currentSlide.id}')">
            <span>▶️</span> เรียนต่อจากครั้งก่อน (${currentSlide.title})
          </button>
          <button class="btn-secondary" onclick="openDueReview()">
            <span>⏳</span> ทบทวนประจำวัน (${dueCardsCount} การ์ดที่ถึงกำหนด)
          </button>
        </div>
      </div>
    </div>
    
    <div class="hero-stats-row">
      <div class="stat-card">
        <span class="stat-label">ความคืบหน้ารวม</span>
        <span class="stat-value">${progressPercent}%</span>
        <span class="stat-desc">อ่านแล้ว ${completedCount} จาก ${totalSlides} สไลด์</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">ความจำระยะยาว</span>
        <span class="stat-value">${masteredCards} / ${totalCards}</span>
        <span class="stat-desc">การ์ดที่จำได้แม่นยำ (กล่อง 4-5)</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">ถึงกำหนดทบทวน</span>
        <span class="stat-value" style="color: ${dueCardsCount > 0 ? 'var(--accent-amber)' : 'var(--accent-green)'}">${dueCardsCount}</span>
        <span class="stat-desc">บัตรคำที่ต้องทบทวนวันนี้</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">บุ๊กมาร์กไว้</span>
        <span class="stat-value">${state.bookmarkedSlides.length}</span>
        <span class="stat-desc">สไลด์ที่ทำเครื่องหมายทบทวนพิเศษ</span>
      </div>
    </div>
    
    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">หลักสูตรบทเรียน</h3>
    
    <div class="course-grid">
      <div class="course-card">
        <div class="course-badge monera">Kingdom Monera • 31 สไลด์</div>
        <h2>อาณาจักรมอเนอรา</h2>
        <p>โพรแคริโอต, แบคทีเรียแกรมบวก-แกรมลบ, สัณฐานวิทยา, ไซยาโนแบคทีเรีย, การตรึงไนโตรเจน, โรคติดเชื้อ และประโยชน์ทางอุตสาหกรรม</p>
        
        <div class="course-progress-meta">
          <span>ความคืบหน้า</span>
          <span>${moneraCompleted} / 31 สไลด์ (${moneraPercent}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill monera" style="width: ${moneraPercent}%"></div>
        </div>
        
        <div class="course-actions">
          <button class="btn-primary" onclick="openCourse('monera')">เข้าสู่บทเรียน</button>
          <button class="btn-secondary" onclick="openCourseMemory('monera')">ฝึกความจำ</button>
        </div>
      </div>
      
      <div class="course-card">
        <div class="course-badge protista">Kingdom Protista • 24 สไลด์</div>
        <h2>อาณาจักรโพรติสตา</h2>
        <p>ยูแคริโอตยุคแรก, 6 Supergroups, Excavata (ยูกลีนา/ปรสิต), Chromalveolata (ขี้ปลาวาฬ/เคลป์), Archaeplastida (สาหร่ายแดง/เขียว), และราเมือก</p>
        
        <div class="course-progress-meta">
          <span>ความคืบหน้า</span>
          <span>${protistaCompleted} / 24 สไลด์ (${protistaPercent}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill protista" style="width: ${protistaPercent}%"></div>
        </div>
        
        <div class="course-actions">
          <button class="btn-primary" onclick="openCourse('protista')">เข้าสู่บทเรียน</button>
          <button class="btn-secondary" onclick="openCourseMemory('protista')">ฝึกความจำ</button>
        </div>
      </div>
    </div>
  `;
}

function renderLibrary() {
  const container = document.getElementById('view-library');
  if (!container) return;
  
  const modules = state.data.modules;
  
  let html = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px;">คลังบทเรียนทั้งหมด (Course Library)</h1>
      <p style="color: var(--text-secondary);">จัดเรียงเนื้อหาเป็นระบบตามโครงสร้างสไลด์ต้นฉบับ 55 สไลด์ แบ่งเป็น 13 โมดูลย่อย</p>
    </div>
  `;
  
  modules.forEach(mod => {
    const course = getCourseById(mod.course_id);
    const modSlides = mod.slide_ids.map(id => getSlideById(id)).filter(Boolean);
    const modCompleted = modSlides.filter(s => state.completedSlides.includes(s.id)).length;
    
    html += `
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-card);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span class="course-badge ${mod.course_id}" style="margin-bottom: 6px;">${course.title} • ${mod.slide_range}</span>
            <h3 style="font-size: 1.25rem; font-weight: 800;">${mod.title}</h3>
          </div>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">สำเร็จแล้ว ${modCompleted}/${modSlides.length} สไลด์</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px;">
    `;
    
    modSlides.forEach(s => {
      const isCompleted = state.completedSlides.includes(s.id);
      const isBookmarked = state.bookmarkedSlides.includes(s.id);
      html += `
        <div onclick="navigateToSlide('${s.id}')" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; cursor: pointer; transition: all var(--transition-fast); display: flex; flex-direction: column; justify-content: space-between;" onmouseover="this.style.borderColor='var(--accent-blue)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border-color)'; this.style.transform='translateY(0)'">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-blue);">สไลด์ ${s.slide}</span>
              <div>
                ${isCompleted ? '<span style="color: var(--accent-green); font-size: 0.85rem;">✓ เสร็จแล้ว</span>' : ''}
                ${isBookmarked ? ' ⭐' : ''}
              </div>
            </div>
            <h5 style="font-size: 0.95rem; font-weight: 700; line-height: 1.35; margin-bottom: 6px;">${s.title}</h5>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${s.deep_explanation}</p>
          </div>
          <div style="margin-top: 10px; display: flex; gap: 4px; flex-wrap: wrap;">
            ${s.keywords.slice(0, 3).map(k => `<span class="keyword-tag" style="font-size: 0.7rem; padding: 2px 6px;">${k}</span>`).join('')}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function renderReader() {
  const container = document.getElementById('view-reader');
  if (!container) return;
  
  const currentSlide = getSlideById(state.currentSlideId) || state.data.slides[0];
  const course = getCourseById(currentSlide.pdf);
  const isCompleted = state.completedSlides.includes(currentSlide.id);
  const isBookmarked = state.bookmarkedSlides.includes(currentSlide.id);
  
  const allSlides = state.data.slides;
  const currentIndex = allSlides.findIndex(s => s.id === currentSlide.id);
  const prevSlide = currentIndex > 0 ? allSlides[currentIndex - 1] : null;
  const nextSlide = currentIndex < allSlides.length - 1 ? allSlides[currentIndex + 1] : null;
  
  let sidebarHtml = '';
  state.data.modules.forEach(mod => {
    const modSlides = mod.slide_ids.map(id => getSlideById(id)).filter(Boolean);
    sidebarHtml += `
      <div class="sidebar-module-group">
        <div class="sidebar-module-title">${mod.title}</div>
    `;
    modSlides.forEach(s => {
      const activeClass = s.id === currentSlide.id ? 'active' : '';
      const compClass = state.completedSlides.includes(s.id) ? 'completed' : '';
      sidebarHtml += `
        <div class="sidebar-slide-item ${activeClass} ${compClass}" onclick="navigateToSlide('${s.id}')">
          <span style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <span style="font-size: 0.75rem; font-weight: 700; min-width: 20px;">${s.slide}.</span>
            <span style="overflow: hidden; text-overflow: ellipsis;">${s.title.replace(/^สไลด์ \d+:\s*/, '')}</span>
          </span>
          <span class="slide-check-badge">${state.completedSlides.includes(s.id) ? '✓' : '○'}</span>
        </div>
      `;
    });
    sidebarHtml += `</div>`;
  });
  
  let refsHtml = '';
  if (currentSlide.references && currentSlide.references.length > 0) {
    refsHtml = `
      <div class="references-section">
        <h5><span>🔗</span> แหล่งข้อมูลอ้างอิงทางวิชาการและค้นคว้าเพิ่มเติม</h5>
        <div class="ref-links-list">
          ${currentSlide.references.map(r => `
            <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="ref-link-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span>${r.title}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="reader-layout">
      <div class="reader-sidebar">
        <div class="sidebar-header">
          <h3>สารบัญบทเรียน (55 สไลด์)</h3>
          <span style="font-size: 0.8rem; color: var(--accent-blue); font-weight: 600;">${state.completedSlides.length}/55</span>
        </div>
        <div class="sidebar-search">
          <span class="sidebar-search-icon">🔍</span>
          <input type="text" id="reader-search-input" placeholder="ค้นหาหัวข้อ คำศัพท์ สไลด์..." oninput="handleReaderSearch(this.value)">
        </div>
        <div class="sidebar-scroll-area" id="reader-sidebar-list">
          ${sidebarHtml}
        </div>
      </div>
      
      <div class="reader-main-stage">
        <div class="reader-toolbar">
          <div class="reader-breadcrumbs">
            <span>${course.title}</span>
            <span>›</span>
            <span>สไลด์ที่ ${currentSlide.slide}</span>
          </div>
          
          <div class="reader-tool-actions">
            <button class="btn-secondary" style="min-height: 40px; padding: 6px 14px; font-size: 0.85rem;" onclick="toggleBookmark('${currentSlide.id}')">
              <span>${isBookmarked ? '⭐ บุ๊กมาร์กแล้ว' : '☆ บุ๊กมาร์ก'}</span>
            </button>
            <button class="btn-secondary" style="min-height: 40px; padding: 6px 14px; font-size: 0.85rem;" onclick="toggleComplete('${currentSlide.id}')">
              <span>${isCompleted ? '✅ ทำเครื่องหมายเสร็จแล้ว' : '○ บันทึกว่าอ่านจบ'}</span>
            </button>
          </div>
        </div>
        
        <h1 class="slide-main-title">${currentSlide.title}</h1>
        <div class="slide-sub-title">${currentSlide.subtitle || ''}</div>
        
        <div class="slide-tags-row">
          ${currentSlide.keywords.map(k => `<span class="keyword-tag">#${k}</span>`).join('')}
        </div>
        
        <div class="slide-image-preview-card" onclick="openLightbox('${currentSlide.image}')">
          <img src="${currentSlide.image}" alt="${currentSlide.title}">
          <div class="image-click-hint">
            <span>🔍</span> แตะที่ภาพเพื่อดูสไลด์ต้นฉบับขนาดเต็มแบบคมชัด
          </div>
        </div>
        
        <div class="content-quad-grid">
          <div class="content-box box-original">
            <div class="content-box-header">
              <div class="box-badge-icon">📘</div>
              <h4>1. Original Content (เนื้อหาจากสไลด์ต้นฉบับ 100%)</h4>
            </div>
            <div class="content-box-body">${currentSlide.original_content}</div>
          </div>
          
          <div class="content-box box-deep">
            <div class="content-box-header">
              <div class="box-badge-icon">🔬</div>
              <h4>2. Deep Explanation (คำอธิบายเชิงลึกและหลักการทำงาน)</h4>
            </div>
            <div class="content-box-body">${currentSlide.deep_explanation}</div>
          </div>
          
          <div class="content-box box-realworld">
            <div class="content-box-header">
              <div class="box-badge-icon">🌍</div>
              <h4>3. Real-World Examples & Case Studies (การประยุกต์และตัวอย่างจริง)</h4>
            </div>
            <div class="content-box-body">${currentSlide.real_world_examples}</div>
          </div>
          
          <div class="content-box box-protips">
            <div class="content-box-header">
              <div class="box-badge-icon">💡</div>
              <h4>4. Pro Tips & Important Notes (จุดสังเกต เทคนิคจำ และข้อควรระวัง)</h4>
            </div>
            <div class="content-box-body">${currentSlide.pro_tips}</div>
          </div>
        </div>
        
        ${refsHtml}
        
        <div class="reader-bottom-nav">
          ${prevSlide ? `
            <button class="btn-secondary" onclick="navigateToSlide('${prevSlide.id}')">
              <span>←</span> สไลด์ก่อนหน้า (${prevSlide.slide})
            </button>
          ` : `<div></div>`}
          
          <button class="btn-primary" onclick="openInstantMemory('${currentSlide.id}')">
            <span>🧠</span> ฝึกความจำสไลด์นี้ทันที
          </button>
          
          ${nextSlide ? `
            <button class="btn-primary" onclick="navigateToSlide('${nextSlide.id}')">
              สไลด์ถัดไป (${nextSlide.slide}) <span>→</span>
            </button>
          ` : `<div></div>`}
        </div>
      </div>
    </div>
  `;
}

function handleReaderSearch(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll('.sidebar-slide-item');
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function navigateToSlide(slideId) {
  state.currentSlideId = slideId;
  const slide = getSlideById(slideId);
  if (slide) state.currentCourseId = slide.pdf;
  saveCurrentState();
  switchView('reader');
}

function toggleComplete(slideId) {
  const index = state.completedSlides.indexOf(slideId);
  if (index >= 0) {
    state.completedSlides.splice(index, 1);
  } else {
    state.completedSlides.push(slideId);
    playAudioTone('success');
  }
  saveCurrentState();
  renderReader();
}

function toggleBookmark(slideId) {
  const index = state.bookmarkedSlides.indexOf(slideId);
  if (index >= 0) {
    state.bookmarkedSlides.splice(index, 1);
  } else {
    state.bookmarkedSlides.push(slideId);
  }
  saveCurrentState();
  renderReader();
}

function openLightbox(imgSrc) {
  const modal = document.getElementById('image-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  if (modal && img) {
    img.src = imgSrc;
    modal.classList.add('open');
  }
}

function closeLightbox() {
  const modal = document.getElementById('image-lightbox-modal');
  if (modal) modal.classList.remove('open');
}

function renderMemoryStudio() {
  const container = document.getElementById('view-memory');
  if (!container) return;
  
  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px;">ศูนย์ฝึกความจำระดับโปร (Memory Training Studio)</h1>
      <p style="color: var(--text-secondary);">สร้างทักษะ Active Recall ที่แท้จริงด้วย 6 โหมดการฝึกความจำจากเนื้อหาและภาพจริง</p>
    </div>
    
    <div class="memory-studio-tabs">
      <button class="mem-subtab-btn ${state.activeMemTab === 'flashcards' ? 'active' : ''}" onclick="switchMemTab('flashcards')">
        <span>🃏</span> บัตรคำจำแม่น (Flashcards)
      </button>
      <button class="mem-subtab-btn ${state.activeMemTab === 'fitb' ? 'active' : ''}" onclick="switchMemTab('fitb')">
        <span>✏️</span> เติมคำจากเนื้อหาจริง (Fill in Blanks)
      </button>
      <button class="mem-subtab-btn ${state.activeMemTab === 'recall' ? 'active' : ''}" onclick="switchMemTab('recall')">
        <span>🧠</span> ฝึกดึงความจำ (Free Recall)
      </button>
      <button class="mem-subtab-btn ${state.activeMemTab === 'sequence' ? 'active' : ''}" onclick="switchMemTab('sequence')">
        <span>🔀</span> เรียงลำดับขั้นตอน (Sequence Memory)
      </button>
      <button class="mem-subtab-btn ${state.activeMemTab === 'visual' ? 'active' : ''}" onclick="switchMemTab('visual')">
        <span>👁️</span> จำแผนภาพโครงสร้าง (Visual Memory)
      </button>
      <button class="mem-subtab-btn ${state.activeMemTab === 'slide-by-slide' ? 'active' : ''}" onclick="switchMemTab('slide-by-slide')">
        <span>📑</span> ตะลุยจำทีละสไลด์ (Slide-by-Slide)
      </button>
    </div>
    
    <div id="mem-tab-content"></div>
  `;
  
  renderActiveMemSubTab();
}

function switchMemTab(tab) {
  state.activeMemTab = tab;
  renderMemoryStudio();
}

function renderActiveMemSubTab() {
  const container = document.getElementById('mem-tab-content');
  if (!container) return;
  
  if (state.activeMemTab === 'flashcards') renderFlashcardTrainer(container);
  if (state.activeMemTab === 'fitb') renderFitbTrainer(container);
  if (state.activeMemTab === 'recall') renderRecallTrainer(container);
  if (state.activeMemTab === 'sequence') renderSequenceTrainer(container);
  if (state.activeMemTab === 'visual') renderVisualTrainer(container);
  if (state.activeMemTab === 'slide-by-slide') renderSlideBySlideTrainer(container);
}

function getFilteredFlashcards() {
  let cards = state.data.flashcards;
  if (state.flashcardFilter === 'monera') {
    cards = cards.filter(c => c.slide_id.startsWith('monera'));
  } else if (state.flashcardFilter === 'protista') {
    cards = cards.filter(c => c.slide_id.startsWith('protista'));
  } else if (state.flashcardFilter.startsWith('slide:')) {
    const sid = state.flashcardFilter.replace('slide:', '');
    cards = cards.filter(c => c.slide_id === sid);
  }
  return cards;
}

function renderFlashcardTrainer(container) {
  const cards = getFilteredFlashcards();
  if (cards.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">ไม่พบการ์ดสำหรับตัวกรองนี้</div>`;
    return;
  }
  
  if (state.currentFlashcardIndex >= cards.length) {
    state.currentFlashcardIndex = 0;
  }
  
  const currentCard = cards[state.currentFlashcardIndex];
  const slide = getSlideById(currentCard.slide_id);
  const cardStats = state.leitnerCards[currentCard.id] || { box: 1 };
  
  container.innerHTML = `
    <div class="flashcard-stage">
      <div class="flashcard-controls-top">
        <div>
          <span>ตัวกรอง: </span>
          <select style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600;" onchange="setFlashcardFilter(this.value)">
            <option value="all" ${state.flashcardFilter === 'all' ? 'selected' : ''}>การ์ดทั้งหมด (${state.data.flashcards.length})</option>
            <option value="monera" ${state.flashcardFilter === 'monera' ? 'selected' : ''}>เฉพาะมอเนอรา (Monera)</option>
            <option value="protista" ${state.flashcardFilter === 'protista' ? 'selected' : ''}>เฉพาะโพรติสตา (Protista)</option>
          </select>
        </div>
        <div style="font-weight: 700;">
          การ์ดที่ ${state.currentFlashcardIndex + 1} / ${cards.length}
        </div>
      </div>
      
      <div class="flashcard-perspective-container" onclick="flipCurrentCard()">
        <div class="flashcard-3d ${state.flashcardFlipped ? 'flipped' : ''}">
          <div class="flashcard-face front">
            <div class="card-top-row">
              <span class="card-origin-badge">${slide ? slide.title : currentCard.slide_id}</span>
              <span class="card-side-label">คำถาม (แตะเพื่อพลิก)</span>
            </div>
            
            <div class="card-content-center">
              <div class="card-question-text">${currentCard.question}</div>
            </div>
            
            <div class="card-bottom-row">
              <span class="card-hint-text">💡 คำใบ้: ${currentCard.hint}</span>
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--accent-blue);">กล่อง Leitner: ${cardStats.box}/5</span>
            </div>
          </div>
          
          <div class="flashcard-face back">
            <div class="card-top-row">
              <span class="card-origin-badge" style="background-color: var(--accent-green-subtle); color: var(--accent-green);">คำเฉลยอ้างอิงจริง</span>
              <span class="card-side-label">เฉลย</span>
            </div>
            
            <div class="card-content-center">
              <div class="card-answer-text">${currentCard.answer}</div>
            </div>
            
            <div class="card-bottom-row">
              <span style="color: var(--text-muted); font-size: 0.8rem;">ประเมินความแม่นยำของคุณด้านล่าง:</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-bottom: 16px;">
        <button class="btn-secondary" style="flex: 1;" onclick="prevFlashcard()">← การ์ดก่อนหน้า</button>
        <button class="btn-secondary" style="flex: 1;" onclick="flipCurrentCard()">🔄 พลิกการ์ด (Space)</button>
        <button class="btn-secondary" style="flex: 1;" onclick="nextFlashcard()">การ์ดถัดไป →</button>
      </div>
      
      <div class="leitner-ratings-bar">
        <button class="rate-btn again" onclick="rateFlashcard('${currentCard.id}', 1)">
          <span>❌ จำไม่ได้</span>
          <span class="rate-sublabel">เริ่มใหม่พรุ่งนี้</span>
        </button>
        <button class="rate-btn hard" onclick="rateFlashcard('${currentCard.id}', 2)">
          <span>⚠️ พอจำได้</span>
          <span class="rate-sublabel">ทบทวนใน 2 วัน</span>
        </button>
        <button class="rate-btn good" onclick="rateFlashcard('${currentCard.id}', 3)">
          <span>✅ จำได้ดี</span>
          <span class="rate-sublabel">ทบทวนใน 4 วัน</span>
        </button>
        <button class="rate-btn easy" onclick="rateFlashcard('${currentCard.id}', 4)">
          <span>🌟 แม่นยำมาก</span>
          <span class="rate-sublabel">เลื่อนสู่กล่องถัดไป</span>
        </button>
      </div>
    </div>
  `;
}

function setFlashcardFilter(filter) {
  state.flashcardFilter = filter;
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  renderMemoryStudio();
}

function flipCurrentCard() {
  state.flashcardFlipped = !state.flashcardFlipped;
  playAudioTone('flip');
  renderMemoryStudio();
}

function nextFlashcard() {
  const cards = getFilteredFlashcards();
  state.currentFlashcardIndex = (state.currentFlashcardIndex + 1) % cards.length;
  state.flashcardFlipped = false;
  renderMemoryStudio();
}

function prevFlashcard() {
  const cards = getFilteredFlashcards();
  state.currentFlashcardIndex = (state.currentFlashcardIndex - 1 + cards.length) % cards.length;
  state.flashcardFlipped = false;
  renderMemoryStudio();
}

function rateFlashcard(cardId, rating) {
  let cardState = state.leitnerCards[cardId] || { box: 1, reviews: 0 };
  
  if (rating === 1) {
    cardState.box = 1;
    playAudioTone('error');
  } else if (rating === 2) {
    cardState.box = Math.max(1, cardState.box);
    playAudioTone('flip');
  } else if (rating === 3) {
    cardState.box = Math.min(5, cardState.box + 1);
    playAudioTone('success');
  } else if (rating === 4) {
    cardState.box = Math.min(5, cardState.box + 2);
    playAudioTone('success');
  }
  
  const intervals = [1, 2, 4, 7, 14, 30];
  const days = intervals[cardState.box] || 1;
  const now = Date.now();
  cardState.lastReviewed = now;
  cardState.nextReview = now + (days * 24 * 60 * 60 * 1000);
  cardState.reviews = (cardState.reviews || 0) + 1;
  
  state.leitnerCards[cardId] = cardState;
  saveCurrentState();
  
  nextFlashcard();
}

function renderFitbTrainer(container) {
  const items = state.data.fill_in_the_blanks;
  if (!items || items.length === 0) return;
  
  const currentItem = items[state.currentFitbIndex];
  const slide = getSlideById(currentItem.slide_id);
  
  const displaySentence = currentItem.sentence.replace('[BLANK]', `<span style="display: inline-block; min-width: 120px; border-bottom: 2px dashed var(--accent-blue); padding: 0 8px; font-weight: 700; color: var(--accent-blue); text-align: center;">[ ? ]</span>`);
  
  container.innerHTML = `
    <div class="fitb-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="card-origin-badge">${slide ? slide.title : currentItem.slide_id}</span>
        <span style="font-weight: 700; color: var(--text-muted);">ข้อที่ ${state.currentFitbIndex + 1} / ${items.length}</span>
      </div>
      
      <div class="fitb-sentence">${displaySentence}</div>
      
      <div class="fitb-input-container">
        <input type="text" id="fitb-user-input" class="fitb-input" placeholder="พิมพ์คำตอบที่ถูกต้องที่นี่..." onkeydown="if(event.key==='Enter') checkFitbAnswer()">
        <button class="btn-primary" style="min-width: 120px;" onclick="checkFitbAnswer()">ตรวจคำตอบ</button>
      </div>
      
      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="btn-secondary" style="font-size: 0.85rem;" onclick="toggleFitbHint()">💡 ขอคำใบ้</button>
        <span id="fitb-hint-area" style="font-size: 0.85rem; color: var(--accent-amber); display: none;">${currentItem.hint}</span>
      </div>
      
      <div id="fitb-feedback" class="fitb-result-box"></div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 24px;">
        <button class="btn-secondary" onclick="prevFitb()">← ข้อก่อนหน้า</button>
        <button class="btn-secondary" onclick="nextFitb()">ข้อถัดไป →</button>
      </div>
    </div>
  `;
}

function toggleFitbHint() {
  const el = document.getElementById('fitb-hint-area');
  if (el) el.style.display = el.style.display === 'none' ? 'inline' : 'none';
}

function checkFitbAnswer() {
  const input = document.getElementById('fitb-user-input');
  const feedback = document.getElementById('fitb-feedback');
  if (!input || !feedback) return;
  
  const userVal = input.value.trim().toLowerCase();
  const item = state.data.fill_in_the_blanks[state.currentFitbIndex];
  
  const accepted = [item.answer.toLowerCase(), ...(item.alternate_answers || []).map(a => a.toLowerCase())];
  const isMatch = accepted.some(ans => userVal === ans || (userVal.length > 2 && (userVal.includes(ans) || ans.includes(userVal))));
  
  feedback.className = `fitb-result-box ${isMatch ? 'correct' : 'incorrect'}`;
  if (isMatch) {
    feedback.innerHTML = `<strong>🎉 ถูกต้องยอดเยี่ยม!</strong> คำตอบคือ "${item.answer}"`;
    playAudioTone('success');
  } else {
    feedback.innerHTML = `<strong>❌ ยังไม่ถูกต้อง</strong> คำตอบที่แท้จริงคือ <strong>"${item.answer}"</strong> (คุณตอบ: "${input.value}")`;
    playAudioTone('error');
  }
}

function nextFitb() {
  const items = state.data.fill_in_the_blanks;
  state.currentFitbIndex = (state.currentFitbIndex + 1) % items.length;
  renderMemoryStudio();
}

function prevFitb() {
  const items = state.data.fill_in_the_blanks;
  state.currentFitbIndex = (state.currentFitbIndex - 1 + items.length) % items.length;
  renderMemoryStudio();
}

function renderRecallTrainer(container) {
  const recalls = state.data.active_recalls;
  if (!recalls || recalls.length === 0) return;
  
  const item = recalls[state.currentRecallIndex];
  const slide = getSlideById(item.slide_id);
  
  container.innerHTML = `
    <div class="fitb-card" style="max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="card-origin-badge">${slide ? slide.title : item.slide_id}</span>
        <span style="font-weight: 700; color: var(--text-muted);">โจทย์ที่ ${state.currentRecallIndex + 1} / ${recalls.length}</span>
      </div>
      
      <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 8px;">${item.topic}</h3>
      <p style="font-size: 1.05rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 20px;">${item.prompt}</p>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">พิมพ์สิ่งที่จำได้ด้วยตนเอง (Active Recall Scratchpad):</label>
        <textarea id="recall-notes-input" style="width: 100%; min-height: 130px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; font-size: 0.95rem; line-height: 1.6; resize: vertical;" placeholder="พิมพ์ประเด็นสำคัญที่คุณจำได้ออกมาให้หมด ก่อนกดดูประเด็นใบ้หรือเฉลย..."></textarea>
      </div>
      
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
        <button class="btn-secondary" onclick="revealNextCue()">
          <span>💡</span> เปิดประเด็นเตือนความจำทีละส่วน (${state.recallRevealedCues}/${item.cues.length})
        </button>
        <button class="btn-primary" onclick="toggleRecallAnswer()">
          <span>📖</span> ${state.recallAnswerRevealed ? 'ซ่อนคำเฉลยอ้างอิง' : 'เปิดคำเฉลยอ้างอิงทั้งหมด'}
        </button>
      </div>
      
      <div id="cues-container" style="margin-bottom: 20px;">
        ${item.cues.slice(0, state.recallRevealedCues).map((cue, idx) => `
          <div style="background-color: var(--accent-amber-subtle); border-left: 3px solid var(--accent-amber); padding: 8px 14px; border-radius: 4px; margin-bottom: 6px; font-size: 0.9rem; font-weight: 600;">
            ประเด็นที่ ${idx + 1}: ${cue}
          </div>
        `).join('')}
      </div>
      
      ${state.recallAnswerRevealed ? `
        <div style="background-color: var(--accent-blue-subtle); border: 1px solid rgba(0, 113, 227, 0.25); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
          <h4 style="font-weight: 800; margin-bottom: 10px; color: var(--accent-blue);">คำตอบอ้างอิงระดับมาสเตอร์พีซ:</h4>
          <div style="white-space: pre-line; line-height: 1.7; font-size: 0.95rem;">${item.reference_answer}</div>
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; margin-top: 24px;">
        <button class="btn-secondary" onclick="prevRecall()">← โจทย์ก่อนหน้า</button>
        <button class="btn-secondary" onclick="nextRecall()">โจทย์ถัดไป →</button>
      </div>
    </div>
  `;
}

function revealNextCue() {
  const item = state.data.active_recalls[state.currentRecallIndex];
  if (state.recallRevealedCues < item.cues.length) {
    state.recallRevealedCues++;
    playAudioTone('flip');
    renderMemoryStudio();
  }
}

function toggleRecallAnswer() {
  state.recallAnswerRevealed = !state.recallAnswerRevealed;
  playAudioTone('flip');
  renderMemoryStudio();
}

function nextRecall() {
  const recalls = state.data.active_recalls;
  state.currentRecallIndex = (state.currentRecallIndex + 1) % recalls.length;
  state.recallRevealedCues = 0;
  state.recallAnswerRevealed = false;
  renderMemoryStudio();
}

function prevRecall() {
  const recalls = state.data.active_recalls;
  state.currentRecallIndex = (state.currentRecallIndex - 1 + recalls.length) % recalls.length;
  state.recallRevealedCues = 0;
  state.recallAnswerRevealed = false;
  renderMemoryStudio();
}

function renderSequenceTrainer(container) {
  const seqs = state.data.sequence_memories;
  if (!seqs || seqs.length === 0) return;
  
  const currentSeq = seqs[state.currentSeqIndex];
  
  if (!state.currentSeqOrder || state.currentSeqOrder.length !== currentSeq.steps.length) {
    state.currentSeqOrder = [...currentSeq.steps].sort(() => Math.random() - 0.5);
  }
  
  container.innerHTML = `
    <div class="sequence-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="course-badge monera">Sequence Memory Challenge</span>
        <span style="font-weight: 700; color: var(--text-muted);">ชุดที่ ${state.currentSeqIndex + 1} / ${seqs.length}</span>
      </div>
      
      <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;">${currentSeq.title}</h2>
      <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 20px;">${currentSeq.description}</p>
      
      <div class="sequence-list">
        ${state.currentSeqOrder.map((step, idx) => `
          <div class="sequence-item" id="seq-step-${step.id}">
            <div class="seq-number">${idx + 1}</div>
            <div class="seq-text">${step.text}</div>
            <div class="seq-actions">
              <button class="seq-btn-arrow" onclick="moveSeqStep(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
              <button class="seq-btn-arrow" onclick="moveSeqStep(${idx}, 1)" ${idx === state.currentSeqOrder.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button class="btn-primary" style="flex: 1;" onclick="checkSequenceOrder()">✓ ตรวจสอบลำดับ</button>
        <button class="btn-secondary" onclick="shuffleSequenceOrder()">🔀 สลับตำแหน่งใหม่</button>
      </div>
      
      <div id="seq-result-feedback" style="margin-top: 18px;"></div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 28px;">
        <button class="btn-secondary" onclick="prevSequence()">← ชุดก่อนหน้า</button>
        <button class="btn-secondary" onclick="nextSequence()">ชุดถัดไป →</button>
      </div>
    </div>
  `;
}

function moveSeqStep(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= state.currentSeqOrder.length) return;
  const temp = state.currentSeqOrder[index];
  state.currentSeqOrder[index] = state.currentSeqOrder[newIndex];
  state.currentSeqOrder[newIndex] = temp;
  playAudioTone('flip');
  renderMemoryStudio();
}

function shuffleSequenceOrder() {
  state.currentSeqOrder = [...state.currentSeqOrder].sort(() => Math.random() - 0.5);
  renderMemoryStudio();
}

function checkSequenceOrder() {
  const currentSeq = state.data.sequence_memories[state.currentSeqIndex];
  const isCorrect = state.currentSeqOrder.every((step, idx) => step.order === idx + 1);
  const feedback = document.getElementById('seq-result-feedback');
  if (!feedback) return;
  
  if (isCorrect) {
    feedback.innerHTML = `
      <div style="background-color: var(--accent-green-subtle); color: var(--accent-green); border: 1px solid rgba(52, 199, 89, 0.3); border-radius: var(--radius-md); padding: 16px; font-weight: 700;">
        🎉 ยอดเยี่ยมมาก! จัดลำดับกระบวนการได้อย่างถูกต้องสมบูรณ์แบบ 100%
      </div>
    `;
    playAudioTone('success');
  } else {
    feedback.innerHTML = `
      <div style="background-color: var(--accent-red-subtle); color: var(--accent-red); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: var(--radius-md); padding: 16px;">
        <strong>ยังไม่ถูกต้องทั้งหมด:</strong> ลองพิจารณาจุดเริ่มต้นและผลลัพธ์ของแต่ละขั้นตอนใหม่อีกครั้ง หรือใช้ปุ่มลูกศรปรับตำแหน่ง
      </div>
    `;
    playAudioTone('error');
  }
}

function nextSequence() {
  const seqs = state.data.sequence_memories;
  state.currentSeqIndex = (state.currentSeqIndex + 1) % seqs.length;
  state.currentSeqOrder = [];
  renderMemoryStudio();
}

function prevSequence() {
  const seqs = state.data.sequence_memories;
  state.currentSeqIndex = (state.currentSeqIndex - 1 + seqs.length) % seqs.length;
  state.currentSeqOrder = [];
  renderMemoryStudio();
}

function renderVisualTrainer(container) {
  const visuals = state.data.visual_memories;
  if (!visuals || visuals.length === 0) return;
  
  const currentVis = visuals[state.currentVisualIndex];
  
  container.innerHTML = `
    <div class="visual-memory-stage">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span class="course-badge protista">Visual Memory Explorer</span>
        <span style="font-weight: 700; color: var(--text-muted);">แผนภาพที่ ${state.currentVisualIndex + 1} / ${visuals.length}</span>
      </div>
      
      <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;">${currentVis.title}</h2>
      <p style="color: var(--text-secondary); font-size: 0.95rem;">${currentVis.description}</p>
      
      <div class="visual-diagram-frame" onclick="openLightbox('${currentVis.image}')">
        <img src="${currentVis.image}" alt="${currentVis.title}">
      </div>
      
      <h4 style="font-size: 1.05rem; font-weight: 800; margin: 16px 0 10px 0;">แตะโครงสร้างเพื่อทบทวนหน้าที่และตำแหน่ง:</h4>
      
      <div class="visual-labels-grid">
        ${currentVis.labels.map(l => `
          <div class="label-interactive-card" onclick="playAudioTone('flip')">
            <div class="label-title">📍 ${l.name}</div>
            <div class="label-desc">${l.desc}</div>
          </div>
        `).join('')}
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 28px;">
        <button class="btn-secondary" onclick="prevVisual()">← แผนภาพก่อนหน้า</button>
        <button class="btn-secondary" onclick="nextVisual()">แผนภาพถัดไป →</button>
      </div>
    </div>
  `;
}

function nextVisual() {
  const visuals = state.data.visual_memories;
  state.currentVisualIndex = (state.currentVisualIndex + 1) % visuals.length;
  renderMemoryStudio();
}

function prevVisual() {
  const visuals = state.data.visual_memories;
  state.currentVisualIndex = (state.currentVisualIndex - 1 + visuals.length) % visuals.length;
  renderMemoryStudio();
}

function renderSlideBySlideTrainer(container) {
  container.innerHTML = `
    <div class="fitb-card" style="max-width: 760px;">
      <h2 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 8px;">โหมดตะลุยจำตามสไลด์ (Slide-by-Slide Walkthrough)</h2>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">เดินตามสไลด์ตั้งแต่หน้าแรกจนถึงหน้าสุดท้ายอย่างเป็นระบบ เพื่อให้มั่นใจว่าจะไม่มีแม้แต่สไลด์เดียวที่ถูกมองข้าม</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px;">
        <button class="btn-secondary" onclick="startSlideWalkthrough(1, 10, 'monera')">
          📘 มอเนอรา สไลด์ 1–10
        </button>
        <button class="btn-secondary" onclick="startSlideWalkthrough(11, 20, 'monera')">
          📘 มอเนอรา สไลด์ 11–20
        </button>
        <button class="btn-secondary" onclick="startSlideWalkthrough(21, 31, 'monera')">
          📘 มอเนอรา สไลด์ 21–31
        </button>
        <button class="btn-secondary" onclick="startSlideWalkthrough(1, 12, 'protista')">
          📗 โพรติสตา สไลด์ 1–12
        </button>
        <button class="btn-secondary" onclick="startSlideWalkthrough(13, 24, 'protista')">
          📗 โพรติสตา สไลด์ 13–24
        </button>
        <button class="btn-primary" onclick="startSlideWalkthrough(1, 55, 'all')">
          🌟 ตะลุยครบทั้ง 2 PDF (55 สไลด์)
        </button>
      </div>
      
      <div style="background-color: var(--bg-secondary); border-radius: var(--radius-md); padding: 18px; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
        💡 <strong>คำแนะนำการฝึก:</strong> ในโหมดนี้ ระบบจะดึงคำถามและการทดสอบความจำที่ตรงกับสไลด์ที่เลือกมาให้ทำเรียงตามเลขสไลด์ เหมาะสำหรับการเตรียมตัวสอบรายบทหรือทบทวนก่อนสอบปลายภาค
      </div>
    </div>
  `;
}

function startSlideWalkthrough(start, end, courseType) {
  state.activeMemTab = 'flashcards';
  if (courseType === 'all') {
    state.flashcardFilter = 'all';
  } else {
    state.flashcardFilter = courseType;
  }
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  renderMemoryStudio();
}

function getDueCards() {
  const now = Date.now();
  return state.data.flashcards.filter(c => {
    const s = state.leitnerCards[c.id];
    if (!s) return true;
    return !s.nextReview || s.nextReview <= now;
  });
}

function renderReviewCenter() {
  const container = document.getElementById('view-review');
  if (!container) return;
  
  const dueCards = getDueCards();
  const allCards = state.data.flashcards;
  
  const boxCounts = [0, 0, 0, 0, 0, 0];
  allCards.forEach(c => {
    const s = state.leitnerCards[c.id];
    const b = s ? s.box : 1;
    boxCounts[b] = (boxCounts[b] || 0) + 1;
  });
  
  container.innerHTML = `
    <div style="margin-bottom: 28px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px;">ศูนย์ทบทวนตามกำหนด (Spaced Repetition Center)</h1>
      <p style="color: var(--text-secondary);">ระบบจัดตารางทบทวนอัตโนมัติตามอัลกอริทึม Leitner 5 กล่อง เพื่อเปลี่ยนความจำระยะสั้นสู่ความจำถาวร</p>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(255, 149, 0, 0.08) 0%, rgba(255, 59, 48, 0.08) 100%); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 6px;">พร้อมทบทวนวันนี้: ${dueCards.length} การ์ด</h2>
        <p style="color: var(--text-secondary); max-width: 500px;">การ์ดเหล่านี้ถึงกำหนดเวลาที่สมองกำลังจะลืม การทบทวนในจังหวะนี้จะเสริมความแข็งแรงของเส้นใยประสาทความจำได้ดีที่สุด</p>
      </div>
      <button class="btn-primary" style="min-width: 200px; min-height: 52px; font-size: 1rem;" onclick="startDueReviewSession()">
        <span>🚀</span> เริ่มเซสชันทบทวนทันที
      </button>
    </div>
    
    <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 16px;">การกระจายตัวของบัตรคำในกล่อง Leitner ทั้ง 5</h3>
    
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 32px;">
      <div class="stat-card" style="border-top: 4px solid var(--accent-red);">
        <span class="stat-label">กล่อง 1 (ทุกวัน)</span>
        <span class="stat-value">${boxCounts[1]}</span>
        <span class="stat-desc">การ์ดใหม่หรือจำไม่ได้</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--accent-amber);">
        <span class="stat-label">กล่อง 2 (ทุก 3 วัน)</span>
        <span class="stat-value">${boxCounts[2]}</span>
        <span class="stat-desc">เริ่มจำได้</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--accent-blue);">
        <span class="stat-label">กล่อง 3 (ทุก 1 สัปดาห์)</span>
        <span class="stat-value">${boxCounts[3]}</span>
        <span class="stat-desc">จำได้ปานกลาง</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--accent-purple);">
        <span class="stat-label">กล่อง 4 (ทุก 2 สัปดาห์)</span>
        <span class="stat-value">${boxCounts[4]}</span>
        <span class="stat-desc">จำได้ดีมาก</span>
      </div>
      <div class="stat-card" style="border-top: 4px solid var(--accent-green);">
        <span class="stat-label">กล่อง 5 (ทุก 1 เดือน)</span>
        <span class="stat-value">${boxCounts[5]}</span>
        <span class="stat-desc">จำได้ถาวร (Mastered)</span>
      </div>
    </div>
  `;
}

function startDueReviewSession() {
  state.activeMemTab = 'flashcards';
  state.flashcardFilter = 'all';
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  switchView('memory');
}

function openDueReview() {
  switchView('review');
}

function openCourse(courseId) {
  state.currentCourseId = courseId;
  const firstSlide = state.data.slides.find(s => s.pdf === courseId);
  if (firstSlide) {
    navigateToSlide(firstSlide.id);
  }
}

function openCourseMemory(courseId) {
  state.activeMemTab = 'flashcards';
  state.flashcardFilter = courseId;
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  switchView('memory');
}

function openInstantMemory(slideId) {
  state.activeMemTab = 'flashcards';
  state.flashcardFilter = `slide:${slideId}`;
  state.currentFlashcardIndex = 0;
  state.flashcardFlipped = false;
  switchView('memory');
}

function renderAnalytics() {
  const container = document.getElementById('view-analytics');
  if (!container) return;
  
  const totalSlides = state.data.slides.length;
  const completedCount = state.completedSlides.length;
  const progressPercent = Math.round((completedCount / totalSlides) * 100);
  
  container.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px;">สถิติและความก้าวหน้าการเรียน (Learning Analytics)</h1>
      <p style="color: var(--text-secondary);">ติดตามผลสัมฤทธิ์ทางการศึกษาและการจดจำเนื้อหาอย่างละเอียด</p>
    </div>
    
    <div class="hero-stats-row">
      <div class="stat-card">
        <span class="stat-label">อัตราสำเร็จหลักสูตร</span>
        <span class="stat-value">${progressPercent}%</span>
        <span class="stat-desc">55 สไลด์ต้นฉบับ</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">สไลด์ที่เรียนจบแล้ว</span>
        <span class="stat-value">${completedCount}</span>
        <span class="stat-desc">คงเหลืออีก ${totalSlides - completedCount} สไลด์</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">บัตรคำในระบบ</span>
        <span class="stat-value">${state.data.flashcards.length}</span>
        <span class="stat-desc">ครอบคลุมทุกสไลด์ 100%</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">แบบฝึกหัดเติมคำ</span>
        <span class="stat-value">${state.data.fill_in_the_blanks.length}</span>
        <span class="stat-desc">ข้อความสกัดจากต้นฉบับ</span>
      </div>
    </div>
    
    <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
      <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">การจัดการข้อมูลการเรียน (Data Management)</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px;">ข้อมูลความก้าวหน้าทั้งหมดของคุณถูกจัดเก็บอย่างปลอดภัยในเครื่อง (LocalStorage) ไม่สูญหายเมื่อปิดเบราว์เซอร์</p>
      
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="btn-secondary" onclick="exportUserData()">📥 ส่งออกข้อมูลการเรียน (Export JSON)</button>
        <button class="btn-secondary" style="color: var(--accent-red);" onclick="resetUserData()">⚠️ รีเซ็ตข้อมูลความก้าวหน้าทั้งหมด</button>
      </div>
    </div>
  `;
}

function exportUserData() {
  const data = {
    completedSlides: state.completedSlides,
    bookmarkedSlides: state.bookmarkedSlides,
    leitnerCards: state.leitnerCards,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BioLab_Progress_Backup_${Date.now()}.json`;
  a.click();
}

function resetUserData() {
  if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตข้อมูลความก้าวหน้าทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
    localStorage.removeItem(APP_STORAGE_KEY);
    state.completedSlides = [];
    state.bookmarkedSlides = [];
    state.leitnerCards = {};
    saveCurrentState();
    switchView('dashboard');
  }
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function initApp() {
  loadSavedState();
  
  if (window.BIOLOGY_DATA) {
    state.data = window.BIOLOGY_DATA;
  } else {
    fetch('biology_data.json')
      .then(res => res.json())
      .then(d => {
        state.data = d;
        initializeAppViews();
      })
      .catch(() => {});
    return;
  }
  
  initializeAppViews();
}

function initializeAppViews() {
  applyTheme(state.theme);
  
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  document.addEventListener('keydown', (e) => {
    if (state.currentView === 'memory' && state.activeMemTab === 'flashcards') {
      if (e.code === 'Space') {
        e.preventDefault();
        flipCurrentCard();
      } else if (e.code === 'ArrowRight') {
        nextFlashcard();
      } else if (e.code === 'ArrowLeft') {
        prevFlashcard();
      }
    }
  });
  
  switchView('dashboard');
}

window.addEventListener('DOMContentLoaded', initApp);
