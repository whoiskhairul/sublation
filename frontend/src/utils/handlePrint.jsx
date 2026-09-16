export const handlePrint = async (modelerRef, diagramName) => {
    if (!modelerRef.current) return;

    try {
      const { svg } = await modelerRef.current.saveSVG({ format: true });
      const printWindow = window.open('', 'print-window');
      const title = diagramName || "Business Process Diagram";
      const printDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${title} - BPMN Print</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 12mm 15mm 12mm 15mm;
              }
              * {
                box-sizing: border-box;
              }
              body { 
                margin: 0;
                padding: 16px 20px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #0f172a;
                background-color: #ffffff;
                display: flex;
                flex-direction: column;
                min-height: 98vh;
              }
              .header {
                display: flex;
                justifyContent: space-between;
                align-items: flex-end;
                padding-bottom: 12px;
                border-bottom: 2px solid #0f172a;
                margin-bottom: 16px;
              }
              .title-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }
              .title {
                font-size: 22px;
                font-weight: 700;
                color: #0f172a;
                letter-spacing: -0.02em;
                margin: 0;
              }
              .doc-badge {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #2563eb;
                font-weight: 700;
              }
              .meta-group {
                text-align: right;
                font-size: 12px;
                color: #64748b;
                display: flex;
                flex-direction: column;
                gap: 2px;
              }
              .meta-date {
                font-weight: 500;
                color: #334155;
              }
              .diagram-container {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                min-height: 480px;
              }
              .diagram-container svg { 
                width: 100%;
                height: 100%;
                max-height: 72vh;
                object-fit: contain;
              }
              .footer {
                display: flex;
                justifyContent: space-between;
                align-items: center;
                padding-top: 10px;
                margin-top: 12px;
                border-top: 1px solid #e2e8f0;
                font-size: 11px;
                color: #94a3b8;
              }
              .footer-brand {
                font-weight: 600;
                color: #64748b;
              }
              @media print {
                body {
                  padding: 0;
                  min-height: auto;
                }
                .diagram-container {
                  border: none;
                  padding: 0;
                  page-break-inside: avoid;
                }
                .diagram-container svg {
                  max-height: 80vh;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title-group">
                <span class="doc-badge">BPMN 2.0 Process Specification</span>
                <h1 class="title">${title}</h1>
              </div>
              <div class="meta-group">
                <span class="meta-date">Date: ${printDate}</span>
                <span>Folia Process Modeler</span>
              </div>
            </div>

            <div class="diagram-container">
              ${svg}
            </div>

            <div class="footer">
              <span class="footer-brand">Folia Intelligent BPMN Studio</span>
              <span>Confidential &amp; Proprietary</span>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 250);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating print view:', error);
    }
  };

  