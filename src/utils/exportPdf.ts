export const exportarEsbocoParaPDF = (esboco: any) => {
  const printWindow = window.open('', '', 'width=800,height=900');
  if (!printWindow) {
    alert("Por favor, permita pop-ups para exportar o PDF.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${esboco.tema}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #334155; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          h1 { 
            color: #0f172a; 
            text-align: center; 
            border-bottom: 3px solid #facc15; 
            padding-bottom: 15px; 
            margin-bottom: 20px; 
            font-size: 28px;
          }
          .meta { 
            text-align: center; 
            color: #64748b; 
            font-size: 14px; 
            margin-bottom: 40px; 
          }
          h2 { 
            color: #1e293b; 
            margin-top: 35px; 
            font-size: 20px; 
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .verse { 
            background: #f8fafc; 
            padding: 20px; 
            border-left: 4px solid #facc15; 
            font-style: italic; 
            margin-bottom: 25px; 
            border-radius: 0 8px 8px 0;
          }
          .verse-ref { 
            font-weight: 700; 
            text-align: right; 
            display: block; 
            margin-top: 10px; 
            font-style: normal; 
            color: #0f172a;
          }
          .topic { 
            margin-bottom: 25px; 
          }
          .topic-title { 
            font-weight: 700; 
            font-size: 17px; 
            color: #0f172a;
            margin-bottom: 8px;
          }
          ul { 
            padding-left: 24px; 
          }
          li { 
            margin-bottom: 10px; 
          }
          p {
            margin-bottom: 15px;
          }
          @media print {
            body { padding: 0; }
            @page { margin: 2cm; }
          }
        </style>
      </head>
      <body>
        <h1>${esboco.tema}</h1>
        ${esboco.data ? `<div class="meta">Criado em ${esboco.data} ${esboco.categoria ? `| Categoria: ${esboco.categoria}` : ''}</div>` : ''}
        
        <h2>Introdução</h2>
        <p>${esboco.introducao.replace(/\n/g, '<br/>')}</p>

        <h2>Versículo Base</h2>
        <div class="verse">
          ${esboco.textoBiblico?.texto || ''}
          <span class="verse-ref">— ${esboco.textoBiblico?.referencia || ''}</span>
        </div>

        <h2>Tópicos Principais</h2>
        ${esboco.pontosPrincipais?.map((ponto: any) => `
          <div class="topic">
            <div class="topic-title">- ${ponto.titulo}</div>
            <p>${ponto.conteudo.replace(/\n/g, '<br/>')}</p>
          </div>
        `).join('') || ''}

        <h2>Aplicação Prática</h2>
        <p>${esboco.aplicacaoPratica?.replace(/\n/g, '<br/>') || ''}</p>

        <h2>Conclusão</h2>
        <p>${esboco.conclusao?.replace(/\n/g, '<br/>') || ''}</p>

        ${esboco.referenciasApoio?.length > 0 ? `
          <h2>Versículos Adicionais</h2>
          <ul>
            ${esboco.referenciasApoio.map((ref: string) => `<li>${ref}</li>`).join('')}
          </ul>
        ` : ''}
        
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
