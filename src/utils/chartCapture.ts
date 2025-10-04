/**
 * Chart Capture Utilities
 * 
 * Provides functions to capture chart elements as data URLs for PDF embedding.
 * Supports both canvas-based and SVG-based charts.
 */

/**
 * Capture a canvas element as a data URL
 */
export const captureCanvasChart = (canvasElement: HTMLCanvasElement): string => {
  try {
    return canvasElement.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Failed to capture canvas chart:', error);
    return '';
  }
};

/**
 * Capture an SVG element as a data URL
 */
export const captureSVGChart = async (svgElement: SVGElement): Promise<string> => {
  try {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Get computed styles
    const styles = window.getComputedStyle(svgElement);
    const width = parseInt(styles.width);
    const height = parseInt(styles.height);
    
    // Set explicit dimensions
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    
    // Create a blob and convert to data URL
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    
    // Convert to PNG via canvas for better PDF compatibility
    return await convertSVGToPNG(svgString, width, height);
  } catch (error) {
    console.error('Failed to capture SVG chart:', error);
    return '';
  }
};

/**
 * Convert SVG string to PNG data URL
 */
const convertSVGToPNG = (svgString: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    // Set canvas dimensions with scale factor for better quality
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    
    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = url;
  });
};

/**
 * Capture a chart by ID or selector
 */
export const captureChartById = async (
  elementId: string,
  type: 'canvas' | 'svg' = 'canvas'
): Promise<string> => {
  const element = document.getElementById(elementId) || document.querySelector(elementId);
  
  if (!element) {
    console.warn(`Chart element not found: ${elementId}`);
    return '';
  }
  
  if (type === 'canvas' && element instanceof HTMLCanvasElement) {
    return captureCanvasChart(element);
  } else if (type === 'svg' && element instanceof SVGElement) {
    return await captureSVGChart(element);
  } else {
    console.warn(`Element ${elementId} is not a ${type} element`);
    return '';
  }
};

/**
 * Capture multiple charts at once
 */
export const captureMultipleCharts = async (
  charts: Array<{ id: string; type: 'canvas' | 'svg' }>
): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  
  for (const chart of charts) {
    results[chart.id] = await captureChartById(chart.id, chart.type);
  }
  
  return results;
};

/**
 * Wait for charts to render before capturing
 */
export const waitForChartsToRender = (timeout = 2000): Promise<void> => {
  return new Promise((resolve) => {
    // Use requestAnimationFrame to wait for rendering
    requestAnimationFrame(() => {
      setTimeout(resolve, timeout);
    });
  });
};

/**
 * Create a placeholder chart image for when actual chart is unavailable
 */
export const createPlaceholderChart = (width = 600, height = 400, text = 'Chart Not Available'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL('image/png');
};
