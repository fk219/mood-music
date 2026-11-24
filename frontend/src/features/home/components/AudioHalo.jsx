import { useEffect, useRef } from "react";
import { getMoodTheme } from "../moodTheme";

const TAU = Math.PI * 2;
const SEGMENTS = 84;

const withAlpha = (hex, alpha) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return `rgba(167, 155, 181, ${alpha})`;
  const number = Number.parseInt(value, 16);
  if (!Number.isFinite(number)) return `rgba(167, 155, 181, ${alpha})`;
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
};

/**
 * A real analysis ring for the platter. The canvas is only shown once the
 * browser hands over an analyser, so the existing mood halo is the fallback.
 */
const AudioHalo = ({ audioRef, mood, volume = 1, muted = false }) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(getMoodTheme(mood));
  const graphRef = useRef(null);
  const targetRef = useRef({ volume, muted });

  const applyVolume = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const target = targetRef.current.muted ? 0 : targetRef.current.volume;
    const graph = graphRef.current;

    if (graph?.gain) {
      graph.gain.gain.setTargetAtTime(target, graph.audioContext.currentTime, 0.02);
      audio.volume = 1;
      audio.muted = false;
      return;
    }

    audio.volume = target;
    audio.muted = targetRef.current.muted;
  };

  useEffect(() => {
    colorsRef.current = getMoodTheme(mood);
  }, [mood]);

  useEffect(() => {
    targetRef.current = { volume, muted };
    applyVolume();
    // applyVolume reads the current graph through a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return undefined;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reducedMotion) return undefined;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;
    const paint = canvas.getContext("2d");
    if (!AudioContextClass || !paint) return undefined;

    let disposed = false;
    let audioContext = null;
    let analyser = null;
    let frequency = null;
    let waveform = null;
    let frame = 0;
    let lastPaint = 0;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(box.width * ratio);
      const height = Math.round(box.height * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const ensureAnalyser = () => {
      if (analyser) return true;

      try {
        audioContext = new AudioContextClass();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        const gain = audioContext.createGain();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.84;
        analyser.minDecibels = -88;
        analyser.maxDecibels = -22;
        frequency = new Uint8Array(analyser.frequencyBinCount);
        waveform = new Uint8Array(analyser.fftSize);
        source.connect(analyser);
        analyser.connect(gain);
        gain.connect(audioContext.destination);
        graphRef.current = { audioContext, analyser, gain };
        applyVolume();
        return true;
      } catch {
        analyser = null;
        frequency = null;
        waveform = null;
        graphRef.current = null;
        audioContext?.close?.().catch?.(() => {});
        audioContext = null;
        return false;
      }
    };

    const draw = (time) => {
      frame = 0;
      if (disposed) return;

      if (!analyser) {
        canvas.classList.remove("is-active");
        return;
      }

      if (time - lastPaint < 32) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastPaint = time;

      if (!canvas.width || !canvas.height) resize();
      if (!canvas.width || !canvas.height) {
        frame = window.requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(frequency);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const unit = Math.min(width, height);
      const base = unit * 0.432;
      const reach = unit * 0.062;
      const { color: primary, secondary } = colorsRef.current;

      let lowEnergy = 0;
      const lowBins = 18;
      for (let index = 1; index < lowBins; index += 1) {
        lowEnergy += frequency[index] || 0;
      }
      lowEnergy = Math.min(1, lowEnergy / (lowBins - 1) / 210);

      paint.setTransform(1, 0, 0, 1, 0, 0);
      paint.clearRect(0, 0, width, height);

      const glow = paint.createRadialGradient(
        centerX,
        centerY,
        base * 0.74,
        centerX,
        centerY,
        base + reach * 2.1,
      );
      glow.addColorStop(0, withAlpha(primary, 0));
      glow.addColorStop(0.58, withAlpha(primary, 0.05 + lowEnergy * 0.15));
      glow.addColorStop(1, withAlpha(primary, 0));
      paint.fillStyle = glow;
      paint.fillRect(0, 0, width, height);

      paint.save();
      paint.translate(centerX, centerY);
      paint.lineCap = "round";
      paint.lineWidth = Math.max(1, unit * 0.0022);

      for (let index = 0; index < SEGMENTS; index += 1) {
        const bin = 1 + Math.floor((index / SEGMENTS) * 92);
        const value = (frequency[bin] || 0) / 255;
        if (value < 0.025) continue;

        const angle = (index / SEGMENTS) * TAU - Math.PI / 2;
        const start = base + unit * 0.012;
        const end = start + unit * (0.006 + value * 0.052);

        paint.globalAlpha = 0.16 + value * 0.58;
        paint.strokeStyle = index % 2 === 0 ? primary : secondary;
        paint.beginPath();
        paint.moveTo(Math.cos(angle) * start, Math.sin(angle) * start);
        paint.lineTo(Math.cos(angle) * end, Math.sin(angle) * end);
        paint.stroke();
      }

      analyser.getByteTimeDomainData(waveform);
      const points = 132;
      paint.beginPath();
      for (let index = 0; index <= points; index += 1) {
        const sampleIndex = Math.floor((index / points) * waveform.length) % waveform.length;
        const sample = (waveform[sampleIndex] - 128) / 128;
        const angle = (index / points) * TAU - Math.PI / 2;
        const radius = base + unit * 0.006 + sample * unit * 0.012;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (index === 0) paint.moveTo(x, y);
        else paint.lineTo(x, y);
      }
      paint.closePath();
      paint.globalAlpha = 0.24 + lowEnergy * 0.34;
      paint.strokeStyle = withAlpha(secondary, 0.9);
      paint.lineWidth = Math.max(1, unit * 0.0016);
      paint.stroke();

      paint.restore();
      paint.globalAlpha = 1;

      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (disposed || !ensureAnalyser()) return;
      resize();
      audioContext?.resume?.().catch?.(() => {});
      canvas.classList.add("is-active");
      if (!frame) {
        lastPaint = 0;
        frame = window.requestAnimationFrame(draw);
      }
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      canvas.classList.remove("is-active");
      paint.setTransform(1, 0, 0, 1, 0, 0);
      paint.clearRect(0, 0, canvas.width, canvas.height);
    };

    const unlock = () => {
      audioContext?.resume?.().catch?.(() => {});
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    audio.addEventListener("play", start);
    audio.addEventListener("pause", stop);
    audio.addEventListener("ended", stop);
    document.addEventListener("pointerdown", unlock, { passive: true });

    if (!audio.paused) start();

    return () => {
      disposed = true;
      observer.disconnect();
      audio.removeEventListener("play", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("ended", stop);
      document.removeEventListener("pointerdown", unlock);
      if (frame) window.cancelAnimationFrame(frame);
      canvas.classList.remove("is-active");
      graphRef.current = null;
      applyVolume();
      audioContext?.close?.().catch?.(() => {});
    };
  }, [audioRef]);

  return (
    <canvas
      ref={canvasRef}
      className="record-ambient"
      aria-hidden="true"
    />
  );
};

export default AudioHalo;
