window.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Luz ambiental hemisférica
    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.6;

    // Luz direccional desde el "techo" para sombras y realismo
    const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(-0.5, -1, -0.5), scene);
    dirLight.position = new BABYLON.Vector3(10, 20, 10);
    dirLight.intensity = 0.8;

    // Habilitar sombras
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // Cargar/usar modelo de suelo (terrain/suelo.glb) si existe
    BABYLON.SceneLoader.ImportMesh(
      '',
      'terrain/',
      'suelo.glb',
      scene,
      function (meshes) {
        if (meshes.length > 0) {
          // Crear un nodo root para controlar posición/escala del terreno
          const terrainRoot = new BABYLON.TransformNode('terrainRoot', scene);

          // Parentear las mallas al root y aplicar ajustes
          meshes.forEach((m) => {
            if (m instanceof BABYLON.Mesh) {
              m.parent = terrainRoot;
              m.receiveShadows = true;
              m.isPickable = false;
            }
          });

          // Aumentar el tamaño del terreno para cubrir más área
          // y bajar ligeramente en Y para que la parte superior quede a la altura del suelo (pies)
          terrainRoot.scaling = new BABYLON.Vector3(25, 25, 25); // escala por defecto (ajustable)
          terrainRoot.position = new BABYLON.Vector3(0, -1, 0);

          // Poner el terreno en vertical: rotar 90° alrededor del eje X
          terrainRoot.rotationQuaternion = null;
          terrainRoot.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

          // Asegurar que cada malla hija no tenga rotación propia que incline el conjunto
          meshes.forEach((m) => {
            if (m instanceof BABYLON.Mesh) {
              m.rotationQuaternion = null;
              m.rotation = new BABYLON.Vector3(0, 0, 0);
            }
          });

          console.log('Suelo (suelo.glb) cargado en la escena y rotado a vertical.');
        }
      },
      null,
      function (sceneArg, message, exception) {
        console.warn('No se pudo cargar terrain/suelo.glb:', message);
      }
    );



    // Player (mensajero espacial) - root TransformNode; model will be cargado y parentado aquí
    const player = new BABYLON.TransformNode('player', scene);
    player.position = new BABYLON.Vector3(0, 0, 0);
    player.rotation = new BABYLON.Vector3(0, 0, 0);
    player.scaling = new BABYLON.Vector3(1, 1, 1);

    // Cargar modelo glb del astronauta localizado en 'astronaut/source/sample.glb'
    BABYLON.SceneLoader.ImportMesh(
      '',
      'astronaut/source/',
      'sample.glb',
      scene,
      function (meshes) {
        if (meshes.length > 0) {
          // El primer mesh (meshes[0]) es el nodo raíz del modelo importado
          const root = meshes[0];
          root.parent = player;
          root.position = new BABYLON.Vector3(0, 3, 0);
          root.scaling = new BABYLON.Vector3(10, 10, 10);
          // Sin rotación para que el modelo dé la espalda a la cámara
          root.rotation = new BABYLON.Vector3(0, 0, 0);

          // Ajustar escala del player para que el modelo tenga un tamaño apropiado
          player.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

          // Añadir todas las mallas del modelo como proyectores de sombras
          meshes.forEach((mesh) => {
            if (mesh.getTotalVertices() > 0) {
              shadowGenerator.addShadowCaster(mesh);
            }
          });

          console.log('Modelo astronauta cargado correctamente.');
        }
      },
      null,
      function (scene, message, exception) {
        console.error('Error cargando sample.glb:', message, exception);
      }
    );

    // Camera: ArcRotateCamera (tercera persona) — rotación con mouse alrededor del jugador
    const camera = new BABYLON.ArcRotateCamera('arcCam', -Math.PI / 2, Math.PI / 3, 16, player.position, scene);
    // Alejar un poco la cámara del jugador
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 40;
    camera.wheelDeltaPercentage = 0.01;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2 - 0.1;
    camera.inertia = 0.6;
    // Deshabilitar controles de la cámara para que no se pueda mover
    camera.attachControl(canvas, true);
    // Mantener la cámara enfocada en el mesh jugador
    camera.lockedTarget = player;

    // Materiales para los objetos
    const mPackage = new BABYLON.StandardMaterial('mPackage', scene);
    mPackage.diffuseColor = new BABYLON.Color3(1, 0.3, 0.1);
    mPackage.emissiveColor = new BABYLON.Color3(0.2, 0.05, 0);

    const mCollected = new BABYLON.StandardMaterial('mCollected', scene);
    mCollected.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    mCollected.alpha = 0.5;

    const mDrop = new BABYLON.StandardMaterial('mDrop', scene);
    mDrop.diffuseColor = new BABYLON.Color3(0.2, 1, 0.3);
    mDrop.emissiveColor = new BABYLON.Color3(0, 0.2, 0.05);

    // Zona de depósito (más grande y visible)
    const dropZone = BABYLON.MeshBuilder.CreateCylinder('dropZone', { diameter: 5, height: 0.2 }, scene);
    dropZone.position = new BABYLON.Vector3(0, 0.1, -20);
    dropZone.material = mDrop;

    // Indicador visual del depósito
    const dropIndicator = BABYLON.MeshBuilder.CreateTorus('dropIndicator', { diameter: 6, thickness: 0.3 }, scene);
    dropIndicator.position = new BABYLON.Vector3(0, 0.5, -20);
    dropIndicator.material = mDrop;

    // Posiciones de los paquetes distribuidos por el mapa
    const packagePositions = [
      new BABYLON.Vector3(15, 0.5, 10),
      new BABYLON.Vector3(-12, 0.5, 8),
      new BABYLON.Vector3(20, 0.5, -5),
      new BABYLON.Vector3(-18, 0.5, -12),
      new BABYLON.Vector3(8, 0.5, 18),
      new BABYLON.Vector3(-8, 0.5, 22),
      new BABYLON.Vector3(25, 0.5, 15),
      new BABYLON.Vector3(-22, 0.5, 5),
    ];

    let packages = [];

    // Intentar cargar el GLB de los paquetes y clonar sus mallas para cada posición.
    BABYLON.SceneLoader.ImportMesh(
      '',
      'paquete/',
      'paquete.glb',
      scene,
      function (meshes) {
        // Filtrar las mallas visuales (con vértices)
        const prototypeMeshes = meshes.filter((m) => m instanceof BABYLON.Mesh && m.getTotalVertices && m.getTotalVertices() > 0);

        if (prototypeMeshes.length === 0) {
          console.warn('paquete.glb cargado pero no contiene mallas visibles. No se crearán paquetes.');
          return;
        }

        // Para cada posición crear un TransformNode root y clonar las mallas visuales dentro
        packagePositions.forEach((pos, index) => {
          const root = new BABYLON.TransformNode('paqueteRoot_' + index, scene);
          root.position = pos.clone();

          // Clonar cada malla prototipo y parentarla al root
          prototypeMeshes.forEach((pm) => {
            const clone = pm.clone(pm.name + '_inst_' + index);
            if (clone) {
              clone.parent = root;
              // Mantener transform locales
              clone.position = pm.position ? pm.position.clone() : BABYLON.Vector3.Zero();
              if (pm.rotation) clone.rotation = pm.rotation.clone();
              if (pm.scaling) clone.scaling = pm.scaling.clone();
              // Asegurar que genere sombras
              try { shadowGenerator.addShadowCaster(clone); } catch (e) {}
            }
          });

          // Estado y referencias
          packages.push({ root: root, isCollected: false, isDelivered: false });
        });

        // Desechar las mallas importadas originales para mantener la escena limpia
        meshes.forEach((m) => {
          try { if (m instanceof BABYLON.Mesh) m.dispose(); } catch (e) {}
        });
      },
      null,
      function (sceneArg, message, exception) {
        console.warn('No se pudo cargar paquete/paquete.glb:', message);
      }
    );

    // State
    let carriedPackage = null; // Paquete que lleva el jugador
    let delivered = 0;
    const totalPackages = packagePositions.length;

    // Input handling
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = true;
      })
    );
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = false;
      })
    );

    // Action key (Espacio) - respond to keydown events separately for pick/drop
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
        const code = kbInfo.event.code; // e.g., 'Space'
        if (code === 'Space') {
          const distToDrop = BABYLON.Vector3.Distance(player.position, dropZone.getAbsolutePosition());

          if (!carriedPackage) {
            // Buscar el paquete más cercano que no haya sido entregado
            let closestPkg = null;
            let closestDist = Infinity;
            packages.forEach((pkg) => {
              if (!pkg.isDelivered && !pkg.isCollected) {
                let pkgPos = null;
                try {
                  pkgPos = pkg.root.getAbsolutePosition();
                } catch (e) {
                  pkgPos = pkg.root.position;
                }
                const dist = BABYLON.Vector3.Distance(player.position, pkgPos);
                if (dist < closestDist && dist < 3) {
                  closestDist = dist;
                  closestPkg = pkg;
                }
              }
            });

            if (closestPkg) {
              // Recoger el paquete: parentear el root al jugador
              closestPkg.isCollected = true;
              closestPkg.root.parent = player;
              closestPkg.root.position = new BABYLON.Vector3(0, 2.5, 0.8);
              carriedPackage = closestPkg;
              updateHUD();
            }
          } else if (carriedPackage && distToDrop < 4) {
            // Entregar el paquete en el depósito
            carriedPackage.root.parent = null;
            carriedPackage.isDelivered = true;

            // Aplicar material de entregado a todas las mallas hijas
            try {
              const children = carriedPackage.root.getChildMeshes ? carriedPackage.root.getChildMeshes() : [];
              children.forEach((m) => {
                if (m instanceof BABYLON.Mesh) m.material = mCollected;
              });
            } catch (e) {}

            // Apilar paquetes entregados en el depósito
            carriedPackage.root.position = new BABYLON.Vector3(
              dropZone.position.x + (Math.random() - 0.5) * 2,
              0.5 + delivered * 0.3,
              dropZone.position.z + (Math.random() - 0.5) * 2
            );
            carriedPackage.root.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
            carriedPackage = null;
            delivered += 1;
            updateHUD();

            // Verificar si ganó
            if (delivered >= totalPackages) {
              setTimeout(() => {
                alert('¡Felicidades! Has entregado todos los paquetes.');
              }, 100);
            }
          }
        }
      }
    });

    // HUD update helper
    function updateHUD() {
      const estado = document.getElementById('estado-text');
      const count = document.getElementById('del-count');
      if (!estado || !count) return;
      estado.textContent = carriedPackage ? '📦 Llevando paquete' : '🔍 Busca un paquete';
      count.textContent = delivered + ' / ' + totalPackages;
    }

    updateHUD();

    // Game loop - movimiento del jugador (WASD) — movimiento relativo a la cámara
    const moveSpeed = 3.0; // unidades por segundo (ajustable)
    const rotationSpeed = 12.0; // rapidez para girar hacia la dirección de movimiento (incrementado)
    const damping = 0.85; // factor de amortiguación por frame
    let playerVelocity = new BABYLON.Vector3(0, 0, 0);

    scene.onBeforeRenderObservable.add(() => {
      const deltaTime = engine.getDeltaTime() / 1000.0; // Delta time en segundos

      let moveX = 0;
      let moveZ = 0;

      // Detectar teclas WASD (corregido: W debe ir hacia adelante)
      if (inputMap['w'] || inputMap['W']) {
        moveZ = -1;
      }
      if (inputMap['s'] || inputMap['S']) {
        moveZ = 1;
      }
      if (inputMap['a'] || inputMap['A']) {
        moveX = -1;
      }
      if (inputMap['d'] || inputMap['D']) {
        moveX = 1;
      }

      // Movimiento relativo a la cámara (usar el ángulo alpha de la ArcRotateCamera)
      if (moveX !== 0 || moveZ !== 0) {
        const alpha = camera.alpha; // ángulo horizontal de la cámara
        const forward = new BABYLON.Vector3(Math.cos(alpha), 0, Math.sin(alpha));
        const right = new BABYLON.Vector3(Math.cos(alpha + Math.PI / 2), 0, Math.sin(alpha + Math.PI / 2));

        const moveDir = forward.scale(moveZ).add(right.scale(moveX));
        moveDir.normalize();

        // Acelerar en la dirección deseada (velocidad por segundo)
        playerVelocity.addInPlace(moveDir.scale(moveSpeed * deltaTime));

        // Rotar el jugador suavemente hacia la dirección de movimiento
        const desiredYaw = Math.atan2(moveDir.x, moveDir.z);
        const currentYaw = player.rotation.y || 0;
        player.rotation.y = BABYLON.Scalar.Lerp(currentYaw, desiredYaw, Math.min(1, rotationSpeed * deltaTime));
      }

      // Aplicar amortiguación para detenerse suavemente
      playerVelocity.scaleInPlace(damping);

      // Mover el jugador basado en la velocidad
      player.position.addInPlace(playerVelocity);

      // Detener el movimiento si la velocidad es muy baja para evitar deslizamiento infinito
      if (playerVelocity.length() < 0.02) {
        playerVelocity.set(0, 0, 0);
      }

      // Mantener la cámara siguiendo al jugador
      camera.target.copyFrom(player.position);
    });

    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
});
