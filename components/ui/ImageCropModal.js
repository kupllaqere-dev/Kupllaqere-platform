'use client';
import { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { PrimaryButton, GhostButton } from '@/components/ui/Button';

// Space (px) between the crop zone border and the container edge — lets the user
// see what's outside the crop area before committing.
const MARGIN = 44;

/* ─── Styled components ────────────────────────────────────────── */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: 1.5rem;
`;

const ModalBox = styled.div`
  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radii['2xl']};
  padding: 1.5rem;
  width: min(${({ $maxW }) => $maxW}px, calc(100vw - 3rem));
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.display};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

// Outer container — shows the full image + margin around the crop zone
const Container = styled.div`
  position: relative;
  width: 100%;
  height: ${({ $h }) => $h}px;
  background: ${({ theme }) => theme.colors.bg.root};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  cursor: ${({ $ready }) => $ready ? 'grab' : 'default'};
  user-select: none;
  touch-action: none;

  &:active { cursor: ${({ $ready }) => $ready ? 'grabbing' : 'default'}; }
`;

// Full-container layer with the blurred + darkened image
const BlurLayer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

// The sharp crop zone window, clipped via overflow:hidden + background-image
const CropWindow = styled.div`
  position: absolute;
  left: ${({ $cx }) => $cx}px;
  top:  ${({ $cy }) => $cy}px;
  width: ${({ $cw }) => $cw}px;
  height: ${({ $ch }) => $ch}px;
  border-radius: ${({ $circular }) => $circular ? '50%' : '6px'};
  overflow: hidden;
  background-repeat: no-repeat;
  pointer-events: none;
  opacity: ${({ $ready }) => $ready ? 1 : 0};
  transition: opacity 0.2s;
`;

// Decorative border + corner handles drawn on top of CropWindow
const CropBorder = styled.div`
  position: absolute;
  left: ${({ $cx }) => $cx}px;
  top:  ${({ $cy }) => $cy}px;
  width: ${({ $cw }) => $cw}px;
  height: ${({ $ch }) => $ch}px;
  border-radius: ${({ $circular }) => $circular ? '50%' : '6px'};
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
  opacity: ${({ $ready }) => $ready ? 1 : 0};
  transition: opacity 0.2s;
`;

// L-shaped corner handles
const cornerBase = css`
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: #fff;
  border-style: solid;
  border-width: 0;
`;
const CornerTL = styled.div`${cornerBase} top: -1px; left: -1px; border-top-width: 2.5px; border-left-width: 2.5px; border-top-left-radius: 5px;`;
const CornerTR = styled.div`${cornerBase} top: -1px; right: -1px; border-top-width: 2.5px; border-right-width: 2.5px; border-top-right-radius: 5px;`;
const CornerBL = styled.div`${cornerBase} bottom: -1px; left: -1px; border-bottom-width: 2.5px; border-left-width: 2.5px; border-bottom-left-radius: 5px;`;
const CornerBR = styled.div`${cornerBase} bottom: -1px; right: -1px; border-bottom-width: 2.5px; border-right-width: 2.5px; border-bottom-right-radius: 5px;`;

/* ─── Zoom slider ──────────────────────────────────────────────── */
const ZoomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ZoomIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text.muted};
  user-select: none;
`;

const ZoomSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  background: ${({ theme }) => theme.colors.border.medium};
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &:disabled { opacity: 0.35; cursor: default; }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent.violet};
    cursor: pointer;
    box-shadow: 0 0 6px rgba(139, 92, 246, 0.55);
  }
  &::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent.violet};
    cursor: pointer;
    border: none;
    box-shadow: 0 0 6px rgba(139, 92, 246, 0.55);
  }
`;

const ZoomVal = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  min-width: 2.8rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

/* ─── Footer ───────────────────────────────────────────────────── */
const Hint = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.625rem;
`;

const ErrMsg = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.rose};
  margin: 0 auto 0 0;
`;

/* ─── Component ────────────────────────────────────────────────── */
export default function ImageCropModal({
  open,
  onClose,
  onConfirm,
  file,
  circular = false,
  outputW = 256,
  outputH = 256,
  title = 'Adjust image',
}) {
  const containerRef = useRef(null);
  const imgRef       = useRef(null);   // blurred img — also used for canvas drawImage
  const cropWinRef   = useRef(null);   // CropWindow div — background-image shows clear crop
  const readyRef     = useRef(false);

  // Mutable state stored in refs to avoid re-renders on every drag frame
  const s = useRef({ pos: { x: 0, y: 0 }, scale: 1, natW: 0, natH: 0 });
  const g = useRef({ cropX: MARGIN, cropY: MARGIN, cropW: 100, cropH: 100, fitScale: 1 });
  const drag  = useRef(null);
  const touch = useRef(null);

  const [imgSrc,     setImgSrc]     = useState(null);
  const [ready,      setReady]      = useState(false);
  const [containerH, setContainerH] = useState(200);
  const [cropGeom,   setCropGeom]   = useState({ cropX: MARGIN, cropY: MARGIN, cropW: 100, cropH: 100 });
  const [sliderPct,  setSliderPct]  = useState(100);
  const [busy,       setBusy]       = useState(false);
  const [err,        setErr]        = useState('');

  const aspect = outputW / outputH;

  // ── Load file into object URL ────────────────────────────────
  useEffect(() => {
    if (!file) return;
    readyRef.current = false;
    setReady(false);
    setErr('');
    setSliderPct(100);
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Apply transform to both the blurred img and the crop background ──
  function applyTransform() {
    const { pos, scale, natW, natH } = s.current;
    const { cropX, cropY } = g.current;

    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale})`;
    }
    if (cropWinRef.current) {
      cropWinRef.current.style.backgroundSize     = `${natW * scale}px ${natH * scale}px`;
      cropWinRef.current.style.backgroundPosition = `${pos.x - cropX}px ${pos.y - cropY}px`;
    }
  }

  // ── Image load — compute geometry and set initial view ────────
  function handleImgLoad(e) {
    const img = e.currentTarget;
    const el  = containerRef.current;
    if (!el) return;

    const containerW = el.clientWidth;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    // Crop zone fills the container minus the margin on every side
    const cropW = containerW - MARGIN * 2;
    const cropH = cropW / aspect;
    const cropX = MARGIN;
    const cropY = MARGIN;
    const cH    = cropH + MARGIN * 2;

    // Start with the whole image visible (contain scale)
    const fitScale = Math.min(containerW / nw, cH / nh);

    g.current = { cropX, cropY, cropW, cropH, fitScale };
    s.current.natW  = nw;
    s.current.natH  = nh;
    s.current.scale = fitScale;
    s.current.pos   = {
      x: (containerW - nw * fitScale) / 2,
      y: (cH        - nh * fitScale) / 2,
    };

    // Style the blurred background image
    img.style.cssText = [
      'position:absolute', 'top:0', 'left:0',
      `width:${nw}px`, `height:${nh}px`,
      'transform-origin:0 0',
      'will-change:transform',
      'pointer-events:none',
      'user-select:none',
      'filter:blur(7px) brightness(0.38)',
    ].join(';');

    // Point the crop window's background-image at the same source
    if (cropWinRef.current) {
      cropWinRef.current.style.backgroundImage  = `url("${img.src}")`;
      cropWinRef.current.style.backgroundRepeat = 'no-repeat';
    }

    applyTransform();

    setContainerH(Math.ceil(cH));
    setCropGeom({ cropX, cropY, cropW, cropH });
    setSliderPct(100);
    readyRef.current = true;
    setReady(true);
  }

  // ── Global mouse drag ─────────────────────────────────────────
  useEffect(() => {
    function onMove(e) {
      if (!drag.current) return;
      const d = drag.current;
      s.current.pos = { x: d.ix + e.clientX - d.sx, y: d.iy + e.clientY - d.sy };
      applyTransform();
    }
    function onUp() { drag.current = null; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // ── Touch drag + pinch zoom on container ─────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function pDist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

    function onTouchStart(e) {
      e.preventDefault();
      const t = e.touches;
      const { pos, scale } = s.current;
      if (t.length === 1) {
        touch.current = { type: 'drag', sx: t[0].clientX, sy: t[0].clientY, ix: pos.x, iy: pos.y };
      } else if (t.length >= 2) {
        touch.current = { type: 'pinch', d0: pDist(t), s0: scale, ix: pos.x, iy: pos.y };
      }
    }

    function onTouchMove(e) {
      e.preventDefault();
      const tc = touch.current;
      if (!tc) return;
      const t = e.touches;

      if (tc.type === 'drag' && t.length === 1) {
        s.current.pos = { x: tc.ix + t[0].clientX - tc.sx, y: tc.iy + t[0].clientY - tc.sy };
      } else if (tc.type === 'pinch' && t.length >= 2) {
        const { fitScale } = g.current;
        const newScale = Math.min(fitScale * 10, Math.max(fitScale, tc.s0 * pDist(t) / tc.d0));
        const { cropX, cropY, cropW, cropH } = g.current;
        const cx = cropX + cropW / 2;
        const cy = cropY + cropH / 2;
        const r  = newScale / s.current.scale;
        s.current.scale = newScale;
        s.current.pos   = { x: cx - r * (cx - tc.ix), y: cy - r * (cy - tc.iy) };
      }
      applyTransform();
    }

    function onTouchEnd() {
      touch.current = null;
      // Sync slider to the scale that pinch ended at
      const { fitScale } = g.current;
      if (fitScale) setSliderPct(Math.round((s.current.scale / fitScale) * 100));
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, []);

  // ── Mouse down — start drag ───────────────────────────────────
  function handleMouseDown(e) {
    if (!readyRef.current) return;
    e.preventDefault();
    const { pos } = s.current;
    drag.current = { sx: e.clientX, sy: e.clientY, ix: pos.x, iy: pos.y };
  }

  // ── Slider — zoom toward crop-zone center ─────────────────────
  function handleSlider(e) {
    const pct = parseInt(e.target.value, 10);
    const { fitScale, cropX, cropY, cropW, cropH } = g.current;
    const newScale = fitScale * (pct / 100);
    const cx = cropX + cropW / 2;
    const cy = cropY + cropH / 2;
    const { pos, scale } = s.current;
    const r = newScale / scale;
    s.current.scale = newScale;
    s.current.pos   = { x: cx - r * (cx - pos.x), y: cy - r * (cy - pos.y) };
    applyTransform();
    setSliderPct(pct);
  }

  // ── Apply — render crop zone to canvas → WebP blob ───────────
  async function handleApply() {
    if (!imgRef.current || !readyRef.current) return;
    setBusy(true);
    setErr('');
    try {
      const { pos, scale } = s.current;
      const { cropX, cropY, cropW, cropH } = g.current;

      // Map crop zone back to natural image coordinates
      const srcX = (cropX - pos.x) / scale;
      const srcY = (cropY - pos.y) / scale;
      const srcW = cropW / scale;
      const srcH = cropH / scale;

      const canvas = document.createElement('canvas');
      canvas.width  = outputW;
      canvas.height = outputH;
      canvas.getContext('2d').drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, outputW, outputH);

      const blob = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/webp', 0.85),
      );
      onConfirm(blob);
    } catch {
      setErr('Export failed — please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const { cropX, cropY, cropW, cropH } = cropGeom;

  return (
    <Overlay onClick={onClose}>
      <ModalBox $maxW={circular ? 400 : 700} onClick={e => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>

        {/* ── Image area ── */}
        <Container ref={containerRef} $h={containerH} $ready={ready} onMouseDown={handleMouseDown}>
          {/* Layer 1 — blurred + dark, shows context outside crop zone */}
          <BlurLayer>
            {imgSrc && (
              <img ref={imgRef} src={imgSrc} alt="" onLoad={handleImgLoad} draggable={false} />
            )}
          </BlurLayer>

          {/* Layer 2 — clear image visible only inside the crop zone */}
          <CropWindow
            ref={cropWinRef}
            $cx={cropX} $cy={cropY} $cw={cropW} $ch={cropH}
            $circular={circular}
            $ready={ready}
          />

          {/* Layer 3 — decorative border + corner handles */}
          <CropBorder $cx={cropX} $cy={cropY} $cw={cropW} $ch={cropH} $circular={circular} $ready={ready}>
            {!circular && (
              <>
                <CornerTL /><CornerTR />
                <CornerBL /><CornerBR />
              </>
            )}
          </CropBorder>
        </Container>

        {/* ── Zoom slider ── */}
        <ZoomRow>
          <ZoomIcon>−</ZoomIcon>
          <ZoomSlider
            type="range"
            min={100}
            max={1000}
            step={1}
            value={sliderPct}
            onChange={handleSlider}
            disabled={!ready}
          />
          <ZoomIcon>+</ZoomIcon>
          <ZoomVal>{(sliderPct / 100).toFixed(1)}×</ZoomVal>
        </ZoomRow>

        <Hint>Drag to reposition · use the slider to zoom</Hint>

        <Footer>
          {err && <ErrMsg>{err}</ErrMsg>}
          <GhostButton size="sm" onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton size="sm" onClick={handleApply} disabled={!ready || busy}>
            {busy ? 'Applying…' : 'Apply'}
          </PrimaryButton>
        </Footer>
      </ModalBox>
    </Overlay>
  );
}
