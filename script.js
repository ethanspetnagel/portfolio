// --- FONTFLIP CLASS DEFINITION ---
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'Times New Roman, serif',
            'UnifrakturCook, cursive',
            'Impact, sans-serif',
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
            const char = this.text[i];
            const wrapper = document.createElement('span');
            wrapper.style.display = 'inline-block';
            wrapper.style.position = 'relative';

            const ghost = document.createElement('span');
            ghost.textContent = char;
            ghost.style.fontFamily = this.originalFont;
            ghost.style.visibility = 'hidden';
            wrapper.appendChild(ghost);

            const charWidth = ghost.getBoundingClientRect().width;
            wrapper.style.width = `${charWidth}px`;

            const animator = document.createElement('span');
            animator.textContent = char;
            animator.style.position = 'absolute';
            animator.style.top = '0';
            animator.style.left = '0';
            animator.style.width = '100%';
            animator.style.height = '100%';
            animator.style.textAlign = 'center';

            if (i === activeIndex && fontFrame >= 0) {
                animator.style.fontFamily = fontList[fontFrame];
            } else {
                animator.style.fontFamily = this.originalFont;
            }
            wrapper.appendChild(animator);
            this.el.appendChild(wrapper);
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

// --- WRAP ALL CODE IN DOMCONTENTLOADED ---
document.addEventListener('DOMContentLoaded', function() {

    // --- INTRO OVERLAY SETUP ---
    (function setupIntroOverlay() {
        const introOverlay = document.getElementById('introOverlay');
        const introText = document.getElementById('introText');

        if (sessionStorage.getItem('introShown')) {
            if (introOverlay) introOverlay.style.display = 'none';
        } else {
            if (introOverlay && introText) {
                const introFlip = new FontFlip(introText);
                introFlip.setText('ETHAN SPETNAGEL', () => {
                    startSubtitleAnimation(introOverlay, introText);
                });
            }
        }
    })();

    function startSubtitleAnimation(overlay, textElement) {
        const paragraphs = [
            "Design Manager — Church California\n\nUX Designer — Talamel Health",
            "based in Queens, NY",
            "Building intuitive products & distinctive brands.",
        ];
        let paragraphIndex = 0;

        function showNextParagraph() {
            if (paragraphIndex < paragraphs.length) {
                textElement.textContent = paragraphs[paragraphIndex];
                paragraphIndex++;
                setTimeout(showNextParagraph, 2000);
            } else {
                overlay.style.transition = 'opacity 0.5s ease-in-out';
                overlay.style.opacity = '0';
                sessionStorage.setItem('introShown', '1');
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            }
        }
        showNextParagraph();
    }

    // --- DOM ELEMENT SELECTION ---
    const dateText = document.getElementById('dateText');
    const aboutToggle = document.getElementById('aboutToggle');
    const hideToggle = document.getElementById('hideToggle');
    const bioSection = document.querySelector('.bio-section');
    const resumeDownload = document.getElementById('resumeDownload');
    const projectsContainer = document.getElementById('projectsContainer');

    // --- ABOUT/HIDE FUNCTIONALITY ---
    const aboutFlip = new FontFlip(aboutToggle);
    let isAboutOpen = false;

    function setAboutState(isOpen) {
        isAboutOpen = isOpen;
        if (bioSection) {
            bioSection.classList.toggle('is-open', isOpen);
        }
    }

    aboutToggle.addEventListener('mouseenter', () => {
        if (aboutFlip._isAnimating || isAboutOpen) return;
        aboutFlip.setText('ABOUT', () => {
            setAboutState(true);
        });
    });

    hideToggle.addEventListener('click', () => {
        setAboutState(false);
    });

    // --- RESUME FUNCTIONALITY ---
    if (resumeDownload) {
        const resumeFlip = new FontFlip(resumeDownload);
        let downloadInProgress = false;

        resumeDownload.addEventListener('mouseenter', function() {
            if (downloadInProgress || resumeFlip._isAnimating) return;
            downloadInProgress = true;

            resumeFlip.setText('DOWNLOAD', function onAnimationFinish() {
                const link = document.createElement('a');
                link.href = './EthanSpetnagel2025.pdf';
                link.download = 'EthanSpetnagel2025.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                    downloadInProgress = false;
                    resumeFlip.setText('RESUME');
                }, 500);
            });
        });
    }

    // --- DATE TEXT HOVER ---
    dateText.addEventListener('mouseenter', function() {
        document.body.classList.add('june-hover');
    });
    dateText.addEventListener('mouseleave', function() {
        document.body.classList.remove('june-hover');
    });

    // --- PROJECT LINK HOVER ---
    projectsContainer.addEventListener('mouseover', (event) => {
        if (event.target.classList.contains('project-link')) {
            projectsContainer.classList.add('hovering');
        }
    });
    projectsContainer.addEventListener('mouseout', () => {
        projectsContainer.classList.remove('hovering');
    });
});
