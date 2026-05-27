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

    // 4. Cinematic Canvas Scroll Background
    const scrollCanvas = document.getElementById('scroll-bg-canvas');
    const scrollOverlay = document.getElementById('scroll-bg-overlay');
    const heroSection = document.getElementById('hero');

    if (scrollCanvas && heroSection) {
        const TOTAL_FRAMES = 480;
        const LERP = 0.08;
        const CONCURRENCY = 24;
        
        const ctx = scrollCanvas.getContext('2d');
        const frames = new Array(TOTAL_FRAMES);
        
        let loadedCount = 0;
        let isReady = false;
        let currentFrame = 0;
        let targetFrame = 0;
        
        // Resize canvas
        function resizeCanvas() {
            scrollCanvas.width = window.innerWidth;
            scrollCanvas.height = window.innerHeight;
            if (isReady) drawFrame(Math.round(currentFrame));
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Load frames
        function frameName(i) {
            return `assets/frames-webp/frame_${String(i + 1).padStart(6, '0')}.webp`;
        }
        
        async function loadFrame(idx) {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => {
                    frames[idx] = img;
                    loadedCount++;
                    if (loadedCount === 1) {
                        isReady = true;
                        drawFrame(0);
                    }
                    resolve();
                };
                img.onerror = () => {
                    frames[idx] = null;
                    loadedCount++;
                    resolve();
                };
                img.src = frameName(idx);
            });
        }
        
        async function loadAllFrames() {
            const queue = Array.from({ length: TOTAL_FRAMES }, (_, i) => i);
            async function worker() {
                while (queue.length > 0) {
                    const idx = queue.shift();
                    await loadFrame(idx);
                }
            }
            await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
        }
        
        loadAllFrames().then(() => {
            isReady = true;
        });
        
        // Draw frame (cover-fit)
        function drawFrame(idx) {
            const img = frames[Math.max(0, Math.min(idx, TOTAL_FRAMES - 1))];
            if (!img) return;
            const W = scrollCanvas.width;
            const H = scrollCanvas.height;
            const r = Math.max(W / img.naturalWidth, H / img.naturalHeight);
            const iw = img.naturalWidth * r;
            const ih = img.naturalHeight * r;
            const x = (W - iw) / 2;
            const y = (H - ih) / 2;
            
            ctx.clearRect(0, 0, W, H);
            ctx.drawImage(img, x, y, iw, ih);
        }
        
        // Scroll logic
        window.addEventListener('scroll', () => {
            if (!isReady) return;
            const heroHeight = heroSection.offsetHeight;
            const scrollY = window.scrollY;
            
            if (scrollY >= heroHeight) {
                scrollCanvas.classList.add('visible');
                scrollOverlay.classList.add('visible');
                
                const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight - heroHeight;
                let progress = 0;
                if (scrollableDistance > 0) {
                    progress = (scrollY - heroHeight) / scrollableDistance;
                }
                progress = Math.max(0, Math.min(1, progress));
                targetFrame = progress * (TOTAL_FRAMES - 1);
            } else {
                scrollCanvas.classList.remove('visible');
                scrollOverlay.classList.remove('visible');
            }
        }, { passive: true });
        
        // Render loop
        function renderLoop() {
            if (isReady && Math.abs(targetFrame - currentFrame) > 0.01) {
                currentFrame += (targetFrame - currentFrame) * LERP;
                drawFrame(Math.round(currentFrame));
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);
    }
});
