// Array of reliable, public-domain Max Verstappen racing images
const MAX_IMAGES = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Max_Verstappen_2023_photograph.jpg/440px-Max_Verstappen_2023_photograph.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Max_Verstappen_2022_Bahrain.jpg/440px-Max_Verstappen_2022_Bahrain.jpg',
];

function getRandomMaxImage(): string {
  return MAX_IMAGES[Math.floor(Math.random() * MAX_IMAGES.length)];
}

export function executeSuperMax(): void {
  const images = document.querySelectorAll<HTMLImageElement>('img');

  images.forEach((img, index) => {
    // Store original src for potential restoration
    img.dataset.originalSrc = img.src;

    // Stagger the replacements for a wave effect
    setTimeout(() => {
      img.src = getRandomMaxImage();
      img.style.objectFit = 'cover';
      img.style.filter = 'none';
      img.removeAttribute('srcset');

      // Handle lazy-loaded images
      img.removeAttribute('loading');
      img.removeAttribute('data-src');
    }, index * 80);
  });

  // Also handle background images
  document.querySelectorAll<HTMLElement>('[style*="background-image"]').forEach((el) => {
    el.style.backgroundImage = `url("${getRandomMaxImage()}")`;
    el.style.backgroundSize = 'cover';
  });

  console.log(`[DOM Hijacker] SUPER MAX: Replaced ${images.length} images. VERSTAPPEN WINS.`);
}
