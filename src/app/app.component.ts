import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Comprehensive Pivot Table System</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-data-import (dataImported)="onDataImported($event)"></app-data-import>
          <app-pivot-table [data]="importedData"></app-pivot-table>
          <app-chart [data]="importedData"></app-chart>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
    }
    mat-card {
      margin-bottom: 40px;
    }
  `]
})
export class AppComponent {
  importedData: any[] = [];

  onDataImported(data: any[]): void {
    this.importedData = data;
  }
}