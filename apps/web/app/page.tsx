'use client';

import {
  GenerationParams,
  GenerationResult,
  Palette,
  buildFilterString,
  buildSvg,
  createPaletteFromImage,
  generateTrixelation,
  renderToCanvas,
  simplifyPalette,
} from '@trixelator/core';
import { useEffect, useMemo, useRef, useState } from 'react';

type WorkerResult = {
  result: GenerationResult;
  svg: string;
};

const defaultFilters = {
  hue: 0,
  saturate: 0,
  brightness: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  contrast: 0,
  invert: 0,
};

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [baseWidth, setBaseWidth] = useState(40);
  const [sampleSize, setSampleSize] = useState(15);
  const [usePaletteMapping, setUsePaletteMapping] = useState(false);
  const [paletteList, setPaletteList] = useState<string[]>([]);
  const [selectedPaletteName, setSelectedPaletteName] = useState<string | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [simplifyAmount, setSimplifyAmount] = useState(10);
  const [filters, setFilters] = useState(defaultFilters);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [status, setStatus] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mosaicCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const worker = new Worker(new URL('./workers/trixelWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      setResult(event.data.result);
      setSvgOutput(event.data.svg);
      setIsWorking(false);
      setStatus('');
      renderResult(event.data.result);
    };
    worker.onerror = (err) => {
      console.error(err);
      setStatus('Worker failed; fell back to main thread.');
      setIsWorking(false);
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetch('/palettes/index.json')
      .then((res) => res.json())
      .then((names: string[]) => {
        setPaletteList(names);
        if (names.length) {
          setSelectedPaletteName(names[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus('Unable to load palettes');
      });
  }, []);

  useEffect(() => {
    if (!selectedPaletteName) return;
    fetch(`/palettes/${selectedPaletteName}.json`)
      .then((res) => res.json())
      .then((data: Palette) => setPalette(data))
      .catch((err) => {
        console.error(err);
        setStatus('Failed to load palette');
      });
  }, [selectedPaletteName]);

  useEffect(() => {
    if (imageElementRef.current) {
      drawPreview(imageElementRef.current);
    }
  }, [filters]);

  const triangleCount = useMemo(() => (result ? result.triangles.length : 0), [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = objectUrl;
    const img = new Image();
    img.onload = () => {
      imageElementRef.current = img;
      setImageSrc(objectUrl);
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      drawPreview(img);
    };
    img.src = objectUrl;
  };

  const drawPreview = (img: HTMLImageElement) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / img.naturalWidth);
    canvas.width = Math.floor(img.naturalWidth * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = buildFilterString(filters);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const handleGenerate = () => {
    if (!imageElementRef.current) {
      setStatus('Select an image to get started.');
      return;
    }
    const img = imageElementRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = buildFilterString(filters);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const params: GenerationParams = {
      baseWidth,
      sampleSize,
      usePaletteMapping,
      palette,
    };
    setIsWorking(true);
    setStatus('Generating trixels…');

    if (workerRef.current) {
      workerRef.current.postMessage({ imageData, params });
    } else {
      const generation = generateTrixelation(imageData, params);
      const svg = buildSvg(generation);
      setResult(generation);
      setSvgOutput(svg);
      renderResult(generation);
      setIsWorking(false);
      setStatus('');
    }
  };

  const renderResult = (generation: GenerationResult) => {
    if (!mosaicCanvasRef.current) return;
    renderToCanvas(mosaicCanvasRef.current, generation);
  };

  const handleDownloadPng = () => {
    if (!result) return;
    const canvas = document.createElement('canvas');
    renderToCanvas(canvas as HTMLCanvasElement, result);
    const link = document.createElement('a');
    link.download = 'trixelator.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!result) return;
    const svg = svgOutput ?? buildSvg(result);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trixelator.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSimplifyPalette = () => {
    if (!palette) return;
    const simplified = simplifyPalette(palette.colors, simplifyAmount);
    setPalette({ ...palette, colors: simplified });
  };

  const handleSamplePaletteFromImage = () => {
    if (!imageElementRef.current) {
      setStatus('Load an image before sampling a palette.');
      return;
    }
    const img = imageElementRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = buildFilterString(filters);
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colors = createPaletteFromImage(imageData, { baseWidth, sampleSize });
    setPalette({ name: 'Sampled palette', colors });
    setUsePaletteMapping(true);
  };

  const paletteSwatches = useMemo(() => palette?.colors.slice(0, 16) ?? [], [palette]);

  return (
    <main>
      <header>
        <div className="brand">
          <div className="badge">Next + Electron</div>
          <div>
            <h1>Trixelator</h1>
            <p className="lede">Image-to-triangle mosaics with palette control and exports.</p>
          </div>
        </div>
        <div className="inline-actions">
          <button onClick={handleGenerate} disabled={!imageSrc || isWorking}>
            {isWorking ? 'Working…' : 'Generate'}
          </button>
          <button className="secondary" onClick={() => fileInputRef.current?.click()}>
            Import Image
          </button>
        </div>
      </header>

      <div className="grid">
        <section className="panel">
          <h2>Image</h2>
          <div
            className="upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) loadImage(file);
            }}
          >
            <p style={{ marginBottom: 8 }}>
              Drag an image here or{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                browse
              </span>
              .
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {imageSize && <div className="tag">{imageSize.width} x {imageSize.height}</div>}
          </div>
          <div className="canvas-wrap" style={{ marginTop: 12 }}>
            <canvas ref={previewCanvasRef} />
          </div>
          <p className="status">Filtered preview (applies the adjustments below).</p>
        </section>

        <section className="panel">
          <h2>Controls</h2>
          <div className="controls">
            <div className="control">
              <label>Base Width</label>
              <input type="number" value={baseWidth} min={4} onChange={(e) => setBaseWidth(Number(e.target.value))} />
            </div>
            <div className="control">
              <label>Sample Size</label>
              <input type="number" value={sampleSize} min={1} onChange={(e) => setSampleSize(Number(e.target.value))} />
            </div>
            <div className="control">
              <label>Palette</label>
              <select value={selectedPaletteName ?? ''} onChange={(e) => setSelectedPaletteName(e.target.value)}>
                {paletteList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="inline-actions" style={{ marginTop: 6 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  <input type="checkbox" checked={usePaletteMapping} onChange={(e) => setUsePaletteMapping(e.target.checked)} /> Map to palette
                </label>
                <button className="ghost" onClick={handleSimplifyPalette} disabled={!palette}>
                  Simplify ({simplifyAmount})
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={simplifyAmount}
                onChange={(e) => setSimplifyAmount(Number(e.target.value))}
              />
              <div className="palette-preview" style={{ marginTop: 8 }}>
                {paletteSwatches.map((c) => (
                  <span key={c} className="palette-swatch" style={{ background: c }} />
                ))}
                {palette && <span className="tag">{palette.colors.length} colors</span>}
              </div>
            </div>
            <div className="control">
              <label>Sample palette from image</label>
              <button className="secondary" onClick={handleSamplePaletteFromImage} disabled={!imageSrc}>
                Build palette from current image
              </button>
            </div>
            <div className="control">
              <label>Hue</label>
              <input type="range" min={0} max={360} value={filters.hue} onChange={(e) => setFilters({ ...filters, hue: Number(e.target.value) })} />
            </div>
            <div className="control">
              <label>Saturation</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={filters.saturate}
                onChange={(e) => setFilters({ ...filters, saturate: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Brightness</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={filters.brightness}
                onChange={(e) => setFilters({ ...filters, brightness: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Contrast</label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.01}
                value={filters.contrast}
                onChange={(e) => setFilters({ ...filters, contrast: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Grayscale</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={filters.grayscale}
                onChange={(e) => setFilters({ ...filters, grayscale: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Sepia</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={filters.sepia}
                onChange={(e) => setFilters({ ...filters, sepia: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Invert</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={filters.invert}
                onChange={(e) => setFilters({ ...filters, invert: Number(e.target.value) })}
              />
            </div>
            <div className="control">
              <label>Blur</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={filters.blur}
                onChange={(e) => setFilters({ ...filters, blur: Number(e.target.value) })}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Output</h2>
          <div className="canvas-wrap">
            <canvas ref={mosaicCanvasRef} />
          </div>
          <div className="actions">
            <button onClick={handleGenerate} disabled={!imageSrc || isWorking}>
              {isWorking ? 'Working…' : 'Generate'}
            </button>
            <button className="secondary" disabled={!result} onClick={handleDownloadPng}>
              Download PNG
            </button>
            <button className="secondary" disabled={!result} onClick={handleDownloadSvg}>
              Download SVG
            </button>
          </div>
          <p className="status">
            {status ||
              (result
                ? `${triangleCount.toLocaleString()} triangles · ${Math.round(result.bounds.width)} x ${Math.round(
                    result.bounds.height
                  )} output`
                : 'Generate a mosaic to preview and export.')}
          </p>
        </section>
      </div>
    </main>
  );
}
