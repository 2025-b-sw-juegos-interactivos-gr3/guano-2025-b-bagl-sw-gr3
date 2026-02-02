# Space Defender

Un juego tipo Galaga/Space Shooter 2D construido con **Babylon.js** y **TypeScript**.

## 🎮 Características principales

- ✅ Nave espacial 3D personalizada (modelo GLB)
- ✅ Cámara fija ortográfica 2D
- ✅ Controles suaves (flechas o A/D + Espacio para disparar)
- ✅ 3 tipos de enemigos con sprites PNG personalizados
- ✅ **Boss Final** que aparece al alcanzar 2000 puntos
- ✅ Barra de vida del Boss con porcentaje
- ✅ Sistema de colisiones
- ✅ **Efectos de partículas** (explosiones al destruir enemigos)
- ✅ **Sistema de audio** (disparo, explosión, música de fondo)
- ✅ UI con puntuación y vidas
- ✅ Pantalla de **Game Over** con botón de reinicio
- ✅ Pantalla de **Victoria** al derrotar al Boss
- ✅ Fondo espacial con estrellas generadas proceduralmente

## 🚀 Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm

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

| Acción                    | Teclas                       |
| ------------------------- | ---------------------------- |
| Mover izquierda           | ← o A                        |
| Mover derecha             | → o D                        |
| Disparar                  | Espacio                      |
| Reiniciar (Game Over)     | Botón RESTART en pantalla    |
| Jugar de nuevo (Victoria) | Botón PLAY AGAIN en pantalla |

## 🏗️ Estructura del Proyecto

```
Andrew's Space Defender/
├── public/
│   ├── models/
│   │   ├── nave.glb           # Modelo 3D de la nave del jugador
│   │   ├── enemiesLV1.png     # Sprite enemigo nivel 1
│   │   ├── enemiesLV2.png     # Sprite enemigo nivel 2
│   │   └── enemiesLV3.png     # Sprite enemigo nivel 3 / Boss
│   ├── sounds/
│   │   ├── disparo.mp3        # (Opcional) Sonido de disparo
│   │   ├── explosion.mp3      # (Opcional) Sonido de explosión
│   │   └── musica_fondo.mp3   # (Opcional) Música de fondo
│   └── textures/              # Texturas adicionales
├── src/
│   ├── entities/
│   │   ├── Player.ts          # Nave del jugador (carga modelo GLB)
│   │   ├── Enemy.ts           # Enemigos (sprites PNG)
│   │   ├── Boss.ts            # Jefe final
│   │   └── Projectile.ts      # Proyectiles
│   ├── systems/
│   │   ├── InputSystem.ts     # Manejo de input
│   │   ├── CollisionSystem.ts # Detección de colisiones
│   │   ├── SpawnSystem.ts     # Sistema de spawn de enemigos
│   │   └── ParticleSystem.ts  # Sistema de explosiones VFX
│   ├── managers/
│   │   ├── ScoreManager.ts    # Gestión de puntuación
│   │   └── AudioManager.ts    # Gestión de audio
│   ├── scenes/
│   │   └── GameScene.ts       # Escena principal del juego
│   └── main.ts                # Punto de entrada
├── index.html                 # HTML principal con UI
├── package.json
├── tsconfig.json
├── ASSETS.md                  # Documentación de assets
└── README.md
```

## 🎨 Características Técnicas

### Cámara

- **Tipo:** Ortográfica fija
- **Vista:** Cenital (top-down)
- **Proyección:** 2D sin perspectiva

### Jugador

- Modelo 3D personalizado (GLB)
- Escala: 0.05 (5% del tamaño original)
- Movimiento horizontal con límites de pantalla
- Sistema de vidas (3 inicial)
- Invulnerabilidad temporal al recibir daño (parpadeo rojo)

### Enemigos

| Tipo             | Archivo        | Tamaño | Puntos |
| ---------------- | -------------- | ------ | ------ |
| Nivel 1 (Básico) | enemiesLV1.png | 3.0    | 100    |
| Nivel 2 (Medio)  | enemiesLV2.png | 3.2    | 100    |
| Nivel 3 (Fuerte) | enemiesLV3.png | 3.4    | 100    |

**Patrones de movimiento:**

- Zigzag horizontal
- Onda sinusoidal
- Diagonal descendente

### Boss Final

- Aparece al alcanzar **2000 puntos**
- Usa sprite enemiesLV3.png escalado a 8.0 unidades
- **10 puntos de vida**
- Dispara un proyectil cada 2 segundos
- Al derrotarlo: **¡VICTORIA!** (+1000 puntos)

### Sistema de Audio

- **Sonidos personalizados:** Carga archivos MP3 de `/public/sounds/`
- **Sonidos generados:** Web Audio API como fallback automático
  - Disparo: Onda cuadrada descendente
  - Explosión: Ruido blanco filtrado
  - Música: Melodía arcade simple

### Efectos Visuales (VFX)

- Sistema de partículas para explosiones
- Colores: Amarillo → Naranja → Rojo
- Blend mode aditivo (efecto de brillo)
- 3 tamaños: Normal, Pequeño (chispas), Grande (boss)

### Fondo Espacial

- 200 estrellas generadas proceduralmente
- Colores variados: Blanco, Azul, Amarillo
- Fondo: Azul muy oscuro (#050514)

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

- **Babylon.js 7.0** - Motor de juego 3D
- **@babylonjs/loaders** - Carga de modelos GLB
- **TypeScript** - Lenguaje de programación
- **Vite** - Build tool y dev server
- **Web Audio API** - Generación de sonidos

## 📂 Documentación Adicional

- [ASSETS.md](ASSETS.md) - Documentación completa de todos los assets del juego

## 🎯 Cómo Jugar

1. Mueve tu nave con las flechas ← → o teclas A/D
2. Dispara con la barra espaciadora
3. Destruye enemigos para ganar puntos (100 pts c/u)
4. Al llegar a 2000 puntos aparece el **Boss Final**
5. Derrota al Boss para ganar el juego
6. ¡Cuidado! Tienes solo 3 vidas

## 👨‍💻 Desarrollador

**Andrew**  
2025

---

_Space Defender - Un juego arcade estilo Galaga desarrollado con Babylon.js_
