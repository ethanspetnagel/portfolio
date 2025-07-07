/* Church California CSS - Updated to match slug.css styling */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 60);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }
        this.el.textContent = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Smooth Scroll without Snap Points
class SmoothScroll {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            resistance: options.resistance || 0.8,
            damping: options.damping || 0.08,
            ...options
        };

        this.currentScroll = 0;
        this.targetScroll = 0;
        this.isScrolling = false;

        this.init();
    }

    init() {
        // Override native scroll
        this.element.style.overflow = 'hidden';
        this.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Touch support
        let touchStart = 0;
        this.element.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        });

        this.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchDelta = touchStart - e.touches[0].clientY;
            this.targetScroll += touchDelta * 0.5;
            touchStart = e.touches[0].clientY;
            this.clampScroll();
        }, { passive: false });

        // Start animation loop
        this.animate();
    }

    onWheel(e) {
        e.preventDefault();

        // Add resistance to scroll
        const delta = e.deltaY * this.options.resistance;
        this.targetScroll += delta;

        this.clampScroll();

        if (!this.isScrolling) {
            this.isScrolling = true;
            this.element.classList.add('scrolling');
        }

        // Clear timeout for scroll end detection
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.element.classList.remove('scrolling');
        }, 150);
    }

    clampScroll() {
        const maxScroll = this.element.scrollHeight - this.element.clientHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
    }

    animate() {
        // Smooth interpolation without snapping
        const diff = this.targetScroll - this.currentScroll;
        this.currentScroll += diff * this.options.damping;

        // Apply scroll
        this.element.scrollTop = this.currentScroll;

        // Continue animation
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const cursorLabel = document.getElementById('cursorLabel');
    const homeLink = document.getElementById('home-link');
    const churchLink = document.getElementById('church-link');
    const tabs = document.querySelectorAll('.essay-tab');
    const essays = document.querySelectorAll('.essay-text');
    const projects = document.querySelectorAll('.project-set');
    const essaySidebar = document.querySelector('.essay-sidebar');
    const projectGallery = document.querySelector('.project-gallery');

    // --- NAVIGATION ARROW HOVER LABELS ---
    function setupArrowHover(arrowElement, labelText) {
        if (!arrowElement) return;

        arrowElement.addEventListener('mouseenter', (e) => {
            if (cursorLabel) {
                cursorLabel.textContent = labelText;
                cursorLabel.style.display = 'block';
            }
        });

        arrowElement.addEventListener('mousemove', (e) => {
            if (cursorLabel) {
                cursorLabel.style.left = `${e.clientX}px`;
                cursorLabel.style.top = `${e.clientY}px`;
            }
        });

        arrowElement.addEventListener('mouseleave', () => {
            if (cursorLabel) {
                cursorLabel.style.display = 'none';
            }
        });
    }

    setupArrowHover(homeLink, 'HOME');
    setupArrowHover(churchLink, 'CHURCH');

    // --- TAB SWITCHING LOGIC ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const index = tab.dataset.index;

            // Update active states for tabs, essays, and projects
            [tabs, essays, projects].forEach(collection => {
                collection.forEach(item => item.classList.remove('active'));
            });

            tab.classList.add('active');
            document.querySelector(`.essay-text[data-index="${index}"]`)?.classList.add('active');
            document.querySelector(`.project-set[data-index="${index}"]`)?.classList.add('active');

            // Reset scroll positions
            if (essaySidebar) essaySidebar.scrollTop = 0;
            if (projectGallery) projectGallery.scrollTop = 0;
        });
    });

    // --- INFO TOGGLE FOR PROJECT DETAILS ---
    document.querySelectorAll('.info-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const panel = toggle.nextElementSibling;
            const isActive = toggle.classList.contains('active');

            // Close all other panels
            document.querySelectorAll('.info-toggle.active').forEach(t => {
                if (t !== toggle) {
                    t.classList.remove('active');
                    const otherPanel = t.nextElementSibling;
                    if (otherPanel) {
                        otherPanel.classList.remove('active');
                        otherPanel.style.maxHeight = '0';
                    }
                }
            });

            // Toggle the current panel
            toggle.classList.toggle('active');
            if (panel) {
                panel.classList.toggle('active');
                panel.style.maxHeight = isActive ? '0' : panel.scrollHeight + 'px';
            }
        });
    });

    // --- INITIALIZE FIRST TAB ---
    const firstTab = document.querySelector('.essay-tab');
    if (firstTab) {
        firstTab.click();
    }
});