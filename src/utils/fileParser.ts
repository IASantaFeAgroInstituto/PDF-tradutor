import Papa from 'papaparse';
import { GlossaryEntry } from '../types';

export async function parseGlossaryFile(file: File): Promise<GlossaryEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        const entries: GlossaryEntry[] = results.data
          .filter((row: any[]) => row.length >= 2 && row[0] && row[1])
          .map((row: any[]) => ({
            id: Math.random().toString(36).substr(2, 9),
            sourceText: row[0],
            targetText: row[1],
            context: row[2] || undefined,
            category: row[3] || undefined,
            createdAt: new Date(),
          }));
        resolve(entries);
      },
      error: (error) => reject(error),
      skipEmptyLines: true,
    });
  });
}