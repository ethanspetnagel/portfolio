// Project media mapping with brightness info
const projectMedia = {
    'slug': {
        url: './church video bg.mp4',
        isDark: false  // slug video appears to be dark
    }, 
    'church': {
        url: './church video bg.mp4',
        isDark: true  // Church video appears to be dark
    },
    'talamel': '', 
    'fox-and-lion': '', 
    'cardioscape': '', 
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        isDark: false  // Lu Rose Gold video appears to be light
    },
    'green-lake-law': '', 
    'artwork': '', 
    'june-2025': ''
};

// Bio link images
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': '',
    'crowe': '',
    'colorado': ''
};

// DOM Elements
const fullscreenBg = document.getElementById('fullscreenBg');
let bgVideo = document.getElementById('bgVideo');
let bgImage = document.getElementById('bgImage');
const projectLinks = document.querySelectorAll('.project-link');
const projectsContainer = document.querySelector('.projects-container');
const dateText = document.getElementById('dateText');
const aboutToggle = document.getElementById('aboutToggle');
const bioContent = document.getElementById('bioContent');
const bioLinks = document.querySelectorAll('.bio-text a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');

// Variables
let currentMedia = null;
let activeProject = null;
let videoPool = {};
let currentActiveVideo = null;

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Initialize video pool for instant playback
function initializeVideoPool() {
    // Remove old video/image elements
    if (bgVideo) bgVideo.remove();
    if (bgImage) bgImage.remove();
    
    // Create video elements for each project
    Object.entries(projectMedia).forEach(([project, mediaInfo]) => {
        const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
        if (url && url.includes('.mp4')) {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = false;
            video.preload = 'auto';
            video.style.position = 'absolute';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.opacity = '0';
            video.style.display = 'none';
            video.style.transition = 'opacity 0.1s linear';
            video.dataset.project = project;
            
            // Hardware acceleration
            video.style.transform = 'translateZ(0)';
            video.style.webkitTransform = 'translateZ(0)';
            video.style.backfaceVisibility = 'hidden';
            
            // Add to DOM
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            
            // Force load
            video.load();
            
            // Ensure video is ready
            video.addEventListener('canplaythrough', () => {
                console.log(`${project} video ready`);
            });
        }
    });
}

// Show video instantly
function showVideo(project) {
    const video = videoPool[project];
    if (!video) return false;
    
    // Hide current video if exists
    if (currentActiveVideo && currentActiveVideo !== video) {
        currentActiveVideo.style.opacity = '0';
        setTimeout(() => {
            currentActiveVideo.style.display = 'none';
            currentActiveVideo.pause();
        }, 100);
    }
    
    // Apply filter
    if (project !== 'church') {
        video.style.filter = 'brightness(0.9)';
    } else {
        video.style.filter = 'none';
    }
    
    // Show new video instantly
    video.style.display = 'block';
    video.play().catch(e => {
        console.log('Play failed, retrying...', e);
        // Retry on interaction
        document.addEventListener('click', () => {
            video.play();
        }, { once: true });
    });
    
    // Fade in
    requestAnimationFrame(() => {
        video.style.opacity = '1';
        fullscreenBg.classList.add('active');
        fullscreenBg.style.opacity = '1';
    });
    
    currentActiveVideo = video;
    currentMedia = projectMedia[project];
    
    // Apply text color based on video brightness
    const mediaInfo = projectMedia[project];
    if (mediaInfo && typeof mediaInfo === 'object' && mediaInfo.isDark !== undefined) {
        if (mediaInfo.isDark) {
            document.body.classList.add('video-dark');
            document.body.classList.remove('video-light');
        } else {
            document.body.classList.add('video-light');
            document.body.classList.remove('video-dark');
        }
    }
    
    return true;
}

// Hide all media
function hideAllMedia() {
    fullscreenBg.classList.remove('active');
    fullscreenBg.style.opacity = '0';
    
    if (currentActiveVideo) {
        currentActiveVideo.style.opacity = '0';
        setTimeout(() => {
            currentActiveVideo.style.display = 'none';
            currentActiveVideo.pause();
            currentActiveVideo = null;
        }, 100);
    }
    
    // Remove video color classes
    document.body.classList.remove('video-dark', 'video-light');
    
    currentMedia = null;
}

// Text scramble effect
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.update = this.update.bind(this);
    }
    
    setText(newText, showName = false) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length, 15);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        this.showName = showName;
        this.targetText = newText;
        this.nameText = 'ETHAN SPETNAGEL';
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 60);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.nameShown = false;
        this.namePauseComplete = false;
        this.nameRevealComplete = false;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        if (this.showName && this.frame >= 20 && !this.nameRevealComplete) {
            const nameProgress = Math.min((this.frame - 20) / 40, 1);
            const nameCharsToShow = Math.floor(this.nameText.length * nameProgress);
            
            for (let i = 0; i < this.nameText.length; i++) {
                if (i < nameCharsToShow) {
                    output += this.nameText[i];
                } else {
                    output += this.randomChar();
                }
            }
            
            this.el.textContent = output;
            
            if (nameProgress >= 1) {
                this.nameRevealComplete = true;
            }
        } else if (this.nameRevealComplete && this.frame < 120 && !this.namePauseComplete) {
            this.el.textContent = this.nameText;
            if (this.frame >= 120) {
                this.namePauseComplete = true;
            }
        } else if (this.namePauseComplete || !this.showName) {
            const adjustedFrame = this.showName ? this.frame - 120 : this.frame;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                
                if (adjustedFrame >= end) {
                    complete++;
                    output += to;
                } else if (adjustedFrame >= start) {
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
        }
        
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

// Text Parting Effect
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
    }

    init() {
        this.wrapWordsInSpans();
        
        const bioTexts = document.querySelectorAll('.bio-text');
        
        bioTexts.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.startParting(e.target));
            element.addEventListener('mousemove', (e) => this.updateParting(e));
            element.addEventListener('mouseleave', (e) => this.endParting(e.target));
        });
    }

    wrapWordsInSpans() {
        const bioTexts = document.querySelectorAll('.bio-text p, .bio-text a');
        
        bioTexts.forEach(element => {
            if (element.querySelector('.word')) return;
            
            const textNodes = this.getTextNodes(element);
            
            textNodes.forEach(node => {
                const words = node.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                
                words.forEach(word => {
                    if (word.trim() !== '') {
                        const span = document.createElement('span');
                        span.className = 'word';
                        span.textContent = word;
                        fragment.appendChild(span);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                
                node.parentNode.replaceChild(fragment, node);
            });
        });
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim() !== '') {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }

    startParting(element) {
        if (!this.activeElements.has(element)) {
            const words = element.querySelectorAll('.word');
            const wordData = new Map();
            
            words.forEach(word => {
                const rect = word.getBoundingClientRect();
                wordData.set(word, {
                    rect: rect,
                    originalTransform: word.style.transform || '',
                    isActive: true
                });
            });
            
            this.activeElements.set(element, {
                words: wordData,
                isActive: true
            });
        }
    }

    updateParting(event) {
        const element = event.target.closest('.bio-text');
        const data = this.activeElements.get(element);
        
        if (!data || !data.isActive) return;

        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        data.words.forEach((wordData, word) => {
            const rect = word.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = cursorX - centerX;
            const deltaY = cursorY - centerY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxInfluence = 150;
            
            if (distance < maxInfluence) {
                const strength = (1 - distance / maxInfluence) * 25;
                const angle = Math.atan2(deltaY, deltaX);
                const pushX = -Math.cos(angle) * strength;
                const pushY = -Math.sin(angle) * strength;
                
                word.style.transform = `translate(${pushX}px, ${pushY}px)`;
                word.style.transition = 'transform 0.1s ease-out';
            } else {
                word.style.transform = wordData.originalTransform;
                word.style.transition = 'transform 0.2s ease-out';
            }
        });
    }

    endParting(element) {
        const data = this.activeElements.get(element);
        
        if (data) {
            data.isActive = false;
            
            data.words.forEach((wordData, word) => {
                word.style.transition = 'transform 0.3s ease-out';
                word.style.transform = wordData.originalTransform;
            });
            
            setTimeout(() => {
                if (!data.isActive) {
                    this.activeElements.delete(element);
                }
            }, 300);
        }
    }
}

// Project hover handling with inverse effect
function handleProjectHover(link, isEntering) {
    if (isEntering) {
        const project = link.getAttribute('data-project');
        const projectInfo = link.getAttribute('data-info');
        
        activeProject = project;
        projectsContainer.classList.add('hovering');
        document.body.classList.add('project-hovering'); // Add body class for inverse effect
        
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        
        // Show video for this project
        const mediaUrl = projectMedia[project];
        const url = typeof mediaUrl === 'string' ? mediaUrl : mediaUrl?.url;
        if (url && url.includes('.mp4')) {
            showVideo(project);
        } else {
            hideAllMedia();
        }
    } else {
        activeProject = null;
        projectsContainer.classList.remove('hovering');
        document.body.classList.remove('project-hovering'); // Remove body class
        
        dateText.textContent = 'JUNE 2025';
        dateText.classList.remove('project-active');
        
        hideAllMedia();
    }
}

// Initialize text effects
const textParting = new TextPartingEffect();
const aboutScramble = new TextScramble(aboutToggle);
let isAboutOpen = false;

// About toggle functionality
aboutToggle.addEventListener('click', function() {
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    
    if (isAboutOpen) {
        aboutScramble.setText('HIDE', true);
        setTimeout(() => {
            textParting.init();
        }, 100);
    } else {
        aboutScramble.setText('ABOUT');
    }
});

aboutToggle.addEventListener('mouseenter', function() {
    if (!isAboutOpen) {
        aboutScramble.setText('ABOUT');
    } else {
        aboutScramble.setText('HIDE');
    }
});

// Project link events
if (!isTouchDevice) {
    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            handleProjectHover(this, true);
        });
        
        link.addEventListener('mouseleave', function(e) {
            handleProjectHover(this, false);
        });
    });
} else {
    let lastTouchedLink = null;
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const project = this.getAttribute('data-project');
            const projectInfo = this.getAttribute('data-info');
            
            if (lastTouchedLink === this) {
                window.location.href = this.href;
                return;
            }
            
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            
            lastTouchedLink = this;
            this.classList.add('touch-active');
            projectsContainer.classList.add('touch-hovering');
            document.body.classList.add('project-hovering'); // Add for touch devices too
            
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            
            const mediaUrl = projectMedia[project];
            const url = typeof mediaUrl === 'string' ? mediaUrl : mediaUrl?.url;
            if (url && url.includes('.mp4')) {
                showVideo(project);
            } else {
                hideAllMedia();
            }
        });
    });
    
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.project-link')) {
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            projectsContainer.classList.remove('touch-hovering');
            document.body.classList.remove('project-hovering'); // Remove for touch devices
            dateText.textContent = 'JUNE 2025';
            dateText.classList.remove('project-active');
            hideAllMedia();
            lastTouchedLink = null;
        }
    });
}

// Date text hover
dateText.addEventListener('mouseenter', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.add('june-hover');
        if (fullscreenBg.classList.contains('active')) {
            hideAllMedia();
        }
    }
});

dateText.addEventListener('mouseleave', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.remove('june-hover');
    }
});

// Bio link hover
bioLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        const bioType = this.getAttribute('data-bio');
        const imageUrl = bioImages[bioType];
        
        if (imageUrl) {
            bioPreviewImage.src = imageUrl;
            bioPreviewImage.alt = this.textContent;
            bioPreview.classList.add('active');
        }
    });
    
    link.addEventListener('mouseleave', function() {
        bioPreview.classList.remove('active');
    });
});

// UPDATED Page Transition System - Video Circle Effect
class PageTransition {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }

    init() {
        this.attachLinkHandlers();
    }

    attachLinkHandlers() {
        const projectLinks = document.querySelectorAll('.project-link');
        
        projectLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.isTransitioning && !isTouchDevice) {
                    e.preventDefault();
                    const href = link.href;
                    const project = link.getAttribute('data-project');
                    this.startVideoCircleTransition(href, project);
                }
            });
        });
    }

    startVideoCircleTransition(targetUrl, project) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Get the video for this project
        const projectVideo = videoPool[project];
        if (!projectVideo) {
            // Fallback to black circle if no video
            this.startBlackCircleTransition(targetUrl);
            return;
        }
        
        // Create video circle container - START FULL SCREEN
        const videoCircleContainer = document.createElement('div');
        videoCircleContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 300vw;
            height: 300vh;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 30000;
            pointer-events: none;
            overflow: hidden;
        `;
        
        // Clone the video for the transition
        const transitionVideo = projectVideo.cloneNode(true);
        transitionVideo.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300vw;
            height: 300vh;
            object-fit: cover;
            transform: translate(-50%, -50%);
            opacity: 1;
        `;
        
        // Apply same filter as original video
        if (project !== 'church') {
            transitionVideo.style.filter = 'brightness(0.9)';
        } else {
            transitionVideo.style.filter = 'none';
        }
        
        // Start playing the video
        transitionVideo.muted = true;
        transitionVideo.loop = true;
        transitionVideo.play().catch(() => {});
        
        videoCircleContainer.appendChild(transitionVideo);
        document.body.appendChild(videoCircleContainer);
        
        // Force reflow
        videoCircleContainer.offsetHeight;
        
        // Animate circle SHRINKING to center point - SLOWER (2 seconds)
        videoCircleContainer.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        videoCircleContainer.style.width = '0';
        videoCircleContainer.style.height = '0';
        
        // Navigate EARLIER to allow smooth connection (1.8 seconds)
        setTimeout(() => {
            window.location.href = targetUrl + '?from_transition=true';
        }, 1800);
        
        // Clean up after full animation completes
        setTimeout(() => {
            if (videoCircleContainer.parentNode) {
                videoCircleContainer.remove();
            }
        }, 2200);
    }
    
    // Fallback method for projects without videos - ALSO SLOWER
    startBlackCircleTransition(targetUrl) {
        const circleOverlay = document.createElement('div');
        circleOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 300vw;
            height: 300vh;
            background: #000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 30000;
            pointer-events: none;
        `;
        
        document.body.appendChild(circleOverlay);
        circleOverlay.offsetHeight;
        
        circleOverlay.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        circleOverlay.style.width = '0';
        circleOverlay.style.height = '0';
        
        setTimeout(() => {
            window.location.href = targetUrl + '?from_transition=true';
        }, 1800);
        
        // Clean up
        setTimeout(() => {
            if (circleOverlay.parentNode) {
                circleOverlay.remove();
            }
        }, 2200);
    }
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing video system...');
    
    // Initialize video pool immediately
    initializeVideoPool();
    
    // Initialize page transition with video circle effect
    const pageTransition = new PageTransition();
    
    // Check if we came from a transition to enable smooth return
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from_transition') === 'true') {
        // Remove the parameter from URL without refresh
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Ensure transition system is ready for next click
        setTimeout(() => {
            pageTransition.isTransitioning = false;
        }, 100);
    }
    
    // Force start videos after a brief delay
    setTimeout(() => {
        Object.values(videoPool).forEach(video => {
            video.play().catch(() => {});
        });
    }, 1000);
});