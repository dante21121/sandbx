const TILE_SIZE = 40;

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 60;


/* =========================
   ELEMENTOS
========================= */

const mapViewport = document.getElementById("map-viewport");
const world = document.getElementById("world");

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


/* =========================
   ZOOM Y CÁMARA
========================= */

let zoom = 1;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

let cameraX = 0;
let cameraY = 0;


/* =========================
   TIEMPO
========================= */

const colony = {
    day: 1,
    yearDay: 1,
    hour: 6,
    minute: 0
};

const GAME_MINUTES_PER_SECOND = 5;

let lastTime = performance.now();


/* =========================
   COLONO
========================= */

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


/* =========================
   CREAR COLONO
========================= */

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


/* =========================
   POSICIÓN
========================= */

function updateColonistPosition() {

    colonistElement.style.left =
        `${colonist.x * TILE_SIZE}px`;

    colonistElement.style.top =
        `${colonist.y * TILE_SIZE}px`;
}


/* =========================
   CENTRAR CÁMARA
========================= */

function centerCameraOnColonist() {

    const viewportWidth =
        mapViewport.clientWidth;

    const viewportHeight =
        mapViewport.clientHeight;


    cameraX =
        viewportWidth / 2 -
        colonist.x * TILE_SIZE * zoom;

    cameraY =
        viewportHeight / 2 -
        colonist.y * TILE_SIZE * zoom;


    updateWorldTransform();
}


/* =========================
   DESTINO ALEATORIO
========================= */

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


/* =========================
   MOVIMIENTO
========================= */

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


        if (colonist.playerOrdered) {

            colonist.moving = false;
            colonist.playerOrdered = false;

            return;
        }

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


/* =========================
   MENÚ
========================= */

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


    skillsContainer.innerHTML = "";

    for (const skill in colonist.skills) {

        const skillElement =
            document.createElement("div");

        skillElement.className =
            "skill";

        skillElement.innerHTML = `
            <span>${capitalize(skill)}</span>
            <span class="skill-value">
                ${colonist.skills[skill]}
            </span>
        `;

        skillsContainer.appendChild(
            skillElement
        );
    }


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


/* =========================
   POSICIÓN DEL MENÚ
========================= */

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


    if (
        left + menuRect.width >
        window.innerWidth - margin
    ) {

        left =
            npcRect.left -
            menuRect.width -
            12;
    }


    if (left < margin) {

        left =
            (window.innerWidth -
                menuRect.width) / 2;
    }


    if (
        top + menuRect.height >
        window.innerHeight - margin
    ) {

        top =
            window.innerHeight -
            menuRect.height -
            margin;
    }


    if (top < margin) {
        top = margin;
    }


    menu.style.left =
        `${left}px`;

    menu.style.top =
        `${top}px`;
}


/* =========================
   CLICK COLONO
========================= */

colonistElement.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        if (movingMode) {
            return;
        }

        updateColonistMenu();

        menu.classList.remove("hidden");

        positionColonistMenu();
    }
);


/* =========================
   CERRAR MENÚ
========================= */

mapViewport.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest("#colonist")
        ) {

            menu.classList.add(
                "hidden"
            );
        }
    }
);


/* =========================
   MODO MOVER
========================= */

let movingMode = false;
let moveMarker = null;


moveButton.addEventListener(
    "click",
    () => {

        movingMode = true;

        menu.classList.add("hidden");

        moveMode.classList.remove(
            "hidden"
        );

        mapViewport.style.cursor =
            "crosshair";
    }
);


cancelMoveButton.addEventListener(
    "click",
    cancelMoveMode
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


/* =========================
   ELEGIR DESTINO
========================= */

mapViewport.addEventListener(
    "click",
    event => {

        if (!movingMode) {
            return;
        }


        const rect =
            mapViewport.getBoundingClientRect();


        const viewportX =
            event.clientX - rect.left;

        const viewportY =
            event.clientY - rect.top;


        const worldX =
            (viewportX - cameraX) / zoom;

        const worldY =
            (viewportY - cameraY) / zoom;


        let targetX =
            worldX / TILE_SIZE;

        let targetY =
            worldY / TILE_SIZE;


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


        colonist.targetX =
            targetX;

        colonist.targetY =
            targetY;

        colonist.moving = true;
        colonist.waiting = false;
        colonist.playerOrdered = true;


        createMoveMarker(
            targetX,
            targetY
        );


        cancelMoveMode();
    }
);


/* =========================
   MARCADOR
========================= */

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


    world.appendChild(moveMarker);


    setTimeout(() => {

        if (moveMarker) {

            moveMarker.remove();

            moveMarker = null;
        }

    }, 3000);
}


/* =========================
   ESPERAR
========================= */

waitButton.addEventListener(
    "click",
    () => {

        colonist.waiting = true;
        colonist.moving = false;

        menu.classList.add("hidden");


        setTimeout(() => {

            colonist.waiting = false;
            colonist.moving = true;

            chooseRandomTarget();

        }, 5000);
    }
);


/* =========================
   ZOOM
========================= */

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


zoomInButton.addEventListener(
    "click",
    () => {

        setZoom(
            zoom + ZOOM_STEP
        );
    }
);


zoomOutButton.addEventListener(
    "click",
    () => {

        setZoom(
            zoom - ZOOM_STEP
        );
    }
);


mapViewport.addEventListener(
    "wheel",
    event => {

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


/* =========================
   TIEMPO
========================= */

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


/* =========================
   LOOP
========================= */

function gameLoop(currentTime) {

    const deltaSeconds =
        (currentTime - lastTime) / 1000;

    lastTime =
        currentTime;


    moveColonist(deltaSeconds);

    updateTime(deltaSeconds);


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   INICIO
========================= */

colonistCountElement.textContent = "1";

updateColonistPosition();

chooseRandomTarget();

setZoom(1);

/*
   IMPORTANTE:
   centramos la cámara después
   de crear el colono.
*/

centerCameraOnColonist();

requestAnimationFrame(
    gameLoop
);


/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        centerCameraOnColonist();


        if (
            !menu.classList.contains(
                "hidden"
            )
        ) {

            positionColonistMenu();
        }
    }
);
