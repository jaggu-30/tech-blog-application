/* ===== Inkly — Blog Application Script ===== */

// ———————————————— SAMPLE DATA ————————————————
const samplePosts = [
  {
    id: 'sample-1',
    tag: 'Creativity',
    color: '',
    title: 'Why boredom might be your most creative state',
    text: 'What happens when we resist the urge to fill every quiet moment? In a world that rewards busyness, boredom is often treated as a failure of productivity. But research suggests the opposite — that the mind needs stretches of unstructured time to form unexpected connections. When we stop scrolling, stop scheduling, and simply sit with nothing, something remarkable happens. The brain enters a mode of diffuse thinking, where ideas from unrelated domains collide. Many of history\'s greatest breakthroughs were born not in moments of focused effort, but in moments of idle wandering.',
    author: 'Maya Chen',
    initial: 'M',
    isSample: true
  },
  {
    id: 'sample-2',
    tag: 'Career',
    color: 'blue',
    title: 'The gentle art of changing your mind',
    text: 'A small guide to letting go of the plans that no longer fit. We build our identities around our goals — the career we chose at twenty, the city we promised to live in, the version of success we inherited from our parents. But what if the bravest thing we can do is admit that the map no longer matches the territory? Changing your mind isn\'t weakness. It\'s a sign that you\'re paying attention. The trick is learning to distinguish between giving up and growing up.',
    author: 'Owen Price',
    initial: 'O',
    isSample: true
  },
  {
    id: 'sample-3',
    tag: 'Design',
    color: 'gold',
    title: 'Making digital spaces feel more human',
    text: 'The tiny details that turn a useful product into a loved one. Think about the last time software made you smile. Not a productivity smile — a genuine, surprised moment of delight. Maybe it was a playful loading animation, or a confirmation message that felt like it was written by a person, not a committee. These moments matter more than we think. In a landscape of identical interfaces, warmth is a competitive advantage. And it starts with one question: would a thoughtful friend design it this way?',
    author: 'Amara Singh',
    initial: 'A',
    isSample: true
  },
  {
    id: 'sample-4',
    tag: 'Productivity',
    color: 'green',
    title: 'The myth of the morning routine',
    text: 'Not everyone peaks at 5 AM — and that\'s perfectly fine. The internet is full of morning routines from successful people: cold showers, meditation, journaling, green smoothies — all before 6 AM. But what if your best work happens at midnight? Chronobiology tells us that our energy patterns are largely genetic. Forcing yourself into an unnatural rhythm doesn\'t make you more productive — it makes you exhausted. The real productivity hack is knowing when your brain is at its sharpest and protecting that time fiercely.',
    author: 'Liam Torres',
    initial: 'L',
    isSample: true
  },
  {
    id: 'sample-5',
    tag: 'Writing',
    color: 'purple',
    title: 'How to write when you have nothing to say',
    text: 'Every writer knows the feeling. The cursor blinks on an empty page, mocking you. You\'ve sat down to write, but your mind is blank. Here\'s the secret that professionals won\'t tell you: they feel this way too. The difference is that they write anyway. They write badly, awkwardly, painfully — and then they edit. The first draft isn\'t meant to be good. It\'s meant to exist. You can polish a rough diamond, but you can\'t polish nothing.',
    author: 'Zara Malik',
    initial: 'Z',
    isSample: true
  },
  {
    id: 'sample-6',
    tag: 'Technology',
    color: 'blue',
    title: 'Why I deleted all my social media apps (and what happened next)',
    text: 'Three months ago, I removed Instagram, Twitter, and TikTok from my phone. Not deactivated — deleted. The first week was brutal. I reached for my phone dozens of times, finding nothing to scroll through. By week two, I started reading books again. By month two, I had written more than I had in the entire previous year. The truth is, social media isn\'t inherently bad. But for me, it had become a substitute for creating. I was consuming content instead of making it.',
    author: 'Noah Kim',
    initial: 'N',
    isSample: true
  }
];

// ———————————————— APPLICATION STATE ————————————————
const state = {
  isLoggedIn: !!localStorage.getItem('inklyUser'),
  user: localStorage.getItem('inklyUser') || '',
  posts: JSON.parse(localStorage.getItem('inklyPosts') || '[]'),
  currentPage: 'home',
  previousPage: 'home',
  viewingPost: null
};

// ———————————————— DOM HELPERS ————————————————
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Cached DOM elements
const dom = {
  toast: $('#toast'),
  postGrid: $('#post-grid'),
  exploreGrid: $('#explore-grid'),
  exploreEmpty: $('#explore-empty'),
  categoryFilters: $('#category-filters'),
  myPosts: $('#my-posts'),
  mainNav: $('#main-nav'),
  menuToggle: $('#menu-toggle'),
  headerOut: $('#header-actions-out'),
  headerIn: $('#header-actions-in'),
  headerUserName: $('#header-user-name'),
  userName: $('#user-name'),
  publishedCount: $('#published-count'),
  totalReads: $('#total-reads'),
  btnPostBack: $('#btn-post-back'),
  postViewTag: $('#post-view-tag'),
  postViewTitle: $('#post-view-title'),
  postViewMeta: $('#post-view-meta'),
  postViewBody: $('#post-view-body')
};

// ———————————————— ROUTING ————————————————
function goTo(page) {
  // Auth guard: redirect to login for protected pages
  if ((page === 'dashboard' || page === 'create') && !state.isLoggedIn) {
    goTo('login');
    notify('Please log in to access your dashboard.');
    return;
  }

  state.previousPage = state.currentPage;
  state.currentPage = page;

  // Hide all pages, show target
  $$('.page').forEach(el => el.classList.remove('active-page'));
  const target = $(`#${page}`);
  if (!target) return;
  target.classList.add('active-page');

  // Update active nav link
  $$('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile nav
  dom.mainNav.classList.remove('open');
  dom.menuToggle.setAttribute('aria-expanded', 'false');

  // Page-specific rendering
  if (page === 'dashboard') renderDashboard();
  if (page === 'explore') renderExplore();

  updateHeader();
}

// ———————————————— HEADER STATE ————————————————
function updateHeader() {
  if (state.isLoggedIn) {
    dom.headerOut.classList.add('hidden');
    dom.headerIn.classList.remove('hidden');
    dom.headerUserName.textContent = state.user;
    // Change hero CTA to go to create page when logged in
    const startBtn = $('#btn-start-writing');
    if (startBtn) {
      startBtn.setAttribute('data-page', 'create');
      startBtn.innerHTML = 'Write a story <span>→</span>';
    }
    // Change join banner CTA
    const joinBtn = $('#btn-join-register');
    if (joinBtn) {
      joinBtn.setAttribute('data-page', 'dashboard');
      joinBtn.textContent = 'Go to Dashboard';
    }
  } else {
    dom.headerOut.classList.remove('hidden');
    dom.headerIn.classList.add('hidden');
    const startBtn = $('#btn-start-writing');
    if (startBtn) {
      startBtn.setAttribute('data-page', 'register');
      startBtn.innerHTML = 'Start writing <span>→</span>';
    }
    const joinBtn = $('#btn-join-register');
    if (joinBtn) {
      joinBtn.setAttribute('data-page', 'register');
      joinBtn.textContent = 'Create an account';
    }
  }
}

// ———————————————— TOAST NOTIFICATION ————————————————
function notify(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  clearTimeout(notify._timer);
  notify._timer = setTimeout(() => dom.toast.classList.remove('show'), 2800);
}

// ———————————————— RENDER: FEATURED POSTS (HOME) ————————————————
function renderFeatured() {
  dom.postGrid.innerHTML = samplePosts.slice(0, 3).map(post => createPostCardHTML(post)).join('');
}

// ———————————————— RENDER: EXPLORE PAGE ————————————————
function renderExplore(filterCategory = 'all') {
  // Get all posts: sample + user-created
  const allPosts = getAllPosts();

  // Build unique categories
  const categories = ['All', ...new Set(allPosts.map(p => p.tag || p.category))];
  dom.categoryFilters.innerHTML = categories.map(cat => {
    const isActive = (filterCategory === 'all' && cat === 'All') ||
                     cat.toLowerCase() === filterCategory.toLowerCase();
    return `<button class="filter-btn ${isActive ? 'active' : ''}" data-category="${cat.toLowerCase()}">${cat}</button>`;
  }).join('');

  // Attach filter listeners
  dom.categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => renderExplore(btn.dataset.category));
  });

  // Filter posts
  const filtered = filterCategory === 'all'
    ? allPosts
    : allPosts.filter(p => (p.tag || p.category || '').toLowerCase() === filterCategory.toLowerCase());

  if (filtered.length === 0) {
    dom.exploreGrid.innerHTML = '';
    dom.exploreEmpty.classList.remove('hidden');
  } else {
    dom.exploreEmpty.classList.add('hidden');
    dom.exploreGrid.innerHTML = filtered.map(post => createPostCardHTML(post)).join('');
  }

  // Attach click listeners to post cards
  attachPostCardListeners(dom.exploreGrid);
}

// ———————————————— RENDER: DASHBOARD ————————————————
function renderDashboard() {
  dom.userName.textContent = state.user;
  dom.publishedCount.textContent = state.posts.length;

  // Calculate total reads (simulated)
  const totalReads = state.posts.length > 0
    ? state.posts.reduce((sum, _, i) => sum + Math.floor(Math.random() * 200 + 50) * (i + 1), 0)
    : 0;
  dom.totalReads.textContent = totalReads > 0 ? totalReads.toLocaleString() : '0';

  if (state.posts.length === 0) {
    dom.myPosts.innerHTML = '<p class="empty-state">Your published stories will appear here. Ready when you are.</p>';
    return;
  }

  dom.myPosts.innerHTML = state.posts.map((post, index) => `
    <article class="my-post">
      <div>
        <span class="tag">${post.category}</span>
        <h3>${escapeHTML(post.title)}</h3>
        <p>Published today · ${post.content.length} characters</p>
      </div>
      <div class="my-post-actions">
        <button class="btn-view" data-view-index="${index}">View</button>
        <button class="button-danger" data-delete-index="${index}">Delete</button>
      </div>
    </article>
  `).join('');

  // Attach view listeners
  dom.myPosts.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.viewIndex);
      viewUserPost(idx);
    });
  });

  // Attach delete listeners
  dom.myPosts.querySelectorAll('.button-danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.deleteIndex);
      confirmDelete(idx);
    });
  });
}

// ———————————————— POST CARD HTML ————————————————
function createPostCardHTML(post) {
  const tag = post.tag || post.category || 'General';
  const color = post.color || '';
  const title = post.title;
  const text = post.text || (post.content ? post.content.substring(0, 120) + '...' : '');
  const author = post.author || state.user || 'Anonymous';
  const initial = post.initial || author.charAt(0).toUpperCase();
  const id = post.id || `user-${state.posts.indexOf(post)}`;

  return `
    <article class="post-card" data-post-id="${id}">
      <div>
        <span class="tag ${color}">${tag}</span>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(text.substring(0, 150))}${text.length > 150 ? '...' : ''}</p>
      </div>
      <div class="author">
        <span class="avatar">${initial}</span>${escapeHTML(author)}
      </div>
    </article>
  `;
}

function attachPostCardListeners(container) {
  container.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const postId = card.dataset.postId;
      viewPostById(postId);
    });
  });
}

// ———————————————— VIEW POST ————————————————
function viewPostById(postId) {
  // Search in sample posts
  let post = samplePosts.find(p => p.id === postId);

  // Search in user posts
  if (!post && postId.startsWith('user-')) {
    const idx = parseInt(postId.replace('user-', ''));
    if (state.posts[idx]) {
      post = {
        ...state.posts[idx],
        tag: state.posts[idx].category,
        text: state.posts[idx].content,
        author: state.user,
        initial: state.user.charAt(0).toUpperCase()
      };
    }
  }

  if (!post) return;
  showPostView(post);
}

function viewUserPost(index) {
  const raw = state.posts[index];
  if (!raw) return;
  showPostView({
    tag: raw.category,
    color: '',
    title: raw.title,
    text: raw.content,
    author: state.user,
    initial: state.user.charAt(0).toUpperCase()
  });
}

function showPostView(post) {
  state.viewingPost = post;

  dom.postViewTag.textContent = post.tag || 'General';
  dom.postViewTag.className = `tag ${post.color || ''}`;
  dom.postViewTitle.textContent = post.title;
  dom.postViewMeta.innerHTML = `
    <span class="avatar">${post.initial || '?'}</span>
    <div>
      <strong>${escapeHTML(post.author || 'Anonymous')}</strong>
      <span>${getReadingTime(post.text || '')} min read</span>
    </div>
  `;

  // Format text into paragraphs
  const paragraphs = (post.text || '').split(/\n+/).filter(p => p.trim());
  dom.postViewBody.innerHTML = paragraphs.map(p => `<p>${escapeHTML(p)}</p>`).join('');

  goTo('post-view');
}

// ———————————————— DELETE POST ————————————————
function confirmDelete(index) {
  const post = state.posts[index];
  if (!post) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Delete this story?</h3>
      <p>"${escapeHTML(post.title)}" will be permanently removed.</p>
      <div class="modal-actions">
        <button class="modal-cancel" id="modal-cancel">Cancel</button>
        <button class="modal-confirm" id="modal-confirm">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#modal-confirm').addEventListener('click', () => {
    state.posts.splice(index, 1);
    localStorage.setItem('inklyPosts', JSON.stringify(state.posts));
    overlay.remove();
    renderDashboard();
    notify('Story deleted.');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ———————————————— AUTH FUNCTIONS ————————————————
function login(name) {
  state.isLoggedIn = true;
  state.user = name;
  localStorage.setItem('inklyUser', name);
  updateHeader();
}

function logout() {
  state.isLoggedIn = false;
  state.user = '';
  localStorage.removeItem('inklyUser');
  updateHeader();
  goTo('home');
  notify('You have been logged out. See you soon!');
}

// ———————————————— UTILITY FUNCTIONS ————————————————
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function getAllPosts() {
  // Combine sample and user posts for Explore
  const userPostsMapped = state.posts.map((p, i) => ({
    id: `user-${i}`,
    tag: p.category,
    color: '',
    title: p.title,
    text: p.content,
    author: state.user || 'You',
    initial: (state.user || 'Y').charAt(0).toUpperCase(),
    isSample: false
  }));
  return [...samplePosts, ...userPostsMapped];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ———————————————— EVENT LISTENERS ————————————————

// 1. All [data-page] buttons/links → navigation
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-page]');
  if (trigger) {
    e.preventDefault();
    goTo(trigger.dataset.page);
  }
});

// 2. Brand link → home
$('#brand-link').addEventListener('click', (e) => { e.preventDefault(); goTo('home'); });
$('#footer-brand').addEventListener('click', (e) => { e.preventDefault(); goTo('home'); });

// 3. Mobile menu toggle
dom.menuToggle.addEventListener('click', (e) => {
  dom.mainNav.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', dom.mainNav.classList.contains('open'));
});

// 4. Register form
$('#register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#register-name').value.trim().split(' ')[0] || 'Writer';
  const email = $('#register-email').value.trim();

  if (!name || !email) {
    notify('Please fill in all fields.');
    return;
  }

  login(name);
  e.target.reset();
  notify(`Welcome to Inkly, ${name}! Your account is ready.`);
  goTo('dashboard');
});

// 5. Login form
$('#login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#login-email').value.trim();

  if (!email) {
    notify('Please enter your email.');
    return;
  }

  // If user previously registered, welcome back with their name
  const existingUser = state.user || localStorage.getItem('inklyUser') || 'Writer';
  login(existingUser || 'Writer');
  e.target.reset();
  notify(`Welcome back, ${state.user}!`);
  goTo('dashboard');
});

// 6. Post form (create blog)
$('#post-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#post-title').value.trim();
  const category = $('#post-category').value.trim();
  const content = $('#post-content').value.trim();

  if (!title || !category || !content) {
    notify('Please fill in all fields.');
    return;
  }

  state.posts.unshift({ title, category, content, createdAt: new Date().toISOString() });
  localStorage.setItem('inklyPosts', JSON.stringify(state.posts));
  e.target.reset();
  notify('Your story is published! 🎉');
  goTo('dashboard');
});

// 7. Save draft
$('#save-draft').addEventListener('click', () => {
  const title = $('#post-title').value.trim();
  if (!title) {
    notify('Write something first, then save your draft.');
    return;
  }
  notify('Draft saved in this browser.');
});

// 8. Logout
$('#btn-logout').addEventListener('click', logout);

// 9. Post view back button
dom.btnPostBack.addEventListener('click', () => {
  goTo(state.previousPage || 'home');
});

// ———————————————— INITIALIZATION ————————————————
(function init() {
  // Render featured posts on home page
  renderFeatured();
  attachPostCardListeners(dom.postGrid);

  // Update header based on login state
  updateHeader();

  // Update dashboard greeting
  const greetingEl = $('.dashboard-head h1');
  if (greetingEl) {
    greetingEl.innerHTML = `${getGreeting()}, <span id="user-name">${escapeHTML(state.user || 'writer')}</span>.`;
    // Re-cache the user-name element since we just replaced it
    dom.userName = $('#user-name');
  }
})();
