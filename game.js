/* =====================================================
   CONFIGURACIÓN
===================================================== */
const TILE_SIZE = 40;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 60;
const WORLD_PIXEL_WIDTH = WORLD_WIDTH * TILE_SIZE;
const WORLD_PIXEL_HEIGHT = WORLD_HEIGHT * TILE_SIZE;
/* =====================================================
   ELEMENTOS HTML
===================================================== */
const mapViewport = document.getElementById("map-viewport");
const world = document.getElementById("world");
const map = document.getElementById("map");
const menu = document.getElementById("colonist-menu");
const moveButton = document.getElementById("move-button");
const waitButton = document.getElementById("wait-button");
const moveMode = document.getElementById("move-mode");
const cancelMoveButton = document.getElementById("cancel-move");
const zoomInButton = document.getElementById("zoom-in");
const zoomOutButton = document.getElementById("zoom-out");
const zoomLevel = document.getElementById("zoom-level");
const colonyDaysElement = document.getElementById("colony-days");
const colonyTimeElement = document.getElementById("colony-time");
const colonyYearDayElement = document.getElementById("colony-year-day");
const colonistCountElement = document.getElementById("colonist-count");
const menuName = document.getElementById("menu-name");
const menuBasicInfo = document.getElementById("menu-basic-info");
const menuDescription = document.getElementById("menu-description");
const healthBar = document.getElementById("health-bar");
const healthValue = document.getElementById("health-value");
const skillsContainer = document.getElementById("skills-container");
const traitsContainer = document.getElementById("traits-container");
const menuAvatar = document.getElementById("menu-avatar");
/* =====================================================
   CÁMARA Y ZOOM
===================================================== */
let zoom = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
let cameraX = 0;
let cameraY = 0;
/* =====================================================
   TIEMPO DE LA COLONIA
===================================================== */
const colony = {
    day: 1,
    yearDay: 1,
    hour: 6,
    minute: 0
};
/*
   1 segundo real = 5 minutos del juego
*/
const GAME_MINUTES_PER_SECOND = 5;
let lastTime = performance.now();
/* =====================================================
   COLONO
===================================================== */
const colonist = {
    id: 1,
    name: "Elias",
    age: 27,
    sex: "Hombre",
    description:
        "Elias creció en una pequeña comunidad rural. " +
        "Está acostumbrado a trabajar con sus manos y " +
        "prefiere mantenerse ocupado.",
    health: 100,
    skills: {
        agricultura: 7,
        construccion: 5,
        cocina: 3,
        medicina: 2,
        investigacion: 1,
        artesania: 6
    },
    traits: [
        "Trabajador",
        "Resistente",
        "Curioso"
    ],
    x: 50,
    y: 30,
    targetX: 50,
    targetY: 30,
    speed: 0.035,
    moving: true,
    waiting: false,
    playerOrdered: false
};
/* =====================================================
   CREAR COLONO
===================================================== */
const colonistElement = document.createElement("div");
colonistElement.id = "colonist";
colonistElement.innerHTML = `
    <div class="npc-shadow"></div>
    <div class="npc-head"></div>
    <div class="npc-hair"></div>
    <div class="npc-arm-left"></div>
    <div class="npc-arm-right"></div>
    <div class="npc-body"></div>
    <div class="npc-leg-left"></div>
    <div class="npc-leg-right"></div>
`;
world.appendChild(colonistElement);
/* =====================================================
   POSICIÓN DEL COLONO
===================================================== */
function updateColonistPosition() {
    colonistElement.style.left =
        `${colonist.x * TILE_SIZE}px`;
    colonistElement.style.top =
        `${colonist.y * TILE_SIZE}px`;
}
/* =====================================================
   OBJETIVO ALEATORIO
===================================================== */
function chooseRandomTarget() {
    const margin = 5;
    colonist.targetX =
        margin +
        Math.random() *
        (WORLD_WIDTH - margin * 2);
    colonist.targetY =
        margin +
        Math.random() *
        (WORLD_HEIGHT - margin * 2);
}
/* =====================================================
   MOVER COLONO
===================================================== */
function moveColonist(deltaTime) {
    if (!colonist.moving || colonist.waiting) {
        return;
    }
    const dx =
        colonist.targetX - colonist.x;
    const dy =
        colonist.targetY - colonist.y;
    const distance =
        Math.sqrt(dx * dx + dy * dy);
    if (distance < 0.05) {
        colonist.x = colonist.targetX;
        colonist.y = colonist.targetY;
        updateColonistPosition();
        /*
           Si llegó a una orden del jugador,
           se queda allí unos segundos.
        */
        if (colonist.playerOrdered) {
            colonist.moving = false;
            colonist.playerOrdered = false;
            return;
        }
        /*
           Si no tenía una orden,
           busca otro destino automáticamente.
        */
        chooseRandomTarget();
        return;
    }
    const movement =
        colonist.speed * deltaTime;
    colonist.x +=
        (dx / distance) * movement;
    colonist.y +=
        (dy / distance) * movement;
    updateColonistPosition();
}
/* =====================================================
   MENÚ DEL COLONO
===================================================== */
function updateColonistMenu() {
    menuName.textContent =
        colonist.name;
    menuBasicInfo.textContent =
        `${colonist.age} años · ${colonist.sex}`;
    menuDescription.textContent =
        colonist.description;
    healthValue.textContent =
        colonist.health;
    healthBar.style.width =
        `${colonist.health}%`;
    /*
       HABILIDADES
    */
    skillsContainer.innerHTML = "";
    for (const skill in colonist.skills) {
        const value =
            colonist.skills[skill];
        const skillElement =
            document.createElement("div");
        skillElement.className =
            "skill";
        skillElement.innerHTML = `
            <span>
                ${capitalize(skill)}
            </span>
            <span class="skill-value">
                ${value}
            </span>
        `;
        skillsContainer.appendChild(skillElement);
    }
    /*
       CARACTERÍSTICAS
    */
    traitsContainer.innerHTML = "";
    colonist.traits.forEach(trait => {
        const traitElement =
            document.createElement("span");
        traitElement.className =
            "trait";
        traitElement.textContent =
            trait;
        traitsContainer.appendChild(
            traitElement
        );
    });
}
/* =====================================================
   CAPITALIZAR TEXTO
===================================================== */
function capitalize(text) {
    return text.charAt(0).toUpperCase() +
        text.slice(1);
}
/* =====================================================
   ABRIR MENÚ
===================================================== */
colonistElement.addEventListener(
    "click",
    (event) => {
        event.stopPropagation();
        if (movingMode) {
            return;
        }
        updateColonistMenu();
        menu.classList.remove("hidden");
        positionColonistMenu();
    }
);
/* =====================================================
   POSICIONAR MENÚ INTELIGENTEMENTE
===================================================== */
function positionColonistMenu() {
    const npcRect =
        colonistElement.getBoundingClientRect();
    const menuRect =
        menu.getBoundingClientRect();
    const margin = 10;
    let left =
        npcRect.right + 12;
    let top =
        npcRect.top;
    /*
       Si no entra a la derecha,
       ponerlo a la izquierda.
    */
    if (
        left + menuRect.width >
        window.innerWidth - margin
    ) {
        left =
            npcRect.left -
            menuRect.width -
            12;
    }
    /*
       Si tampoco entra a la izquierda,
       centrarlo horizontalmente.
    */
    if (left < margin) {
        left =
            (window.innerWidth -
                menuRect.width) / 2;
    }
    /*
       Comprobar parte inferior.
    */
    if (
        top + menuRect.height >
        window.innerHeight - margin
    ) {
        top =
            window.innerHeight -
            menuRect.height -
            margin;
    }
    /*
       Comprobar parte superior.
    */
    if (top < margin) {
        top = margin;
    }
    menu.style.left =
        `${left}px`;
    menu.style.top =
        `${top}px`;
}
/* =====================================================
   CERRAR MENÚ
===================================================== */
mapViewport.addEventListener(
    "click",
    (event) => {
        if (
            !event.target.closest("#colonist")
        ) {
            menu.classList.add(
                "hidden"
            );
        }
    }
);
/* =====================================================
   SISTEMA MOVER
===================================================== */
let movingMode = false;
let moveMarker = null;
/*
   Activar modo mover
*/
moveButton.addEventListener(
    "click",
    () => {
        movingMode = true;
        menu.classList.add(
            "hidden"
        );
        moveMode.classList.remove(
            "hidden"
        );
        mapViewport.style.cursor =
            "crosshair";
    }
);
/*
   Cancelar
*/
cancelMoveButton.addEventListener(
    "click",
    () => {
        cancelMoveMode();
    }
);
function cancelMoveMode() {
    movingMode = false;
    moveMode.classList.add(
        "hidden"
    );
    mapViewport.style.cursor =
        "default";
    if (moveMarker) {
        moveMarker.remove();
        moveMarker = null;
    }
}
/* =====================================================
   ELEGIR DESTINO EN EL MAPA
===================================================== */
mapViewport.addEventListener(
    "click",
    (event) => {
        if (!movingMode) {
            return;
        }
        /*
           Posición del click dentro
           del viewport.
        */
        const rect =
            mapViewport.getBoundingClientRect();
        const viewportX =
            event.clientX -
            rect.left;
        const viewportY =
            event.clientY -
            rect.top;
        /*
           Convertir a coordenadas
           del mundo teniendo en cuenta
           zoom y cámara.
        */
        const worldX =
            (viewportX -
                cameraX) / zoom;
        const worldY =
            (viewportY -
                cameraY) / zoom;
        /*
           Convertir a casillas.
        */
        let targetX =
            worldX / TILE_SIZE;
        let targetY =
            worldY / TILE_SIZE;
        /*
           Limitar al mapa.
        */
        targetX =
            Math.max(
                1,
                Math.min(
                    WORLD_WIDTH - 1,
                    targetX
                )
            );
        targetY =
            Math.max(
                1,
                Math.min(
                    WORLD_HEIGHT - 1,
                    targetY
                )
            );
        /*
           Dar la orden.
        */
        colonist.targetX =
            targetX;
        colonist.targetY =
            targetY;
        colonist.moving =
            true;
        colonist.waiting =
            false;
        colonist.playerOrdered =
            true;
        /*
           Mostrar marcador.
        */
        createMoveMarker(
            targetX,
            targetY
        );
        cancelMoveMode();
    }
);
/* =====================================================
   MARCADOR DE DESTINO
===================================================== */
function createMoveMarker(x, y) {
    if (moveMarker) {
        moveMarker.remove();
    }
    moveMarker =
        document.createElement("div");
    moveMarker.className =
        "move-marker";
    moveMarker.style.left =
        `${x * TILE_SIZE}px`;
    moveMarker.style.top =
        `${y * TILE_SIZE}px`;
    world.appendChild(
        moveMarker
    );
    setTimeout(() => {
        if (moveMarker) {
            moveMarker.remove();
            moveMarker = null;
        }
    }, 3000);
}
/* =====================================================
   ESPERAR
===================================================== */
waitButton.addEventListener(
    "click",
    () => {
        colonist.waiting = true;
        colonist.moving = false;
        menu.classList.add(
            "hidden"
        );
        setTimeout(() => {
            colonist.waiting = false;
            colonist.moving = true;
            chooseRandomTarget();
        }, 5000);
    }
);
/* =====================================================
   ZOOM
===================================================== */
function setZoom(newZoom) {
    zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                newZoom
            )
        );
    zoomLevel.textContent =
        `${Math.round(zoom * 100)}%`;
    updateWorldTransform();
}
function updateWorldTransform() {
    world.style.transform =
        `translate(${cameraX}px, ${cameraY}px) scale(${zoom})`;
}
/* Zoom + */
zoomInButton.addEventListener(
    "click",
    () => {
        setZoom(
            zoom + ZOOM_STEP
        );
    }
);
/* Zoom - */
zoomOutButton.addEventListener(
    "click",
    () => {
        setZoom(
            zoom - ZOOM_STEP
        );
    }
);
/*
   Zoom con rueda
*/
mapViewport.addEventListener(
    "wheel",
    (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            setZoom(
                zoom + ZOOM_STEP
            );
        } else {
            setZoom(
                zoom - ZOOM_STEP
            );
        }
    },
    { passive: false }
);
/* =====================================================
   TIEMPO
===================================================== */
function updateTime(deltaSeconds) {
    colony.minute +=
        GAME_MINUTES_PER_SECOND *
        deltaSeconds;
    while (colony.minute >= 60) {
        colony.minute -= 60;
        colony.hour++;
    }
    while (colony.hour >= 24) {
        colony.hour -= 24;
        colony.day++;
        colony.yearDay++;
    }
    if (colony.yearDay > 365) {
        colony.yearDay = 1;
    }
    const hours =
        Math.floor(colony.hour)
            .toString()
            .padStart(2, "0");
    const minutes =
        Math.floor(colony.minute)
            .toString()
            .padStart(2, "0");
    colonyTimeElement.textContent =
        `${hours}:${minutes}`;
    colonyDaysElement.textContent =
        `Día ${colony.day}`;
    colonyYearDayElement.textContent =
        `Día ${colony.yearDay} / 365`;
}
/* =====================================================
   LOOP PRINCIPAL
===================================================== */
function gameLoop(currentTime) {
    const deltaSeconds =
        (currentTime - lastTime) / 1000;
    lastTime =
        currentTime;
    moveColonist(
        deltaSeconds
    );
    updateTime(
        deltaSeconds
    );
    requestAnimationFrame(
        gameLoop
    );
}
/* =====================================================
   INICIALIZACIÓN
===================================================== */
colonistCountElement.textContent =
    "1";
updateColonistPosition();
chooseRandomTarget();
setZoom(1);
requestAnimationFrame(
    gameLoop
);
/* =====================================================
   REPOSICIONAR MENÚ
   SI CAMBIA EL TAMAÑO DE LA PANTALLA
===================================================== */
window.addEventListener(
    "resize",
    () => {
        if (
            !menu.classList.contains(
                "hidden"
            )
        ) {
            positionColonistMenu();
        }
    }
);
