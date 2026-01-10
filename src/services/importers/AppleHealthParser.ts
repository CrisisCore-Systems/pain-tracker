import { HealthDataParser, ImportResult, HealthRecord } from './types';
import { parseISO } from 'date-fns';

export class AppleHealthChunkParser implements HealthDataParser {
  name = "Apple Health Export (XML)";

  validateFile(file: File): boolean {
    return file.name.endsWith('.xml') || file.name === 'export.xml';
  }

  async parse(file: File, onProgress: (percent: number) => void): Promise<ImportResult> {
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
    const result: ImportResult = {
      records: [],
      errors: [],
      summary: { totalRecords: 0, dateRange: null }
    };

    let offset = 0;
    let leftover = '';
    const decoder = new TextDecoder();
    
    // Limits to prevent freezing UI
    const RECORD_LIMIT = 50000; // Cap purely for this demo/safety

    while (offset < file.size) {
      if (result.records.length >= RECORD_LIMIT) break;

      const slice = file.slice(offset, offset + CHUNK_SIZE);
      
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(slice);
      });
      
      const text = decoder.decode(buffer, { stream: true });
      
      const lines = (leftover + text).split('\n');
      leftover = lines.pop() || ''; // Save incomplete line

      for (const line of lines) {
        const record = this.parseLine(line);
        if (record) {
          result.records.push(record);
        }
      }

      offset += CHUNK_SIZE;
      onProgress(Math.min((offset / file.size) * 100, 100));
      
      // Yield to main thread
      await new Promise(r => setTimeout(r, 0));
    }

    // Process final leftover
    if (leftover.trim()) {
        const record = this.parseLine(leftover);
        if (record) result.records.push(record);
    }

    result.summary.totalRecords = result.records.length;
    // Calculate date range if needed (omitted for speed)
    
    return result;
  }

  private parseLine(line: string): HealthRecord | null {
    // Optimization: Quick check before regex
    if (!line.includes('<Record')) return null;

    // We mainly care about specifics
    if (line.includes('HKQuantityTypeIdentifierHeartRate')) {
      return this.extractQuantity(line, 'heart_rate');
    }
    if (line.includes('HKQuantityTypeIdentifierStepCount')) {
      return this.extractQuantity(line, 'step_count');
    }
    if (line.includes('HKCategoryTypeIdentifierSleepAnalysis')) {
        return this.extractCategory(line, 'sleep_analysis');
    }
    
    return null;
  }

  private extractQuantity(line: string, type: HealthRecord['type']): HealthRecord | null {
    try {
      const matchValue = line.match(/value="([\d.]+)"/);
      const matchUnit = line.match(/unit="([^"]+)"/);
      const matchStart = line.match(/startDate="([^"]+)"/);
      const matchEnd = line.match(/endDate="([^"]+)"/);

      if (matchValue && matchStart && matchEnd) {
        return {
          type,
          value: parseFloat(matchValue[1]),
          unit: matchUnit ? matchUnit[1] : '',
          startDate: matchStart[1],
          endDate: matchEnd[1]
        };
      }
    } catch { 
        // silent fail
    }
    return null;
  }

    private extractCategory(line: string, type: HealthRecord['type']): HealthRecord | null {
    try {
      const matchValue = line.match(/value="([^"]+)"/); // Often 'HKCategoryValueSleepAnalysisAsleep'
      const matchStart = line.match(/startDate="([^"]+)"/);
      const matchEnd = line.match(/endDate="([^"]+)"/);

      if (matchValue && matchStart && matchEnd) {
        // Map string values to numbers if needed, or keep logic simple
        // In Apple Health: AsleepCore, AsleepDeep, AsleepREM, Awake
        // We'll just store -1 for now as a marker, or map 'Asleep' to 1
        const valStr = matchValue[1];
        let val = 0;
        if (valStr.includes('Asleep')) val = 1;
        
        return {
          type,
          value: val,
          unit: 'state',
          startDate: matchStart[1],
          endDate: matchEnd[1]
        };
      }
    } catch { 
        // silent fail
    }
    return null;
  }
}
