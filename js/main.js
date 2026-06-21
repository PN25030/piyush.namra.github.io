document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. THEME TOGGLER (LIGHT / DARK MODE)
    // --------------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;

    // Check system preference or stored preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
        rootElement.setAttribute('data-theme', storedTheme);
    } else {
        rootElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        rootElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --------------------------------------------------------------------------
    // 2. MOBILE NAVIGATION MENU
    // --------------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu visibility
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = mobileToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // --------------------------------------------------------------------------
    // 3. SCROLL ACTIVE LINK HIGHLIGHTING
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // offset for fixed header
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*=${sectionId}]`);
            
            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink(); // Run on initial load

    // --------------------------------------------------------------------------
    // 4. REVEAL-ON-SCROLL ANIMATIONS
    // --------------------------------------------------------------------------
    const animateElements = document.querySelectorAll('.card, .section-header, .hero-content, .hero-image-wrapper');
    
    // Add initial opacity state for clean loading
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
    });

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
                observer.unobserve(target); // Only animate once
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // --------------------------------------------------------------------------
    // 5. CONTACT FORM INTERACTIVE SUBMIT
    // --------------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Note: If using formspree, let it submit naturally unless handling via fetch.
            // Here, we provide standard interactive UI feedback.
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending Message...';
            }
        });
    }

    // --------------------------------------------------------------------------
    // 6. COLLAPSIBLE PROFESSIONAL EXPERIENCE
    // --------------------------------------------------------------------------
    // Start timeline entries collapsed and add accessible toggle buttons
    const timelineContents = document.querySelectorAll('.timeline-content');
    timelineContents.forEach(tc => {
        tc.classList.add('collapsed');

        const btn = document.createElement('button');
        btn.className = 'toggle-details';
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Show more';

        btn.addEventListener('click', () => {
            const isCollapsed = tc.classList.toggle('collapsed'); // true if now collapsed
            btn.setAttribute('aria-expanded', String(!isCollapsed));
            btn.textContent = isCollapsed ? 'Show more' : 'Show less';
        });

        tc.appendChild(btn);
    });

    // --------------------------------------------------------------------------
    // 7. TIMELINE DURATION CALCULATION
    // --------------------------------------------------------------------------
    // Parse period strings like "Feb 2026 – Present" or "Mar 2010 – Jan 2015"
    function parsePeriod(periodStr){
        if(!periodStr) return 0;
        // Normalize dash
        const parts = periodStr.split(/–|—|-|to/).map(p => p.trim());
        if(parts.length === 0) return 0;
        const monthsMap = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};

        function parseToken(tok){
            if(!tok) return null;
            if(/Present|present|Current|current/.test(tok)) return new Date();
            // try to match 'Mon YYYY' or 'Month YYYY' or 'YYYY'
            const m = tok.match(/([A-Za-z]{3,9})\s*(\d{4})/);
            if(m){
                const mon = m[1].slice(0,3);
                const yr = parseInt(m[2],10);
                const monthIdx = monthsMap[mon] !== undefined ? monthsMap[mon] : 0;
                return new Date(yr, monthIdx, 1);
            }
            const y = tok.match(/(\d{4})/);
            if(y) return new Date(parseInt(y[1],10),0,1);
            return null;
        }

        const start = parseToken(parts[0]);
        const end = parts[1] ? parseToken(parts[1]) : new Date();
        if(!start || !end) return 0;
        // compute months diff
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return Math.max(0, Math.round(months));
    }

    // Format duration into human friendly label
    function formatDuration(months){
        if(months <= 0) return '0 mos';
        const yrs = Math.floor(months/12);
        const rem = months % 12;
        if(yrs >= 2) return `${yrs} yrs${rem? ' ' + rem + ' mos' : ''}`;
        if(yrs === 1) return `1 yr${rem? ' ' + rem + ' mos' : ''}`;
        return `${rem} mos`;
    }

    // Apply duration visuals to markers
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        const periodEl = item.querySelector('.time-period');
        const marker = item.querySelector('.timeline-marker');
        if(!periodEl || !marker) return;
        const months = parsePeriod(periodEl.textContent || periodEl.innerText);
        const label = formatDuration(months);
        // scale: base 1, +0.06 per 6 months, clamp
        const scale = Math.min(2.2, Math.max(0.9, 1 + (months / 12) * 0.12));
        const height = Math.min(260, Math.max(18, months * 3)); // px
        marker.setAttribute('data-duration-text', label);
        marker.style.setProperty('--duration-scale', scale);
        marker.style.setProperty('--duration-height', height + 'px');

        // also add a duration label inside the experience block (next to the time-period)
        let durationSpan = item.querySelector('.duration-label');
        if(!durationSpan){
            durationSpan = document.createElement('span');
            durationSpan.className = 'duration-label';
            periodEl.insertAdjacentElement('afterend', durationSpan);
        }
        durationSpan.textContent = label;
    });

    // Add hover listeners to ensure marker scales also on keyboard focus
    timelineItems.forEach(item => {
        item.addEventListener('mouseenter', () => item.classList.add('hovered'));
        item.addEventListener('mouseleave', () => item.classList.remove('hovered'));
        item.addEventListener('focusin', () => item.classList.add('hovered'));
        item.addEventListener('focusout', () => item.classList.remove('hovered'));
    });

});
