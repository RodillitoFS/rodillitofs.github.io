# Rodillito FS — Constructor de entrenamientos

Página web interactiva para montar plantillas de entrenamiento de fútbol sala.

## Uso local

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8080
```

Entra en `http://localhost:8080`.

## Publicar en GitHub Pages (usuario `rodillitofs`)

1. Crea la cuenta / organización **rodillitofs** en GitHub.
2. Crea un repositorio (recomendado: `rodillitofs.github.io` para la raíz del dominio, o cualquier repo con Pages).
3. Sube estos archivos a la rama `main`.
4. En **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` / carpeta `/ (root)`
5. La web quedará en:
   - `https://rodillitofs.github.io/` (si el repo es `rodillitofs.github.io`)
   - o `https://rodillitofs.github.io/NOMBRE-REPO/` (si es un repo de proyecto)

## Personalizar ejercicios

Edita `js/exercises.js`: categorías, títulos, duraciones, descripciones y la clave `animation` (definida en `js/animations.js`).

## Leyenda táctica

| Símbolo | Significado |
|---------|-------------|
| Círculo rosa | Atacante |
| Triángulo negro | Defensor |
| Círculo amarillo | Balón |
| Círculo verde | Portero |
