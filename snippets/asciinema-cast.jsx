import React, { useEffect, useRef } from 'react';

const PLAYER_JS = "https://cdn.jsdelivr.net/npm/asciinema-player@3.7.1/dist/bundle/asciinema-player.min.js";
const PLAYER_CSS = "https://cdn.jsdelivr.net/npm/asciinema-player@3.7.1/dist/bundle/asciinema-player.css";

const defaultOptions = {
  idleTimeLimit: 2,
  poster: 'npt:0:3',
};

function ensureAsciinemaAssets() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    // CSS
    const existingCss = Array.from(document.styleSheets || []).some(s => (s.href || '').includes('asciinema-player'));
    if (!existingCss) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = PLAYER_CSS;
      document.head.appendChild(link);
    }
    // JS
    if (window.AsciinemaPlayer) return resolve();
    const existing = Array.from(document.scripts || []).find(s => (s.src || '').includes('asciinema-player'));
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed loading Asciinema script')));
      return;
    }
    const script = document.createElement('script');
    script.src = PLAYER_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed loading Asciinema script'));
    document.head.appendChild(script);
  });
}

export const Asciinema = (props) => {
  const ref = useRef(null);

  const {
    src,
    poster,
    cols,
    rows,
    theme,
    speed,
  } = props || {};

  const idleTimeLimit = props?.['idle-time-limit'] ?? props?.idleTimeLimit ?? defaultOptions.idleTimeLimit;
  const posterOpt = poster ?? defaultOptions.poster;

  useEffect(() => {
    let disposed = false;
    const el = ref.current;
    if (!el || !src) return () => {};

    const options = { idleTimeLimit, poster: posterOpt };
    if (cols) options.cols = cols;
    if (rows) options.rows = rows;
    if (theme) options.theme = theme;
    if (speed) options.speed = speed;

    ensureAsciinemaAssets()
      .then(() => {
        if (disposed || !window.AsciinemaPlayer) return;
        try {
          window.AsciinemaPlayer.create(src, el, options);
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (el) el.innerHTML = '';
    };
  }, [src, idleTimeLimit, posterOpt, cols, rows, theme, speed]);

  return <div ref={ref} />;
};

export default Asciinema;

