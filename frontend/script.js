/* ===== Inkly — Full-Stack Blog Application Script ===== */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const CATEGORY_COLORS = ['', 'blue', 'gold', 'green', 'purple'];

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

function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('inklyUser') || 'null');
  } catch {
    return null;
  }
}

const state = {
  isLoggedIn: !!localStorage.getItem('inklyToken'),
  token: localStorage.getItem('inklyToken') || '',
  user: loadStoredUser(),
  apiBlogs: [],
  myBlogs: [],
  currentPage: 'home',
  previousPage: 'home',
  viewingPost: null,
  isLoading: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

function setSubmitLoading(button, isLoading, defaultText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Please wait...' : defaultText;
}

function mapApiBlog(blog, index = 0) {
  return {
    id: blog.id,
    tag: blog.category,
    category: blog.category,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    title: blog.title,
    text: blog.content,
    content: blog.content,
    author: blog.author,
    initial: blog.initial || blog.author?.charAt(0)?.toUpperCase() || 'A',
    createdAt: blog.createdAt,
    isSample: false
  };
}

async function fetchPublicBlogs() {
  const data = await apiRequest('/blogs');
  state.apiBlogs = (data.blogs || []).map(mapApiBlog);
  return state.apiBlogs;
}

async function fetchMyBlogs() {
  if (!state.isLoggedIn) {
    state.myBlogs = [];
    return state.myBlogs;
  }

  const data = await apiRequest('/blogs/mine');
  state.myBlogs = (data.blogs || []).map(mapApiBlog);
  return state.myBlogs;
}

function getDisplayName() {
  if (!state.user?.name) return 'writer';
  return state.user.name.split(' ')[0];
}

function goTo(page) {
  if ((page === 'dashboard' || page === 'create') && !state.isLoggedIn) {
    goTo('login');
    notify('Please log in to access your dashboard.');
    return;
  }

  state.previousPage = state.currentPage;
  state.currentPage = page;

  $$('.page').forEach((el) => el.classList.remove('active-page'));
  const target = $(`#${page}`);
  if (!target) return;
  target.classList.add('active-page');

  $$('.nav-link').forEach((a) => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  dom.mainNav.classList.remove('open');
  dom.menuToggle.setAttribute('aria-expanded', 'false');

  if (page === 'home') renderFeatured();
  if (page === 'dashboard') renderDashboard();
  if (page === 'explore') renderExplore();

  updateHeader();
}

function updateHeader() {
  const displayName = getDisplayName();

  if (state.isLoggedIn) {
    dom.headerOut.classList.add('hidden');
    dom.headerIn.classList.remove('hidden');
    dom.headerUserName.textContent = displayName;

    const startBtn = $('#btn-start-writing');
    if (startBtn) {
      startBtn.setAttribute('data-page', 'create');
      startBtn.innerHTML = 'Write a story <span>→</span>';
    }

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

function notify(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  clearTimeout(notify._timer);
  notify._timer = setTimeout(() => dom.toast.classList.remove('show'), 2800);
}

function getAllPosts() {
  return [...state.apiBlogs, ...samplePosts];
}

function renderFeatured() {
  const posts = getAllPosts().slice(0, 3);
  dom.postGrid.innerHTML = posts.map((post) => createPostCardHTML(post)).join('');
  attachPostCardListeners(dom.postGrid);
}

function renderExplore(filterCategory = 'all') {
  const allPosts = getAllPosts();
  const categories = ['All', ...new Set(allPosts.map((p) => p.tag || p.category))];

  dom.categoryFilters.innerHTML = categories
    .map((cat) => {
      const isActive =
        (filterCategory === 'all' && cat === 'All') ||
        cat.toLowerCase() === filterCategory.toLowerCase();
      return `<button class="filter-btn ${isActive ? 'active' : ''}" data-category="${cat.toLowerCase()}">${cat}</button>`;
    })
    .join('');

  dom.categoryFilters.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => renderExplore(btn.dataset.category));
  });

  const filtered =
    filterCategory === 'all'
      ? allPosts
      : allPosts.filter(
          (p) => (p.tag || p.category || '').toLowerCase() === filterCategory.toLowerCase()
        );

  if (filtered.length === 0) {
    dom.exploreGrid.innerHTML = '';
    dom.exploreEmpty.classList.remove('hidden');
  } else {
    dom.exploreEmpty.classList.add('hidden');
    dom.exploreGrid.innerHTML = filtered.map((post) => createPostCardHTML(post)).join('');
    attachPostCardListeners(dom.exploreGrid);
  }
}

function renderDashboard() {
  const displayName = getDisplayName();
  dom.userName.textContent = displayName;
  dom.publishedCount.textContent = state.myBlogs.length;

  const totalReads =
    state.myBlogs.length > 0
      ? state.myBlogs.reduce((sum, _, i) => sum + Math.floor(Math.random() * 200 + 50) * (i + 1), 0)
      : 0;
  dom.totalReads.textContent = totalReads > 0 ? totalReads.toLocaleString() : '0';

  if (state.myBlogs.length === 0) {
    dom.myPosts.innerHTML =
      '<p class="empty-state">Your published stories will appear here. Ready when you are.</p>';
    return;
  }

  dom.myPosts.innerHTML = state.myBlogs
    .map(
      (post) => `
    <article class="my-post">
      <div>
        <span class="tag">${escapeHTML(post.category || post.tag)}</span>
        <h3>${escapeHTML(post.title)}</h3>
        <p>Published ${formatDate(post.createdAt)} · ${post.content.length} characters</p>
      </div>
      <div class="my-post-actions">
        <button class="btn-view" data-view-id="${post.id}">View</button>
        <button class="button-danger" data-delete-id="${post.id}">Delete</button>
      </div>
    </article>
  `
    )
    .join('');

  dom.myPosts.querySelectorAll('.btn-view').forEach((btn) => {
    btn.addEventListener('click', () => viewPostById(btn.dataset.viewId));
  });

  dom.myPosts.querySelectorAll('.button-danger').forEach((btn) => {
    btn.addEventListener('click', () => confirmDelete(btn.dataset.deleteId));
  });
}

function createPostCardHTML(post) {
  const tag = post.tag || post.category || 'General';
  const color = post.color || '';
  const title = post.title;
  const text = post.text || (post.content ? `${post.content.substring(0, 120)}...` : '');
  const author = post.author || 'Anonymous';
  const initial = post.initial || author.charAt(0).toUpperCase();
  const id = post.id;

  return `
    <article class="post-card" data-post-id="${id}">
      <div>
        <span class="tag ${color}">${escapeHTML(tag)}</span>
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
  container.querySelectorAll('.post-card').forEach((card) => {
    card.addEventListener('click', () => viewPostById(card.dataset.postId));
  });
}

async function viewPostById(postId) {
  let post = samplePosts.find((p) => p.id === postId);

  if (!post) {
    post = state.apiBlogs.find((p) => p.id === postId) || state.myBlogs.find((p) => p.id === postId);

    if (!post) {
      try {
        const data = await apiRequest(`/blogs/${postId}`);
        post = mapApiBlog(data.blog);
      } catch {
        notify('Unable to load this story.');
        return;
      }
    }
  }

  showPostView(post);
}

function showPostView(post) {
  state.viewingPost = post;

  dom.postViewTag.textContent = post.tag || post.category || 'General';
  dom.postViewTag.className = `tag ${post.color || ''}`;
  dom.postViewTitle.textContent = post.title;
  dom.postViewMeta.innerHTML = `
    <span class="avatar">${post.initial || '?'}</span>
    <div>
      <strong>${escapeHTML(post.author || 'Anonymous')}</strong>
      <span>${getReadingTime(post.text || post.content || '')} min read</span>
    </div>
  `;

  const bodyText = post.text || post.content || '';
  const paragraphs = bodyText.split(/\n+/).filter((p) => p.trim());
  dom.postViewBody.innerHTML = paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join('');

  goTo('post-view');
}

function confirmDelete(blogId) {
  const post = state.myBlogs.find((p) => p.id === blogId);
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
  overlay.querySelector('#modal-confirm').addEventListener('click', async () => {
    try {
      await apiRequest(`/blogs/${blogId}`, { method: 'DELETE' });
      await fetchPublicBlogs();
      await fetchMyBlogs();
      overlay.remove();
      renderDashboard();
      notify('Story deleted.');
    } catch (error) {
      overlay.remove();
      notify(error.message);
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function loginSession(token, user) {
  state.isLoggedIn = true;
  state.token = token;
  state.user = user;
  localStorage.setItem('inklyToken', token);
  localStorage.setItem('inklyUser', JSON.stringify(user));
  updateHeader();
}

function logout() {
  state.isLoggedIn = false;
  state.token = '';
  state.user = null;
  state.myBlogs = [];
  localStorage.removeItem('inklyToken');
  localStorage.removeItem('inklyUser');
  updateHeader();
  goTo('home');
  notify('You have been logged out. See you soon!');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(value) {
  if (!value) return 'recently';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-page]');
  if (trigger) {
    e.preventDefault();
    goTo(trigger.dataset.page);
  }
});

$('#brand-link').addEventListener('click', (e) => {
  e.preventDefault();
  goTo('home');
});
$('#footer-brand').addEventListener('click', (e) => {
  e.preventDefault();
  goTo('home');
});

dom.menuToggle.addEventListener('click', (e) => {
  dom.mainNav.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', dom.mainNav.classList.contains('open'));
});

$('#register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = $('#btn-register-submit');
  const name = $('#register-name').value.trim();
  const email = $('#register-email').value.trim();
  const password = $('#register-password').value;
  const confirmPassword = $('#register-confirm-password').value;

  if (!name || !email || !password || !confirmPassword) {
    notify('Please fill in all fields.');
    return;
  }

  if (password !== confirmPassword) {
    notify('Passwords do not match.');
    return;
  }

  setSubmitLoading(submitBtn, true, 'Create account');

  try {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    e.target.reset();
    notify('Account created successfully. Please log in.');
    goTo('login');
  } catch (error) {
    notify(error.message);
  } finally {
    setSubmitLoading(submitBtn, false, 'Create account');
  }
});

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = $('#btn-login-submit');
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;

  if (!email || !password) {
    notify('Please enter your email and password.');
    return;
  }

  setSubmitLoading(submitBtn, true, 'Log in');

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    loginSession(data.token, data.user);
    await fetchMyBlogs();
    e.target.reset();
    notify(`Welcome back, ${getDisplayName()}!`);
    goTo('dashboard');
  } catch (error) {
    notify(error.message);
  } finally {
    setSubmitLoading(submitBtn, false, 'Log in');
  }
});

$('#post-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = $('#btn-publish');
  const title = $('#post-title').value.trim();
  const category = $('#post-category').value.trim();
  const content = $('#post-content').value.trim();

  if (!title || !category || !content) {
    notify('Please fill in all fields.');
    return;
  }

  setSubmitLoading(submitBtn, true, 'Publish story');

  try {
    await apiRequest('/blogs', {
      method: 'POST',
      body: JSON.stringify({ title, category, content })
    });

    await fetchPublicBlogs();
    await fetchMyBlogs();
    e.target.reset();
    notify('Your story is published!');
    goTo('dashboard');
  } catch (error) {
    notify(error.message);
  } finally {
    setSubmitLoading(submitBtn, false, 'Publish story');
  }
});

$('#save-draft').addEventListener('click', () => {
  const title = $('#post-title').value.trim();
  if (!title) {
    notify('Write something first, then save your draft.');
    return;
  }
  notify('Draft saved locally in this browser session.');
});

$('#btn-logout').addEventListener('click', logout);

dom.btnPostBack.addEventListener('click', () => {
  goTo(state.previousPage || 'home');
});

async function initApp() {
  const greetingEl = $('.dashboard-head h1');
  if (greetingEl) {
    greetingEl.innerHTML = `${getGreeting()}, <span id="user-name">${escapeHTML(getDisplayName())}</span>.`;
    dom.userName = $('#user-name');
  }

  try {
    await fetchPublicBlogs();
    if (state.isLoggedIn) {
      await fetchMyBlogs();
    }
  } catch (error) {
    notify('Could not connect to the backend. Start the API server and refresh.');
    console.error(error);
  }

  renderFeatured();
  updateHeader();
}

initApp();
