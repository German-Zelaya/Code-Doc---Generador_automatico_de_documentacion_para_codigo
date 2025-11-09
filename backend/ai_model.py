import re
from langchain_ollama import OllamaLLM
#from langchain.schema import HumanMessage, AIMessage

# Configuración del modelo Ollama
MODEL_NAME = "llama3.2"

def extract_functions(code: str) -> list:
    """
    Extrae las funciones del código Python.
    """
    pattern = r'def\s+(\w+)\s*\([^)]*\):'
    return re.findall(pattern, code)

def check_documentation(code: str, function_name: str) -> bool:
    """
    Verifica si una función tiene docstring.
    """
    pattern = rf'def\s+{function_name}\s*\([^)]*\):\s*"""'
    return bool(re.search(pattern, code))

def generate_documentation_suggestions(code: str) -> dict:
    """
    Genera sugerencias de documentación usando Ollama.
    Retorna un diccionario con el código documentado y estadísticas.
    """
    try:
        # Inicializar el modelo
        llm = OllamaLLM(model=MODEL_NAME)
        
        # Prompt para generar documentación
        prompt = f"""
Eres un experto en Python. Tu tarea es documentar el siguiente código agregando docstrings en formato estándar de Python (Google Style) a todas las funciones que no tienen documentación.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega docstrings donde falten
- Usa el formato de docstring de Google (con Args, Returns, etc.)
- No modifiques el código funcional
- Devuelve SOLO el código completo con los docstrings agregados

Código a documentar:
```python
{code}
```

Código documentado:
"""
        
        # Generar respuesta
        response = llm.invoke(prompt)
        
        # Limpiar la respuesta (remover bloques de código markdown si existen)
        documented_code = response.strip()
        if documented_code.startswith("```python"):
            documented_code = documented_code.split("```python")[1].split("```")[0].strip()
        elif documented_code.startswith("```"):
            documented_code = documented_code.split("```")[1].split("```")[0].strip()
        
        # Extraer funciones del código original y documentado
        original_functions = extract_functions(code)
        documented_functions = sum(
            1 for func in original_functions 
            if check_documentation(documented_code, func)
        )
        
        # Calcular porcentaje
        total_functions = len(original_functions)
        doc_percentage = (documented_functions / total_functions * 100) if total_functions > 0 else 0
        
        return {
            "success": True,
            "documented_code": documented_code,
            "original_code": code,
            "statistics": {
                "total_functions": total_functions,
                "documented_functions": documented_functions,
                "documentation_percentage": round(doc_percentage, 1)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Error al generar documentación. Verifica que Ollama esté corriendo."
        }

def regenerate_documentation(code: str, feedback: str = None) -> dict:
    """
    Regenera la documentación con feedback opcional del usuario.
    """
    try:
        llm = OllamaLLM(model=MODEL_NAME)
        
        feedback_text = f"\n\nFeedback del usuario: {feedback}" if feedback else ""
        
        prompt = f"""
Eres un experto en Python. Genera una NUEVA versión de documentación para el siguiente código.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega/modifica docstrings
- Usa el formato de docstring de Google
- Sé más detallado y claro que la versión anterior
- No modifiques el código funcional
{feedback_text}

Código a documentar:
```python
{code}
```

Código documentado:
"""
        
        response = llm.invoke(prompt)
        
        # Limpiar respuesta
        documented_code = response.strip()
        if documented_code.startswith("```python"):
            documented_code = documented_code.split("```python")[1].split("```")[0].strip()
        elif documented_code.startswith("```"):
            documented_code = documented_code.split("```")[1].split("```")[0].strip()
        
        # Calcular estadísticas
        original_functions = extract_functions(code)
        documented_functions = sum(
            1 for func in original_functions 
            if check_documentation(documented_code, func)
        )
        
        total_functions = len(original_functions)
        doc_percentage = (documented_functions / total_functions * 100) if total_functions > 0 else 0
        
        return {
            "success": True,
            "documented_code": documented_code,
            "original_code": code,
            "statistics": {
                "total_functions": total_functions,
                "documented_functions": documented_functions,
                "documentation_percentage": round(doc_percentage, 1)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Error al regenerar documentación"
        }

def generate_final_document(documented_code: str, filename: str) -> str:
    """
    Genera un documento Markdown final con el código documentado.
    """
    document = f"""# Documentación de Código - {filename}

## Código Documentado

```python
{documented_code}
```

---

*Documentación generada automáticamente por Code Doc Generator*
*Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca*
"""
    
    return document