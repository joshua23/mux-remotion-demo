import { continueRender, delayRender } from 'remotion';
const handle = delayRender('Loading Dalio fonts');
export async function loadDalioFonts() {
  const fonts = [
    { family: 'Source Serif Pro', weights: ['400', '600', '700'] },
    { family: 'Inter', weights: ['400', '500', '600'] },
  ];
  const links = fonts.map(({ family, weights }) =>
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`
  );
  await Promise.all(links.map((href) =>
    new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    })
  ));
  continueRender(handle);
}
