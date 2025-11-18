import re
from langchain_ollama import OllamaLLM
from langchain_core.messages import HumanMessage

# Configuración del modelo Ollama
MODEL_NAME = "llama3.2"

# Patrones de detección por lenguaje
LANGUAGE_PATTERNS = {
    'python': {
        'function_pattern': r'def\s+(\w+)\s*\([^)]*\):',
        'docstring_pattern': r'def\s+\w+\s*\([^)]*\):\s*"""',
        'doc_format': 'Python Docstring (Google Style)'
    },
    'javascript': {
        'function_pattern': r'(?:function\s+(\w+)\s*\([^)]*\)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)',
        'docstring_pattern': r'/\*\*[\s\S]*?\*/\s*(?:function|const|let|var|async)',
        'doc_format': 'JSDoc'
    },
    'php': {
        'function_pattern': r'function\s+(\w+)\s*\([^)]*\)',
        'docstring_pattern': r'/\*\*[\s\S]*?\*/\s*(?:public|private|protected|function)',
        'doc_format': 'PHPDoc'
    },
    'go': {
    'function_pattern': r'func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\([^)]*\)',
    'docstring_pattern': r'//.*\n(?://.*\n)*func',
    'doc_format': 'GoDoc'
    }
}

def extract_functions(code: str, language: str) -> list:
    """
    Extrae las funciones del código según el lenguaje.
    """
    if language not in LANGUAGE_PATTERNS:
        return []
    
    pattern = LANGUAGE_PATTERNS[language]['function_pattern']
    matches = re.findall(pattern, code)
    
    # Para JavaScript que puede tener tuplas, limpiamos
    if isinstance(matches[0] if matches else None, tuple):
        matches = [m[0] or m[1] for m in matches if m[0] or m[1]]
    
    return matches

def check_documentation(code: str, function_name: str, language: str) -> bool:
    """
    Verifica si una función tiene documentación según el lenguaje.
    """
    if language not in LANGUAGE_PATTERNS:
        return False
    
    # Buscar la función y verificar si tiene documentación antes
    if language == 'python':
        pattern = rf'def\s+{function_name}\s*\([^)]*\):\s*"""'
    elif language in ['javascript', 'php']:
        # Buscar /** comentario */ antes de la función
        pattern = rf'/\*\*[\s\S]*?\*/\s*.*{function_name}'
    else:
        return False
    
    return bool(re.search(pattern, code))

def get_documentation_prompt(language: str, code: str) -> str:
    """
    Genera el prompt adecuado según el lenguaje.
    """
    prompts = {
        'python': f"""
Eres un experto en Python. Tu tarea es documentar el siguiente código agregando docstrings en formato estándar de Python (Google Style) a todas las funciones que no tienen documentación.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega docstrings donde falten
- Usa el formato de docstring de Google:
  \"\"\"
  Descripción breve de la función.
  
  Args:
      param1 (tipo): Descripción del parámetro.
      param2 (tipo): Descripción del parámetro.
  
  Returns:
      tipo: Descripción del valor de retorno.
  \"\"\"
- No modifiques el código funcional
- Devuelve SOLO el código completo con los docstrings agregados

Código a documentar:
```python
{code}
```

Código documentado:
""",
        
        'javascript': f"""
Eres un experto en JavaScript. Tu tarea es documentar el siguiente código agregando comentarios JSDoc a todas las funciones que no tienen documentación.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega JSDoc donde falte
- Usa el formato JSDoc estándar:
  /**
   * Descripción breve de la función.
   * 
   * @param {{tipo}} param1 - Descripción del parámetro.
   * @param {{tipo}} param2 - Descripción del parámetro.
   * @returns {{tipo}} Descripción del valor de retorno.
   */
- No modifiques el código funcional
- Devuelve SOLO el código completo con JSDoc agregado

Código a documentar:
```javascript
{code}
```

Código documentado:
""",
        
        'php': f"""
Eres un experto en PHP. Tu tarea es documentar el siguiente código agregando comentarios PHPDoc a todas las funciones que no tienen documentación.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega PHPDoc donde falte
- Usa el formato PHPDoc estándar:
  /**
   * Descripción breve de la función.
   * 
   * @param tipo $param1 Descripción del parámetro.
   * @param tipo $param2 Descripción del parámetro.
   * @return tipo Descripción del valor de retorno.
   */
- No modifiques el código funcional
- Devuelve SOLO el código completo con PHPDoc agregado

Código a documentar:
```php
{code}
```

Código documentado:
""",
'go': f"""
Eres un experto en Go. Tu tarea es documentar el siguiente código agregando comentarios GoDoc a todas las funciones que no tienen documentación.

IMPORTANTE:
- Mantén TODO el código original exactamente como está
- Solo agrega GoDoc donde falte
- Usa el formato GoDoc estándar:
  // FunctionName descripción breve de la función.
  // Descripción más detallada si es necesaria.
  // Puede incluir múltiples líneas.
- Los comentarios deben estar INMEDIATAMENTE antes de la función
- No modifiques el código funcional
- Devuelve SOLO el código completo con GoDoc agregado

Código a documentar:
```go
{code}
```

Código documentado:
"""
    }
    
    return prompts.get(language, prompts['python'])

def generate_documentation_suggestions(code: str, language: str = 'python') -> dict:
    """
    Genera sugerencias de documentación usando Ollama.
    Retorna un diccionario con el código documentado y estadísticas.
    """
    try:
        # Inicializar el modelo
        llm = OllamaLLM(model=MODEL_NAME)
        
        # Obtener prompt según el lenguaje
        prompt = get_documentation_prompt(language, code)
        
        # Generar respuesta
        response = llm.invoke(prompt)
        
        # Limpiar la respuesta
        documented_code = response.strip()
        
        # Detectar y remover bloques de código markdown
        code_block_patterns = [
            (r'```python\s*\n(.*?)```', language == 'python'),
            (r'```javascript\s*\n(.*?)```', language == 'javascript'),
            (r'```php\s*\n(.*?)```', language == 'php'),
            (r'```go\s*\n(.*?)```', language == 'go'),
            (r'```\s*\n(.*?)```', True)
        ]
        
        for pattern, should_apply in code_block_patterns:
            if should_apply:
                match = re.search(pattern, documented_code, re.DOTALL)
                if match:
                    documented_code = match.group(1).strip()
                    break
        
        # Extraer funciones del código original y documentado
        original_functions = extract_functions(code, language)
        documented_functions = sum(
            1 for func in original_functions 
            if check_documentation(documented_code, func, language)
        )
        
        # Calcular porcentaje
        total_functions = len(original_functions)
        doc_percentage = (documented_functions / total_functions * 100) if total_functions > 0 else 0
        
        return {
            "success": True,
            "documented_code": documented_code,
            "original_code": code,
            "language": language,
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
            "message": f"Error al generar documentación para {language}. Verifica que Ollama esté corriendo."
        }

def regenerate_documentation(code: str, language: str = 'python', feedback: str = None) -> dict:
    """
    Regenera la documentación con feedback opcional del usuario.
    """
    try:
        llm = OllamaLLM(model=MODEL_NAME)
        
        feedback_text = f"\n\nFeedback del usuario: {feedback}" if feedback else ""
        
        base_prompt = get_documentation_prompt(language, code)
        prompt = base_prompt + f"\n\nGenera una NUEVA versión más detallada y clara.{feedback_text}"
        
        response = llm.invoke(prompt)
        
        # Limpiar respuesta
        documented_code = response.strip()
        
        # Detectar y remover bloques de código markdown
        code_block_patterns = [
            (r'```python\s*\n(.*?)```', language == 'python'),
            (r'```javascript\s*\n(.*?)```', language == 'javascript'),
            (r'```php\s*\n(.*?)```', language == 'php'),
            (r'```go\s*\n(.*?)```', language == 'go'),
            (r'```\s*\n(.*?)```', True)
        ]
        
        for pattern, should_apply in code_block_patterns:
            if should_apply:
                match = re.search(pattern, documented_code, re.DOTALL)
                if match:
                    documented_code = match.group(1).strip()
                    break
        
        # Calcular estadísticas
        original_functions = extract_functions(code, language)
        documented_functions = sum(
            1 for func in original_functions 
            if check_documentation(documented_code, func, language)
        )
        
        total_functions = len(original_functions)
        doc_percentage = (documented_functions / total_functions * 100) if total_functions > 0 else 0
        
        return {
            "success": True,
            "documented_code": documented_code,
            "original_code": code,
            "language": language,
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
            "message": f"Error al regenerar documentación para {language}"
        }

def generate_final_document(documented_code: str, filename: str, language: str = 'python') -> str:
    """
    Genera un documento Markdown final con el código documentado.
    """
    lang_names = {
        'python': 'Python',
        'javascript': 'JavaScript',
        'php': 'PHP',
        'go': 'Go'
    }
    
    lang_display = lang_names.get(language, language)
    
    document = f"""# Documentación de Código - {filename}

**Lenguaje:** {lang_display}

## Código Documentado

```{language}
{documented_code}
```

---

*Documentación generada automáticamente por Code Doc Generator*
*Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca*
"""
    
    return document