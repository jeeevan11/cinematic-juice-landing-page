import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* =========================================================
   1. LENIS SMOOTH SCROLL
   ========================================================= */
const lenis = new Lenis({
  lerp: 0.1,
  smoothWheel: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Scroll Progress Indicator
const scrollProgress = document.querySelector('.scroll-progress');
lenis.on('scroll', (e) => {
  if (scrollProgress) {
    scrollProgress.style.width = `${e.progress * 100}%`;
  }
});

/* =========================================================
   2. CUSTOM CURSOR & MAGNETIC BUTTONS
   ========================================================= */
const cursor = document.querySelector('.custom-cursor');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animating cursor with Lerp
gsap.ticker.add(() => {
  cursorX += (mouseX - cursorX) * 0.2;
  cursorY += (mouseY - cursorY) * 0.2;
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
});

const magnetics = document.querySelectorAll('.magnetic');
magnetics.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const currentX = gsap.getProperty(btn, "x") || 0;
    const currentY = gsap.getProperty(btn, "y") || 0;
    
    const ogLeft = rect.left - currentX;
    const ogTop = rect.top - currentY;
    
    const x = e.clientX - ogLeft - rect.width / 2;
    const y = e.clientY - ogTop - rect.height / 2;
    
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power3.out" });
    cursor.classList.add('active');
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    cursor.classList.remove('active');
  });
});

/* =========================================================
   3. PRELOADER & INTRO TIMELINE
   ========================================================= */
const preloaderTL = gsap.timeline({
  onComplete: () => {
    document.body.classList.remove('loading');
    ScrollTrigger.refresh();
  }
});

// Simulate loading progress
preloaderTL
  .to('.preloader-circle', { scale: 100, duration: 1.5, ease: 'expo.inOut' })
  .to('.preloader-progress-bar', { width: '100%', duration: 1, ease: 'power2.inOut' }, '<')
  .to('.wordmark-letter', { 
    y: 0, 
    opacity: 1, 
    stagger: 0.05, 
    duration: 0.8, 
    ease: 'power3.out' 
  }, '-=0.5')
  .to('.preloader', { 
    clipPath: 'circle(150% at 50% 50%)', 
    opacity: 0, 
    duration: 1.2, 
    ease: 'power3.inOut',
    onComplete: () => {
      document.querySelector('.preloader').style.display = 'none';
      // Intro animations for Hero
      gsap.fromTo('.hero-title-1', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' });
      gsap.set('.hero-title-2', { y: 50, opacity: 0 }); // Hide second title initially
      gsap.fromTo('.hero-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.4 });
    }
  });


/* =========================================================
   4. HERO CANVAS SEQUENCE & SCROLL SYNC
   ========================================================= */
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");
const frameCount = 40; // We have exactly 40 frames
const images = [];
const frameObj = { frame: 0 };

const currentFrame = index => `./frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

// Setup initial canvas dimensions
canvas.width = 1920;
canvas.height = 1080;

// Preload the 40 frames
for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}

// Render first frame when loaded
images[0].onload = renderFrame;

function renderFrame() {
  if (images[frameObj.frame]) {
    // Fill background just in case
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw the scaled image
    ctx.drawImage(images[frameObj.frame], 0, 0, canvas.width, canvas.height);
  }
}

// GSAP Scrub for frames
gsap.to(frameObj, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "+=3000",
    scrub: 0.5,
    pin: true,
  },
  onUpdate: renderFrame
});

// Hero text fade out & halo bloom
const heroTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "+=1500",
    scrub: true,
  }
});

heroTL
  .to('.hero-title-1', { opacity: 0, y: -50, duration: 1 })
  .to('.hero-title-2', { opacity: 1, y: 0, duration: 1 }, "-=0.5")
  .to('.hero-title-2', { opacity: 0, y: -50, duration: 1 }, "+=0.5")
  .to('.hero-subtitle', { opacity: 0, duration: 1 }, 0)
  .to('.hero-halo', { scale: 1, opacity: 1, duration: 2 }, 1);


/* =========================================================
   5. FLAVOR STORY HORIZONTAL SCROLL
   ========================================================= */
const flavorTrack = document.querySelector('.flavor-track');
const flavorCards = document.querySelectorAll('.flavor-card');

gsap.to(flavorTrack, {
  xPercent: -100 * ((flavorCards.length - 1) / flavorCards.length),
  ease: "none",
  scrollTrigger: {
    trigger: ".flavor-section",
    start: "top top",
    end: () => "+=" + document.querySelector('.flavor-track').offsetWidth,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true
  }
});


/* =========================================================
   6. MANIFESTO TEXT REVEAL
   ========================================================= */
gsap.utils.toArray('.manifesto-line').forEach((line) => {
  gsap.fromTo(line, 
    { clipPath: 'inset(100% 0 0 0)', y: 50 },
    { 
      clipPath: 'inset(0% 0 0 0)',
      y: 0,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 85%',
      }
    }
  );
});

gsap.to('.manifesto-hr', {
  width: '80vw',
  duration: 1.5,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: '.manifesto-hr',
    start: 'top 90%',
  }
});


/* =========================================================
   7. STATS BAR COUNTERS
   ========================================================= */
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
  const target = parseFloat(counter.getAttribute('data-target'));
  gsap.to(counter, {
    innerHTML: target,
    duration: 2,
    ease: "power2.out",
    snap: { innerHTML: 1 },
    scrollTrigger: {
      trigger: ".stats-section",
      start: "top 80%",
    }
  });
});


/* =========================================================
   8. FOUNDER QUOTE BLUR REVEAL
   ========================================================= */
gsap.utils.toArray('.quote-word').forEach(word => {
  gsap.to(word, {
    filter: 'blur(0px)',
    opacity: 1,
    duration: 1,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.founder-quote-container',
      start: 'top 60%',
    }
  });
});

// Small hover interaction for the seal
const seal = document.querySelector('.rotate-seal');
if (seal) {
  seal.addEventListener('mouseenter', () => cursor.classList.add('active'));
  seal.addEventListener('mouseleave', () => cursor.classList.remove('active'));
}
