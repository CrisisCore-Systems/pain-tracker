#!/usr/bin/env node

/**
 * SVG to PNG Converter
 * Converts SVG diagrams to PNG format for wider compatibility
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert SVG to PNG
 * @param {string} svgPath - Path to input SVG file
 * @param {string} pngPath - Path to output PNG file
 * @param {number} width - Output width in pixels (optional)
 * @returns {Promise<void>}
 */
async function convertSvgToPng(svgPath, pngPath, width = null) {
  try {
    console.log(`Converting ${basename(svgPath)} to PNG...`);
    
    const svgBuffer = readFileSync(svgPath);
    
    let sharpInstance = sharp(svgBuffer);
    
    if (width) {
      sharpInstance = sharpInstance.resize(width);
    }
    
    await sharpInstance
      .png({
        compressionLevel: 9,
        quality: 100,
      })
      .toFile(pngPath);
    
    console.log(`✓ Successfully created ${basename(pngPath)}`);
  } catch (error) {
    console.error(`✗ Error converting ${basename(svgPath)}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const diagramsDir = resolve(__dirname, '../docs/diagrams');
  
  const diagrams = [
    {
      svg: resolve(diagramsDir, 'architectural-data-flow.svg'),
      png: resolve(diagramsDir, 'architectural-data-flow.png'),
      width: 1400,
    },
    {
      svg: resolve(diagramsDir, 'privacy-first-flow.svg'),
      png: resolve(diagramsDir, 'privacy-first-flow.png'),
      width: 800,
    },
    {
      svg: resolve(diagramsDir, 'data-flow-comparison.svg'),
      png: resolve(diagramsDir, 'data-flow-comparison.png'),
      width: 1200,
    },
  ];
  
  console.log('🖼️  Converting SVG diagrams to PNG format...\n');
  
  for (const diagram of diagrams) {
    try {
      await convertSvgToPng(diagram.svg, diagram.png, diagram.width);
    } catch (error) {
      console.error(`Failed to convert ${basename(diagram.svg)}`);
      // Continue with other diagrams even if one fails
    }
  }
  
  console.log('\n✓ SVG to PNG conversion complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Error during conversion:', error);
    process.exit(1);
  });
}

export { convertSvgToPng };
