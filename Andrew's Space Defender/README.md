# Space Defender - POC

Un juego tipo Galaga/Space Shooter 2D construido con Babylon.js como prueba de concepto (POC).

## 🎮 Características

- ✅ Cámara fija ortográfica 2D
- ✅ Nave espacial controlable (teclas de flecha o WASD)
- ✅ Sistema de disparo (Espacio o Enter)
- ✅ Enemigos con 3 tipos diferentes y patrones de movimiento variados
- ✅ Sistema de colisiones
- ✅ UI con puntuación y vidas
- ✅ Sistema de Game Over y reinicio

## 🚀 Instalación

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Pasos

1. **Instalar dependencias:**
```bash
npm install
```

2. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

3. **Abrir en navegador:**
El juego se abrirá automáticamente en `http://localhost:5173`

## 🎯 Controles

| Acción | Teclas |
|--------|--------|
| Mover izquierda | ← o A |
| Mover derecha | → o D |
| Disparar | Espacio o Enter |
| Reiniciar (Game Over) | Botón en pantalla |

## 🏗️ Estructura del Proyecto

```
space-defender-poc/
├── src/
│   ├── entities/           # Entidades del juego
│   │   ├── Player.ts       # Nave del jugador
│   │   ├── Enemy.ts        # Enemigos
│   │   └── Projectile.ts   # Proyectiles
│   ├── systems/            # Sistemas del juego
│   │   ├── InputSystem.ts  # Manejo de input
│   │   ├── CollisionSystem.ts  # Detección de colisiones
│   │   └── SpawnSystem.ts  # Sistema de spawn
│   ├── managers/           # Managers
│   │   └── ScoreManager.ts # Gestión de puntuación
│   ├── scenes/
│   │   └── GameScene.ts    # Escena principal del juego
│   └── main.ts             # Punto de entrada
├── index.html              # HTML principal
├── package.json
└── tsconfig.json
```

## 🎨 Características Técnicas

### Cámara
- **Tipo:** Ortográfica fija
- **Vista:** Cenital (top-down)
- **Proyección:** 2D sin perspectiva 3D

### Movimiento
- Nave del jugador: solo horizontal (izquierda/derecha)
- Límites de pantalla implementados
- Movimiento suave con velocidad constante

### Enemigos
- **3 tipos:**
  - Básico (rojo) - Movimiento zigzag horizontal
  - Medio (naranja) - Movimiento en onda sinusoidal
  - Fuerte (morado) - Movimiento diagonal

### Gameplay
- Sistema de vidas (3 inicial)
- Invulnerabilidad temporal al recibir daño
- Puntuación por enemigos eliminados (100 puntos cada uno)
- Spawn continuo de enemigos
- Game Over cuando vidas llegan a 0

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 📝 Tecnologías

- **Babylon.js 7.0** - Motor de juego 3D/2D
- **TypeScript** - Lenguaje de programación
- **Vite** - Build tool y dev server
- **HTML5 Canvas** - Renderizado

## 🎯 Alcance del POC

Este es un **Vertical Slice** que demuestra:
- ✅ Loop de juego funcional
- ✅ Mecánicas core (movimiento, disparo, colisiones)
- ✅ Sistema de puntuación y vidas
- ✅ Diferentes tipos de enemigos
- ✅ UI básica pero funcional

**No incluye (fuera del alcance del POC):**
- Múltiples niveles
- Power-ups complejos
- Boss fights
- Sistema de guardado
- Menús elaborados
- Audio

## 📄 Licencia

Este proyecto es una prueba de concepto educativa.
