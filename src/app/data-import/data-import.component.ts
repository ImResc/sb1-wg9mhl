import { Component, Output, EventEmitter } from '@angular/core';
import { DataImportService } from '../services/data-import.service';

@Component({
  selector: 'app-data-import',
  template: `
    <div class="import-container">
      <input type="file" (change)="onFileSelected($event)" accept=".csv,.xlsx,.xls" id="fileInput" style="display:none;">
      <label for="fileInput" class="file-input-label">
        <mat-icon>cloud_upload</mat-icon>
        Choose File
      </label>
      <button mat-raised-button color="primary" (click)="importData()" [disabled]="!file">Import Data</button>
    </div>
  `,
  styles: [`
    .import-container {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .file-input-label {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      background-color: #f5f5f7;
      color: #1d1d1f;
      border-radius: 20px;
      cursor: pointer;
      margin-right: 10px;
      transition: background-color 0.3s ease;
    }
    .file-input-label:hover {
      background-color: #e8e8ed;
    }
    .file-input-label mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DataImportComponent {
  @Output() dataImported = new EventEmitter<any[]>();
  file: File | null = null;

  constructor(private dataImportService: DataImportService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  importData(): void {
    if (!this.file) return;

    this.dataImportService.importData(this.file).subscribe(
      (data: any[]) => {
        this.dataImported.emit(data);
      },
      (error) => {
        console.error('Error importing data:', error);
        // Handle error (e.g., show error message to user)
      }
    );
  }
}