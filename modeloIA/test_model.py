import subprocess

def analizar_codigo(ruta_archivo):
    with open(ruta_archivo, "r", encoding="utf-8") as f:
        codigo = f.read()

    prompt = f"Analiza este código y da sugerencias de documentación:\n\n{codigo}"
    result = subprocess.run(["ollama", "run", "code-doc"], input=prompt.encode("utf-8"), capture_output=True)
    
    print(result.stdout.decode())

analizar_codigo("tests/ejemplo.py")
