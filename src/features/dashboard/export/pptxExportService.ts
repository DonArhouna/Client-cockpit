import pptxgen from 'pptxgenjs';
import html2canvas from 'html2canvas';
import { Widget } from '@/types';

// ── Brand colors ────────────────────────────────────────────────
const BRAND_DARK   = '0f1b35';
const BRAND_MID    = '1e3a6e';
const BRAND_ACCENT = '3b66ac';
const BRAND_LIGHT  = '5a85cb';
const WHITE        = 'FFFFFF';
const LIGHT_BG     = 'F8FAFC';
const SLATE_100    = 'F1F5F9';
const SLATE_200    = 'E2E8F0';
const SLATE_400    = '94A3B8';
const SLATE_500    = '64748B';
const SLATE_800    = '1E293B';

// ── Page label / filename mapping ────────────────────────────────
export const PAGE_LABELS: Record<string, string> = {
    dashboard:   'Tableau de Bord Exécutif',
    finance:     'Finance & Trésorerie',
    revenue:     'Ventes',
    purchases:   'Achats & Performance',
    stocks:      'Stocks & Articles',
    accounting:  'Comptabilité',
    risks:       'Risques & Recouvrement',
    inventory:   'Inventaire',
    operational: 'Opérationnel',
};

const FILE_LABELS: Record<string, string> = {
    dashboard:   'Tableau_de_Bord',
    finance:     'Finance',
    revenue:     'Ventes',
    purchases:   'Achats',
    stocks:      'Stocks',
    accounting:  'Comptabilite',
    risks:       'Risques',
    inventory:   'Inventaire',
    operational: 'Operationnel',
};

const PERIOD_LABELS: Record<string, string> = {
    current_month:   'Ce mois',
    current_quarter: 'Ce trimestre',
    current_year:    'Cette année',
    custom:          'Période personnalisée',
};

// ── Export options ────────────────────────────────────────────────
export interface ExportOptions {
    pageId:    string;
    orgName?:  string;
    period?:   string;
    currency?: string;
    userName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────
function formatDateFile(): string {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function formatDateLong(): string {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day:     'numeric',
        month:   'long',
        year:    'numeric',
    }).format(new Date());
}

function formatTime(): string {
    return new Intl.DateTimeFormat('fr-FR', {
        hour:   '2-digit',
        minute: '2-digit',
    }).format(new Date());
}

// ── Widget capture ────────────────────────────────────────────────
async function captureWidget(widgetId: string): Promise<string | null> {
    const el = document.querySelector(`[data-export-id="${widgetId}"]`) as HTMLElement | null;
    if (!el) return null;

    try {
        // Temporarily scroll element into view for accurate capture
        el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        await new Promise(r => setTimeout(r, 80)); // let layout settle

        const canvas = await html2canvas(el, {
            scale:           2,
            useCORS:         true,
            backgroundColor: '#ffffff',
            logging:         false,
            removeContainer: true,
        });
        return canvas.toDataURL('image/png');
    } catch {
        return null;
    }
}

// ── Slide builders ────────────────────────────────────────────────

/**
 * Slide 1 — Professional cover / title slide
 */
function addCoverSlide(
    prs:       pptxgen,
    pageLabel: string,
    options:   ExportOptions,
) {
    const slide = prs.addSlide();

    // ── Background layers ─────────────────────────────────────────
    // Dark navy base
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { color: BRAND_DARK },
        line: { color: BRAND_DARK },
    });

    // Right accent panel
    slide.addShape(prs.ShapeType.rect, {
        x: 8.5, y: 0, w: 4.83, h: '100%',
        fill: { color: BRAND_MID },
        line: { color: BRAND_MID },
    });

    // Diagonal separator (simulated with a thin rect rotated)
    slide.addShape(prs.ShapeType.rect, {
        x: 8.2, y: 0, w: 0.5, h: '100%',
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
        rotate: -3,
    });

    // Top accent strip
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.07,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // Bottom accent strip
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 7.43, w: '100%', h: 0.07,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // ── Left panel content ────────────────────────────────────────

    // Brand mark
    slide.addText('COCKPIT', {
        x: 0.55, y: 0.35, w: 4, h: 0.45,
        fontSize:  20,
        bold:      true,
        color:     WHITE,
        fontFace:  'Calibri',
        charSpacing: 6,
    });

    // Brand underline accent
    slide.addShape(prs.ShapeType.rect, {
        x: 0.55, y: 0.82, w: 1.4, h: 0.05,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // Main title (page label)
    slide.addText(pageLabel.toUpperCase(), {
        x:        0.55,
        y:        1.5,
        w:        7.6,
        h:        1.2,
        fontSize: 34,
        bold:     true,
        color:    WHITE,
        fontFace: 'Calibri',
        wrap:     true,
    });

    // Subtitle
    slide.addText('Rapport de performance', {
        x:        0.55,
        y:        2.75,
        w:        7.6,
        h:        0.4,
        fontSize: 15,
        color:    BRAND_LIGHT,
        fontFace: 'Calibri',
        italic:   true,
    });

    // Divider
    slide.addShape(prs.ShapeType.rect, {
        x: 0.55, y: 3.35, w: 7.3, h: 0.03,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // Info block
    const periodLabel = PERIOD_LABELS[options.period ?? ''] ?? (options.period ?? 'Ce mois');
    const currencyLabel = options.currency === 'XOF' ? 'FCFA (XOF)' : options.currency === 'EUR' ? 'Euro (EUR)' : `Dollar (USD)`;

    const infos = [
        { label: 'Organisation', value: options.orgName  || 'Mon Organisation' },
        { label: 'Période',      value: periodLabel },
        { label: 'Devise',       value: currencyLabel },
        { label: 'Généré le',   value: `${formatDateLong()} à ${formatTime()}` },
        ...(options.userName ? [{ label: 'Préparé par', value: options.userName }] : []),
    ];

    const infoStartY = 3.6;
    const lineH      = 0.48;

    infos.forEach((info, i) => {
        const y = infoStartY + i * lineH;
        slide.addText(info.label.toUpperCase(), {
            x: 0.55, y, w: 2.2, h: lineH,
            fontSize: 9,
            color:    SLATE_400,
            fontFace: 'Calibri',
            bold:     true,
        });
        slide.addText(info.value, {
            x: 2.75, y, w: 5.5, h: lineH,
            fontSize: 12,
            color:    WHITE,
            fontFace: 'Calibri',
        });
    });

    // Confidentiality notice
    slide.addText('● CONFIDENTIEL', {
        x: 0.55, y: 7.0, w: 3, h: 0.3,
        fontSize: 8,
        color:    SLATE_500,
        fontFace: 'Calibri',
        bold:     true,
        charSpacing: 2,
    });

    // ── Right panel decoration ─────────────────────────────────────
    // Decorative circles
    const circles = [
        { x: 9.5,  y: 1.0, size: 1.4 },
        { x: 10.5, y: 2.8, size: 0.9 },
        { x: 9.2,  y: 4.2, size: 1.8 },
        { x: 11.2, y: 5.5, size: 0.7 },
    ];

    circles.forEach(c => {
        slide.addShape(prs.ShapeType.ellipse, {
            x: c.x, y: c.y, w: c.size, h: c.size,
            fill: { color: BRAND_ACCENT, transparency: 75 },
            line: { color: BRAND_ACCENT, transparency: 60 },
        });
    });

    // Right panel label
    slide.addText('TABLEAU DE BORD\nEXÉCUTIF', {
        x:        8.8,
        y:        3.2,
        w:        4.2,
        h:        1.5,
        fontSize: 18,
        bold:     true,
        color:    WHITE,
        fontFace: 'Calibri',
        align:    'center',
        valign:   'middle',
        wrap:     true,
        transparency: 40,
    });
}

/**
 * Slide header band (content slides)
 */
function addSlideHeader(
    slide:       pptxgen.Slide,
    prs:         pptxgen,
    pageLabel:   string,
    slideNum:    number,
    totalSlides: number,
) {
    // Dark header band
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.62,
        fill: { color: BRAND_DARK },
        line: { color: BRAND_DARK },
    });

    // Accent underline
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 0.62, w: '100%', h: 0.04,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // COCKPIT brand
    slide.addText('COCKPIT', {
        x: 0.25, y: 0.1, w: 1.8, h: 0.42,
        fontSize:    10,
        bold:        true,
        color:       BRAND_LIGHT,
        fontFace:    'Calibri',
        charSpacing: 4,
    });

    // Separator dot
    slide.addShape(prs.ShapeType.ellipse, {
        x: 1.95, y: 0.27, w: 0.06, h: 0.06,
        fill: { color: BRAND_ACCENT },
        line: { color: BRAND_ACCENT },
    });

    // Page label
    slide.addText(pageLabel, {
        x: 2.1, y: 0.1, w: 8, h: 0.42,
        fontSize: 13,
        bold:     true,
        color:    WHITE,
        fontFace: 'Calibri',
    });

    // Slide number (top-right)
    slide.addText(`${slideNum} / ${totalSlides}`, {
        x: 10.8, y: 0.1, w: 2.3, h: 0.42,
        fontSize: 10,
        color:    SLATE_400,
        align:    'right',
        fontFace: 'Calibri',
    });
}

/**
 * Slide footer
 */
function addSlideFooter(slide: pptxgen.Slide, prs: pptxgen) {
    // Footer bg
    slide.addShape(prs.ShapeType.rect, {
        x: 0, y: 7.35, w: '100%', h: 0.15,
        fill: { color: BRAND_DARK },
        line: { color: BRAND_DARK },
    });

    slide.addText(`COCKPIT  ·  ${formatDateLong()}  ·  Document confidentiel`, {
        x: 0.25, y: 7.36, w: 13.0, h: 0.14,
        fontSize: 7,
        color:    SLATE_400,
        fontFace: 'Calibri',
    });
}

// ── Grid layout constants ─────────────────────────────────────────
const SLIDE_W      = 13.33; // LAYOUT_WIDE width (inches)
const SLIDE_H      = 7.5;   // LAYOUT_WIDE height (inches)
const HEADER_H     = 0.7;
const FOOTER_H     = 0.2;
const MARGIN       = 0.2;
const CARD_RADIUS  = 0.12;

const COLS = 2;
const ROWS = 2;
const WIDGETS_PER_SLIDE = COLS * ROWS; // 4

const CONTENT_H = SLIDE_H - HEADER_H - FOOTER_H;
const cellW     = (SLIDE_W - (COLS + 1) * MARGIN) / COLS;
const cellH     = (CONTENT_H - (ROWS + 1) * MARGIN) / ROWS;

// ── Main export function ──────────────────────────────────────────
export async function exportDashboardToPptx(
    widgets:     Widget[],
    options:     ExportOptions,
    onProgress?: (pct: number) => void,
): Promise<void> {
    const prs = new pptxgen();
    prs.layout = 'LAYOUT_WIDE';  // 13.33" × 7.5"
    prs.author = options.userName ?? 'Cockpit';
    prs.company = options.orgName ?? 'Cockpit';
    prs.subject = PAGE_LABELS[options.pageId] ?? options.pageId;
    prs.title = `${PAGE_LABELS[options.pageId] ?? options.pageId} — Rapport de performance`;

    const pageLabel = PAGE_LABELS[options.pageId] ?? options.pageId;
    const fileLabel = FILE_LABELS[options.pageId] ?? options.pageId;
    const dateStr   = formatDateFile();

    // ── 1. Cover slide ────────────────────────────────────────────
    addCoverSlide(prs, pageLabel, options);
    onProgress?.(5);

    // ── 2. Capture each widget ────────────────────────────────────
    const activeWidgets = widgets.filter(w => w.isActive);

    if (activeWidgets.length === 0) {
        // Empty dashboard slide
        const slide = prs.addSlide();
        addSlideHeader(slide, prs, pageLabel, 2, 2);
        addSlideFooter(slide, prs);
        slide.addShape(prs.ShapeType.rect, {
            x: 0, y: HEADER_H, w: '100%', h: CONTENT_H,
            fill: { color: LIGHT_BG }, line: { color: LIGHT_BG },
        });
        slide.addText('Aucun widget configuré sur cette page.', {
            x: 1, y: 3.5, w: 11, h: 0.8,
            fontSize: 18,
            color: SLATE_400,
            align: 'center',
            fontFace: 'Calibri',
        });
        await prs.writeFile({ fileName: `${fileLabel}_${dateStr}.pptx` });
        onProgress?.(100);
        return;
    }

    const captures: Array<{ widget: Widget; dataUrl: string | null }> = [];
    for (let i = 0; i < activeWidgets.length; i++) {
        const widget = activeWidgets[i];
        const dataUrl = await captureWidget(widget.id);
        captures.push({ widget, dataUrl });
        onProgress?.(5 + Math.round(((i + 1) / activeWidgets.length) * 65));
    }

    // ── 3. Group into slides ──────────────────────────────────────
    const slideGroups: Array<typeof captures> = [];
    for (let i = 0; i < captures.length; i += WIDGETS_PER_SLIDE) {
        slideGroups.push(captures.slice(i, i + WIDGETS_PER_SLIDE));
    }

    const totalSlides = slideGroups.length + 1; // +1 for cover

    // ── 4. Build content slides ───────────────────────────────────
    slideGroups.forEach((group, groupIdx) => {
        const slide    = prs.addSlide();
        const slideNum = groupIdx + 2;

        addSlideHeader(slide, prs, pageLabel, slideNum, totalSlides);
        addSlideFooter(slide, prs);

        // Content area background
        slide.addShape(prs.ShapeType.rect, {
            x: 0, y: HEADER_H, w: '100%', h: CONTENT_H,
            fill: { color: LIGHT_BG },
            line: { color: LIGHT_BG },
        });

        group.forEach((item, idx) => {
            const col = idx % COLS;
            const row = Math.floor(idx / COLS);
            const x   = MARGIN + col * (cellW + MARGIN);
            const y   = HEADER_H + MARGIN + row * (cellH + MARGIN);

            // Card shadow (simulated with slight offset darker rect)
            slide.addShape(prs.ShapeType.roundRect, {
                x: x + 0.04, y: y + 0.04, w: cellW, h: cellH,
                fill: { color: SLATE_200, transparency: 50 },
                line: { color: SLATE_200, transparency: 50 },
                rectRadius: CARD_RADIUS,
            });

            // Card white background
            slide.addShape(prs.ShapeType.roundRect, {
                x, y, w: cellW, h: cellH,
                fill: { color: WHITE },
                line: { color: SLATE_200, pt: 0.75 },
                rectRadius: CARD_RADIUS,
            });

            if (item.dataUrl) {
                // Widget captured as image
                slide.addImage({
                    data: item.dataUrl,
                    x:    x + 0.05,
                    y:    y + 0.05,
                    w:    cellW - 0.1,
                    h:    cellH - 0.1,
                });
            } else {
                // Fallback: styled text placeholder
                // Accent top bar
                slide.addShape(prs.ShapeType.roundRect, {
                    x, y, w: cellW, h: 0.07,
                    fill: { color: BRAND_ACCENT },
                    line: { color: BRAND_ACCENT },
                    rectRadius: CARD_RADIUS,
                });

                // Widget name
                slide.addText(item.widget.name, {
                    x: x + 0.2, y: y + 0.2, w: cellW - 0.4, h: 0.45,
                    fontSize: 13,
                    bold:     true,
                    color:    SLATE_800,
                    fontFace: 'Calibri',
                    wrap:     true,
                });

                // Icon placeholder circle
                slide.addShape(prs.ShapeType.ellipse, {
                    x: x + cellW / 2 - 0.4, y: y + cellH / 2 - 0.35,
                    w: 0.8, h: 0.8,
                    fill: { color: SLATE_100 },
                    line: { color: SLATE_200 },
                });

                // Caption
                slide.addText('Données disponibles dans Cockpit', {
                    x: x + 0.2, y: y + cellH - 0.55, w: cellW - 0.4, h: 0.4,
                    fontSize: 9,
                    color:    SLATE_400,
                    align:    'center',
                    fontFace: 'Calibri',
                    italic:   true,
                });
            }
        });

        onProgress?.(72 + Math.round(((groupIdx + 1) / slideGroups.length) * 22));
    });

    // ── 5. Write file ─────────────────────────────────────────────
    onProgress?.(97);
    await prs.writeFile({ fileName: `${fileLabel}_${dateStr}.pptx` });
    onProgress?.(100);
}
