// --- INTRO OVERLAY SETUP ---
(function setupIntroOverlay() {
    if (!sessionStorage.getItem('introShown')) {
        const overlay = document.createElement('div');
        overlay.id = 'introOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #e2e7ed;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s;
            opacity: 1;
        `;

        const introText = document.createElement('div');
        introText.id = 'introText';
        introText.textContent = 'ETHANSPETNAGEL.ONLINE';
        introText.style.cssText = `
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-weight: bold;
            font-size: clamp(10.8px, 2.43vw, 29.7px);
            text-transform: uppercase;
            letter-spacing: 0.02em;
            color: #2d2f32;
            text-align: center;
            line-height: 1;
            user-select: none;
        `;
        overlay.appendChild(introText);
        document.body.appendChild(overlay);

        // Font Flip Animation
        class IntroFontFlip {
            constructor(el) {
                this.el = el;
                this.fonts = [
                    'times new roman, serif',
                    'UnifrakturCook, cursive',
                    'Impact',
                    'Marker Felt, fantasy'
                ];
                this.originalFont = window.getComputedStyle(el).fontFamily;
                this._timeout = null;
            }
            
            setText(newText, onFinish) {
                this.text = newText;
                this.onFinish = onFinish;
                this.stop();
                this._animateLetter(0);
            }
            
            _shuffle(array) {
                let arr = array.slice();
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }
            
            _animateLetter(index) {
                if (index >= this.text.length) {
                    this._renderWord(-1, -1);
                    if (typeof this.onFinish === 'function') this.onFinish();
                    return;
                }
                const shuffledFonts = this._shuffle(this.fonts);
                let fontFrame = 0;
                const animateFont = () => {
                    if (fontFrame < shuffledFonts.length) {
                        this._renderWord(index, fontFrame, shuffledFonts);
                        fontFrame++;
                        this._timeout = setTimeout(animateFont, 80);
                    } else {
                        this._renderWord(index, -1, shuffledFonts);
                        this._timeout = setTimeout(() => this._animateLetter(index + 1), 1);
                    }
                };
                animateFont();
            }
            
            _renderWord(activeIndex, fontFrame, fontList = this.fonts) {
                this.el.innerHTML = '';
                for (let i = 0; i < this.text.length; i++) {
                    const span = document.createElement('span');
                    span.textContent = this.text[i];
                    span.style.display = 'inline-block';
                    if (i === activeIndex && fontFrame >= 0) {
                        span.style.fontFamily = fontList[fontFrame];
                    } else {
                        span.style.fontFamily = this.originalFont;
                    }
                    this.el.appendChild(span);
                }
            }
            
            stop() {
                if (this._timeout) {
                    clearTimeout(this._timeout);
                    this._timeout = null;
                }
            }
        }

        const introFlip = new IntroFontFlip(introText);
        introFlip.setText('ETHANSPETNAGEL.ONLINE', () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                sessionStorage.setItem('introShown', '1');
            }, 300);
        });
    }
})();

// Project media mapping
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        position: { left: '12%', top: '0%' }
    }, 
    'church': {
        url: './church video bg.mp4',
        position: { left: '34.5%', top: '39%' }
    },
    'talamel': {
        url: './talamel1.mp4',
        position: { left: '16%', top: '7%' }
    }, 
    'fox-and-lion': { 
        url: './foxlionbg.mp4',
        position: { left: '45%', top: '15%' }
    }, 
    'cardioscape': { 
        url: './cardio.mp4',
        position: { left: '5%', top: '22%' }
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        position: { left: '50%', top: '30.5%' }
    },
    'green-lake-law': {
        url: './greenlake.mp4',
        position: { left: '0%', top: '20%' }
    }
};

// Bio link images
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': '',
    'colorado': ''
};

// DOM Elements
const fullscreenBg = document.getElementById('fullscreenBg');
const dateText = document.getElementById('dateText');
const contactToggle = document.getElementById('contactToggle');
const contactContent = document.getElementById('contactContent');
const bioLinks = document.querySelectorAll('.bio-text-center a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');
const rollerSection = document.getElementById('rollerSection');
const rollerTrack = document.getElementById('rollerTrack');
const rollerItems = document.querySelectorAll('.roller-item');

// Variables
let videoPool = {};
let currentActiveVideo = null;
let currentActiveProject = null;
let videoBrightness = {};
let scrollProgress = 0;
let currentIndex = 0;
let isAnimating = false;

// Roller Configuration
const ITEMS_COUNT = 7;
const VISIBLE_ITEMS = 4;
const ITEM_ANGLE = 360 / ITEMS_COUNT;

// Initialize video pool
function initializeVideoPool() {
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
            video.style.opacity = '0';
            video.style.visibility = 'hidden';
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            video.load();
            
            video.addEventListener('loadeddata', () => {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                    analyzeVideoBrightness(video, project);
                }).catch(() => {});
            });
        }
    });
}

// Analyze video brightness
function analyzeVideoBrightness(video, project) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 160;
    canvas.height = 90;
    
    if (video.readyState >= 2) {
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let brightness = 0;
            let pixelCount = 0;
            
            for (let i = 0; i < data.length; i += 40) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const pixelBrightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                brightness += pixelBrightness;
                pixelCount++;
            }
            
            const avgBrightness = brightness / pixelCount;
            videoBrightness[project] = avgBrightness < 0.5;
        } catch (e) {
            videoBrightness[project] = true;
        }
    }
}

// Update roller position
function updateRoller() {
    rollerItems.forEach((item, index) => {
        const adjustedIndex = index % ITEMS_COUNT;
        const angle = (adjustedIndex - currentIndex) * ITEM_ANGLE + scrollProgress * ITEM_ANGLE;
        const radian = (angle * Math.PI) / 180;
        
        const z = Math.cos(radian) * 300;
        const y = Math.sin(radian) * 300;
        
        item.style.transform = `translateY(${y}px) translateZ(${z}px)`;
        
        // Update opacity based on position
        const normalizedAngle = ((angle % 360) + 360) % 360;
        if (normalizedAngle < 90 || normalizedAngle > 270) {
            const opacity = Math.cos(radian) * 0.7 + 0.3;
            item.style.opacity = Math.max(0.3, opacity);
            item.style.pointerEvents = 'auto';
        } else {
            item.style.opacity = '0';
            item.style.pointerEvents = 'none';
        }
        
        // Mark active item
        item.classList.remove('active');
        if (Math.abs(angle % 360) < ITEM_ANGLE / 2 || Math.abs(angle % 360 - 360) < ITEM_ANGLE / 2) {
            item.classList.add('active');
            updateActiveProject(item);
        }
    });
}

// Update active project
function updateActiveProject(item) {
    const project = item.dataset.project;
    const info = item.dataset.info;
    
    if (currentActiveProject !== project) {
        currentActiveProject = project;
        dateText.textContent = info;
        
        // Show video for active project
        if (currentActiveVideo) {
            currentActiveVideo.style.opacity = '0';
            currentActiveVideo.style.visibility = 'hidden';
            currentActiveVideo.pause();
        }
        
        const video = videoPool[project];
        if (video) {
            const mediaInfo = projectMedia[project];
            video.style.left = mediaInfo.position.left;
            video.style.top = mediaInfo.position.top;
            video.style.visibility = 'visible';
            video.currentTime = 0;
            video.play().then(() => {
                video.style.opacity = '1';
                fullscreenBg.classList.add('active');
                currentActiveVideo = video;
                
                // Update text colors
                const isDark = videoBrightness[project];
                document.body.classList.toggle('video-dark', isDark);
                document.body.classList.toggle('video-light', !isDark);
            }).catch(() => {});
        }
    }
}

// Handle scroll
let lastScrollTop = 0;
let rollerSticky = false;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const rollerTop = rollerSection.offsetTop;
    
    if (scrollTop >= rollerTop - window.innerHeight / 2) {
        if (!rollerSticky) {
            rollerSticky = true;
        }
        
        // Calculate scroll within roller section
        const scrollInRoller = scrollTop - (rollerTop - window.innerHeight / 2);
        const scrollDelta = scrollTop - lastScrollTop;
        
        // Update scroll progress
        scrollProgress += scrollDelta * 0.002;
        
        // Handle looping
        if (scrollProgress >= 1) {
            scrollProgress -= 1;
            currentIndex = (currentIndex + 1) % ITEMS_COUNT;
        } else if (scrollProgress < 0) {
            scrollProgress += 1;
            currentIndex = (currentIndex - 1 + ITEMS_COUNT) % ITEMS_COUNT;
        }
        
        updateRoller();
    }
    
    lastScrollTop = scrollTop;
});

// Click to rotate
rollerItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        const clickedIndex = index % ITEMS_COUNT;
        const activeItem = document.querySelector('.roller-item.active');
        
        if (item === activeItem) {
            // Navigate if clicking active item
            window.location.href = item.href;
        } else {
            // Rotate to clicked item
            if (!isAnimating) {
                isAnimating = true;
                
                // Calculate shortest rotation direction
                let targetDiff = clickedIndex - currentIndex;
                if (targetDiff > ITEMS_COUNT / 2) targetDiff -= ITEMS_COUNT;
                if (targetDiff < -ITEMS_COUNT / 2) targetDiff += ITEMS_COUNT;
                
                // Animate to target
                const startProgress = scrollProgress;
                const targetProgress = -targetDiff / ITEMS_COUNT;
                const duration = 600;
                const startTime = Date.now();
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    const t = Math.min(elapsed / duration, 1);
                    const eased = 0.5 - Math.cos(t * Math.PI) / 2;
                    
                    scrollProgress = startProgress + (targetProgress - startProgress) * eased;
                    updateRoller();
                    
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        currentIndex = clickedIndex;
                        scrollProgress = 0;
                        updateRoller();
                        isAnimating = false;
                    }
                }
                
                animate();
            }
        }
    });
});

// Font Flip Class
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'times new roman, serif',
            'UnifrakturCook, cursive',
            'Impact',
            'Marker Felt, fantasy'
        ];
        this.originalFont = window.getComputedStyle(el).fontFamily;
        this._timeout = null;
        this._isAnimating = false;
    }

    setText(newText, onFinish) {
        this.text = newText;
        this.stop();
        this._animateLetter(0, onFinish);
    }

    _shuffle(array) {
        let arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _animateLetter(index, onFinish) {
        if (index >= this.text.length) {
            this._renderWord(-1, -1);
            this._isAnimating = false;
            if (typeof onFinish === 'function') onFinish();
            return;
        }
        
        const shuffledFonts = this._shuffle(this.fonts);
        let fontFrame = 0;
        
        const animateFont = () => {
            if (fontFrame < shuffledFonts.length) {
                this._renderWord(index, fontFrame, shuffledFonts);
                fontFrame++;
                this._timeout = setTimeout(animateFont, 90);
            } else {
                this._renderWord(index, -1, shuffledFonts);
                this._timeout = setTimeout(() => this._animateLetter(index + 1, onFinish), 5);
            }
        };
        
        this._isAnimating = true;
        animateFont();
    }

    _renderWord(activeIndex, fontFrame, fontList = this.fonts) {
        this.el.innerHTML = '';
        for (let i = 0; i < this.text.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.text[i];
            span.style.display = 'inline-block';
            if (i === activeIndex && fontFrame >= 0) {
                span.style.fontFamily = fontList[fontFrame];
            } else {
                span.style.fontFamily = this.originalFont;
            }
            this.el.appendChild(span);
        }
    }

    stop() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._isAnimating = false;
    }
}

// Contact Toggle
const contactFlip = new FontFlip(contactToggle);
let isContactOpen = false;

function setContactButtonText(label) {
    contactToggle.innerHTML = '';
    for (let i = 0; i < label.length; i++) {
        const span = document.createElement('span');
        span.textContent = label[i];
        span.style.display = 'inline-block';
        span.style.fontFamily = contactFlip.originalFont;
        contactToggle.appendChild(span);
    }
}

contactToggle.addEventListener('mouseenter', function() {
    if (contactFlip._isAnimating) return;
    contactFlip.setText(isContactOpen ? 'HIDE' : 'CONTACT', function animationDone() {
        contactContent.classList.toggle('active');
        isContactOpen = !isContactOpen;
        setContactButtonText(isContactOpen ? 'HIDE' : 'CONTACT');
    });
});

contactToggle.addEventListener('mouseleave', function() {
    setContactButtonText(isContactOpen ? 'HIDE' : 'CONTACT');
});

// Resume Download
const resumeDownload = document.getElementById('resumeDownload');
if (resumeDownload) {
    const resumeFlip = new FontFlip(resumeDownload);
    let downloadInProgress = false;

    function setResumeButtonText(text) {
        resumeDownload.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.display = 'inline-block';
            span.style.fontFamily = resumeFlip.originalFont;
            resumeDownload.appendChild(span);
        }
    }

    function resetResumeButton() {
        downloadInProgress = false;
        resumeFlip.stop();
        setResumeButtonText('RESUME');
    }

    resumeDownload.addEventListener('mouseenter', function() {
        if (downloadInProgress || resumeFlip._isAnimating) return;
        
        downloadInProgress = true;
        resumeFlip.setText('DOWNLOAD', function animationDone() {
            const link = document.createElement('a');
            link.href = './EthanSpetnagel2025.pdf';
            link.download = 'EthanSpetnagel2025.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                resetResumeButton();
            }, 500);
        });
    });

    setResumeButtonText('RESUME');
}

// Date text hover
dateText.addEventListener('mouseenter', function() {
    document.body.classList.add('june-hover');
});

dateText.addEventListener('mouseleave', function() {
    document.body.classList.remove('june-hover');
});

// Bio link hovers
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeVideoPool();
    updateRoller();
    
    // Auto-play videos after user interaction
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
});