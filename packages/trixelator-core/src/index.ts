/* Core trixelation utilities extracted from the legacy renderer */

export interface ImageDataLike {
  data: Uint8ClampedArray | number[];
  width: number;
  height: number;
}

export interface Palette {
  name?: string;
  colors: string[];
}

export interface FilterAdjustments {
  hue?: number;
  saturate?: number;
  brightness?: number;
  blur?: number;
  grayscale?: number;
  sepia?: number;
  contrast?: number;
  invert?: number;
}

export interface GenerationParams {
  baseWidth: number;
  sampleSize: number;
  overlap?: number;
  usePaletteMapping?: boolean;
  palette?: Palette | null;
}

export type Point = [number, number];

export interface Triangle {
  points: [Point, Point, Point];
  color: string;
}

export interface GenerationResult {
  triangles: Triangle[];
  bounds: {
    width: number;
    height: number;
  };
}

const EQ_RAD = Math.PI / 3;
const EQ_SIN = Math.sin(EQ_RAD);

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const componentToHex = (c: number) => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

const hexToComponent = (hex: string): [number, number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

const rgbToHex = (rgba: [number, number, number, number]) =>
  `#${componentToHex(rgba[0])}${componentToHex(rgba[1])}${componentToHex(rgba[2])}`;

const colorDistance = (a: [number, number, number, number], b: [number, number, number, number]) =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);

const minColorDiff = (color: [number, number, number, number], data: [number, number, number, number][]) => {
  let diff = Number.POSITIVE_INFINITY;
  for (const d of data) {
    const colorDiff = colorDistance(color, d);
    diff = Math.min(diff, colorDiff);
  }
  return diff;
};

const averagePixelData = (image: ImageDataLike, startX: number, startY: number, size: number) => {
  const { data, width, height } = image;
  const clampedStartX = clamp(startX, 0, width);
  const clampedStartY = clamp(startY, 0, height);
  const maxX = clamp(startX + size, 0, width);
  const maxY = clamp(startY + size, 0, height);
  let count = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;

  for (let y = clampedStartY; y < maxY; y++) {
    for (let x = clampedStartX; x < maxX; x++) {
      const idx = (y * width + x) * 4;
      const pr = data[idx];
      const pg = data[idx + 1];
      const pb = data[idx + 2];
      const pa = data[idx + 3];
      r += pr;
      g += pg;
      b += pb;
      a += pa;
      count++;
    }
  }

  if (!count) {
    return [0, 0, 0, 255] as [number, number, number, number];
  }

  return [Math.floor(r / count), Math.floor(g / count), Math.floor(b / count), Math.floor(a / count)] as [
    number,
    number,
    number,
    number,
  ];
};

export const buildFilterString = (adjust: FilterAdjustments) => {
  const filters: string[] = [];
  if (adjust.hue) filters.push(`hue-rotate(${adjust.hue}deg)`);
  if (adjust.saturate) filters.push(`saturate(${adjust.saturate})`);
  if (adjust.brightness) filters.push(`brightness(${adjust.brightness})`);
  if (adjust.blur) filters.push(`blur(${adjust.blur}px)`);
  if (adjust.grayscale) filters.push(`grayscale(${adjust.grayscale})`);
  if (adjust.sepia) filters.push(`sepia(${adjust.sepia})`);
  if (adjust.contrast) filters.push(`contrast(${adjust.contrast})`);
  if (adjust.invert) filters.push(`invert(${adjust.invert})`);
  return filters.join(" ");
};

const getNearestPaletteColor = (rgba: [number, number, number, number], palette?: Palette | null) => {
  if (!palette || !palette.colors || !palette.colors.length) {
    return rgbToHex(rgba);
  }
  let diff = Number.POSITIVE_INFINITY;
  let bestColor = palette.colors[0];
  for (const c of palette.colors) {
    const componentColor = hexToComponent(c);
    const d = colorDistance(componentColor, rgba);
    if (d < diff) {
      diff = d;
      bestColor = c;
    }
  }
  return bestColor;
};

export const generateTrixelation = (image: ImageDataLike, params: GenerationParams): GenerationResult => {
  const baseWidth = Number(params.baseWidth);
  const halfBase = baseWidth / 2;
  const baseSin = baseWidth * EQ_SIN;
  const overlapSize = params.overlap ?? 0.75;
  const sampleSize = Math.max(1, Math.floor(params.sampleSize));
  const widthSteps = Math.floor(image.width / halfBase);
  const heightSteps = Math.floor(image.height / baseSin);
  const triangles: Triangle[] = [];

  for (let y = 0; y < heightSteps; y++) {
    for (let x = 0; x < widthSteps; x++) {
      const pixelData = averagePixelData(image, Math.floor(x * halfBase), Math.floor(y * baseSin), sampleSize);
      const color =
        params.usePaletteMapping && params.palette ? getNearestPaletteColor(pixelData, params.palette) : rgbToHex(pixelData);
      const pointUp = (x + y) % 2 === 1;
      const points: [Point, Point, Point] = pointUp
        ? [
            [
              Math.round(x * halfBase - overlapSize - halfBase),
              Math.round(y * baseSin + baseSin + overlapSize),
            ],
            [
              Math.round(x * halfBase + baseWidth + overlapSize - halfBase),
              Math.round(y * baseSin + baseSin + overlapSize),
            ],
            [Math.round(x * halfBase), Math.round(y * baseSin - overlapSize)],
          ]
        : [
            [
              Math.round(x * halfBase - overlapSize - halfBase),
              Math.round(y * baseSin - overlapSize),
            ],
            [
              Math.round(x * halfBase + baseWidth + overlapSize - halfBase),
              Math.round(y * baseSin - overlapSize),
            ],
            [Math.round(x * halfBase), Math.round(y * baseSin + baseSin + overlapSize)],
          ];
      triangles.push({ points, color });
    }
  }

  return {
    triangles,
    bounds: {
      width: image.width - baseWidth,
      height: image.height - baseSin,
    },
  };
};

export const buildSvg = (result: GenerationResult) => {
  const { triangles, bounds } = result;
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bounds.width} ${bounds.height}" xml:space="preserve">`,
    '<g>',
  ];
  for (const tri of triangles) {
    const points = tri.points.map((p) => `${p[0]},${p[1]}`).join(' ');
    lines.push(`<polygon fill="${tri.color}" points="${points}" />`);
  }
  lines.push('</g></svg>');
  return lines.join('\n');
};

export const renderToCanvas = (canvas: HTMLCanvasElement, result: GenerationResult) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = Math.ceil(result.bounds.width);
  canvas.height = Math.ceil(result.bounds.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const tri of result.triangles) {
    ctx.beginPath();
    ctx.moveTo(tri.points[0][0], tri.points[0][1]);
    ctx.lineTo(tri.points[1][0], tri.points[1][1]);
    ctx.lineTo(tri.points[2][0], tri.points[2][1]);
    ctx.closePath();
    ctx.fillStyle = tri.color;
    ctx.fill();
  }
};

export const simplifyPalette = (colors: string[], threshold: number) => {
  const simplified: string[] = [];
  const componentVals: [number, number, number, number][] = [];
  const uniqueColors = [...colors];
  for (const color of uniqueColors) {
    const val = hexToComponent(color);
    const diff = minColorDiff(val, componentVals);
    if (diff > threshold) {
      simplified.push(color);
      componentVals.push(val);
    }
  }
  simplified.sort((a, b) => {
    const aC = hexToComponent(a);
    const bC = hexToComponent(b);
    return bC[0] + bC[1] + bC[2] - (aC[0] + aC[1] + aC[2]);
  });
  return simplified;
};

export const createPaletteFromImage = (image: ImageDataLike, params: { baseWidth: number; sampleSize: number }) => {
  const { baseWidth, sampleSize } = params;
  const halfBase = baseWidth / 2;
  const baseSin = baseWidth * EQ_SIN;
  const widthSteps = Math.floor(image.width / halfBase);
  const heightSteps = Math.floor(image.height / baseSin);
  const colors: string[] = [];
  for (let y = 0; y < heightSteps; y++) {
    for (let x = 0; x < widthSteps; x++) {
      const pixelData = averagePixelData(image, Math.floor(x * halfBase), Math.floor(y * baseSin), sampleSize);
      const color = rgbToHex(pixelData).toLowerCase();
      if (!colors.includes(color)) colors.push(color);
    }
  }
  colors.sort((a, b) => {
    const aC = hexToComponent(a);
    const bC = hexToComponent(b);
    return bC[0] + bC[1] + bC[2] - (aC[0] + aC[1] + aC[2]);
  });
  return colors;
};

export type { GenerationResult as Trixelation };
