<template>
  <div class="bg-card p-6 rounded-xl border border-border-color transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary hover:scale-[1.005]">
    <h3 class="text-xl font-semibold text-text-primary mb-4">Gelir Analizi (Son 6 Ay)</h3>
    <div class="h-80">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const chartData = computed(() => ({
  labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
  datasets: [
    {
      label: 'Gelir',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        if (ctx) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(29, 78, 216, 0.5)');
            gradient.addColorStop(1, 'rgba(29, 78, 216, 0)');
            return gradient;
        }
        return 'rgba(29, 78, 216, 0.5)';
      },
      borderColor: '#1D4ED8',
      pointBackgroundColor: '#1D4ED8',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#1D4ED8',
      tension: 0.4,
      fill: true,
      data: [12000, 19000, 15000, 24000, 22000, 30000]
    }
  ]
}))

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(128, 128, 128, 0.1)'
      },
      ticks: {
        color: '#9ca3af',
        callback: function(value) {
          return '₺' + value / 1000 + 'k';
        }
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#9ca3af'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#f9fafb',
      bodyColor: '#e5e7eb',
      boxPadding: 8,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
})
</script>
