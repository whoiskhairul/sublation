export const handlePrint = async (modelerRef, diagramName) => {
    if (!modelerRef.current) return;

    try {
      const { svg } = await modelerRef.current.saveSVG({ format: true });
      const printWindow = window.open('', 'print-window');
      printWindow.document.write(`
        <html>
          <head>
            <title>Diagram Name: ${diagramName}</title>
            <style>
              body { 
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                justify-content: center;
              }
              .header {
                width: 100%;
                text-align: center;
                margin-bottom: 20px;
                padding: 10px;
                border-bottom: 2px solid #4CAF50;
                position: fixed;
                top: 0;
                background: white;
              }
              .logo {
                font-size: 32px;
                color: #4CAF50;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: center;
              }
              .subtitle {
                font-size: 16px;
                color: #666;
                margin-top: 5px;
                text-align: center;
              }
              .diagram-container {
                background-color: white;
                padding: 10px;
                width: 100%;
                margin-top: 100px;
              }
              svg { 
                width: 100%;
                height: auto;
                max-height: calc(100vh - 200px);
              }
              @media print {
                body { padding: 0; }
                .header { margin-bottom: 10px; padding: 5px; }
                .diagram-container { padding: 5px; page-break-inside: avoid; }
                svg { max-height: calc(100vh - 150px); }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">Folia</div>
              <div class="subtitle">By team <b>Sublation</b></div>
            </div>
            <div class="diagram-container">
              ${svg}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error generating print view:', error);
    }
  };

  