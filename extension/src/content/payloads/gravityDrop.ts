// Dynamically loads matter.js from CDN and applies physics to page elements
const MATTER_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';

declare global {
  interface Window {
    Matter: typeof import('matter-js');
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

export async function executeGravityDrop(): Promise<void> {
  try {
    await loadScript(MATTER_JS_CDN);
  } catch (err) {
    console.error('[DOM Hijacker] 0G DROP: Failed to load matter.js — CSP may be blocking it.', err);
    return;
  }

  const { Engine, Runner, Bodies, Composite } = window.Matter;

  // Capture all major layout elements
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(
      'p, h1, h2, h3, h4, img, article, section, .card, [class*="container"], [class*="block"]'
    )
  ).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 20 && rect.height > 20 && rect.top > -100;
  }).slice(0, 40); // Limit to 40 elements for performance

  const engine = Engine.create({ gravity: { y: 1.5 } });
  const runner = Runner.create();

  // Floor
  const floor = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 50,
    window.innerWidth * 2,
    100,
    { isStatic: true }
  );
  Composite.add(engine.world, floor);

  // Create physics bodies from DOM elements
  const bodies = targets.map((el) => {
    const rect = el.getBoundingClientRect();
    const body = Bodies.rectangle(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      rect.width,
      rect.height,
      {
        restitution: 0.3,
        friction: 0.2,
        frictionAir: 0.01,
        angle: (Math.random() - 0.5) * 0.1,
      }
    );

    // Fix the DOM element to this body
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.margin = '0';
    el.style.zIndex = '9999';
    el.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    el.style.width = `${rect.width}px`;
    el.style.pointerEvents = 'none';

    return { body, el, width: rect.width, height: rect.height };
  });

  Composite.add(engine.world, bodies.map((b) => b.body));
  Runner.run(runner, engine);

  // Sync DOM positions with physics engine each frame
  function tick() {
    bodies.forEach(({ body, el, width, height }) => {
      const { x, y } = body.position;
      const angle = body.angle;
      el.style.transform = `translate(${x - width / 2}px, ${y - height / 2}px) rotate(${angle}rad)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  console.log(`[DOM Hijacker] 0G DROP: ${bodies.length} elements detached from reality.`);
}
