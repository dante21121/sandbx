const viewport = document.getElementById("map-viewport");
const world = document.getElementById("world");
const map = document.getElementById("map");

const colonistCard = document.getElementById("colonist-card");
const cardAvatar = document.getElementById("card-avatar");

const actionMenu = document.getElementById("action-menu");
const actionLocationName = document.getElementById("action-location-name");

const colonistMenu = document.getElementById("colonist-menu");
const moveMode = document.getElementById("move-mode");
const cancelMove = document.getElementById("cancel-move");

const zoomLevel = document.getElementById("zoom-level");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

const TILE_SIZE = 40;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 60;

let zoom = 1;
let cameraX = 0;
let cameraY = 0;

let selectedColonist = false;
let movingMode = false;

let actionMenuX = 0;
let actionMenuY = 0;

let moveTarget = null;
let autonomousTarget = null;
let waitUntil = 0;

let lastTime = performance.now();

const colony = {
    day: 1,
    yearDay: 1,
    hour: 6,
    minute: 0
};

const colonist = {
    name: "Elias",
    age: 27,
    gender: "Hombre",

    x: 50 * TILE_SIZE,
    y: 30 * TILE_SIZE,

    speed: 80,

    health: 100,

    description:
        "Elias es un colono tranquilo y trabajador. Tiene experiencia con tareas manuales y una buena resistencia física.",

    skills: {
        Agricultura: 7,
        Construcción: 5,
        Cocina: 3,
        Medicina: 2,
        Investigación: 1,
        Artesanía: 6
    },

    traits: [
        "Trabajador",
        "Resistente",
        "Curioso"
    ]
};


/* =========================
   CREAR COLONO
========================= */

function createColonist() {

    const old = document.getElementById("colonist");

    if (old) old.remove();

    const npc = document.createElement("div");

    npc.id = "colonist";

    npc.innerHTML = `
        <div class="npc-shadow"></div>
        <div class="npc-head"></div>
        <div class="npc-hair"></div>
        <div class="npc-body"></div>
        <div class="npc-arm-left"></div>
        <div class="npc-arm-right"></div>
        <div class="npc-leg-left"></div>
        <div class="npc-leg-right"></div>
    `;

    world.appendChild(npc);

    npc.addEventListener("click", function(event) {
        event.stopPropagation();
        selectColonist();
    });

    npc.addEventListener("dblclick", function(event) {
        event.stopPropagation();
        openColonistInformation();
    });

    return npc;
}

const colonistElement = createColonist();


/* =========================
   AVATAR DE LA TARJETA
========================= */

function createCardAvatar() {

    cardAvatar.innerHTML = `
        <div class="npc-head"></div>
        <div class="npc-hair"></div>
        <div class="npc-body"></div>
        <div class="npc-arm-left"></div>
        <div class="npc-arm-right"></div>
        <div class="npc-leg-left"></div>
        <div class="npc-leg-right"></div>
        <div class="npc-shadow"></div>
    `;
}

createCardAvatar();


/* =========================
   SELECCIÓN
========================= */

function selectColonist() {

    selectedColonist = true;

    colonistElement.classList.add("selected");
    colonistCard.classList.add("selected");

    closeColonistInformation();

    console.log("Elias seleccionado");
}


/* =========================
   DOBLE CLICK
========================= */

function openColonistInformation() {

    selectedColonist = true;

    colonistElement.classList.add("selected");
    colonistCard.classList.add("selected");

    actionMenu.classList.add("hidden");

    updateColonistMenu();

    colonistMenu.classList.remove("hidden");

    positionColonistMenu();
}


function closeColonistInformation() {

    colonistMenu.classList.add("hidden");
}


/* =========================
   TARJETA
========================= */

colonistCard.addEventListener("click", function(event) {

    event.stopPropagation();

    selectColonist();
});


colonistCard.addEventListener("dblclick", function(event) {

    event.stopPropagation();

    openColonistInformation();
});


/* =========================
   INFORMACIÓN
========================= */

function updateColonistMenu() {

    document.getElementById("menu-name").textContent =
        colonist.name;

    document.getElementById("menu-basic-info").textContent =
        `${colonist.age} años · ${colonist.gender}`;

    document.getElementById("menu-description").textContent =
        colonist.description;

    document.getElementById("health-value").textContent =
        colonist.health;

    document.getElementById("health-bar").style.width =
        `${colonist.health}%`;

    const skillsContainer =
        document.getElementById("skills-container");

    skillsContainer.innerHTML = "";

    for (const skill in colonist.skills) {

        const row = document.createElement("div");

        row.className = "skill-row";

        row.innerHTML = `
            <span>${skill}</span>
            <strong>${colonist.skills[skill]}</strong>
        `;

        skillsContainer.appendChild(row);
    }

    const traitsContainer =
        document.getElementById("traits-container");

    traitsContainer.innerHTML = "";

    colonist.traits.forEach(trait => {

        const element = document.createElement("span");

        element.className = "trait";

        element.textContent = trait;

        traitsContainer.appendChild(element);
    });
}


/* =========================
   POSICIÓN DEL MENÚ
========================= */

function positionColonistMenu() {

    const rect = colonistElement.getBoundingClientRect();

    const menuWidth = colonistMenu.offsetWidth;
    const menuHeight = colonistMenu.offsetHeight;

    let left = rect.right + 15;
    let top = rect.top;

    if (left + menuWidth > window.innerWidth) {
        left = rect.left - menuWidth - 15;
    }

    if (left < 10) {
        left = 10;
    }

    if (top + menuHeight > window.innerHeight) {
        top = window.innerHeight - menuHeight - 10;
    }

    if (top < 10) {
        top = 10;
    }

    colonistMenu.style.left = `${left}px`;
    colonistMenu.style.top = `${top}px`;
}


/* =========================
   ACCIONES EN EL MAPA
========================= */

viewport.addEventListener("click", function(event) {

    if (!selectedColonist) return;

    if (movingMode) {

        setMoveTargetFromScreen(
            event.clientX,
            event.clientY
        );

        return;
    }

    if (event.target.closest("#colonist")) {
        return;
    }

    if (event.target.closest("#colonist-list")) {
        return;
    }

    if (event.target.closest("#action-menu")) {
        return;
    }

    showActionMenu(
        event.clientX,
        event.clientY
    );
});


function showActionMenu(x, y) {

    actionMenuX = x;
    actionMenuY = y;

    actionLocationName.textContent =
        "Lugar seleccionado";

    actionMenu.classList.remove("hidden");

    positionActionMenu();
}


function positionActionMenu() {

    const width = actionMenu.offsetWidth;
    const height = actionMenu.offsetHeight;

    let x = actionMenuX + 12;
    let y = actionMenuY + 12;

    if (x + width > window.innerWidth) {
        x = actionMenuX - width - 12;
    }

    if (y + height > window.innerHeight) {
        y = actionMenuY - height - 12;
    }

    x = Math.max(8, x);
    y = Math.max(8, y);

    actionMenu.style.left = `${x}px`;
    actionMenu.style.top = `${y}px`;
}


/* =========================
   ACCIONES
========================= */

document.querySelectorAll(".action-button").forEach(button => {

    button.addEventListener("click", function(event) {

        event.stopPropagation();

        const action = button.dataset.action;

        if (action === "move") {

            startMoveMode();
        }

        if (action === "inspect") {

            console.log(
                "Inspeccionando lugar..."
            );

            actionMenu.classList.add("hidden");
        }

        if (action === "wait") {

            waitUntil =
                performance.now() + 5000;

            autonomousTarget = null;
            moveTarget = null;

            actionMenu.classList.add("hidden");
        }
    });
});


/* =========================
   MOVER
========================= */

function startMoveMode() {

    movingMode = true;

    actionMenu.classList.add("hidden");

    moveMode.classList.remove("hidden");

    viewport.style.cursor = "crosshair";
}


cancelMove.addEventListener("click", function(event) {

    event.stopPropagation();

    movingMode = false;

    moveMode.classList.add("hidden");

    viewport.style.cursor = "default";
});


function setMoveTargetFromScreen(screenX, screenY) {

    const rect = viewport.getBoundingClientRect();

    const viewportX =
        screenX - rect.left;

    const viewportY =
        screenY - rect.top;

    let worldX =
        (viewportX - cameraX) / zoom;

    let worldY =
        (viewportY - cameraY) / zoom;

    worldX = Math.max(
        30,
        Math.min(
            WORLD_WIDTH * TILE_SIZE - 30,
            worldX
        )
    );

    worldY = Math.max(
        30,
        Math.min(
            WORLD_HEIGHT * TILE_SIZE - 30,
            worldY
        )
    );

    moveTarget = {
        x: worldX,
        y: worldY
    };

    autonomousTarget = null;

    createMoveMarker(worldX, worldY);

    movingMode = false;

    moveMode.classList.add("hidden");

    viewport.style.cursor = "default";
}


function createMoveMarker(x, y) {

    const old =
        document.querySelector(".move-marker");

    if (old) old.remove();

    const marker =
        document.createElement("div");

    marker.className =
        "move-marker";

    marker.style.left =
        `${x}px`;

    marker.style.top =
        `${y}px`;

    world.appendChild(marker);
}


/* =========================
   MOVIMIENTO AUTÓNOMO
========================= */

function chooseRandomTarget() {

    autonomousTarget = {

        x:
            8 * TILE_SIZE +
            Math.random() *
            (WORLD_WIDTH - 16) *
            TILE_SIZE,

        y:
            8 * TILE_SIZE +
            Math.random() *
            (WORLD_HEIGHT - 16) *
            TILE_SIZE
    };
}


function moveColonist(delta) {

    if (performance.now() < waitUntil) {
        return;
    }

    let target =
        moveTarget || autonomousTarget;

    if (!target) {

        chooseRandomTarget();

        target = autonomousTarget;
    }

    const dx =
        target.x - colonist.x;

    const dy =
        target.y - colonist.y;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {

        if (moveTarget) {

            moveTarget = null;

            const marker =
                document.querySelector(".move-marker");

            if (marker) marker.remove();

        } else {

            autonomousTarget = null;

            setTimeout(() => {

                if (!moveTarget) {
                    chooseRandomTarget();
                }

            }, 1000);
        }

        return;
    }

    const directionX =
        dx / distance;

    const directionY =
        dy / distance;

    const speed =
        colonist.speed * delta;

    colonist.x +=
        directionX * speed;

    colonist.y +=
        directionY * speed;
}


/* =========================
   POSICIÓN VISUAL
========================= */

function updateColonistPosition() {

    colonistElement.style.left =
        `${colonist.x}px`;

    colonistElement.style.top =
        `${colonist.y}px`;
}


/* =========================
   CÁMARA
========================= */

function centerCameraOnColonist() {

    cameraX =
        viewport.clientWidth / 2 -
        colonist.x * zoom;

    cameraY =
        viewport.clientHeight / 2 -
        colonist.y * zoom;

    updateWorldTransform();
}


function updateWorldTransform() {

    world.style.transform =
        `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${zoom})`;
}


/* =========================
   ZOOM
========================= */

function changeZoom(newZoom, mouseX, mouseY) {

    newZoom =
        Math.max(
            0.5,
            Math.min(2, newZoom)
        );

    const rect =
        viewport.getBoundingClientRect();

    const screenX =
        mouseX - rect.left;

    const screenY =
        mouseY - rect.top;

    const worldX =
        (screenX - cameraX) / zoom;

    const worldY =
        (screenY - cameraY) / zoom;

    zoom = newZoom;

    cameraX =
        screenX - worldX * zoom;

    cameraY =
        screenY - worldY * zoom;

    updateWorldTransform();

    zoomLevel.textContent =
        `${Math.round(zoom * 100)}%`;
}


zoomIn.addEventListener("click", function() {

    changeZoom(
        zoom + 0.1,
        window.innerWidth / 2,
        window.innerHeight / 2
    );
});


zoomOut.addEventListener("click", function() {

    changeZoom(
        zoom - 0.1,
        window.innerWidth / 2,
        window.innerHeight / 2
    );
});


viewport.addEventListener(
    "wheel",
    function(event) {

        event.preventDefault();

        const amount =
            event.deltaY > 0
                ? -0.1
                : 0.1;

        changeZoom(
            zoom + amount,
            event.clientX,
            event.clientY
        );
    },
    { passive: false }
);


/* =========================
   ÁRBOLES
========================= */

function createTrees() {

    const treeCount = 90;

    for (let i = 0; i < treeCount; i++) {

        let x;
        let y;

        do {

            x =
                Math.random() *
                WORLD_WIDTH *
                TILE_SIZE;

            y =
                Math.random() *
                WORLD_HEIGHT *
                TILE_SIZE;

        } while (
            Math.abs(x - colonist.x) <
                8 * TILE_SIZE &&
            Math.abs(y - colonist.y) <
                8 * TILE_SIZE
        );

        const tree =
            document.createElement("div");

        tree.className =
            "tree";

        tree.style.left =
            `${x}px`;

        tree.style.top =
            `${y}px`;

        const scale =
            0.8 +
            Math.random() * 0.45;

        tree.style.transform =
            `translateX(-50%) scale(${scale})`;

        tree.innerHTML = `
            <div class="tree-shadow"></div>
            <div class="tree-trunk"></div>
            <div class="tree-crown"></div>
        `;

        world.appendChild(tree);
    }
}


/* =========================
   TIEMPO
========================= */

function updateTime() {

    colony.minute += 5;

    if (colony.minute >= 60) {

        colony.minute = 0;

        colony.hour++;
    }

    if (colony.hour >= 24) {

        colony.hour = 0;

        colony.day++;
        colony.yearDay++;

        if (colony.yearDay > 365) {
            colony.yearDay = 1;
        }
    }

    document.getElementById("colony-days").textContent =
        `Día ${colony.day}`;

    document.getElementById("colony-time").textContent =
        `${String(colony.hour).padStart(2, "0")}:${String(colony.minute).padStart(2, "0")}`;

    document.getElementById("colony-year-day").textContent =
        `Día ${colony.yearDay} / 365`;
}


/* =========================
   CLICK FUERA
========================= */

document.addEventListener("click", function(event) {

    if (
        !event.target.closest("#colonist-menu") &&
        !event.target.closest("#colonist") &&
        !event.target.closest("#colonist-card")
    ) {
        closeColonistInformation();
    }

    if (
        !event.target.closest("#action-menu") &&
        !event.target.closest("#map-viewport")
    ) {
        actionMenu.classList.add("hidden");
    }
});


/* =========================
   GAME LOOP
========================= */

function gameLoop(currentTime) {

    const delta =
        Math.min(
            (currentTime - lastTime) / 1000,
            0.05
        );

    lastTime = currentTime;

    moveColonist(delta);

    updateColonistPosition();

    requestAnimationFrame(gameLoop);
}


/* =========================
   INICIO
========================= */

document.getElementById("colonist-count")
    .textContent = "1";

createTrees();

updateColonistPosition();

setTimeout(() => {
    centerCameraOnColonist();
}, 50);

setInterval(updateTime, 1000);

requestAnimationFrame(gameLoop);

window.addEventListener("resize", function() {

    centerCameraOnColonist();

    if (!colonistMenu.classList.contains("hidden")) {
        positionColonistMenu();
    }

    if (!actionMenu.classList.contains("hidden")) {
        positionActionMenu();
    }
});
