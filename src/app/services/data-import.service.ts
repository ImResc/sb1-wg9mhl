import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class DataImportService {
  constructor(private http: HttpClient) {}

  importData(file: File): Observable<any[]> {
    if (file.name.endsWith('.csv')) {
      return this.importCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return this.importExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  private importCSV(file: File): Observable<any[]> {
    return new Observable(observer => {
      Papa.parse(file, {
        complete: (results) => {
          observer.next(this.preprocessData(results.data));
          observer.complete();
        },
        header: true,
        dynamicTyping: true
      });
    });
  }

  private importExcel(file: File): Observable<any[]> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        observer.next(this.preprocessData(jsonData));
        observer.complete();
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private preprocessData(data: any[]): any[] {
    // Implement data cleansing and preprocessing logic here
    return data.map(row => {
      const cleanedRow: any = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          cleanedRow[this.cleanKey(key)] = this.cleanValue(row[key]);
        }
      }
      return cleanedRow;
    });
  }

  private cleanKey(key: string): string {
    return key.trim().replace(/\s+/g, '_').toLowerCase();
  }

  private cleanValue(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }

  // Add more methods for other data sources (e.g., databases, APIs) here
}