// Project media mapping with position data
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        position: {
            left: '12%',  // Position so "SLUG" text in video aligns with top-left
            top: '0%'
        }
    }, 
    'church': {
        url: './church video bg.mp4',
        position: {
            left: '34.5%',  // Right side
            top: '39%'
        }
    },
    'talamel': {
        url: './talamel1.mp4',
        position: {
            left: '16%',  // Left side
            top: '7%'
        }
    }, 
    'fox-and-lion': { 
        url: './foxlionbg.mp4',
        position: {
            left: '45%',  // Center-right
            top: '15%'
        }
    }, 
    'ecoscan': '',
    'cardioscape': { 
        url: './cardio.mp4',
        position: {
            left: '5%',  // Center-left
            top: '22%'
        }
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        position: {
            left: '50%',  // Right side
            top: '30.5%'
        }
    },
    'green-lake-law': {
        url: './greenlake.mp4',
        position: {
            left: '0%',  // Center
            top: '20%'
        }
    }, 
    'june-2025': ''
};

// Bio link images
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': ' ',
    'crowe': '',
    'colorado': ''
};

// DOM Elements
const fullscreenBg = document.getElementById('fullscreenBg');
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
let isTransitioning = false;
let videoBrightness = {}; // Store brightness values for each video
let hideMediaTimeout = null; // Timeout for hiding media
let isHoveringProject = false; // Track if hovering over any project

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Analyze video brightness
function analyzeVideoBrightness(video, project) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Sample video at a smaller size for performance
    canvas.width = 160;
    canvas.height = 90;
    
    // Wait for video to have enough data
    if (video.readyState >= 2) {
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            let brightness = 0;
            let pixelCount = 0;
            
            // Sample every 10th pixel for performance
            for (let i = 0; i < data.length; i += 40) { // 4 channels * 10 pixels
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Calculate perceived brightness
                const pixelBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                brightness += pixelBrightness;
                pixelCount++;
            }
            
            const avgBrightness = brightness / pixelCount;
            videoBrightness[project] = avgBrightness < 0.5; // true if dark, false if light
            
            console.log(`${project} brightness:`, avgBrightness, 'isDark:', avgBrightness < 0.5);
        } catch (e) {
            console.log('Could not analyze video brightness:', e);
            // Default to dark if analysis fails
            videoBrightness[project] = true;
        }
    }
}

// Initialize video pool for instant playback
function initializeVideoPool() {
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
            video.className = 'bg-video';
            video.dataset.project = project;
            
            // Start with videos hidden
            video.style.opacity = '0';
            video.style.visibility = 'hidden';
            video.style.zIndex = '1'; // Default z-index
            
            // Add to DOM
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            
            // Force load
            video.load();
            
            // Analyze brightness when video loads
            video.addEventListener('loadeddata', () => {
                // Play and immediately pause to have frame ready
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                    // Analyze brightness after first frame is ready
                    setTimeout(() => {
                        analyzeVideoBrightness(video, project);
                    }, 100);
                }).catch(() => {});
            });
            
            // Re-analyze if video seeks (in case brightness changes)
            video.addEventListener('seeked', () => {
                analyzeVideoBrightness(video, project);
            });
        }
    });
}

// Update text colors based on video brightness
function updateTextColors(project) {
    // Get brightness for this video (default to dark if not analyzed yet)
    const isDark = videoBrightness[project] !== undefined ? videoBrightness[project] : true;
    
    if (isDark) {
        document.body.classList.add('video-dark');
        document.body.classList.remove('video-light');
    } else {
        document.body.classList.add('video-light');
        document.body.classList.remove('video-dark');
    }
}

// Show video instantly with custom position
function showVideo(project) {
    if (isTransitioning) return false;
    
    const video = videoPool[project];
    if (!video) return false;
    
    const mediaInfo = projectMedia[project];
    if (!mediaInfo || !mediaInfo.position) return false;
    
    isTransitioning = true;
    
    // Don't hide current video yet - keep it playing until new one is ready
    const previousVideo = currentActiveVideo;
    
    // Set z-index for layering
    if (previousVideo) {
        previousVideo.style.zIndex = '1';
    }
    video.style.zIndex = '2'; // New video on top
    
    // Apply custom position
    video.style.left = mediaInfo.position.left;
    video.style.top = mediaInfo.position.top;
    
    // Show new video instantly
    video.style.visibility = 'visible';
    video.currentTime = 0; // Reset to start
    
    // Start playing immediately
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Once playing, fade in new video
            requestAnimationFrame(() => {
                video.style.opacity = '1';
                video.classList.add('active');
                fullscreenBg.classList.add('active');
                
                // After new video is visible, hide the previous one
                setTimeout(() => {
                    if (previousVideo && previousVideo !== video) {
                        previousVideo.style.opacity = '0';
                        previousVideo.style.visibility = 'hidden';
                        previousVideo.pause();
                        previousVideo.classList.remove('active');
                        previousVideo.style.zIndex = '1';
                    }
                }, 100); // Small delay to ensure smooth transition
                
                isTransitioning = false;
                
                // Update text colors based on video brightness
                updateTextColors(project);
            });
        }).catch(error => {
            console.log('Play failed:', error);
            // Still show the video even if autoplay fails
            video.style.opacity = '1';
            video.classList.add('active');
            fullscreenBg.classList.add('active');
            
            // Hide previous video
            if (previousVideo && previousVideo !== video) {
                previousVideo.style.opacity = '0';
                previousVideo.style.visibility = 'hidden';
                previousVideo.pause();
                previousVideo.classList.remove('active');
                previousVideo.style.zIndex = '1';
            }
            
            isTransitioning = false;
            
            // Update text colors
            updateTextColors(project);
        });
    }
    
    currentActiveVideo = video;
    currentMedia = projectMedia[project];
    
    return true;
}

// Hide all media
function hideAllMedia() {
    fullscreenBg.classList.remove('active');
    
    if (currentActiveVideo) {
        currentActiveVideo.style.opacity = '0';
        currentActiveVideo.style.visibility = 'hidden';
        currentActiveVideo.pause();
        currentActiveVideo.classList.remove('active');
        currentActiveVideo.style.zIndex = '1'; // Reset z-index
        currentActiveVideo = null;
    }
    
    // Remove video color classes
    document.body.classList.remove('video-dark', 'video-light');
    
    currentMedia = null;
}

// Text scramble effect
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Only letters, no numbers
        this.update = this.update.bind(this);
        // Much more dramatic font differences
        this.abstractFonts = [
            '"Impact", fantasy',
            '"Times New Roman", serif',
            '"Courier New", monospace',
            '"Comic Sans MS", cursive',
            '"Papyrus", fantasy',
            '"Old English Text MT", fantasy',
            '"Brush Script MT", cursive',
            '"Lucida Console", monospace',
            '"Georgia", serif',
            '"Trebuchet MS", sans-serif',
            '"Palatino", serif',
            '"Garamond", serif'
        ];
        this.originalFont = getComputedStyle(el).fontFamily;
        this.originalFontSize = getComputedStyle(el).fontSize;
        this.originalLineHeight = getComputedStyle(el).lineHeight;
        this.isActive = false;
        this.charWidths = [];
    }
    
    // Pre-measure character widths to prevent layout shift
    measureCharWidths(text) {
        const tempEl = document.createElement('span');
        tempEl.style.fontFamily = this.originalFont;
        tempEl.style.fontSize = this.originalFontSize;
        tempEl.style.fontWeight = getComputedStyle(this.el).fontWeight;
        tempEl.style.visibility = 'hidden';
        tempEl.style.position = 'absolute';
        document.body.appendChild(tempEl);
        
        this.charWidths = [];
        for (let i = 0; i < text.length; i++) {
            tempEl.textContent = text[i] || 'W'; // Use 'W' as default for empty chars
            this.charWidths[i] = Math.max(tempEl.offsetWidth, 12); // Minimum width
        }
        
        document.body.removeChild(tempEl);
    }
    
    setText(newText, showName = false) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length, 5);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        this.showName = showName;
        this.targetText = newText;
        this.nameText = 'ABOUT';
        this.isActive = true;
        
        // Measure character widths first
        this.measureCharWidths(newText);
        
        // Sequential timing - each letter starts after the previous with slight overlap
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = i * 60; // Each letter starts 60 frames (1 second) after the previous
            const end = start + 180; // Each letter scrambles for 180 frames (3 seconds)
            this.queue.push({ 
                from, 
                to, 
                start, 
                end, 
                currentChar: from,
                currentFont: this.originalFont,
                letterChangeCounter: 0,
                fontChangeCounter: 0
            });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.nameShown = false;
        this.namePauseComplete = false;
        this.nameRevealComplete = false;
        this.update();
        return promise;
    }
    
    getRandomFont() {
        return this.abstractFonts[Math.floor(Math.random() * this.abstractFonts.length)];
    }
    
    update() {
        if (!this.isActive) return;
        
        let complete = 0;
        const letterSpans = [];
        
        if (this.showName && this.frame >= 60 && !this.nameRevealComplete) {
            const nameProgress = Math.min((this.frame - 60) / 300, 1); // Much slower
            const nameCharsToShow = Math.floor(this.nameText.length * nameProgress);
            
            for (let i = 0; i < this.nameText.length; i++) {
                const char = i < nameCharsToShow ? this.nameText[i] : this.randomChar();
                const isCharScrambling = i >= nameCharsToShow;
                
                const span = document.createElement('span');
                span.textContent = char;
                span.style.fontFamily = isCharScrambling ? this.getRandomFont() : this.originalFont;
                span.style.display = 'inline-block';
                span.style.width = (this.charWidths[i] || 12) + 'px';
                span.style.textAlign = 'center';
                span.style.lineHeight = this.originalLineHeight;
                span.style.verticalAlign = 'baseline';
                span.style.fontSize = this.originalFontSize;
                letterSpans.push(span);
            }
            
            if (nameProgress >= 1) {
                this.nameRevealComplete = true;
            }
        } else if (this.nameRevealComplete && this.frame < 600 && !this.namePauseComplete) {
            for (let i = 0; i < this.nameText.length; i++) {
                const span = document.createElement('span');
                span.textContent = this.nameText[i];
                span.style.fontFamily = this.originalFont;
                span.style.display = 'inline-block';
                span.style.width = (this.charWidths[i] || 12) + 'px';
                span.style.textAlign = 'center';
                span.style.lineHeight = this.originalLineHeight;
                span.style.verticalAlign = 'baseline';
                span.style.fontSize = this.originalFontSize;
                letterSpans.push(span);
            }
            
            if (this.frame >= 600) {
                this.namePauseComplete = true;
            }
        } else if (this.namePauseComplete || !this.showName) {
            const adjustedFrame = this.showName ? this.frame - 600 : this.frame;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let queueItem = this.queue[i];
                let { from, to, start, end } = queueItem;
                let currentChar = '';
                let currentFont = this.originalFont;
                let isCharScrambling = false;
                
                if (adjustedFrame >= end) {
                    complete++;
                    currentChar = to;
                    currentFont = this.originalFont;
                } else if (adjustedFrame >= start) {
                    isCharScrambling = true;
                    
                    // Font changes every 15 frames (0.25 seconds at 60fps)
                    if (adjustedFrame - start >= queueItem.fontChangeCounter * 15) {
                        queueItem.currentFont = this.getRandomFont();
                        queueItem.fontChangeCounter++;
                    }
                    
                    // Letter changes every 30 frames (0.5 seconds at 60fps)
                    if (adjustedFrame - start >= queueItem.letterChangeCounter * 30) {
                        queueItem.currentChar = this.randomChar();
                        queueItem.letterChangeCounter++;
                    }
                    
                    currentChar = queueItem.currentChar;
                    currentFont = queueItem.currentFont;
                } else {
                    currentChar = from;
                    currentFont = this.originalFont;
                }
                
                const span = document.createElement('span');
                span.textContent = currentChar;
                span.style.fontFamily = currentFont;
                span.style.display = 'inline-block';
                span.style.width = (this.charWidths[i] || 12) + 'px';
                span.style.textAlign = 'center';
                span.style.lineHeight = this.originalLineHeight;
                span.style.verticalAlign = 'baseline';
                span.style.fontSize = this.originalFontSize;
                letterSpans.push(span);
            }
        }
        
        // Only update DOM if we have spans to show
        if (letterSpans.length > 0) {
            this.el.innerHTML = '';
            letterSpans.forEach(span => this.el.appendChild(span));
        }
        
        if (complete === this.queue.length) {
            this.isActive = false;
            // Reset to clean text after completion
            setTimeout(() => {
                if (!this.isActive) {
                    this.el.innerHTML = this.el.textContent;
                    this.el.style.fontFamily = this.originalFont;
                }
            }, 500);
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    stop() {
        this.isActive = false;
        cancelAnimationFrame(this.frameRequest);
        // Reset to clean text
        this.el.innerHTML = this.el.textContent;
        this.el.style.fontFamily = this.originalFont;
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

// Project hover handling
function handleProjectHover(link, isEntering) {
    if (isEntering) {
        // Clear any pending hide timeout
        if (hideMediaTimeout) {
            clearTimeout(hideMediaTimeout);
            hideMediaTimeout = null;
        }
        
        isHoveringProject = true;
        const project = link.getAttribute('data-project');
        const projectInfo = link.getAttribute('data-info');
        
        activeProject = project;
        projectsContainer.classList.add('hovering');
        document.body.classList.add('project-hovering');
        
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        
        // Show video for this project
        const mediaInfo = projectMedia[project];
        const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
        if (url && url.includes('.mp4')) {
            showVideo(project);
        } else {
            // Reset all videos if no video for this project
            Object.values(videoPool).forEach(v => {
                v.style.zIndex = '1';
            });
            hideAllMedia();
        }
    } else {
        isHoveringProject = false;
        
        // Add a small delay before hiding to check if hovering another project
        hideMediaTimeout = setTimeout(() => {
            // Only hide if not hovering any project
            if (!isHoveringProject) {
                activeProject = null;
                projectsContainer.classList.remove('hovering');
                document.body.classList.remove('project-hovering');
                
                dateText.textContent = 'JUNE 2025';
                dateText.classList.remove('project-active');
                
                // Reset all video z-indices before hiding
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                
                hideAllMedia();
            }
        }, 50); // 50ms delay to allow for transitions between links
    }
}

// Initialize text effects
const textParting = new TextPartingEffect();
const aboutScramble = new TextScramble(aboutToggle);
let isAboutOpen = false;

// About toggle functionality - EXACTLY like original code
aboutToggle.addEventListener('click', function() {
    // 1. Simple bio content toggle (exactly like original)
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    
    // 2. Update text content
    if (isAboutOpen) {
        this.textContent = 'HIDE';
        setTimeout(() => {
            textParting.init();
        }, 100);
    } else {
        this.textContent = 'ABOUT';
    }
    
    // 3. Trigger scramble effect
    const currentText = this.textContent;
    aboutScramble.setText(currentText);
});

// Hover to trigger scramble effect (separate from click)
aboutToggle.addEventListener('mouseenter', function() {
    const currentText = this.textContent;
    aboutScramble.setText(currentText);
});

// Don't stop on mouse leave - let it finish naturally
aboutToggle.addEventListener('mouseleave', function() {
    // Let scramble finish naturally
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
        
        // Simple navigation without transitions
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
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
            document.body.classList.add('project-hovering');
            
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            
            const mediaInfo = projectMedia[project];
            const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
            if (url && url.includes('.mp4')) {
                showVideo(project);
            } else {
                // Reset all videos if no video for this project
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                hideAllMedia();
            }
        });
    });
    
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.project-link')) {
            // Add delay for touch devices too
            setTimeout(() => {
                projectLinks.forEach(l => l.classList.remove('touch-active'));
                projectsContainer.classList.remove('touch-hovering');
                document.body.classList.remove('project-hovering');
                dateText.textContent = 'JUNE 2025';
                dateText.classList.remove('project-active');
                
                // Reset all video z-indices
                Object.values(videoPool).forEach(v => {
                    v.style.zIndex = '1';
                });
                
                hideAllMedia();
                lastTouchedLink = null;
            }, 50);
        }
    });
}

// Date text hover
dateText.addEventListener('mouseenter', function() {
    if (!dateText.classList.contains('project-active')) {
        // Clear any pending hide timeout
        if (hideMediaTimeout) {
            clearTimeout(hideMediaTimeout);
            hideMediaTimeout = null;
        }
        
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

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing video system...');
    
    // Initialize video pool immediately
    initializeVideoPool();
    
    // Attempt to start videos after user interaction
    document.addEventListener('mousemove', () => {
        Object.values(videoPool).forEach(video => {
            if (video.paused) {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(() => {});
            }
        });
    }, { once: true });
    
    // Periodically re-analyze brightness for playing videos
    setInterval(() => {
        if (currentActiveVideo && activeProject) {
            analyzeVideoBrightness(currentActiveVideo, activeProject);
            updateTextColors(activeProject);
        }
    }, 1000); // Check every second
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (hideMediaTimeout) {
        clearTimeout(hideMediaTimeout);
    }
});