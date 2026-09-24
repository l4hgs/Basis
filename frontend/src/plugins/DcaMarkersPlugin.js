import { parseDateToYmd, findClosestChartPoint } from '../services/prices';

export class DcaMarkersPrimitive {
  constructor(purchases, chartPrices = []) {
    this._purchases = purchases;
    this._chartPrices = chartPrices;
    this._paneViews = [new DcaMarkersPaneView(this)];
  }

  attached({ chart, series, requestUpdate }) {
    this._chart = chart;
    this._series = series;
    this._requestUpdate = requestUpdate;
  }

  detached() {
    this._chart = undefined;
    this._series = undefined;
    this._requestUpdate = undefined;
  }

  updatePurchases(purchases, chartPrices = []) {
    this._purchases = purchases;
    this._chartPrices = chartPrices;
    this.updateAllViews();
    if (this._requestUpdate) {
      this._requestUpdate();
    }
  }

  updateAllViews() {
    this._paneViews.forEach(v => v.update());
  }

  paneViews() {
    return this._paneViews;
  }
}

class DcaMarkersPaneView {
  constructor(primitive) {
    this._primitive = primitive;
    this._renderer = new DcaMarkersRenderer(this);
    this.points = [];
  }

  update() {
    const series = this._primitive._series;
    const chart = this._primitive._chart;
    if (!series || !chart) return;
    const timeScale = chart.timeScale();
    const purchases = this._primitive._purchases || [];
    const chartPrices = this._primitive._chartPrices || [];

    const maxBuyAmount = purchases.reduce((max, p) => {
      const amt = Number(p.amountUsd) || Number(p.amountPhp) || 0;
      return amt > max ? amt : max;
    }, 0);

    this.points = purchases.map(p => {
      const dateStr = parseDateToYmd(p.date);
      const closest = findClosestChartPoint(dateStr, chartPrices);

      let x = null;
      let y = null;

      if (closest) {
        x = timeScale.timeToCoordinate(closest.time);
        y = series.priceToCoordinate(closest.value);
      } else {
        const targetYmd = parseDateToYmd(p.date);
        x = timeScale.timeToCoordinate(targetYmd);
        const price = p.amountUsd / p.receivedBtc;
        y = series.priceToCoordinate(price);
      }

      if (x === null || y === null) return null;

      const amt = Number(p.amountUsd) || Number(p.amountPhp) || 0;
      let radius = 7;
      if (maxBuyAmount > 0) {
        const ratio = amt / maxBuyAmount;
        const minRadius = 5;
        const maxRadius = 16;
        radius = minRadius + Math.sqrt(ratio) * (maxRadius - minRadius);
      }

      return { x, y, radius, purchase: p };
    }).filter(pt => pt !== null);
  }

  renderer() {
    return this._renderer;
  }
}

class DcaMarkersRenderer {
  constructor(paneView) {
    this._paneView = paneView;
  }

  draw(target) {
    target.useMediaCoordinateSpace(scope => {
      const ctx = scope.context;
      const points = this._paneView.points;

      points.forEach(pt => {
        // Draw outer glow/pulse ring (semi-transparent orange)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius + 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(247, 147, 26, 0.25)';
        ctx.fill();

        // Draw inner dot (orange)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#F7931A';
        ctx.fill();

        // Draw border
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, 2 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      });
    });
  }
}
