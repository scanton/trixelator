/// <reference lib="webworker" />

import { GenerationParams, buildSvg, generateTrixelation } from '@trixelator/core';

self.onmessage = (event: MessageEvent<{ imageData: ImageData; params: GenerationParams }>) => {
  const { imageData, params } = event.data;
  const result = generateTrixelation(imageData, params);
  const svg = buildSvg(result);
  (self as DedicatedWorkerGlobalScope).postMessage({ result, svg });
};

export {};
