document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Scroll behavior removed - no header changes on scroll

  // Countdown Timer Logic (Recurring 4 Hour Cycle)
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const cycleHours = 4;

    function updateTimer() {
      const now = new Date();
      const totalSeconds = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
      const cycleSeconds = cycleHours * 3600;
      const remaining = cycleSeconds - (totalSeconds % cycleSeconds);

      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;

      countdownEl.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    setInterval(updateTimer, 1000);
    updateTimer();
  }

  // Simple intersection observer for fade-in elements (future use)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  });

  // 4. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const body = document.body;

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link (unless it has a submenu)
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.classList.contains('has-submenu')) {
          e.preventDefault();
          const submenuId = link.getAttribute('data-submenu');
          const submenu = document.getElementById(`submenu-${submenuId}`);

          link.classList.toggle('active');
          if (submenu) {
            submenu.classList.toggle('active');
          }
          return;
        }

        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        body.style.overflow = '';
      });
    });
  }

  // Cookie Consent Logic
  const cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner && !localStorage.getItem('cookieConsent')) {
    // Small delay to allow fade-in animation
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 1000);
  }
});

// Global Function for Cookie Buttons
function acceptCookie(type) {
  localStorage.setItem('cookieConsent', type);
  const cookieBanner = document.getElementById('cookie-banner');
  cookieBanner.classList.remove('show'); // Hide via CSS transition/animation reversing would be better but simple hide works
  cookieBanner.style.display = 'none'; // Force hide
}

// Stripe Checkout Integration
// Stripe Checkout Integration
async function proceedToStripeCheckout(source) {
  // Get form fields based on source (hero or main checkout)
  const nameField = source === 'hero' ? 'full-name-hero' : 'full-name';
  const emailField = source === 'hero' ? 'email-hero' : 'email';

  const name = document.getElementById(nameField).value.trim();
  const email = document.getElementById(emailField).value.trim();

  // Validation
  if (!name || !email) {
    alert('Please fill in your name and email address.');
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Store customer info in localStorage for later use
  localStorage.setItem('mpdc_customer_name', name);
  localStorage.setItem('mpdc_customer_email', email);

  // 🧲 CAPTURE LEAD (Before Redirect)
  // This sends the data to your Vercel server so you have it even if they don't buy
  try {
    await fetch('https://webhook-server-xi-nine.vercel.app/capture-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
  } catch (e) {
    console.error('Lead capture failed (silent error):', e);
  }

  // ACTUAL Stripe Checkout URL (Using TEST link for safe testing)
  const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_8x2cN5bU09Mt8dIdI06EU00';

  // Redirect to Stripe, pre-filling the email address
  window.location.href = `${STRIPE_CHECKOUT_URL}?prefilled_email=${encodeURIComponent(email)}`;
}

// Countdown Timer (2 Days, 15 Hours, 8 Mins from now simulation)
function startTimer() {
  // 2d 15h 8m 41s
  let timeInSeconds = (2 * 24 * 60 * 60) + (15 * 60 * 60) + (8 * 60) + 41;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  const interval = setInterval(() => {
    timeInSeconds--;

    if (timeInSeconds < 0) {
      clearInterval(interval);
      return;
    }

    const days = Math.floor(timeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((timeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }, 1000);
}

document.addEventListener('DOMContentLoaded', startTimer);

/* -----------------------
   Login & LMS Logic
   ----------------------- */
const AUTH_TOKEN_KEY = 'mpdc_user_token';
const COURSE_PROGRESS_KEY = 'mpdc_course_progress';

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // TODO: SECURITY WARNING - MOCK AUTHENTICATION
  // This is a placeholder for demonstration. It accepts ANY email/password.
  // DO NOT DEPLOY TO PRODUCTION WITHOUT IMPLEMENTING REAL AUTH (e.g., Supabase Auth).
  if (email && password) {
    // 1. Set Auth Token (Mock)
    localStorage.setItem(AUTH_TOKEN_KEY, 'demo_token_' + Date.now());

    // 2. Set Initial User Profile (Mock)
    const userProfile = {
      name: 'Greg Montoya',
      initials: 'GM',
      email: email
    };
    localStorage.setItem('mpdc_user_profile', JSON.stringify(userProfile));

    // 3. Navigate to dashboard
    window.location.href = 'dashboard.html';
  } else {
    alert('Please enter a valid email and password.');
  }
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.location.href = 'login.html';
}

function markLessonComplete(moduleId) {
  let progress = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY)) || [];
  if (!progress.includes(moduleId)) {
    progress.push(moduleId);
    localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(progress));
    updateProgressUI();
    alert('Lesson Marked Complete!');
  }
}

function updateProgressUI() {
  const progress = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY)) || [];

  // Update sidebar icons
  document.querySelectorAll('.lms-module-link').forEach((link, index) => {
    const moduleId = index + 1; // Simple 1-based index mapping
    const iconSpan = link.querySelector('.module-icon');

    if (progress.includes(moduleId)) {
      // Checked icon for completed
      iconSpan.innerHTML = '<i class="fas fa-check-circle" style="color: var(--color-neon);"></i>';
    } else if (link.classList.contains('active')) {
      // Play icon for active
      iconSpan.innerHTML = '<i class="fas fa-play-circle"></i>';
    } else {
      // Lock icon for standard/locked (or could use play-circle if open navigation)
      iconSpan.innerHTML = '<i class="fas fa-play-circle"></i>';
    }
  });
}

// Check Auth & Initialize LMS (for course.html)
if (window.location.pathname.includes('course.html')) {

  const COURSE_MODULES = [
    {
      id: 0,
      title: "INTRODUCTION",
      subtitle: "Welcome",
      videoid: "YOUR_INTRO_VIDEO_ID",
      description: "Welcome to the system. Before we begin, you're going to set One Big Goal, a goal so meaningful that when you achieve it, you'll want to tell everyone. This exercise will give you the clarity and focus you need to get the most out of everything that follows.",
      resources: [
        { title: "One Big Goal.pdf", size: "0.5 MB", type: "PDF Document", url: "../assets/resources/One_Big_Goal.pdf" }
      ]
    },
    {
      id: 1,
      title: "A Memory in Your Future",
      description: "Stop building your life through the rearview mirror. This module installs the Future Memory protocol, a cognitive framework that pulls you toward your potential.",
      videoid: "CSJQf3I5b8c",
      resources: [
        { title: "The Full Decision Worksheet.pdf", type: "pdf", size: "2.4 MB" },
        { title: "Audio Version - Module 1.mp3", type: "audio", size: "15.2 MB" }
      ]
    },
    {
      id: 2,
      title: "Resolving Your Past",
      description: "Unresolved history acts as an anchor. This phase focuses on making peace with previous chapters to stop the cycle of emotional debt.",
      videoid: "YB8N1BwHIP4",
      resources: [
        { title: "Cognitive Trust Exercises.pdf", type: "pdf", size: "1.8 MB" }
      ]
    },
    {
      id: 3,
      title: "Rebuilding Your Reality Chain",
      description: "You aren't just a 'divorced man'. We define who you are becoming by auditing and dismantling limiting belief systems.",
      videoid: "h6c7Bq1FgQw",
      resources: [
        { title: "Identity Map Template.pdf", type: "pdf", size: "3.1 MB" },
        { title: "Core Values Audit.pdf", type: "pdf", size: "1.2 MB" }
      ]
    },
    {
      id: 4,
      title: "Designing Your Ideal Future",
      description: "Most people inhabit a life they never actually chose. Here, we move beyond vague goals and into rigorous life architecture.",
      videoid: "5z8wdMWwZN8",
      resources: [
        { title: "Communication Scripts.pdf", type: "pdf", size: "4.5 MB" }
      ]
    },
    {
      id: 5,
      title: "Scarcity to Abundance",
      description: "Operating from a fear state is a radical barrier. This module flips the script on how you view your resources and value.",
      videoid: "5GyRVx-Jn4k",
      resources: [
        { title: "Dating Red Flags Checklist.pdf", type: "pdf", size: "1.1 MB" }
      ]
    }
  ];

  let currentModuleId = 0;

  function loadModule(moduleId) {
    const module = COURSE_MODULES.find(m => m.id === moduleId);
    if (!module) return;

    currentModuleId = moduleId;

    // 1. Update Breadcrumb
    const breadcrumb = document.getElementById('breadcrumb-module');
    if (breadcrumb) breadcrumb.textContent = `Module ${module.id}: ${module.title}`;

    // 2. Update Video Player (Toggle between YouTube & Local)
    const iframe = document.getElementById('lesson-video-frame');
    const localVideo = document.getElementById('lesson-local-video');
    const localSource = document.getElementById('lesson-video-source');

    if (module.localVideo && localVideo && localSource) {
      // PLAY LOCAL VIDEO
      if (iframe) iframe.style.display = 'none'; // Hide YouTube
      localVideo.style.display = 'block'; // Show Local

      localSource.src = module.localVideo;
      localVideo.load(); // Reload video with new source
    } else if (module.videoid && iframe) {
      // PLAY YOUTUBE
      if (localVideo) {
        localVideo.style.display = 'none';
        localVideo.pause(); // Ensure local is stopped
      }
      iframe.style.display = 'block';
      iframe.src = `https://www.youtube.com/embed/${module.videoid}?enablejsapi=1&rel=0`;
    }

    // 3. Update Text Content
    const title = document.getElementById('lesson-title');
    const desc = document.getElementById('lesson-description');
    if (title) title.textContent = module.title;
    if (desc) desc.textContent = module.description;

    // 4. Update Resources
    const resourcesList = document.getElementById('resources-list');
    if (resourcesList) {
      resourcesList.innerHTML = ''; // Clear existing
      module.resources.forEach(res => {
        const iconClass = res.type === 'pdf' ? 'fa-file-pdf' : (res.type === 'audio' ? 'fa-file-audio' : 'fa-file-alt');
        const iconColor = res.type === 'pdf' ? '#F40F02' : (res.type === 'audio' ? '#4CAF50' : '#888');
        const downloadUrl = res.url || '#';
        const targetAttr = downloadUrl !== '#' ? 'target="_blank"' : '';

        const html = `
                <div class="resource-item">
                    <div class="resource-icon" style="color: ${iconColor};"><i class="fas ${iconClass}"></i></div>
                    <div>
                        <div style="font-weight: 700; color: var(--color-text-light);">${res.title}</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">${res.size} • ${res.type.toUpperCase()}</div>
                    </div>
                    <div style="margin-left: auto;">
                        <a href="${downloadUrl}" ${targetAttr} style="color: var(--color-text-light); opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                </div>`;
        resourcesList.insertAdjacentHTML('beforeend', html);
      });
    }

    // 5. Update Sidebar Active State
    document.querySelectorAll('.lms-module-link').forEach((link) => {
      // Use data-id attribute for robust matching
      const linkId = parseInt(link.getAttribute('data-id'));
      if (linkId === moduleId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    updateProgressUI();
  }

  // 1. Auth Guard
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    window.location.href = 'login.html';
  }

  // 2. Initialize UI
  document.addEventListener('DOMContentLoaded', () => {
    // Initial Load - Start with Module 0 (Intro)
    loadModule(0);

    // Bind Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }

    // Bind Mark Complete
    const completeBtn = document.getElementById('mark-complete-btn'); // Uses new ID
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        markLessonComplete(currentModuleId);
      });
    }

    // Bind Next Lesson
    const nextBtn = document.getElementById('next-lesson-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        // Find next ID
        const currentIndex = COURSE_MODULES.findIndex(m => m.id === currentModuleId);
        if (currentIndex !== -1 && currentIndex < COURSE_MODULES.length - 1) {
          const nextModule = COURSE_MODULES[currentIndex + 1];
          loadModule(nextModule.id);
        }
      });
    }

    // Sidebar Navigation Interactivity
    const videoLinks = document.querySelectorAll('.lms-module-link');
    videoLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = parseInt(link.getAttribute('data-id'));
        if (!isNaN(targetId)) {
          loadModule(targetId);
        }
      });
    });
  });
}

// User Menu Popup Logic
window.toggleUserMenu = function () {
  const popup = document.getElementById('user-menu-popup');
  if (popup) {
    popup.classList.toggle('active');
  }
}

// Close User Menu when clicking outside
document.addEventListener('click', function (event) {
  const profile = document.querySelector('.user-profile');
  const popup = document.getElementById('user-menu-popup');

  if (profile && popup && popup.classList.contains('active')) {
    // If click is NOT inside the profile (which includes the popup markup wise usually, but let's check hierarchy)
    // Actually, the popup is INSIDE the profile div in my HTML. 
    // So clicking inside the popup OR the profile trigger is fine.
    // We only want to close if clicking OUTSIDE the profile div.

    if (!profile.contains(event.target)) {
      popup.classList.remove('active');
    }
  }
});

// Bind Logout to new link
document.addEventListener('DOMContentLoaded', () => {
  const newLogoutBtn = document.querySelector('.user-menu-item.logout');
  if (newLogoutBtn) {
    newLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout(); // Call the global logout function
    });
  }
});

/* -----------------------
   Blog Logic (Filter & Counts)
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return; // Only run on blog index page

  const filterLinks = document.querySelectorAll('.category-link');
  const blogCards = document.querySelectorAll('.blog-card');
  const featuredArticle = document.querySelector('.featured-article');

  // 1. Initial Count Update
  updateCategoryCounts();

  // 2. Filter Event Listeners (Sidebar)
  // Sidebar links are now hard links to category-*.html pages. 
  // No JS interference needed.

  // 3. Filter Event Listeners (Card Categories)
  const categoryTags = document.querySelectorAll('.article-category');
  const catMap = {
    'mindset': 'category-mindset.html',
    'strategy': 'category-strategy.html',
    'relationships': 'category-relationships.html',
    'parenting': 'category-parenting.html',
    'finances': 'category-finances.html',
    'health': 'category-mindset.html' // Fallback or new page if created
  };

  categoryTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      // Allow default behavior if it's already an <a> tag with href, 
      // BUT we want to ensure it goes to the right file if the href is just '#'
      const cat = tag.getAttribute('data-category');
      if (cat && catMap[cat]) {
        e.preventDefault();
        window.location.href = catMap[cat];
      }
    });
  });

  // Helper for counts (still useful for the "All" page, 
  // though static pages might need manual counts or a different approach.
  // We'll leave it running for blog-index.html but safeguard it)
  if (document.querySelector('.category-link[data-category="all"]')) {
    updateCategoryCounts();
  }

  function updateCategoryCounts() {
    // 1. Get totals
    const counts = {
      'all': blogCards.length + (featuredArticle ? 1 : 0),
      'mindset': 0,
      'strategy': 0,
      'relationships': 0,
      'parenting': 0,
      'finances': 0,
      'health': 0
    };

    // Count grid items
    blogCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      if (counts[cat] !== undefined) counts[cat]++;
    });

    // Count featured item (hardcoded for now as strategy)
    if (featuredArticle) {
      counts['strategy']++;
    }

    // 2. Update DOM
    filterLinks.forEach(link => {
      const cat = link.getAttribute('data-category');
      const countSpan = link.querySelector('.count');
      if (countSpan && counts[cat] !== undefined) {
        countSpan.textContent = `(${counts[cat]})`;
      }
    });
  }
});
