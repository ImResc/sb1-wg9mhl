import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PivotTableService } from '../services/pivot-table.service';

@Component({
  selector: 'app-pivot-table',
  template: `
    <div class="pivot-table-container">
      <div class="field-lists">
        <div class="field-list" cdkDropList #availableList="cdkDropList" [cdkDropListData]="availableFields"
             [cdkDropListConnectedTo]="[rowList, columnList, valueList, filterList]"
             (cdkDropListDropped)="drop($event)">
          <h3>Available Fields</h3>
          <div class="field-box" *ngFor="let field of availableFields" cdkDrag>{{field.name}}</div>
        </div>
        <div class="field-list" cdkDropList #rowList="cdkDropList" [cdkDropListData]="rowFields"
             [cdkDropListConnectedTo]="[availableList, columnList, valueList, filterList]"
             (cdkDropListDropped)="drop($event)">
          <h3>Row Fields</h3>
          <div class="field-box" *ngFor="let field of rowFields" cdkDrag>{{field.name}}</div>
        </div>
        <div class="field-list" cdkDropList #columnList="cdkDropList" [cdkDropListData]="columnFields"
             [cdkDropListConnectedTo]="[availableList, rowList, valueList, filterList]"
             (cdkDropListDropped)="drop($event)">
          <h3>Column Fields</h3>
          <div class="field-box" *ngFor="let field of columnFields" cdkDrag>{{field.name}}</div>
        </div>
        <div class="field-list" cdkDropList #valueList="cdkDropList" [cdkDropListData]="valueFields"
             [cdkDropListConnectedTo]="[availableList, rowList, columnList, filterList]"
             (cdkDropListDropped)="drop($event)">
          <h3>Value Fields</h3>
          <div class="field-box" *ngFor="let field of valueFields" cdkDrag>{{field.name}}</div>
        </div>
        <div class="field-list" cdkDropList #filterList="cdkDropList" [cdkDropListData]="filterFields"
             [cdkDropListConnectedTo]="[availableList, rowList, columnList, valueList]"
             (cdkDropListDropped)="drop($event)">
          <h3>Filter Fields</h3>
          <div class="field-box" *ngFor="let field of filterFields" cdkDrag>{{field.name}}</div>
        </div>
      </div>
      <div *ngIf="pivotData.length > 0; else noData">
        <mat-table [dataSource]="dataSource" matSort>
          <ng-container *ngFor="let column of displayedColumns; let i = index" [matColumnDef]="column">
            <mat-header-cell *matHeaderCellDef mat-sort-header>{{ pivotData[0][i] }}</mat-header-cell>
            <mat-cell *matCellDef="let element">{{ element[column] }}</mat-cell>
          </ng-container>
          <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
          <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>
        <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
      </div>
      <ng-template #noData>
        <p>No data available. Please import data and configure pivot fields.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .pivot-table-container {
      display: flex;
      flex-direction: column;
    }
    .field-lists {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .field-list {
      background-color: #f5f5f7;
      border-radius: 4px;
      width: 18%;
      min-height: 100px;
      padding: 10px;
    }
    .field-box {
      padding: 10px;
      background-color: white;
      border: 1px solid #ddd;
      margin-bottom: 5px;
      cursor: move;
    }
    mat-table {
      width: 100%;
    }
  `]
})
export class PivotTableComponent implements OnChanges {
  @Input() data: any[] = [];
  
  availableFields: any[] = [];
  rowFields: any[] = [];
  columnFields: any[] = [];
  valueFields: any[] = [];
  filterFields: any[] = [];
  
  pivotData: any[][] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = [];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private pivotTableService: PivotTableService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.pivotTableService.setData(this.data);
      this.initializeFields();
      this.updatePivotTable();
    }
  }

  initializeFields(): void {
    const fields = this.pivotTableService.getFields();
    this.availableFields = fields;
    this.rowFields = [];
    this.columnFields = [];
    this.valueFields = [];
    this.filterFields = [];
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.updateFieldTypes();
    this.updatePivotTable();
  }

  updateFieldTypes(): void {
    this.availableFields.forEach(field => this.pivotTableService.updateFieldType(field.name, 'row'));
    this.rowFields.forEach(field => this.pivotTableService.updateFieldType(field.name, 'row'));
    this.columnFields.forEach(field => this.pivotTableService.updateFieldType(field.name, 'column'));
    this.valueFields.forEach(field => this.pivotTableService.updateFieldType(field.name, 'value'));
    this.filterFields.forEach(field => this.pivotTableService.updateFieldType(field.name, 'filter'));
  }

  updatePivotTable(): void {
    this.pivotData = this.pivotTableService.generatePivotTable();
    if (this.pivotData.length > 0) {
      this.displayedColumns = this.pivotData[0].map((_, index) => `col${index}`);
      this.dataSource = new MatTableDataSource(this.pivotData.slice(1));
      
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    } else {
      this.dataSource.data = [];
      this.displayedColumns = [];
    }
  }
}