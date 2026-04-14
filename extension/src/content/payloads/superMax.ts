// Array of reliable, public-domain Max Verstappen racing images
const MAX_IMAGES = [
  'https://c.tenor.com/NmStfoyUX2oAAAAC/tenor.gif',
];

function getRandomMaxImage(): string {
  return MAX_IMAGES[Math.floor(Math.random() * MAX_IMAGES.length)];
}

export function executeSuperMax(data?: any): void {
  const images = document.querySelectorAll<HTMLImageElement>('img');
  const base64Src = data?.imageSrc;

  images.forEach((img, index) => {
    // Store original src for potential restoration
    img.dataset.originalSrc = img.src;

    // Stagger the replacements for a wave effect
    setTimeout(() => {
      img.src = base64Src || getRandomMaxImage();
      img.style.objectFit = 'cover';
      img.style.filter = 'none';
      img.removeAttribute('srcset');

      // Handle lazy-loaded images
      img.removeAttribute('loading');
      img.removeAttribute('data-src');

      // WIPE picture node sources if the image is inside one
      const picture = img.closest('picture');
      if (picture) {
        picture.querySelectorAll('source').forEach((srcNode) => {
          srcNode.removeAttribute('srcset');
          srcNode.removeAttribute('src');
          srcNode.srcset = base64Src || getRandomMaxImage();
        });
      }
    }, index * 80);
  });

  // Also handle background images
  document.querySelectorAll<HTMLElement>('[style*="background-image"]').forEach((el) => {
    el.style.backgroundImage = `url("${base64Src || getRandomMaxImage()}")`;
    el.style.backgroundSize = 'cover';
  });

  console.log(`[DOM Hijacker] SUPER MAX: Replaced ${images.length} images. VERSTAPPEN WINS.`);
}
