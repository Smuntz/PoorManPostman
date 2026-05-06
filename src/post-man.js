import { html, LitElement, css } from 'lit';

class PoorMansPostman extends LitElement {

  static getMetaConfig() {
    return {
      controlName: 'Poor Mans Postman Pro',
      fallbackDisableSubmit: false,
      version: '1.3',
      groupName: 'Developer Tools',
      standardProperties: {
        fieldLabel: true,
        visibility: true,
      },
      properties: {
        url: {
          type: 'string',
          title: 'Target URL',
          required: true
        },
        method: {
          type: 'string',
          title: 'HTTP Method',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          defaultValue: 'GET'
        },
        headersJson: {
          type: 'string',
          title: 'Headers (JSON)',
          description: 'e.g. {"Authorization": "Bearer ...", "Accept": "application/json"}'
        },
        paramsJson: {
          type: 'string',
          title: 'URL Parameters (JSON)',
          description: 'e.g. {"id": "123", "format": "full"}'
        },
        requestBody: {
          type: 'string',
          title: 'Request Body',
          description: 'JSON body for POST/PUT requests'
        },
        apiResponse: {
          type: 'string',
          title: 'Output Variable',
          isValueField: true
        }
      },
      events: ['ntx-value-change']
    };
  }

  static get properties() {
    return {
      url: { type: String },
      method: { type: String },
      headersJson: { type: String },
      paramsJson: { type: String },
      requestBody: { type: String },
      apiResponse: { type: String }
    };
  }

  static get styles() {
    return css`
      :host { 
        display: block; 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      }
      .container { 
        border: 1px solid #d2d2d2; 
        border-radius: 4px; 
        padding: 15px; 
        background: #fff; 
      }
      .status-bar { 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        margin-bottom: 12px; 
      }
      .method-tag { 
        font-weight: bold; 
        color: #0070d2; 
        background: #f0f8ff;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85rem;
      }
      button { 
        background: #0070d2; 
        color: white; 
        border: none; 
        padding: 8px 16px; 
        border-radius: 4px; 
        cursor: pointer; 
        font-weight: 600;
      }
      button:hover { background: #005fb2; }
      
      /* The "4-Line" Console */
      .console { 
        background: #1e1e1e; 
        color: #d4d4d4; 
        padding: 12px; 
        border-radius: 4px; 
        font-family: 'Consolas', 'Monaco', monospace; 
        font-size: 12px; 
        line-height: 1.5; /* Fixed line height */
        height: 4.5em;    /* 4 lines + a little breathing room (1.125 * 4) */
        overflow-y: auto; 
        white-space: pre-wrap;
        border: 1px solid #333;
      }
    `;
  }

  async executeCall() {
    this.apiResponse = "Processing...";

    try {
      // 1. Handle URL Parameters
      let finalUrl = this.url;
      if (this.paramsJson) {
        const params = JSON.parse(this.paramsJson);
        const queryString = new URLSearchParams(params).toString();
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
      }

      // 2. Handle Headers
      const headers = { 'Content-Type': 'application/json' };
      if (this.headersJson) {
        Object.assign(headers, JSON.parse(this.headersJson));
      }

      // 3. Setup Fetch Options
      const options = {
        method: this.method,
        headers: headers
      };

      if (['POST', 'PUT', 'DELETE'].includes(this.method) && this.requestBody) {
        options.body = this.requestBody;
      }

      const response = await fetch(finalUrl, options);
      const data = await response.json();
      const result = JSON.stringify(data, null, 2);

      this.apiResponse = result;

      this.dispatchEvent(new CustomEvent('ntx-value-change', {
        detail: result,
        bubbles: true,
        composed: true
      }));

    } catch (err) {
      this.apiResponse = `Error: ${err.message}`;
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="status-bar">
          <span class="method-tag">${this.method}</span>
          <button @click="${this.executeCall}">Run Request</button>
        </div>
        <!-- This area is now restricted to 4 lines of height -->
        <div class="console">${this.apiResponse || 'Ready to test...'}</div>
      </div>
    `;
  }
}

customElements.define('poor-mans-postman', PoorMansPostman);