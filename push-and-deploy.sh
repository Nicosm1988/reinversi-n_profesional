#!/bin/bash

# Asegura detener el script si hay errores
set -e

# Imprimir paso actual
echo "🚀 Iniciando proceso de Auto-Deploy a GitHub y Vercel..."

# Verifica si hay cambios
if [[ -z $(git status -s) ]]; then
  echo "✅ No hay cambios para commitear. El repositorio está limpio."
  exit 0
fi

# Añade todos los cambios
echo "📦 Añadiendo archivos..."
git add .

# Pregunta por el mensaje del commit o usa uno genérico temporal si se pasa -y
COMMIT_MSG=$1
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Auto-deploy: Actualización de features (Supabase UI & Build Fixes) - $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "📝 Creando commit: '$COMMIT_MSG'"
git commit -m "$COMMIT_MSG"

# Empuja a la rama actual (por defecto main)
echo "☁️ Subiendo a GitHub..."
CURRENT_BRANCH=$(git branch --show-current)
git push origin "$CURRENT_BRANCH"

echo "✅ ¡Listo! Los cambios ya están en GitHub y Vercel debería estar comenzando el Build automático."
