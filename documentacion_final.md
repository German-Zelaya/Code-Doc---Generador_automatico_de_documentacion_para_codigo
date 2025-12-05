
Documentación en Markdown:

# Sumador y restador
Este archivo contiene dos funciones, `sumar` y `restar`, que permiten sumar o restar números.

## Funciones

### sumar(a, b)
La función `sumar` toma dos argumentos y devuelve la suma de ellos. Si se proporciona un tercer argumento booleano como `True`, se realiza una resta en lugar de una suma.

**Parámetros:**

* `a`: El primer número a sumar o restar.
* `b`: El segundo número a sumar o restar.
* `bool`: Un valor booleano que indica si se debe realizar una resta (si es `True`) o una suma (si es `False`).

**Valor de retorno:**
La suma o diferencia de los dos números.

**Ejemplo de uso:**
```python
print(sumar(2, 3)) # Imprime 5
print(sumar(4, 5, True)) # Imprime -1
```
### restar(a, b)
La función `restar` toma dos argumentos y devuelve la diferencia entre ellos. Si se proporciona un tercer argumento booleano como `True`, se realiza una suma en lugar de una resta.

**Parámetros:**

* `a`: El primer número a restar o sumar.
* `b`: El segundo número a restar o sumar.
* `bool`: Un valor booleano que indica si se debe realizar una suma (si es `True`) o una resta (si es `False`).

**Valor de retorno:**
La diferencia entre los dos números.

**Ejemplo de uso:**
```python
print(restar(2, 3)) # Imprime -1
print(restar(4, 5, True)) # Impresa 1
```
## Sugerencias de documentación

Para mejorar la claridad y precisión de la documentación, se pueden seguir las siguientes sugerencias:

* Utilizar un formato consistente para los parámetros y valores devueltos.
* Proporcionar ejemplos de uso para cada función.
* Incluir información relevante sobre el valor de retorno de cada función.
* Utilizar un formato de documentación adecuado para el lenguaje en el que se está escribiendo el código (por ejemplo, docstring en Python o JSDoc en JavaScript).

Es importante mencionar que la documentación debe ser clara y precisa, y debe incluir información relevante para los usuarios de la función. En este caso, se ha incluido un ejemplo de uso para cada una de las funciones, lo que permite a los usuarios entender cómo utilizarlas correctamente. Además, se ha mencionado el valor de retorno de cada función para que los usuarios puedan entender qué esperarán como resultado al llamar a cada una de ellas.