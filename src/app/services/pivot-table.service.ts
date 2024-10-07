import { Injectable } from '@angular/core';

interface PivotField {
  name: string;
  type: 'row' | 'column' | 'value' | 'filter';
}

interface AggregationFunction {
  name: string;
  fn: (values: any[]) => any;
}

@Injectable({
  providedIn: 'root'
})
export class PivotTableService {
  private data: any[] = [];
  private fields: PivotField[] = [];
  private aggregationFunctions: { [key: string]: AggregationFunction } = {
    sum: { name: 'Sum', fn: (values) => values.reduce((a, b) => a + b, 0) },
    avg: { name: 'Average', fn: (values) => values.reduce((a, b) => a + b, 0) / values.length },
    count: { name: 'Count', fn: (values) => values.length },
    min: { name: 'Min', fn: (values) => Math.min(...values) },
    max: { name: 'Max', fn: (values) => Math.max(...values) },
  };

  setData(data: any[]): void {
    this.data = data;
    this.initializeFields();
  }

  private initializeFields(): void {
    if (this.data.length > 0) {
      this.fields = Object.keys(this.data[0]).map(key => ({
        name: key,
        type: 'row' // Default all fields to row type
      }));
    }
  }

  getFields(): PivotField[] {
    return this.fields;
  }

  updateFieldType(fieldName: string, type: 'row' | 'column' | 'value' | 'filter'): void {
    const field = this.fields.find(f => f.name === fieldName);
    if (field) {
      field.type = type;
    }
  }

  getAggregationFunctions(): { [key: string]: string } {
    return Object.fromEntries(
      Object.entries(this.aggregationFunctions).map(([key, value]) => [key, value.name])
    );
  }

  generatePivotTable(): any[][] {
    const rowFields = this.fields.filter(f => f.type === 'row');
    const columnFields = this.fields.filter(f => f.type === 'column');
    const valueFields = this.fields.filter(f => f.type === 'value');

    // This is a simplified implementation. A full pivot table would require more complex logic.
    const pivotData: { [key: string]: any } = {};

    this.data.forEach(row => {
      const rowKey = rowFields.map(f => row[f.name]).join('|');
      const columnKey = columnFields.map(f => row[f.name]).join('|');
      const key = `${rowKey}|${columnKey}`;

      if (!pivotData[key]) {
        pivotData[key] = {};
        valueFields.forEach(vf => {
          pivotData[key][vf.name] = [];
        });
      }

      valueFields.forEach(vf => {
        pivotData[key][vf.name].push(row[vf.name]);
      });
    });

    // Convert the pivotData object to a 2D array
    const result: any[][] = [];
    const headers = ['Row', ...columnFields.map(f => f.name), ...valueFields.map(f => f.name)];
    result.push(headers);

    Object.entries(pivotData).forEach(([key, values]) => {
      const [rowKey, columnKey] = key.split('|');
      const row = [rowKey, columnKey];
      valueFields.forEach(vf => {
        const aggregatedValue = this.aggregationFunctions.sum.fn(values[vf.name]);
        row.push(aggregatedValue);
      });
      result.push(row);
    });

    return result;
  }
}