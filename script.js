document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navbar Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Scroll Animations (Intersection Observer)
    const fadeUpElements = document.querySelectorAll('.fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    fadeUpElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Cinematic Scroll Background
    const scrollVideo = document.getElementById('scroll-bg-video');
    const scrollOverlay = document.getElementById('scroll-bg-overlay');
    const heroSection = document.getElementById('hero');

    if (scrollVideo && heroSection) {
        let targetTime = 0;
        let currentTime = 0;
        let isReady = false;
        let duration = 0;

        scrollVideo.addEventListener('loadedmetadata', () => {
            isReady = true;
            duration = scrollVideo.duration;
            scrollVideo.currentTime = 0.01; // Force first frame
        });

        window.addEventListener('scroll', () => {
            if (!isReady || !duration) return;
            const heroHeight = heroSection.offsetHeight;
            const scrollY = window.scrollY;
            
            if (scrollY >= heroHeight) {
                scrollVideo.classList.add('visible');
                scrollOverlay.classList.add('visible');
                
                const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight - heroHeight;
                let progress = 0;
                if (scrollableDistance > 0) {
                    progress = (scrollY - heroHeight) / scrollableDistance;
                }
                progress = Math.max(0, Math.min(1, progress));
                targetTime = progress * duration;
            } else {
                scrollVideo.classList.remove('visible');
                scrollOverlay.classList.remove('visible');
            }
        }, { passive: true });

        function renderLoop() {
            if (isReady && Math.abs(targetTime - currentTime) > 0.01) {
                currentTime += (targetTime - currentTime) * 0.08; // LERP
                scrollVideo.currentTime = currentTime;
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);
    }
});
