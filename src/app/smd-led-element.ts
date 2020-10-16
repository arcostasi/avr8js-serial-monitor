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
          width="50"
          height="25"
          version="1.2"
          viewBox="0 0 50 25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <g id="led-body" fill="#aaa">
              <rect x="-3" y="0" height="6" width="12" fill="#999" filter="url(#solderPlate)" />
              <rect x="0" y="-0.2" width="6.2" height="6" stroke="#eee" stroke-width="1.05" />
            </g>
            <filter id="ledFilter" x="-0.8" y="-0.8" height="5.2" width="9.8">
              <feGaussianBlur stdDeviation=".5" />
            </filter>
          </defs>
        <g transform="translate(17.7 5)">
          <use xlink:href="#led-body" />
          ${lightOn &&
          svg`<circle cx="3.6" cy="2.3" r="3.3" fill="#80ff80" filter="url(#ledFilter)" />`}
        </g>
        </svg>
        <span class="led-label">${this.label}</span>
      </div>
    `;
  }
}
