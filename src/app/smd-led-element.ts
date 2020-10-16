import { css, customElement, html, svg, LitElement, property } from 'lit-element';

const lightColors: { [key: string]: string } = {
  red: '#ff8080',
  green: '#80ff80',
  blue: '#8080ff',
  yellow: '#ffff80',
  orange: '#ffcf80',
  white: '#ffffff',
};

@customElement('wokwi-smd-led')
export class SMDLEDElement extends LitElement {
  @property() value = false;
  @property() brightness = 1.0;
  @property() color = 'red';
  @property() lightColor: string | null = null;
  @property() label = '';

  static get styles() {
    return css`
      :host {
        display: inline-block;
      }

      .led-container {
        display: flex;
        flex-direction: column;
        width: 40px;
      }

      .led-label {
        font-size: 10px;
        text-align: center;
        color: gray;
        position: relative;
        line-height: 1;
        top: -8px;
      }
    `;
  }

  render() {
    const { color, lightColor } = this;
    const lightColorActual = lightColor || lightColors[color] || '#ff8080';
    const opacity = this.brightness ? 0.3 + this.brightness * 0.7 : 0;
    const lightOn = this.value && this.brightness > Number.EPSILON;
    return html`
      <div class="led-container">
        <svg
          width="40"
          height="50"
          version="1.2"
          viewBox="-10 -5 35.456 39.618"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <g id="led-body" fill="#eee">
              <rect x="0" y="0" height="1.2" width="2.6" fill="#333" filter="url(#solderPlate)" />
              <rect x=".6" y="-0.1" width="1.35" height="1.4" stroke="#aaa" stroke-width=".05" />
            </g>
            <filter id="ledFilter" x="-0.8" y="-0.8" height="2.2" width="2.8">
              <feGaussianBlur stdDeviation=".5" />
            </filter>
          </defs>
        <g transform="translate(27.7 5)">
          <use xlink:href="#led-body" />
          ${lightOn &&
          svg`<circle cx="1.3" cy=".55" r="1.3" fill="#ff8080" filter="url(#ledFilter)" />`}
        </g>
        </svg>
        <span class="led-label">${this.label}</span>
      </div>
    `;
  }
}
