import * as React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScreenshotPickerProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function ScreenshotPicker({ onCapture, onCancel }: ScreenshotPickerProps) {
  const [selection, setSelection] = React.useState<Rect | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const startPos = React.useRef<{ x: number; y: number } | null>(null);
  const isDragging = React.useRef(false);

  // Touche Échap pour annuler
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const getPos = (e: React.MouseEvent) => ({
    x: e.clientX,
    y: e.clientY,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pos = getPos(e);
    startPos.current = pos;
    isDragging.current = true;
    setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !startPos.current) return;
    const pos = getPos(e);
    setSelection({
      x: startPos.current.x,
      y: startPos.current.y,
      width: pos.x - startPos.current.x,
      height: pos.y - startPos.current.y,
    });
  };

  const handleMouseUp = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (!selection || Math.abs(selection.width) < 10 || Math.abs(selection.height) < 10) {
      setSelection(null);
      return;
    }

    setIsCapturing(true);
    await captureZone(selection);
  };

  const captureZone = async (rect: Rect) => {
    const x = Math.min(rect.x, rect.x + rect.width);
    const y = Math.min(rect.y, rect.y + rect.height);
    const w = Math.abs(rect.width);
    const h = Math.abs(rect.height);

    try {
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        width: w,
        height: h,
        x: x + window.scrollX,
        y: y + window.scrollY,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `capture-zone-${timestamp}.png`, { type: 'image/png' });
        onCapture(file);
      }, 'image/png');
    } catch {
      setIsCapturing(false);
      setSelection(null);
    }
  };

  // Coordonnées normalisées pour l'affichage du rectangle
  const displayRect = selection
    ? {
        left: Math.min(selection.x, selection.x + selection.width),
        top: Math.min(selection.y, selection.y + selection.height),
        width: Math.abs(selection.width),
        height: Math.abs(selection.height),
      }
    : null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        cursor: isCapturing ? 'wait' : 'crosshair',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Overlay sombre en 4 bandes autour de la sélection, ou plein si pas de sélection */}
      {!displayRect ? (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
      ) : (
        <>
          {/* haut */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: displayRect.top, background: 'rgba(0,0,0,0.5)' }} />
          {/* bas */}
          <div style={{ position: 'absolute', top: displayRect.top + displayRect.height, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} />
          {/* gauche */}
          <div style={{ position: 'absolute', top: displayRect.top, left: 0, width: displayRect.left, height: displayRect.height, background: 'rgba(0,0,0,0.5)' }} />
          {/* droite */}
          <div style={{ position: 'absolute', top: displayRect.top, left: displayRect.left + displayRect.width, right: 0, height: displayRect.height, background: 'rgba(0,0,0,0.5)' }} />

          {/* Bordure de sélection */}
          <div
            style={{
              position: 'absolute',
              top: displayRect.top,
              left: displayRect.left,
              width: displayRect.width,
              height: displayRect.height,
              border: '2px solid #3b66ac',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          />

          {/* Coins */}
          {[
            { top: displayRect.top - 2, left: displayRect.left - 2 },
            { top: displayRect.top - 2, left: displayRect.left + displayRect.width - 6 },
            { top: displayRect.top + displayRect.height - 6, left: displayRect.left - 2 },
            { top: displayRect.top + displayRect.height - 6, left: displayRect.left + displayRect.width - 6 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                background: '#ffffff',
                borderRadius: 1,
                pointerEvents: 'none',
                ...pos,
              }}
            />
          ))}

          {/* Dimensions */}
          <div
            style={{
              position: 'absolute',
              top: displayRect.top > 30 ? displayRect.top - 28 : displayRect.top + displayRect.height + 8,
              left: displayRect.left + displayRect.width / 2,
              transform: 'translateX(-50%)',
              background: '#3b66ac',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {Math.round(displayRect.width)} × {Math.round(displayRect.height)}
          </div>
        </>
      )}

      {/* Tooltip instruction */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,23,42,0.92)',
          color: '#fff',
          fontSize: 13,
          padding: '8px 16px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b66ac', display: 'inline-block', flexShrink: 0 }} />
        {isCapturing ? 'Capture en cours…' : 'Tracez un rectangle autour de la zone problématique'}
        {!isCapturing && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>— Échap pour annuler</span>}
      </div>

      {/* Bouton annuler */}
      {!isCapturing && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onCancel}
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            padding: '8px 20px',
            fontSize: 13,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          Annuler la capture
        </button>
      )}
    </div>,
    document.body
  );
}