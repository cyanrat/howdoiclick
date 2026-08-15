console.log('Main page loaded');

// Keyboard overlay interactive frames
const keyboardImage = document.getElementById('keyboardImage');
const keyboard = document.getElementById('keyboardOverlay');
const clickSound = document.getElementById('clickSound');
const keyboardFrames = {
  '1': '/src/keyboard1.png', // static
  '2': '/src/keyboard2.png',
  '3': '/src/keyboard3.png',
  '4': '/src/keyboard4.png'
};

// Function to play click sound
function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(error => console.log('Sound play failed:', error));
}

// Key to frame mapping
const keyFrameMap = {
  'r': '2',
  't': '3',
  'c': '4'
};

// Define clickable regions on the keyboard image for touch
// Format: left, top, width, height
const keyboardRegions = {
  'region_2': {
    left: 585,
    top: 847,
    width: 295,
    height: 591,
    frame: '2'
  }
};

let currentFrame = '1';
let keyPressTimeout;

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  
  // Check if this key is mapped to a frame
  if (keyFrameMap[key]) {
    playClickSound();
    currentFrame = keyFrameMap[key];
    keyboardImage.src = keyboardFrames[currentFrame];
    
    // Clear any existing timeout
    clearTimeout(keyPressTimeout);
    
    // Return to static frame after key release
    keyPressTimeout = setTimeout(() => {
      currentFrame = '1';
      keyboardImage.src = keyboardFrames[currentFrame];
    }, 100);
  }
});

let isTouchDragging = false;

// Touch coordinate-based interaction for frames
keyboard.addEventListener('touchend', (e) => {
  if (!isTouchDragging && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    const rect = keyboard.getBoundingClientRect();
    
    // Get coordinates relative to keyboard element
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check which region was touched
    for (const regionName in keyboardRegions) {
      const region = keyboardRegions[regionName];
      
      if (x >= region.left && x <= region.left + region.width &&
          y >= region.top && y <= region.top + region.height) {
        
        currentFrame = region.frame;
        keyboardImage.src = keyboardFrames[currentFrame];
        
        clearTimeout(keyPressTimeout);
        keyPressTimeout = setTimeout(() => {
          currentFrame = '1';
          keyboardImage.src = keyboardFrames[currentFrame];
        }, 100);
        break;
      }
    }
  }
});

// Trigger animation on touch tap
keyboard.addEventListener('tap', () => {
  currentFrame = '2'; // Default to frame 2 on tap
  keyboardImage.src = keyboardFrames[currentFrame];
  
  clearTimeout(keyPressTimeout);
  keyPressTimeout = setTimeout(() => {
    currentFrame = '1';
    keyboardImage.src = keyboardFrames[currentFrame];
  }, 100);
});
