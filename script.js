const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");
const content = document.querySelector(".overlay-content");
const fadeTexts = document.querySelectorAll(".fade-in-text");

// Total number of images
const frameCount = 40;
// Helper function to return the correct filename with zero-padding
const currentFrame = index => (
  `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

// Cache the images so they don't load sequentially during scroll
const preloadedImages = [];

const preloadImages = () => {
  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    preloadedImages[i] = img;
  }
};

// Set up the first frame
const img = new Image();
img.src = currentFrame(1);
img.onload = function() {
  // Set canvas dimensions to match the image dimensions for best quality
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
};

const updateImage = index => {
  // Ensure we stay within bounds
  if (index < 1) index = 1;
  if (index > frameCount) index = frameCount;

  let imgToDraw = preloadedImages[index];
  if (!imgToDraw) {
      imgToDraw = new Image();
      imgToDraw.src = currentFrame(index);
  }

  // Draw the image onto the canvas
  if (imgToDraw.complete) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);
  } else {
      imgToDraw.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);
      }
  }
};

let lastKnownScrollPosition = 0;
let ticking = false;

// Optimization: use root requestAnimationFrame pattern for scroll events
window.addEventListener('scroll', () => {
    lastKnownScrollPosition = document.documentElement.scrollTop;

    if (!ticking) {
        window.requestAnimationFrame(() => {
            const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
            // Prevent division by zero if there's no scroll space
            if (maxScrollTop === 0) return;
            
            const scrollFraction = lastKnownScrollPosition / maxScrollTop;
            
            // Calculate which frame to display (from 1 to frameCount)
            const frameIndex = Math.min(
                frameCount,
                Math.max(1, Math.ceil(scrollFraction * frameCount))
            );

            updateImage(frameIndex);

            // Control the opacity and translation of text
            if (scrollFraction > 0.05) {
                fadeTexts.forEach(el => el.classList.add('hidden'));
            } else {
                fadeTexts.forEach(el => el.classList.remove('hidden'));
            }

            ticking = false;
        });

        ticking = true;
    }
});

// Kick off preloading
preloadImages();
