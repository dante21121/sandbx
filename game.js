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

const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomLevel = document.getElementById("zoom-level");


/* =========================
   CONFIGURACIÓN
========================= */

const TILE_SIZE = 40;

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 60;

let zoom = 1;

let cameraX = 0;
let cameraY = 0;

let selectedColonist = false;
let movingMode = false;

let moveTarget = null;
let autonomousTarget = null;

let waitUntil = 0;

let lastTime = performance.now();


/* =========================
   COLONIA
========================= */

const colony = {

    day: 1,

    yearDay: 1,

    hour: 6,

    minute: 0

};


/* =========================
   COLONO
========================= */

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
   CREAR NPC
========================= */

function createColonist() {

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

    return npc;
}

const colonistElement = createColonist();


/* =========================
   AVATAR
========================= */

function createAvatar(element) {

    element.innerHTML = `

        <div class="npc-head"></div>

        <div class="npc-hair"></div>

        <div class="npc-body"></div>

    `;
}

createAvatar(cardAvatar);

createAvatar(document.getElementById("menu-avatar"));


/* =========================
   POSICIÓN NPC
========================= */

function updateColonistPosition() {

    colonistElement.style.left =
        colonist.x + "px";

    colonistElement.style.top =
        colonist.y + "px";
}


/* =========================
   SELECCIÓN
========================= */

function selectColonist() {

    selectedColonist = true;

    colonistElement.classList.add("selected");

    colonistCard.classList.add("selected");

    closeActionMenu();

    closeColonistMenu();
}


/* =========================
   CLICK EN TARJETA
========================= */

colonistCard.addEventListener("click", function(event) {

    event.stopPropagation();

    selectColonist();

});


/* =========================
   DOBLE CLICK EN TARJETA
========================= */

colonistCard.addEventListener("dblclick", function(event) {

    event.stopPropagation();

    selectColonist();

    openColonistMenu();

});


/* =========================
   CLICK NPC
========================= */

colonistElement.addEventListener("click", function(event) {

    event.stopPropagation();

    selectColonist();

});


/* =========================
   DOBLE CLICK NPC
========================= */

colonistElement.addEventListener("dblclick", function(event) {

    event.stopPropagation();

    selectColonist();

    openColonistMenu();

});


/* =========================
   FICHA
========================= */

function openColonistMenu() {

    updateColonistMenu();

    colonistMenu.classList.remove("hidden");

    requestAnimationFrame(() => {

        positionColonistMenu();

    });
}


function closeColonistMenu() {

    colonistMenu.classList.add("hidden");

}


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
        colonist.health + "%";


    const skills =
        document.getElementById("skills-container");

    skills.innerHTML = "";


    for (const skill in colonist.skills) {

        const row =
            document.createElement("div");

        row.className =
            "skill-row";

        row.innerHTML = `

            <span>${skill}</span>

            <strong>
                ${colonist.skills[skill]}
            </strong>

        `;

        skills.appendChild(row);

    }


    const traits =
        document.getElementById("traits-container");

    traits.innerHTML = "";


    colonist.traits.forEach(trait => {

        const element =
            document.createElement("span");

        element.className =
            "trait";

        element.textContent =
            trait;

        traits.appendChild(element);

    });

}


function positionColonistMenu() {

    const rect =
        colonistElement.getBoundingClientRect();

    const menuWidth =
        colonistMenu.offsetWidth;

    const menuHeight =
        colonistMenu.offsetHeight;


    let left =
        rect.right + 15;

    let top =
        rect.top;


    if (
        left + menuWidth >
        window.innerWidth
    ) {

        left =
            rect.left -
            menuWidth -
            15;

    }


    if (left < 10) {

        left = 10;

    }


    if (
        top + menuHeight >
        window.innerHeight
    ) {

        top =
            window.innerHeight -
            menuHeight -
            10;

    }


    if (top < 10) {

        top = 10;

    }


    colonistMenu.style.left =
        left + "px";

    colonistMenu.style.top =
        top + "px";

}


/* =========================
   CLICK EN MAPA
========================= */

viewport.addEventListener("click", function(event) {

    if (!selectedColonist) {

        return;

    }


    if (movingMode) {

        setMoveTarget(
            event.clientX,
            event.clientY
        );

        return;

    }


    if (
        event.target.closest("#colonist") ||
        event.target.closest(".tree")
    ) {

        return;

    }


    showActionMenu(
        event.clientX,
        event.clientY
    );

});


/* =========================
   MENÚ ACCIONES
========================= */

function showActionMenu(x, y) {

    actionLocationName.textContent =
        "Suelo";

    actionMenu.classList.remove("hidden");


    let left =
        x + 12;

    let top =
        y + 12;


    requestAnimationFrame(() => {

        const width =
            actionMenu.offsetWidth;

        const height =
            actionMenu.offsetHeight;


        if (
            left + width >
            window.innerWidth
        ) {

            left =
                x - width - 12;

        }


        if (
            top + height >
            window.innerHeight
        ) {

            top =
                y - height - 12;

        }


        left =
            Math.max(8, left);

        top =
            Math.max(8, top);


        actionMenu.style.left =
            left + "px";

        actionMenu.style.top =
            top + "px";

    });

}


function closeActionMenu() {

    actionMenu.classList.add("hidden");

}


/* =========================
   ACCIONES
========================= */

document.querySelectorAll(".action-button")
    .forEach(button => {

        button.addEventListener("click", function(event) {

            event.stopPropagation();

            const action =
                button.dataset.action;


            if (action === "move") {

                startMoveMode();

            }


            if (action === "inspect") {

                console.log(
                    "Inspeccionando el lugar..."
                );

                closeActionMenu();

            }


            if (action === "wait") {

                waitUntil =
                    performance.now() + 5000;

                moveTarget = null;

                autonomousTarget = null;

                closeActionMenu();

            }

        });

    });


/* =========================
   MOVER
========================= */

function startMoveMode() {

    movingMode = true;

    closeActionMenu();

    moveMode.classList.remove("hidden");

    viewport.style.cursor =
        "crosshair";

}


cancelMove.addEventListener("click", function(event) {

    event.stopPropagation();

    movingMode = false;

    moveMode.classList.add("hidden");

    viewport.style.cursor =
        "default";

});


function setMoveTarget(screenX, screenY) {

    const rect =
        viewport.getBoundingClientRect();


    const viewportX =
        screenX - rect.left;

    const viewportY =
        screenY - rect.top;


    const worldX =
        (viewportX - cameraX) / zoom;

    const worldY =
        (viewportY - cameraY) / zoom;


    moveTarget = {

        x: Math.max(
            30,
            Math.min(
                WORLD_WIDTH * TILE_SIZE - 30,
                worldX
            )
        ),

        y: Math.max(
            30,
            Math.min(
                WORLD_HEIGHT * TILE_SIZE - 30,
                worldY
            )
        )

    };


    autonomousTarget = null;


    createMoveMarker(
        moveTarget.x,
        moveTarget.y
    );


    movingMode = false;

    moveMode.classList.add("hidden");

    viewport.style.cursor =
        "default";

}


function createMoveMarker(x, y) {

    const old =
        document.querySelector(".move-marker");

    if (old) {

        old.remove();

    }


    const marker =
        document.createElement("div");

    marker.className =
        "move-marker";

    marker.style.left =
        x + "px";

    marker.style.top =
        y + "px";


    world.appendChild(marker);

}


/* =========================
   MOVIMIENTO
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

    if (
        performance.now() <
        waitUntil
    ) {

        return;

    }


    let target =
        moveTarget ||
        autonomousTarget;


    if (!target) {

        chooseRandomTarget();

        target =
            autonomousTarget;

    }


    const dx =
        target.x - colonist.x;

    const dy =
        target.y - colonist.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance < 5) {

        if (moveTarget) {

            moveTarget = null;


            const marker =
                document.querySelector(
                    ".move-marker"
                );

            if (marker) {

                marker.remove();

            }

        } else {

            autonomousTarget = null;

        }

        return;

    }


    colonist.x +=
        (dx / distance) *
        colonist.speed *
        delta;

    colonist.y +=
        (dy / distance) *
        colonist.speed *
        delta;

}


/* =========================
   CÁMARA
========================= */

function updateWorldTransform() {

    world.style.transform =
        `translate3d(
            ${cameraX}px,
            ${cameraY}px,
            0
        ) scale(${zoom})`;

}


function centerCameraOnColonist() {

    cameraX =
        viewport.clientWidth / 2 -
        colonist.x * zoom;

    cameraY =
        viewport.clientHeight / 2 -
        colonist.y * zoom;


    updateWorldTransform();

}


/* =========================
   ZOOM
========================= */

function changeZoom(
    newZoom,
    mouseX,
    mouseY
) {

    const oldZoom =
        zoom;


    newZoom =
        Math.max(
            .5,
            Math.min(2, newZoom)
        );


    if (newZoom === oldZoom) {

        return;

    }


    const rect =
        viewport.getBoundingClientRect();


    const screenX =
        mouseX - rect.left;

    const screenY =
        mouseY - rect.top;


    const worldX =
        (screenX - cameraX) /
        oldZoom;

    const worldY =
        (screenY - cameraY) /
        oldZoom;


    zoom =
        newZoom;


    cameraX =
        screenX -
        worldX * zoom;

    cameraY =
        screenY -
        worldY * zoom;


    updateWorldTransform();


    zoomLevel.textContent =
        Math.round(zoom * 100) + "%";

}


zoomIn.addEventListener("click", function() {

    changeZoom(
        zoom + .1,
        window.innerWidth / 2,
        window.innerHeight / 2
    );

});


zoomOut.addEventListener("click", function() {

    changeZoom(
        zoom - .1,
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
                ? -.1
                : .1;


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


    for (
        let i = 0;
        i < treeCount;
        i++
    ) {

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

            Math.abs(
                x - colonist.x
            ) < 8 * TILE_SIZE &&

            Math.abs(
                y - colonist.y
            ) < 8 * TILE_SIZE

        );


        const tree =
            document.createElement("div");


        tree.className =
            "tree";


        tree.style.left =
            x + "px";

        tree.style.top =
            y + "px";


        tree.style.transform =
            `translateX(-50%)
             scale(
                ${.8 + Math.random() * .45}
             )`;


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


    document.getElementById(
        "colony-days"
    ).textContent =
        `Día ${colony.day}`;


    document.getElementById(
        "colony-time"
    ).textContent =

        `${String(colony.hour).padStart(2, "0")}:` +
        `${String(colony.minute).padStart(2, "0")}`;


    document.getElementById(
        "colony-year-day"
    ).textContent =
        `Día ${colony.yearDay} / 365`;

}


/* =========================
   CERRAR MENÚS
========================= */

document.addEventListener("click", function(event) {

    if (
        !event.target.closest("#colonist-menu") &&
        !event.target.closest("#colonist") &&
        !event.target.closest("#colonist-card")
    ) {

        closeColonistMenu();

    }

});


/* =========================
   GAME LOOP
========================= */

function gameLoop(currentTime) {

    const delta =
        Math.min(
            (currentTime - lastTime) / 1000,
            .05
        );


    lastTime =
        currentTime;


    moveColonist(delta);

    updateColonistPosition();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================
   INICIO
========================= */

document.getElementById(
    "colonist-count"
).textContent = "1";


createTrees();


updateColonistPosition();


centerCameraOnColonist();


chooseRandomTarget();


setInterval(
    updateTime,
    1000
);


requestAnimationFrame(
    gameLoop
);


window.addEventListener(
    "resize",
    function() {

        centerCameraOnColonist();


        if (
            !colonistMenu.classList.contains(
                "hidden"
            )
        ) {

            positionColonistMenu();

        }

    }
);
