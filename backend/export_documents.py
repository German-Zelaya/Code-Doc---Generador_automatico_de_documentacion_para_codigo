from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from io import BytesIO
import markdown
from datetime import datetime

def create_docx(documented_code: str, filename: str, original_filename: str) -> BytesIO:
    """
    Genera un documento DOCX con el código documentado.
    """
    doc = Document()
    
    # Configurar estilos
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Consolas'
    font.size = Pt(10)
    
    # === PORTADA ===
    title = doc.add_heading('Documentación de Código', 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.runs[0]
    title_run.font.color.rgb = RGBColor(220, 38, 38)  # Rojo Doom
    
    # Información del archivo
    doc.add_paragraph()
    info_para = doc.add_paragraph()
    info_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info_run = info_para.add_run(f'Archivo: {original_filename}')
    info_run.font.size = Pt(14)
    info_run.bold = True
    
    # Fecha de generación
    date_para = doc.add_paragraph()
    date_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    date_run = date_para.add_run(f'Generado: {datetime.now().strftime("%d/%m/%Y %H:%M")}')
    date_run.font.size = Pt(10)
    date_run.font.color.rgb = RGBColor(128, 128, 128)
    
    doc.add_page_break()
    
    # === CÓDIGO DOCUMENTADO ===
    heading = doc.add_heading('Código Documentado', 1)
    heading_run = heading.runs[0]
    heading_run.font.color.rgb = RGBColor(234, 88, 12)  # Naranja
    
    # Agregar el código en un bloque
    code_para = doc.add_paragraph()
    code_run = code_para.add_run(documented_code)
    code_run.font.name = 'Consolas'
    code_run.font.size = Pt(9)
    
    # Establecer fondo gris claro para el código
    shading_elm = code_para._element.get_or_add_pPr()
    
    doc.add_page_break()
    
    # === FOOTER ===
    footer_para = doc.add_paragraph()
    footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer_run = footer_para.add_run(
        'Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca\n'
        'Proyecto de Taller de Especialidad - SHC131\n'
        'Generador Automático de Documentación de Código'
    )
    footer_run.font.size = Pt(8)
    footer_run.font.color.rgb = RGBColor(128, 128, 128)
    
    # Guardar en BytesIO
    file_stream = BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    
    return file_stream

def create_pdf_simple(documented_code: str, filename: str, original_filename: str) -> BytesIO:
    """
    Genera un PDF simple usando HTML y weasyprint.
    Si weasyprint falla, genera un HTML que el usuario puede imprimir como PDF.
    """
    try:
        from weasyprint import HTML, CSS
        
        # HTML para el PDF
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 2cm;
                }}
                body {{
                    font-family: 'Courier New', monospace;
                    line-height: 1.6;
                    color: #333;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #dc2626;
                }}
                h1 {{
                    color: #dc2626;
                    font-size: 32px;
                    margin: 0;
                }}
                .info {{
                    color: #666;
                    font-size: 14px;
                    margin-top: 10px;
                }}
                .code-section {{
                    background: #f5f5f5;
                    padding: 20px;
                    border-left: 4px solid #ea580c;
                    margin: 20px 0;
                }}
                pre {{
                    margin: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 10px;
                }}
                .footer {{
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ccc;
                    text-align: center;
                    color: #999;
                    font-size: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Documentación de Código</h1>
                <div class="info">
                    <strong>Archivo:</strong> {original_filename}<br>
                    <strong>Generado:</strong> {datetime.now().strftime("%d/%m/%Y %H:%M")}
                </div>
            </div>
            
            <h2 style="color: #ea580c;">Código Documentado</h2>
            <div class="code-section">
                <pre>{documented_code}</pre>
            </div>
            
            <div class="footer">
                Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca<br>
                Proyecto de Taller de Especialidad - SHC131<br>
                Generador Automático de Documentación de Código
            </div>
        </body>
        </html>
        """
        
        # Generar PDF
        file_stream = BytesIO()
        HTML(string=html_content).write_pdf(file_stream)
        file_stream.seek(0)
        
        return file_stream
        
    except Exception as e:
        print(f"Error generando PDF con weasyprint: {e}")
        # Si falla, retornar None para que el backend maneje el error
        raise Exception("Error al generar PDF. Intenta con formato DOCX.")

def create_markdown_document(documented_code: str, filename: str, original_filename: str) -> str:
    """
    Genera un documento Markdown formateado.
    """
    markdown_content = f"""# Documentación de Código

**Archivo:** {original_filename}  
**Generado:** {datetime.now().strftime("%d/%m/%Y %H:%M")}

---

## Código Documentado

```python
{documented_code}
```

---

*Documentación generada automáticamente por Code Doc Generator*  
*Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca*  
*Proyecto de Taller de Especialidad - SHC131*
"""
    
    return markdown_content