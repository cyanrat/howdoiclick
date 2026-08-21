console.log('Main page loaded');

// Elements
const keyboardImage = document.getElementById('keyboardImage');
const keyboard = document.getElementById('keyboardOverlay');
const clickSound = document.getElementById('clickSound');

// Frame paths
const keyboardFrames = {
  '1': 'src/keyboard1.png', // static default
  '2': 'src/keyboard2.png',
  '3': 'src/keyboard3.png',
  '4': 'src/keyboard4.png'
};

// Preload all frames to eliminate image-swap flicker/lag
Object.values(keyboardFrames).forEach((src) => {
  const img = new Image();
  img.src = src;
});

// Sound playback helper
function playClickSound() {
  if (!clickSound) return;
  clickSound.currentTime = 0;
  clickSound.play().catch((error) => console.log('Sound play failed:', error));
}

// Physical key to frame mapping
const keyFrameMap = {
  'r': '2',
  't': '3',
  'c': '4'
};

// Base design coordinates (calculated against a 300px base width)
const BASE_WIDTH = 300;
const keyboardRegions = {
  'region_2': { left: 70, top: 144, width: 70, height: 58, frame: '2' },
  'region_3': { left: 115, top: 99, width: 69, height: 77, frame: '3' },
  'region_4': { left: 161, top: 75, width: 69, height: 77, frame: '4' }
};

let currentFrame = '1';
let keyPressTimeout;

// Helper to switch frames and reset back to idle state
function triggerKeyFrame(frameNumber) {
  playClickSound();
  currentFrame = frameNumber;
  keyboardImage.src = keyboardFrames[currentFrame];

  clearTimeout(keyPressTimeout);
  keyPressTimeout = setTimeout(() => {
    currentFrame = '1';
    keyboardImage.src = keyboardFrames[currentFrame];
  }, 100);
}

// Check coordinate hits with dynamic scaling for responsive screens
function handleCoordinateHit(clientX, clientY) {
  const rect = keyboard.getBoundingClientRect();
  const scale = rect.width / BASE_WIDTH;

  // Relative coordinates normalized back to base resolution
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;

  for (const regionName in keyboardRegions) {
    const region = keyboardRegions[regionName];
    if (
      x >= region.left &&
      x <= region.left + region.width &&
      y >= region.top &&
      y <= region.top + region.height
    ) {
      triggerKeyFrame(region.frame);
      return true;
    }
  }
  return false;
}

// 1. Keyboard Event Listener
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (keyFrameMap[key]) {
    triggerKeyFrame(keyFrameMap[key]);
  }
});

// 2. Prevent image dragging and context menu
keyboard.addEventListener('contextmenu', (e) => e.preventDefault());
keyboardImage.addEventListener('dragstart', (e) => e.preventDefault());

// 3. Mouse Click Interaction (Desktop)
keyboard.addEventListener('click', (e) => {
  handleCoordinateHit(e.clientX, e.clientY);
});

// 4. Touch Interactions (Mobile)
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;

keyboard.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isTouchDragging = false;
  }
}, { passive: true });

keyboard.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const moveX = Math.abs(e.touches[0].clientX - touchStartX);
    const moveY = Math.abs(e.touches[0].clientY - touchStartY);
    // If movement exceeds 10px, classify as scroll/drag
    if (moveX > 10 || moveY > 10) {
      isTouchDragging = true;
    }
  }
}, { passive: true });

keyboard.addEventListener('touchend', (e) => {
  if (!isTouchDragging && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    const hit = handleCoordinateHit(touch.clientX, touch.clientY);
    
    // Fallback: if tapped outside active regions, trigger default frame 2
    if (!hit) {
      triggerKeyFrame('2');
    }
  }
});
