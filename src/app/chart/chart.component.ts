import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  template: `
    <div class="chart-container">
      <canvas baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="chartType">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 400px;
      margin-top: 20px;
    }
  `]
})
export class ChartComponent implements OnChanges {
  @Input() data: any[] = [];

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Data Visualization'
      }
    }
  };
  chartType: ChartType = 'bar';
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  ngOnChanges(): void {
    this.updateChart();
  }

  updateChart(): void {
    if (this.data && this.data.length > 0) {
      const firstDataItem = this.data[0];
      const numericFields = Object.keys(firstDataItem).filter(key => typeof firstDataItem[key] === 'number');
      
      this.chartData.labels = this.data.map((item, index) => `Item ${index + 1}`);
      this.chartData.datasets = numericFields.map(field => ({
        data: this.data.map(item => item[field]),
        label: field,
        backgroundColor: this.getRandomColor(),
        borderColor: this.getRandomColor(),
        borderWidth: 1
      }));
    }
  }

  getRandomColor(): string {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  }
}