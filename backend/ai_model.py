import re
from langchain_ollama import OllamaLLM
from langchain_core.messages import HumanMessage

# Configuración del modelo Ollama
MODEL_NAME = "llama3.2"

# Patrones para detectar bucles, condicionales y excepciones
CONTROL_FLOW_PATTERNS = {
    'python': {
        'loops': r'\b(for|while)\s+',
        'conditionals': r'\b(if|elif|else)\s*[:\(]',
        'exceptions': r'\b(try|except|finally)\s*[:\(]'
    },
    'javascript': {
        'loops': r'\b(for|while|forEach|map|filter)\s*[\(\{]',
        'conditionals': r'\b(if|else|switch)\s*[\(\{]',
        'exceptions': r'\b(try|catch|finally)\s*[\{\(]'
    },
    'php': {
        'loops': r'\b(for|foreach|while|do)\s*[\(\{]',
        'conditionals': r'\b(if|else|elseif|switch)\s*[\(\{]',
        'exceptions': r'\b(try|catch|finally)\s*[\{\(]'
    },
    'go': {
        'loops': r'\b(for|range)\s+',
        'conditionals': r'\b(if|else|switch)\s*[\{\(]',
        'exceptions': r'\b(defer|panic|recover)\s*[\{\(]?'
    }
}

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

def extract_code_structure(code: str, language: str) -> dict:
    """
    Extrae información detallada sobre la estructura del código.
    Incluye variables importantes, transformaciones de datos, etc.
    """
    structure = {
        'assignments': [],
        'function_calls': [],
        'data_structures': [],
        'transformations': []
    }
    
    # Variables y asignaciones importantes
    if language == 'python':
        # Captura asignaciones significativas
        assignments = re.findall(r'(\w+)\s*=\s*(.+?)(?=\n|;)', code)
        structure['assignments'] = [f"{var}={val.strip()[:50]}" for var, val in assignments[:5]]
    elif language == 'javascript':
        assignments = re.findall(r'(?:const|let|var)\s+(\w+)\s*=\s*(.+?)(?=;|\n)', code)
        structure['assignments'] = [f"{var}={val.strip()[:50]}" for var, val in assignments[:5]]
    elif language == 'php':
        assignments = re.findall(r'\$(\w+)\s*=\s*(.+?)(?=;)', code)
        structure['assignments'] = [f"${var}={val.strip()[:50]}" for var, val in assignments[:5]]
    elif language == 'go':
        assignments = re.findall(r'(\w+)\s*:?=\s*(.+?)(?=\n)', code)
        structure['assignments'] = [f"{var}={val.strip()[:50]}" for var, val in assignments[:5]]
    
    # Llamadas a funciones/métodos
    if language in ['python', 'javascript', 'php', 'go']:
        function_calls = re.findall(r'\.?(\w+)\s*\(', code)
        structure['function_calls'] = list(set(function_calls))[:10]
    
    # Estructuras de datos (listas, diccionarios, etc.)
    if language == 'python':
        structure['data_structures'] = ['dict' if '{' in code else '', 'list' if '[' in code else '']
    elif language == 'javascript':
        structure['data_structures'] = ['object' if '{' in code else '', 'array' if '[' in code else '']
    elif language == 'php':
        structure['data_structures'] = ['array' if '[' in code or '(' in code else '']
    elif language == 'go':
        structure['data_structures'] = ['map' if 'map[' in code else '', 'slice' if '[]' in code else '']
    
    structure['data_structures'] = [x for x in structure['data_structures'] if x]
    
    return structure

def analyze_control_flow(code: str, language: str) -> dict:
    """
    Analiza bucles, condicionales, excepciones y extrae detalles sobre qué hacen.
    """
    if language not in CONTROL_FLOW_PATTERNS:
        return {
            'loops': [], 'conditionals': [], 'exceptions': [], 
            'loop_details': {}, 'conditional_details': {},
            'structure': {}, 'has_control_flow': False
        }
    
    patterns = CONTROL_FLOW_PATTERNS[language]
    analysis = {
        'loops': [], 'conditionals': [], 'exceptions': [],
        'loop_details': {}, 'conditional_details': {},
        'structure': {}, 'has_control_flow': False
    }
    
    # Detectar bucles y extraer detalles
    loop_matches = re.finditer(patterns['loops'], code)
    loop_details = {}
    for match in loop_matches:
        loop_type = match.group(1)
        # Extraer la línea completa del bucle
        line_start = code.rfind('\n', 0, match.start()) + 1
        line_end = code.find('\n', match.end())
        loop_line = code[line_start:line_end].strip()
        
        if loop_type not in loop_details:
            loop_details[loop_type] = []
        loop_details[loop_type].append(loop_line[:80])
        
        analysis['loops'].append(loop_type)
        analysis['has_control_flow'] = True
    
    analysis['loop_details'] = loop_details
    analysis['loops'] = list(set(analysis['loops']))
    
    # Detectar condicionales y extraer detalles
    conditional_matches = re.finditer(patterns['conditionals'], code)
    conditional_details = {}
    for match in conditional_matches:
        cond_type = match.group(1)
        line_start = code.rfind('\n', 0, match.start()) + 1
        line_end = code.find('\n', match.end())
        cond_line = code[line_start:line_end].strip()
        
        if cond_type not in conditional_details:
            conditional_details[cond_type] = []
        conditional_details[cond_type].append(cond_line[:80])
        
        analysis['conditionals'].append(cond_type)
        analysis['has_control_flow'] = True
    
    analysis['conditional_details'] = conditional_details
    analysis['conditionals'] = list(set(analysis['conditionals']))
    
    # Detectar excepciones
    exceptions = re.findall(patterns['exceptions'], code)
    if exceptions:
        analysis['exceptions'] = list(set(exceptions))
        analysis['has_control_flow'] = True
    
    # Extraer estructura del código
    analysis['structure'] = extract_code_structure(code, language)
    
    return analysis

def get_control_flow_hint(control_flow: dict, language: str = 'python') -> str:
    """
    Crea un hint detallado sobre el flujo de control detectado.
    Explica exactamente qué se debe documentar.
    """
    if not control_flow['has_control_flow']:
        return ""
    
    lang_names = {
        'python': 'Python',
        'javascript': 'JavaScript',
        'php': 'PHP',
        'go': 'Go'
    }
    
    hint = "\n\n📋 INFORMACIÓN IMPORTANTE SOBRE EL FLUJO DE CONTROL DETECTADO:\n"
    hint += "=" * 60 + "\n\n"
    
    # Información sobre bucles
    if control_flow['loops']:
        hint += "🔄 BUCLES DETECTADOS:\n"
        for loop_type in control_flow['loops']:
            hint += f"   - Tipo: {loop_type}\n"
            if loop_type in control_flow['loop_details']:
                for detail in control_flow['loop_details'][loop_type][:2]:
                    hint += f"     * {detail}\n"
        hint += "   ➡️  DOCUMENTA:\n"
        hint += "       • ANTES del bucle: comentario indicando QUÉ se va a iterar y POR QUÉ\n"
        hint += "       • DESPUÉS del bucle: comentario indicando QUÉ se logró con la iteración\n"
        hint += "       • Cuántas veces se repite y qué sucede en cada iteración\n\n"
    
    # Información sobre condicionales
    if control_flow['conditionals']:
        hint += "❓ CONDICIONALES DETECTADOS:\n"
        for cond_type in control_flow['conditionals']:
            hint += f"   - Tipo: {cond_type}\n"
            if cond_type in control_flow['conditional_details']:
                for detail in control_flow['conditional_details'][cond_type][:2]:
                    hint += f"     * {detail}\n"
        hint += "   ➡️  DOCUMENTA: Qué condición valida cada rama (if/else/switch) y qué sucede en cada caso.\n\n"
    
    # Información sobre excepciones
    if control_flow['exceptions']:
        hint += "⚠️ MANEJO DE EXCEPCIONES DETECTADO:\n"
        for exc_type in control_flow['exceptions']:
            hint += f"   - Tipo: {exc_type}\n"
        hint += "   ➡️  DOCUMENTA: Qué excepciones maneja y qué sucede cuando se lanzan.\n\n"
    
    # Información sobre estructura
    if control_flow['structure']:
        structure = control_flow['structure']
        if structure.get('data_structures'):
            hint += "📊 ESTRUCTURAS DE DATOS:\n"
            for ds in structure['data_structures']:
                hint += f"   - {ds}\n"
            hint += "   ➡️  DOCUMENTA: Qué información contienen y cómo se usan.\n\n"
        
        if structure.get('function_calls'):
            hint += "📞 FUNCIONES/MÉTODOS LLAMADOS:\n"
            for call in structure['function_calls'][:5]:
                hint += f"   - {call}()\n"
            hint += "   ➡️  DOCUMENTA: Qué hace cada función y por qué se llama.\n\n"
    
    hint += "💡 RECUERDA: La documentación debe explicar NO SOLO qué hace el código,\n"
    hint += "sino CÓMO lo hace y POR QUÉ se usa cada estructura de control.\n"
    hint += "¡IMPORTANTE! Marca claramente INICIO y FIN de cada bucle con comentarios.\n"
    
    return hint

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
- **DOCUMENTA BUCLES CON INICIO Y FIN:**
  * ANTES del bucle: # INICIO BUCLE: Descripción de qué se va a iterar y por qué
  * DESPUÉS del bucle: # FIN BUCLE: Descripción de qué se logró o resultado obtenido
- Si hay condicionales o excepciones, documenta qué hace cada uno
- Usa el formato de docstring de Google:
  \"\"\"
  Descripción breve de la función.
  
  Descripción detallada: incluye qué hacen los bucles, condicionales y excepciones si existen.
  
  Args:
      param1 (tipo): Descripción del parámetro.
      param2 (tipo): Descripción del parámetro.
  
  Returns:
      tipo: Descripción del valor de retorno.
  \"\"\"
- No modifiques el código funcional
- Devuelve SOLO el código completo con los docstrings y comentarios de bucles agregados

EJEMPLO de documentación de bucles:
# INICIO BUCLE: Itera sobre cada elemento de la lista de usuarios para validación
for user in users:
    validate_user(user)
# FIN BUCLE: Todos los usuarios han sido validados

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
- **DOCUMENTA BUCLES CON INICIO Y FIN:**
  * ANTES del bucle: // INICIO BUCLE: Descripción de qué se va a iterar y por qué
  * DESPUÉS del bucle: // FIN BUCLE: Descripción de qué se logró o resultado obtenido
- Si hay condicionales o excepciones, documenta qué hace cada uno
- Usa el formato JSDoc estándar:
  /**
   * Descripción breve de la función.
   * 
   * Descripción detallada: incluye qué hacen los bucles, condicionales y excepciones si existen.
   * 
   * @param {{tipo}} param1 - Descripción del parámetro.
   * @param {{tipo}} param2 - Descripción del parámetro.
   * @returns {{tipo}} Descripción del valor de retorno.
   */
- No modifiques el código funcional
- Devuelve SOLO el código completo con JSDoc y comentarios de bucles agregados

EJEMPLO de documentación de bucles:
// INICIO BUCLE: Itera sobre cada producto del carrito para calcular total
for (let product of cart) {{
    total += product.price;
}}
// FIN BUCLE: Total del carrito calculado

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
- **DOCUMENTA BUCLES CON INICIO Y FIN:**
  * ANTES del bucle: // INICIO BUCLE: Descripción de qué se va a iterar y por qué
  * DESPUÉS del bucle: // FIN BUCLE: Descripción de qué se logró o resultado obtenido
- Si hay condicionales o excepciones, documenta qué hace cada uno
- Usa el formato PHPDoc estándar:
  /**
   * Descripción breve de la función.
   * 
   * Descripción detallada: incluye qué hacen los bucles, condicionales y excepciones si existen.
   * 
   * @param tipo $param1 Descripción del parámetro.
   * @param tipo $param2 Descripción del parámetro.
   * @return tipo Descripción del valor de retorno.
   */
- No modifiques el código funcional
- Devuelve SOLO el código completo con PHPDoc y comentarios de bucles agregados

EJEMPLO de documentación de bucles:
// INICIO BUCLE: Itera sobre cada registro de la base de datos para actualización
foreach ($records as $record) {{
    $record->update();
}}
// FIN BUCLE: Todos los registros actualizados en la base de datos

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
- **DOCUMENTA BUCLES CON INICIO Y FIN:**
  * ANTES del bucle: // INICIO BUCLE: Descripción de qué se va a iterar y por qué
  * DESPUÉS del bucle: // FIN BUCLE: Descripción de qué se logró o resultado obtenido
- Si hay condicionales o excepciones, documenta qué hace cada uno
- Usa el formato GoDoc estándar:
  // FunctionName descripción breve de la función.
  // Descripción más detallada incluyendo qué hacen los bucles, condicionales y excepciones si existen.
- Los comentarios deben estar INMEDIATAMENTE antes de la función
- No modifiques el código funcional
- Devuelve SOLO el código completo con GoDoc y comentarios de bucles agregados

EJEMPLO de documentación de bucles:
// INICIO BUCLE: Itera sobre cada elemento del slice para procesamiento
for _, item := range items {{
    process(item)
}}
// FIN BUCLE: Todos los elementos han sido procesados

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
        
        # Analizar flujo de control
        control_flow = analyze_control_flow(code, language)
        
        # Obtener prompt según el lenguaje
        prompt = get_documentation_prompt(language, code)
        
        # Agregar hint sobre flujo de control
        hint = get_control_flow_hint(control_flow, language)
        if hint:
            prompt += hint
        
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
        
        # Analizar flujo de control
        control_flow = analyze_control_flow(code, language)
        
        base_prompt = get_documentation_prompt(language, code)
        
        # Agregar hint sobre flujo de control
        hint = get_control_flow_hint(control_flow, language)
        
        prompt = base_prompt + f"\n\nGenera una NUEVA versión más detallada y clara.{feedback_text}"
        if hint:
            prompt += hint
        
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