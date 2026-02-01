# Space Defender - POC

Un juego tipo Galaga/Space Shooter 2D construido con Babylon.js.

## 🎮 Características principales

- ✅ Cámara fija ortográfica 2D
- ✅ Nave espacial controlable (teclas de flecha o WASD)
- ✅ Sistema de disparo (Espacio o Enter)
- ✅ Enemigos con 3 tipos diferentes y patrones de movimiento variados
- ✅ Sistema de colisiones
- ✅ UI con puntuación y vidas
- ✅ Sistema de Game Over, reinicio y retorno al menú principal
- ✅ Menú principal con:
  - Iniciar juego
  - Ver historial de scores
- ✅ Sistema de niveles con jefe por nivel:
  - Cada nivel aumenta la cantidad y velocidad de los enemigos
  - El score necesario para invocar al jefe se **duplica** en cada nivel
  - Si el jugador llega a **15000 puntos**, se muestra mensaje de victoria final
- ✅ Power-ups con drop muy bajo al destruir enemigos:
  - Aumento de velocidad de movimiento
  - Aumento de velocidad de disparo
  - Disparo doble temporal
- ✅ Sistema de scores persistente usando `localStorage` (historial visible desde el menú
  de scores)

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
| Reiniciar (Game Over) | Botón RESTART en pantalla |
| Volver al menú (Game Over) | Botón MENU en pantalla |

## 🏗️ Estructura del Proyecto

```
space-defender-poc/
├── src/
│   ├── entities/           # Entidades del juego
│   │   ├── Player.ts       # Nave del jugador
│   │   ├── Enemy.ts        # Enemigos
│   │   ├── Projectile.ts   # Proyectiles
│   │   └── PowerUp.ts      # Mejores / power-ups
│   ├── systems/            # Sistemas del juego
│   │   ├── InputSystem.ts  # Manejo de input
│   │   ├── CollisionSystem.ts  # Detección de colisiones
│   │   └── SpawnSystem.ts  # Sistema de spawn
│   ├── managers/           # Managers
│   │   └── ScoreManager.ts # Gestión de puntuación y guardado en localStorage
│   ├── scenes/
│   │   └── GameScene.ts    # Escena principal del juego (niveles, jefe, power-ups)
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

### Enemigos y niveles
- **3 tipos de enemigos base:**
  - Básico (LV1) - Movimiento zigzag horizontal
  - Medio (LV2) - Movimiento en onda sinusoidal
  - Fuerte (LV3) - Movimiento diagonal
- Sistema de niveles:
  - Cada nuevo nivel añade más filas/columnas de enemigos
  - Se incrementa la velocidad de movimiento de los enemigos
  - El jefe aparece cuando se alcanza un umbral de score que se **duplica** en cada nivel

### Gameplay
- Sistema de vidas (3 inicial)
- Invulnerabilidad temporal al recibir daño
- Puntuación por enemigos eliminados (100 puntos cada uno) y jefes derrotados (1000 puntos)
- Spawn continuo de enemigos (más agresivo a niveles altos)
- Game Over cuando vidas llegan a 0
- Victoria global al alcanzar **15000 puntos**

### Power-ups
- Drop con probabilidad baja al destruir enemigos
- Tipos de power-up implementados:
  - **MoveSpeed**: aumenta velocidad de movimiento del jugador durante unos segundos
  - **RapidFire**: reduce el tiempo entre disparos durante unos segundos
  - **DoubleShot**: añade un disparo extra paralelo mientras el efecto está activo

### Sistema de scores
- Cada partida terminada (por Game Over o victoria) guarda el score en `localStorage`
- Desde el menú principal puedes ver el historial de scores con fecha y hora

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

## 📄 Nota

Este proyecto empezó como una prueba de concepto y se ha extendido con
mecánicas adicionales (niveles, jefe, power-ups, menú y sistema de scores)
para hacerlo más cercano a un minijuego completo.
