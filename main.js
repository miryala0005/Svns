// ─── NAV ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
  }

  // Active nav
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  // Scroll fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Load notices if on home page
  if (document.getElementById('notices-grid')) loadNotices();
  // Load faculty if on about page
  if (document.getElementById('faculty-grid')) loadFaculty();
  // Init tabs if on academics page
  if (document.querySelector('.tab-nav')) initTabs();
  // Init admission form
  if (document.getElementById('enquiry-form')) initEnquiryForm();
  // Init contact form
  if (document.getElementById('contact-form')) initContactForm();
  // Init admin
  if (document.getElementById('admin-login-form')) initAdmin();
});

// ─── NOTICES ──────────────────────────────────────────────────────────────────
async function loadNotices() {
  const grid = document.getElementById('notices-grid');
  try {
    const res = await fetch('/api/notices');
    const data = await res.json();
    if (!data.success || !data.data.length) {
      grid.innerHTML = '<p class="notice-loading">No notices at the moment.</p>';
      return;
    }
    const notices = data.data.slice(0, 3);
    grid.innerHTML = notices.map(n => `
      <div class="notice-card fade-in">
        <div class="notice-card-top">
          <span class="notice-cat cat-${n.category.toLowerCase()}">${n.category}</span>
          <span class="notice-date">${formatDate(n.created_at)}</span>
        </div>
        <h3>${n.title}</h3>
        <p>${n.content}</p>
      </div>
    `).join('');
    document.querySelectorAll('.notice-card.fade-in').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 50);
    });
  } catch {
    grid.innerHTML = '<p class="notice-error">Could not load notices.</p>';
  }
}

// ─── FACULTY ──────────────────────────────────────────────────────────────────
async function loadFaculty() {
  const grid = document.getElementById('faculty-grid');
  try {
    const res = await fetch('/api/faculty');
    const data = await res.json();
    if (!data.success) throw new Error();
    grid.innerHTML = data.data.map(f => `
      <div class="faculty-card fade-in">
        <div class="faculty-avatar">${f.photo_placeholder}</div>
        <h3>${f.name}</h3>
        <p class="faculty-subject">${f.subject}</p>
        <p class="faculty-qual">${f.qualification}</p>
        <span class="faculty-exp">⏱ ${f.experience_years} Years Experience</span>
      </div>
    `).join('');
    document.querySelectorAll('.faculty-card.fade-in').forEach(el => {
      setTimeout(() => el.classList.add('visible'), 50);
    });
  } catch {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Could not load faculty.</p>';
  }
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function initTabs() {
  const btns = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

// ─── ENQUIRY FORM ─────────────────────────────────────────────────────────────
function initEnquiryForm() {
  const form = document.getElementById('enquiry-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const spinner = btn.querySelector('.spinner');
    const feedback = document.getElementById('enquiry-feedback');

    btn.disabled = true;
    spinner.style.display = 'block';
    feedback.className = 'form-feedback';

    const body = {
      parent_name: form.parent_name.value,
      student_name: form.student_name.value,
      class_applying: form.class_applying.value,
      phone: form.phone.value,
      email: form.email.value,
      message: form.message.value,
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      feedback.textContent = data.message;
      feedback.className = 'form-feedback ' + (data.success ? 'success' : 'error');
      if (data.success) form.reset();
    } catch {
      feedback.textContent = 'Network error. Please try again.';
      feedback.className = 'form-feedback error';
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
    }
  });
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const spinner = btn.querySelector('.spinner');
    const feedback = document.getElementById('contact-feedback');

    btn.disabled = true;
    spinner.style.display = 'block';
    feedback.className = 'form-feedback';

    const body = {
      name: form.c_name.value,
      email: form.c_email.value,
      phone: form.c_phone.value,
      subject: form.c_subject.value,
      message: form.c_message.value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      feedback.textContent = data.message;
      feedback.className = 'form-feedback ' + (data.success ? 'success' : 'error');
      if (data.success) form.reset();
    } catch {
      feedback.textContent = 'Network error. Please try again.';
      feedback.className = 'form-feedback error';
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
    }
  });
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────────
function initAdmin() {
  const ADMIN_PASS = 'svns@admin2024';
  const loginSection = document.getElementById('admin-login');
  const adminWrap = document.getElementById('admin-wrap');

  // Check session
  if (sessionStorage.getItem('svns_admin') === 'true') showAdminPanel();

  document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('admin-pass').value;
    const err = document.getElementById('admin-error');
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem('svns_admin', 'true');
      showAdminPanel();
    } else {
      err.textContent = 'Incorrect password. Please try again.';
      err.style.display = 'block';
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('svns_admin');
    location.reload();
  });

  async function showAdminPanel() {
    loginSection.style.display = 'none';
    adminWrap.style.display = 'block';
    await loadStats();
    await loadAdminEnquiries();
    await loadAdminContacts();
    await loadAdminNotices();
    initAddNotice();
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        document.getElementById('stat-enquiries').textContent = data.data.enquiries;
        document.getElementById('stat-contacts').textContent = data.data.contacts;
        document.getElementById('stat-notices').textContent = data.data.notices;
        document.getElementById('stat-faculty').textContent = data.data.faculty;
      }
    } catch {}
  }

  async function loadAdminEnquiries() {
    try {
      const res = await fetch('/api/admin/enquiries');
      const data = await res.json();
      const tbody = document.getElementById('enquiries-tbody');
      if (!data.data.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">No enquiries yet.</td></tr>'; return; }
      tbody.innerHTML = data.data.map(e => `
        <tr>
          <td>${formatDate(e.created_at)}</td>
          <td>${e.parent_name}</td>
          <td>${e.student_name}</td>
          <td>${e.class_applying}</td>
          <td>${e.phone}</td>
          <td>${e.email || '—'}</td>
        </tr>
      `).join('');
    } catch {}
  }

  async function loadAdminContacts() {
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      const tbody = document.getElementById('contacts-tbody');
      if (!data.data.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted)">No messages yet.</td></tr>'; return; }
      tbody.innerHTML = data.data.map(c => `
        <tr>
          <td>${formatDate(c.created_at)}</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.subject}</td>
          <td>${c.message.slice(0,60)}${c.message.length > 60 ? '...' : ''}</td>
        </tr>
      `).join('');
    } catch {}
  }

  async function loadAdminNotices() {
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      const tbody = document.getElementById('notices-tbody');
      if (!data.data.length) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted)">No notices.</td></tr>'; return; }
      tbody.innerHTML = data.data.map(n => `
        <tr>
          <td>${n.title}</td>
          <td><span class="notice-cat cat-${n.category.toLowerCase()}">${n.category}</span></td>
          <td>${formatDate(n.created_at)}</td>
          <td><button class="del-btn" onclick="deleteNotice(${n.id})">Delete</button></td>
        </tr>
      `).join('');
    } catch {}
  }

  function initAddNotice() {
    document.getElementById('add-notice-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const body = {
        title: form.n_title.value,
        content: form.n_content.value,
        category: form.n_category.value,
      };
      try {
        const res = await fetch('/api/notices', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          await loadStats();
          await loadAdminNotices();
          alert('✅ Notice added successfully!');
        }
      } catch {}
    });
  }

  window.deleteNotice = async function(id) {
    if (!confirm('Delete this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { await loadStats(); await loadAdminNotices(); }
    } catch {}
  };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
