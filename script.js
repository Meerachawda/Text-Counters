// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2000);
});

// Particles Animation
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Navigation
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling
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

// CTA Button Scroll
document.getElementById('ctaButton').addEventListener('click', () => {
    document.getElementById('analyzer').scrollIntoView({
        behavior: 'smooth'
    });
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Text Analyzer
const textInput = document.getElementById('textInput');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const charCountNoSpaces = document.getElementById('charCountNoSpaces');
const sentenceCount = document.getElementById('sentenceCount');
const paragraphCount = document.getElementById('paragraphCount');
const readingTime = document.getElementById('readingTime');
const speakingTime = document.getElementById('speakingTime');
const readabilityScore = document.getElementById('readabilityScore');
const readabilityLabel = document.getElementById('readabilityLabel');
const keywordList = document.getElementById('keywordList');

// Auto-save functionality
let autoSaveTimer;

textInput.addEventListener('input', () => {
    analyzeText();
    
    // Auto-save after 2 seconds of no typing
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        localStorage.setItem('savedText', textInput.value);
    }, 2000);
});

// Load saved text
window.addEventListener('load', () => {
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        textInput.value = savedText;
        analyzeText();
    }
});

function analyzeText() {
    const text = textInput.value;
    
    // Word count (improved regex for better accuracy)
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCountValue = words.length;
    
    // Character count (with spaces)
    const charCountValue = text.length;
    
    // Character count (without spaces)
    const charCountNoSpacesValue = text.replace(/\s/g, '').length;
    
    // Sentence count (improved regex)
    const sentences = text.trim() === '' ? [] : text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCountValue = sentences.length;
    
    // Paragraph count
    const paragraphs = text.trim() === '' ? [] : text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    const paragraphCountValue = paragraphs.length;
    
    // Reading time (average 200 words per minute)
    const readingTimeMinutes = wordCountValue / 200;
    const readingTimeValue = formatTime(readingTimeMinutes);
    
    // Speaking time (average 150 words per minute)
    const speakingTimeMinutes = wordCountValue / 150;
    const speakingTimeValue = formatTime(speakingTimeMinutes);
    
    // Update display with animation
    animateCounter(wordCount, wordCountValue);
    animateCounter(charCount, charCountValue);
    animateCounter(charCountNoSpaces, charCountNoSpacesValue);
    animateCounter(sentenceCount, sentenceCountValue);
    animateCounter(paragraphCount, paragraphCountValue);
    readingTime.textContent = readingTimeValue;
    speakingTime.textContent = speakingTimeValue;
    
    // Calculate readability score
    const readability = calculateReadabilityScore(text, wordCountValue, sentenceCountValue);
    readabilityScore.textContent = readability.score;
    readabilityLabel.textContent = readability.label;
    
    // Generate keyword density
    generateKeywords(words);
}

function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil(Math.abs(targetValue - currentValue) / 10);
    
    if (currentValue !== targetValue) {
        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
        } else {
            element.textContent = Math.max(currentValue - increment, targetValue);
        }
        setTimeout(() => animateCounter(element, targetValue), 50);
    }
}

function formatTime(minutes) {
    if (minutes < 1) {
        const seconds = Math.ceil(minutes * 60);
        return seconds + 's';
    } else if (minutes < 60) {
        return Math.ceil(minutes) + 'm';
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.ceil(minutes % 60);
        return hours + 'h ' + remainingMinutes + 'm';
    }
}

function calculateReadabilityScore(text, wordCount, sentenceCount) {
    if (wordCount === 0 || sentenceCount === 0) {
        return { score: 0, label: 'N/A' };
    }
    
    // Simplified Flesch Reading Ease calculation
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = estimateSyllables(text) / wordCount;
    
    const score = Math.round(206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord));
    
    let label;
    if (score >= 90) label = 'Very Easy';
    else if (score >= 80) label = 'Easy';
    else if (score >= 70) label = 'Fairly Easy';
    else if (score >= 60) label = 'Standard';
    else if (score >= 50) label = 'Fairly Difficult';
    else if (score >= 30) label = 'Difficult';
    else label = 'Very Difficult';
    
    return { score: Math.max(0, score), label };
}

function estimateSyllables(text) {
    const words = text.toLowerCase().match(/[a-z]+/g) || [];
    let syllableCount = 0;
    
    words.forEach(word => {
        let syllables = word.match(/[aeiouy]+/g) || [];
        syllableCount += Math.max(1, syllables.length);
    });
    
    return syllableCount;
}

function generateKeywords(words) {
    if (words.length === 0) {
        keywordList.innerHTML = '<span class="no-keywords">Start typing to see keywords</span>';
        return;
    }
    
    // Filter out common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const wordFreq = {};
    words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 2 && !stopWords.includes(cleanWord)) {
            wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
        }
    });
    
    const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    if (sortedWords.length === 0) {
        keywordList.innerHTML = '<span class="no-keywords">No keywords found</span>';
        return;
    }
    
    keywordList.innerHTML = sortedWords
        .map(([word, count]) => `<span class="keyword-item">${word} (${count})</span>`)
        .join('');
}

// Control Buttons
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all text?')) {
        textInput.value = '';
        localStorage.removeItem('savedText');
        analyzeText();
        showNotification('Text cleared successfully!');
    }
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) {
        showNotification('No text to download!', 'error');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Text downloaded successfully!');
});

document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) {
        showNotification('No text to export!', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Text Analysis Report', 20, 20);
        
        // Add stats
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const stats = [
            `Words: ${document.getElementById('wordCount').textContent}`,
            `Characters (with spaces): ${document.getElementById('charCount').textContent}`,
            `Characters (no spaces): ${document.getElementById('charCountNoSpaces').textContent}`,
            `Sentences: ${document.getElementById('sentenceCount').textContent}`,
            `Paragraphs: ${document.getElementById('paragraphCount').textContent}`,
            `Reading Time: ${document.getElementById('readingTime').textContent}`,
            `Speaking Time: ${document.getElementById('speakingTime').textContent}`,
            `Readability Score: ${document.getElementById('readabilityScore').textContent} (${document.getElementById('readabilityLabel').textContent})`
        ];
        
        let yPosition = 40;
        stats.forEach(stat => {
            doc.text(stat, 20, yPosition);
            yPosition += 10;
        });
        
        // Add text content
        doc.setFont(undefined, 'bold');
        doc.text('Content:', 20, yPosition + 10);
        yPosition += 20;
        
        doc.setFont(undefined, 'normal');
        const splitText = doc.splitTextToSize(text, 170);
        doc.text(splitText, 20, yPosition);
                
        doc.save('text-analysis-report.pdf');
        showNotification('PDF exported successfully!');
    } catch (error) {
        showNotification('Error exporting PDF. Please try again.', 'error');
        console.error('PDF export error:', error);
    }
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) {
        showNotification('No text to save!', 'error');
        return;
    }
    
    localStorage.setItem('savedText', text);
    showNotification('Draft saved successfully!');
});

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    // Add background blur when scrolled
    if (scrollTop > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        if (document.body.getAttribute('data-theme') === 'dark') {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
        }
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        if (document.body.getAttribute('data-theme') === 'dark') {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
        }
    }
    
    lastScrollTop = scrollTop;
});

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.cta-button, .submit-btn, .control-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple animation styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('saveBtn').click();
    }
    
    // Ctrl/Cmd + D to download
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        document.getElementById('downloadBtn').click();
    }
    
    // Ctrl/Cmd + Shift + C to clear
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        document.getElementById('clearBtn').click();
    }
});

// Word count goals and progress
function addWordCountGoals() {
    const goalContainer = document.createElement('div');
    goalContainer.className = 'word-goals';
    goalContainer.innerHTML = `
        <div class="goal-header">
            <h4>Word Count Goals</h4>
            <select id="goalSelect">
                <option value="250">Short Article (250 words)</option>
                <option value="500">Blog Post (500 words)</option>
                <option value="1000">Long Article (1000 words)</option>
                <option value="2000">Essay (2000 words)</option>
                <option value="custom">Custom Goal</option>
            </select>
        </div>
        <div class="goal-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="progress-text" id="progressText">0 / 250 words (0%)</div>
        </div>
    `;
    
    // Add styles for word goals
    const goalStyles = document.createElement('style');
    goalStyles.textContent = `
        .word-goals {
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-light);
            border: 1px solid var(--border-color);
            margin-top: 20px;
        }
        
        .goal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .goal-header h4 {
            margin: 0;
            color: var(--text-primary);
        }
        
        #goalSelect {
            padding: 5px 10px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            background: var(--bg-primary);
            color: var(--text-primary);
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--bg-secondary);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: var(--gradient-primary);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            text-align: center;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
    `;
    document.head.appendChild(goalStyles);
    
    // Insert after advanced stats
    const advancedStats = document.querySelector('.advanced-stats');
    advancedStats.parentNode.insertBefore(goalContainer, advancedStats.nextSibling);
    
    // Goal functionality
    let currentGoal = 250;
    const goalSelect = document.getElementById('goalSelect');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    goalSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            const customGoal = prompt('Enter your custom word count goal:');
            if (customGoal && !isNaN(customGoal) && customGoal > 0) {
                currentGoal = parseInt(customGoal);
                updateProgress();
            } else {
                e.target.value = '250';
                currentGoal = 250;
            }
        } else {
            currentGoal = parseInt(e.target.value);
        }
        updateProgress();
    });
    
    function updateProgress() {
        const currentWords = parseInt(document.getElementById('wordCount').textContent) || 0;
        const percentage = Math.min((currentWords / currentGoal) * 100, 100);
        
        progressFill.style.width = percentage + '%';
        progressText.textContent = `${currentWords} / ${currentGoal} words (${Math.round(percentage)}%)`;
        
        // Change color based on progress
        if (percentage >= 100) {
            progressFill.style.background = '#10b981'; // Green
        } else if (percentage >= 75) {
            progressFill.style.background = '#f59e0b'; // Yellow
        } else {
            progressFill.style.background = 'var(--gradient-primary)'; // Default
        }
    }
    
    // Update progress when text changes
    const originalAnalyzeText = analyzeText;
    analyzeText = function() {
        originalAnalyzeText();
        updateProgress();
    };
}

// Contact Form
document.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simulate form submission
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message sent successfully! We\'ll get back to you soon.');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
});

// Text Input Focus Effects
textInput.addEventListener('focus', () => {
    textInput.parentElement.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
});

textInput.addEventListener('blur', () => {
    textInput.parentElement.style.boxShadow = 'var(--shadow-medium)';
});

// Real-time character counter improvements
function improvedAnalyzeText() {
    const text = textInput.value;
    
    // More accurate word counting
    const words = text.trim() === '' ? [] : text.trim().match(/\b\w+\b/g) || [];
    const wordCountValue = words.length;
    
    // Precise character counting
    const charCountValue = text.length;
    const charCountNoSpacesValue = text.replace(/\s/g, '').length;
    
    // Better sentence detection
    const sentences = text.trim() === '' ? [] : text.match(/[.!?]+/g) || [];
    const sentenceCountValue = sentences.length;
    
    // Improved paragraph counting
    const paragraphs = text.trim() === '' ? [] : text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
    const paragraphCountValue = Math.max(paragraphs.length, text.trim() ? 1 : 0);
    
    // Calculate reading and speaking times
    const readingTimeMinutes = wordCountValue / 200;
    const speakingTimeMinutes = wordCountValue / 150;
    
    // Update all counters
    wordCount.textContent = wordCountValue;
    charCount.textContent = charCountValue;
    charCountNoSpaces.textContent = charCountNoSpacesValue;
    sentenceCount.textContent = sentenceCountValue;
    paragraphCount.textContent = paragraphCountValue;
    readingTime.textContent = formatTime(readingTimeMinutes);
    speakingTime.textContent = formatTime(speakingTimeMinutes);
    
    // Update readability and keywords
    const readability = calculateReadabilityScore(text, wordCountValue, sentenceCountValue);
    readabilityScore.textContent = readability.score;
    readabilityLabel.textContent = readability.label;
    
    generateKeywords(words);
}

// Replace the original analyzeText function
analyzeText = improvedAnalyzeText;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    addRippleEffect();
    addWordCountGoals();
    
    // Initial analysis
    analyzeText();
});

// Service Worker for PWA (basic implementation)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for potential future use
window.WordAnalyzer = {
    analyzeText,
    showNotification,
    formatTime,
    calculateReadabilityScore
};

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    }
});

if (typeof PerformanceObserver !== 'undefined') {
    perfObserver.observe({ entryTypes: ['measure'] });
}

// Measure text analysis performance
function measurePerformance(fn, name) {
    return function(...args) {
        performance.mark(`${name}-start`);
        const result = fn.apply(this, args);
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        return result;
    };
}

// Add text statistics tooltip
function addTooltips() {
    const statCards = document.querySelectorAll('.stat-card');
    
    const tooltips = {
        'Words': 'Total number of words in your text',
        'Characters': 'Total characters including spaces and punctuation',
        'Characters (No Spaces)': 'Total characters excluding spaces',
        'Sentences': 'Number of sentences detected',
        'Paragraphs': 'Number of paragraphs in your text',
        'Reading Time': 'Estimated time to read (200 words/min)',
        'Speaking Time': 'Estimated time to speak (150 words/min)'
    };
    
    statCards.forEach(card => {
        const label = card.querySelector('.stat-label').textContent;
        if (tooltips[label]) {
            card.title = tooltips[label];
            card.style.cursor = 'help';
        }
    });
}

// Text formatting helpers
function addTextFormatting() {
    const formatContainer = document.createElement('div');
    formatContainer.className = 'text-formatting';
    formatContainer.innerHTML = `
        <div class="format-header">
            <h4>Text Formatting</h4>
        </div>
        <div class="format-buttons">
            <button class="format-btn" id="uppercaseBtn" title="Convert to UPPERCASE">
                <i class="fas fa-font"></i> ABC
            </button>
            <button class="format-btn" id="lowercaseBtn" title="Convert to lowercase">
                <i class="fas fa-font"></i> abc
            </button>
            <button class="format-btn" id="titlecaseBtn" title="Convert to Title Case">
                <i class="fas fa-font"></i> Abc
            </button>
            <button class="format-btn" id="removeExtraSpacesBtn" title="Remove extra spaces">
                <i class="fas fa-compress-alt"></i>
            </button>
        </div>
    `;
    
    // Add styles
    const formatStyles = document.createElement('style');
    formatStyles.textContent = `
        .text-formatting {
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-light);
            border: 1px solid var(--border-color);
            margin-top: 20px;
        }
        
        .format-header h4 {
            margin: 0 0 15px 0;
            color: var(--text-primary);
        }
        
        .format-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .format-btn {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: var(--transition);
            color: var(--text-primary);
            font-size: 0.9rem;
        }
        
        .format-btn:hover {
            background: var(--primary-color);
            color: white;
        }
    `;
    document.head.appendChild(formatStyles);
    
    // Insert after word goals
    const wordGoals = document.querySelector('.word-goals');
    wordGoals.parentNode.insertBefore(formatContainer, wordGoals.nextSibling);
    
    // Add functionality
    document.getElementById('uppercaseBtn').addEventListener('click', () => {
        textInput.value = textInput.value.toUpperCase();
        analyzeText();
        showNotification('Text converted to uppercase!');
    });
    
    document.getElementById('lowercaseBtn').addEventListener('click', () => {
        textInput.value = textInput.value.toLowerCase();
        analyzeText();
        showNotification('Text converted to lowercase!');
    });
    
    document.getElementById('titlecaseBtn').addEventListener('click', () => {
        textInput.value = textInput.value.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        analyzeText();
        showNotification('Text converted to title case!');
    });
    
    document.getElementById('removeExtraSpacesBtn').addEventListener('click', () => {
        textInput.value = textInput.value.replace(/\s+/g, ' ').trim();
        analyzeText();
        showNotification('Extra spaces removed!');
    });
}

// Initialize additional features
setTimeout(() => {
    addTooltips();
    addTextFormatting();
}, 1000);

// Wrap analyzeText with performance measurement
analyzeText = measurePerformance(analyzeText, 'text-analysis');

