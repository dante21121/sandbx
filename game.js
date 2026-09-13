const viewport = document.getElementById("map-viewport");
const world = document.getElementById("world");
const map = document.getElementById("map");

const colonistCard = document.getElementById("colonist-card");
const cardAvatar = document.getElementById("card-avatar");

const actionMenu = document.getElementById("action-menu");

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

let draggingCamera = false;
let dragStartX = 0;
let dragStartY = 0;
let dragCameraX = 0;
let dragCameraY = 0;


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
   DATOS ALEATORIOS
========================= */

const maleNames = [
    "Elias",
    "Mateo",
    "Lucas",
    "Bruno",
    "Dante",
    "Nico",
    "Leo",
    "Tomás",
    "Santiago",
    "Thiago",
    "Alex",
    "Milo",
    "Valentín",
    "Adrián",
    "Gabriel",
    "Martín",
    "Franco",
    "Lautaro"
];


const femaleNames = [
    "Sofía",
    "Emma",
    "Valentina",
    "Martina",
    "Camila",
    "Lucía",
    "Julia",
    "Mía",
    "Clara",
    "Abril",
    "Elena",
    "Alma"
];


const traitsList = [
    "Trabajador",
    "Resistente",
    "Curioso",
    "Inteligente",
    "Rápido",
    "Fuerte",
    "Creativo",
    "Sociable",
    "Paciente",
    "Valiente",
    "Organizado",
    "Perceptivo"
];


function randomItem(array) {

    return array[
        Math.floor(
            Math.random() * array.length
        )
    ];

}


function randomNumber(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


function generateSkills() {

    return {

        Agricultura:
            randomNumber(1, 10),

        Construcción:
            randomNumber(1, 10),

        Cocina:
            randomNumber(1, 10),

        Medicina:
            randomNumber(1, 10),

        Investigación:
            randomNumber(1, 10),

        Artesanía:
            randomNumber(1, 10)

    };

}


function generateTraits() {

    const traits = [];

    while (traits.length < 3) {

        const trait =
            randomItem(traitsList);

        if (!traits.includes(trait)) {

            traits.push(trait);

        }

    }

    return traits;

}


function generateDescription(
    name,
    age,
    gender,
    skills,
    traits
) {

    const bestSkill =
        Object.entries(skills)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0][0];


    const genderText =
        gender === "Hombre"
            ? "Es un"
            : "Es una";


    return `${name} tiene ${age} años. ${genderText} colono ${traits[0].toLowerCase()} y ${traits[1].toLowerCase()}, con especial talento en ${bestSkill.toLowerCase()}.`;

}


function generateColonistData() {

    const gender =
        Math.random() < 0.5
            ? "Hombre"
            : "Mujer";


    const name =
        gender === "Hombre"
            ? randomItem(maleNames)
            : randomItem(femaleNames);


    const age =
        randomNumber(18, 55);


    const health =
        randomNumber(75, 100);


    const skills =
        generateSkills();


    const traits =
        generateTraits();


    return {

        name,
        age,
        gender,
        health,
        skills,
        traits,

        description:
            generateDescription(
                name,
                age,
                gender,
                skills,
                traits
            )

    };

}


/* =========================
   COLONO
========================= */

const randomData =
    generateColonistData();


const colonist = {

    ...randomData,

    x: 50 * TILE_SIZE,
    y: 30 * TILE_SIZE,

    speed: 95,

    homeX: 50 * TILE_SIZE,
    homeY: 30 * TILE_SIZE,

    state: "idle",

    choppingTree: null,
    choppingEnd: 0

};


/* =========================
   CREAR NPC
========================= */

function createColonist() {

    const npc =
        document.createElement("div");

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


const colonistElement =
    createColonist();


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

createAvatar(
    document.getElementById("menu-avatar")
);


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

    colonistElement.classList.add(
        "selected"
    );

    colonistCard.classList.add(
        "selected"
    );

    closeActionMenu();

    closeColonistMenu();

}


/* =========================
   CLICK TARJETA
========================= */

colonistCard.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        selectColonist();

    }
);


/* =========================
   DOBLE CLICK TARJETA
========================= */

colonistCard.addEventListener(
    "dblclick",
    function(event) {

        event.stopPropagation();

        selectColonist();

        openColonistMenu();

    }
);


/* =========================
   CLICK NPC
========================= */

colonistElement.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        selectColonist();

    }
);


/* =========================
   DOBLE CLICK NPC
========================= */

colonistElement.addEventListener(
    "dblclick",
    function(event) {

        event.stopPropagation();

        selectColonist();

        openColonistMenu();

    }
);


/* =========================
   FICHA
========================= */

function openColonistMenu() {

    updateColonistMenu();

    colonistMenu.classList.remove(
        "hidden"
    );

    requestAnimationFrame(() => {

        positionColonistMenu();

    });

}


function closeColonistMenu() {

    colonistMenu.classList.add(
        "hidden"
    );

}


function updateColonistMenu() {

    document.getElementById(
        "menu-name"
    ).textContent =
        colonist.name;


    document.getElementById(
        "menu-basic-info"
    ).textContent =
        `${colonist.age} años · ${colonist.gender}`;


    document.getElementById(
        "menu-description"
    ).textContent =
        colonist.description;


    document.getElementById(
        "health-value"
    ).textContent =
        colonist.health;


    document.getElementById(
        "health-bar"
    ).style.width =
        colonist.health + "%";


    const skills =
        document.getElementById(
            "skills-container"
        );

    skills.innerHTML = "";


    for (
        const skill in colonist.skills
    ) {

        const row =
            document.createElement(
                "div"
            );

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
        document.getElementById(
            "traits-container"
        );

    traits.innerHTML = "";


    colonist.traits.forEach(
        trait => {

            const element =
                document.createElement(
                    "span"
                );

            element.className =
                "trait";

            element.textContent =
                trait;

            traits.appendChild(element);

        }
    );

}


function positionColonistMenu() {

    const rect =
        colonistElement
            .getBoundingClientRect();


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
   CUADRÍCULA
========================= */

function snapToGrid(value) {

    return Math.round(
        value / TILE_SIZE
    ) * TILE_SIZE;

}


function getGridPosition(x, y) {

    return {

        x: Math.max(
            TILE_SIZE,
            Math.min(
                WORLD_WIDTH * TILE_SIZE -
                TILE_SIZE,
                snapToGrid(x)
            )
        ),

        y: Math.max(
            TILE_SIZE,
            Math.min(
                WORLD_HEIGHT * TILE_SIZE -
                TILE_SIZE,
                snapToGrid(y)
            )
        )

    };

}


/* =========================
   LÍNEA DE MOVIMIENTO
========================= */

function removeMoveLine() {

    const line =
        document.querySelector(
            ".move-line"
        );

    if (line) {

        line.remove();

    }

}


function createMoveLine(
    startX,
    startY,
    endX,
    endY
) {

    removeMoveLine();


    const line =
        document.createElement(
            "div"
        );

    line.className =
        "move-line";


    const dx =
        endX - startX;

    const dy =
        endY - startY;


    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    const angle =
        Math.atan2(
            dy,
            dx
        ) *
        180 /
        Math.PI;


    line.style.left =
        startX + "px";

    line.style.top =
        startY + "px";

    line.style.width =
        length + "px";

    line.style.transform =
        `rotate(${angle}deg)`;


    world.appendChild(line);

}


/* =========================
   CLICK EN MAPA
========================= */

viewport.addEventListener(
    "click",
    function(event) {

        if (
            draggingCamera
        ) {

            return;

        }


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
            event.target.closest(
                "#colonist"
            )
        ) {

            return;

        }


        if (
            event.target.closest(
                "#colonist-list"
            )
        ) {

            return;

        }


        if (
            event.target.closest(
                "#action-menu"
            )
        ) {

            return;

        }


        if (
            colonist.state ===
            "chopping"
        ) {

            return;

        }


        const tree =
            event.target.closest(
                ".tree"
            );


        if (tree) {

            showTreeActions(
                tree,
                event.clientX,
                event.clientY
            );

            return;

        }


        showGroundActions(
            event.clientX,
            event.clientY
        );

    }
);


/* =========================
   MENÚ ACCIONES
========================= */

function showGroundActions(x, y) {

    actionMenu.innerHTML = `

        <div class="action-title">
            Suelo
        </div>

        <button
            class="action-button"
            data-action="move"
        >

            <span>🚶</span>

            <div>

                <strong>
                    Mover
                </strong>

                <small>
                    Ir hasta aquí
                </small>

            </div>

        </button>


        <button
            class="action-button"
            data-action="wait"
        >

            <span>⏳</span>

            <div>

                <strong>
                    Esperar
                </strong>

                <small>
                    Quedarse aquí
                </small>

            </div>

        </button>

    `;


    addActionListeners();

    showActionMenu(
        x,
        y
    );

}


function showTreeActions(
    tree,
    x,
    y
) {

    actionMenu.innerHTML = `

        <div class="action-title">
            Árbol
        </div>

        <button
            class="action-button"
            data-action="cut-tree"
        >

            <span>🪓</span>

            <div>

                <strong>
                    Talar
                </strong>

                <small>
                    Ir y talar
                </small>

            </div>

        </button>

    `;


    actionMenu.dataset.treeId =
        Math.random()
            .toString(36);


    tree.dataset.actionTree =
        actionMenu.dataset.treeId;


    addActionListeners();

    showActionMenu(
        x,
        y
    );

}


function addActionListeners() {

    actionMenu
        .querySelectorAll(
            ".action-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.stopPropagation();


                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "move"
                        ) {

                            startMoveMode();

                        }


                        if (
                            action ===
                            "wait"
                        ) {

                            waitUntil =
                                performance.now() +
                                5000;

                            moveTarget = null;

                            autonomousTarget =
                                null;

                            removeMoveLine();

                            closeActionMenu();

                        }


                        if (
                            action ===
                            "cut-tree"
                        ) {

                            startChoppingTree();

                        }

                    }
                );

            }
        );

}


function showActionMenu(
    x,
    y
) {

    actionMenu.classList.remove(
        "hidden"
    );


    let left =
        x + 10;

    let top =
        y + 10;


    requestAnimationFrame(
        () => {

            const width =
                actionMenu.offsetWidth;

            const height =
                actionMenu.offsetHeight;


            if (
                left + width >
                window.innerWidth
            ) {

                left =
                    x - width - 10;

            }


            if (
                top + height >
                window.innerHeight
            ) {

                top =
                    y - height - 10;

            }


            left =
                Math.max(
                    6,
                    left
                );

            top =
                Math.max(
                    6,
                    top
                );


            actionMenu.style.left =
                left + "px";

            actionMenu.style.top =
                top + "px";

        }
    );

}


function closeActionMenu() {

    actionMenu.classList.add(
        "hidden"
    );

}


/* =========================
   MODO MOVER
========================= */

function startMoveMode() {

    movingMode = true;

    closeActionMenu();

    moveMode.classList.remove(
        "hidden"
    );

    viewport.style.cursor =
        "crosshair";

}


cancelMove.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        movingMode = false;

        moveMode.classList.add(
            "hidden"
        );

        viewport.style.cursor =
            "default";

    }
);


/* =========================
   DESTINO
========================= */

function setMoveTarget(
    screenX,
    screenY
) {

    const rect =
        viewport.getBoundingClientRect();


    const viewportX =
        screenX - rect.left;

    const viewportY =
        screenY - rect.top;


    const worldX =
        (viewportX - cameraX) /
        zoom;

    const worldY =
        (viewportY - cameraY) /
        zoom;


    const target =
        getGridPosition(
            worldX,
            worldY
        );


    moveTarget = target;

    autonomousTarget = null;


    createMoveMarker(
        target.x,
        target.y
    );


    createMoveLine(
        colonist.x,
        colonist.y,
        target.x,
        target.y
    );


    colonist.state =
        "moving";


    movingMode = false;

    moveMode.classList.add(
        "hidden"
    );

    viewport.style.cursor =
        "default";

}


/* =========================
   MARCADOR
========================= */

function createMoveMarker(
    x,
    y
) {

    const old =
        document.querySelector(
            ".move-marker"
        );


    if (old) {

        old.remove();

    }


    const marker =
        document.createElement(
            "div"
        );


    marker.className =
        "move-marker";


    marker.style.left =
        x + "px";

    marker.style.top =
        y + "px";


    world.appendChild(
        marker
    );

}


/* =========================
   TALADO
========================= */

function startChoppingTree() {

    const treeId =
        actionMenu.dataset.treeId;


    const tree =
        document.querySelector(
            `.tree[data-action-tree="${treeId}"]`
        );


    if (!tree) {

        closeActionMenu();

        return;

    }


    const treeX =
        parseFloat(
            tree.style.left
        );

    const treeY =
        parseFloat(
            tree.style.top
        );


    const target =
        getGridPosition(
            treeX,
            treeY + TILE_SIZE
        );


    colonist.choppingTree =
        tree;


    colonist.state =
        "moving-to-tree";


    moveTarget =
        target;

    autonomousTarget =
        null;


    createMoveMarker(
        target.x,
        target.y
    );


    createMoveLine(
        colonist.x,
        colonist.y,
        target.x,
        target.y
    );


    closeActionMenu();

}


function startChopping() {

    if (
        !colonist.choppingTree
    ) {

        return;

    }


    colonist.state =
        "chopping";


    moveTarget = null;

    removeMoveLine();


    const agriculture =
        colonist.skills.Agricultura;


    /*
       Agricultura 1:
       10 segundos

       Agricultura 10:
       2 segundos
    */

    const choppingTime =
        10000 -
        (
            agriculture - 1
        ) *
        888;


    colonist.choppingEnd =
        performance.now() +
        choppingTime;

}


function finishChopping() {

    if (
        colonist.choppingTree
    ) {

        colonist.choppingTree.remove();

    }


    colonist.choppingTree =
        null;

    colonist.choppingEnd =
        0;

    colonist.state =
        "idle";

}


/* =========================
   MOVIMIENTO
========================= */

function chooseRandomTarget() {

    /*
       El colono deambula cerca
       de su zona de origen.
    */

    const radius =
        7 * TILE_SIZE;


    const angle =
        Math.random() *
        Math.PI *
        2;


    const distance =
        2 * TILE_SIZE +
        Math.random() *
        (
            radius -
            2 * TILE_SIZE
        );


    const x =
        colonist.homeX +
        Math.cos(angle) *
        distance;


    const y =
        colonist.homeY +
        Math.sin(angle) *
        distance;


    autonomousTarget =
        getGridPosition(
            x,
            y
        );

}


function moveColonist(delta) {

    if (
        performance.now() <
        waitUntil
    ) {

        colonist.state =
            "waiting";

        return;

    }


    if (
        colonist.state ===
        "chopping"
    ) {

        if (
            performance.now() >=
            colonist.choppingEnd
        ) {

            finishChopping();

        }

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
        target.x -
        colonist.x;

    const dy =
        target.y -
        colonist.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance < 4
    ) {

        colonist.x =
            target.x;

        colonist.y =
            target.y;


        if (
            colonist.state ===
            "moving-to-tree"
        ) {

            startChopping();

            return;

        }


        if (moveTarget) {

            moveTarget =
                null;

            colonist.state =
                "idle";


            const marker =
                document.querySelector(
                    ".move-marker"
                );


            if (marker) {

                marker.remove();

            }


            removeMoveLine();

        } else {

            autonomousTarget =
                null;

            colonist.state =
                "idle";

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


    /*
       La línea sigue al personaje.
    */

    if (
        moveTarget ||
        colonist.state ===
        "moving-to-tree"
    ) {

        createMoveLine(
            colonist.x,
            colonist.y,
            target.x,
            target.y
        );

    }

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

function createZoomSlider() {

    const controls =
        document.getElementById(
            "zoom-controls"
        );


    controls.innerHTML = `

        <span class="zoom-icon">
            −
        </span>

        <input
            id="zoom-slider"
            type="range"
            min="50"
            max="200"
            value="100"
            step="5"
        >

        <span class="zoom-icon">
            +
        </span>

    `;


    const slider =
        document.getElementById(
            "zoom-slider"
        );


    slider.addEventListener(
        "input",
        function() {

            const newZoom =
                Number(
                    slider.value
                ) / 100;


            changeZoom(
                newZoom,
                window.innerWidth / 2,
                window.innerHeight / 2
            );

        }
    );

}


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
            Math.min(
                2,
                newZoom
            )
        );


    if (
        newZoom === oldZoom
    ) {

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


    const slider =
        document.getElementById(
            "zoom-slider"
        );


    if (slider) {

        slider.value =
            Math.round(
                zoom * 100
            );

    }


    zoomLevel.textContent =
        Math.round(
            zoom * 100
        ) + "%";

}


/* =========================
   DESPLAZAR MAPA
========================= */

viewport.addEventListener(
    "pointerdown",
    function(event) {

        if (
            event.target.closest(
                "#colonist"
            ) ||
            event.target.closest(
                "#action-menu"
            ) ||
            event.target.closest(
                "#colonist-menu"
            ) ||
            event.target.closest(
                "#colonist-card"
            )
        ) {

            return;

        }


        if (
            movingMode
        ) {

            return;

        }


        draggingCamera = false;

        dragStartX =
            event.clientX;

        dragStartY =
            event.clientY;

        dragCameraX =
            cameraX;

        dragCameraY =
            cameraY;


        viewport.setPointerCapture(
            event.pointerId
        );

    }
);


viewport.addEventListener(
    "pointermove",
    function(event) {

        if (
            !viewport.hasPointerCapture(
                event.pointerId
            )
        ) {

            return;

        }


        const dx =
            event.clientX -
            dragStartX;

        const dy =
            event.clientY -
            dragStartY;


        if (
            Math.abs(dx) > 5 ||
            Math.abs(dy) > 5
        ) {

            draggingCamera = true;

        }


        if (
            draggingCamera
        ) {

            cameraX =
                dragCameraX + dx;

            cameraY =
                dragCameraY + dy;


            updateWorldTransform();

        }

    }
);


viewport.addEventListener(
    "pointerup",
    function(event) {

        if (
            viewport.hasPointerCapture(
                event.pointerId
            )
        ) {

            viewport.releasePointerCapture(
                event.pointerId
            );

        }


        setTimeout(
            () => {

                draggingCamera =
                    false;

            },
            20
        );

    }
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
            ) <
            8 * TILE_SIZE &&

            Math.abs(
                y - colonist.y
            ) <
            8 * TILE_SIZE

        );


        const tree =
            document.createElement(
                "div"
            );


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


    if (
        colony.minute >= 60
    ) {

        colony.minute = 0;

        colony.hour++;

    }


    if (
        colony.hour >= 24
    ) {

        colony.hour = 0;

        colony.day++;

        colony.yearDay++;


        if (
            colony.yearDay > 365
        ) {

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

        `${String(
            colony.hour
        ).padStart(2, "0")}:` +

        `${String(
            colony.minute
        ).padStart(2, "0")}`;


    document.getElementById(
        "colony-year-day"
    ).textContent =
        `Día ${colony.yearDay} / 365`;

}


/* =========================
   CERRAR MENÚS
========================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                "#colonist-menu"
            ) &&

            !event.target.closest(
                "#colonist"
            ) &&

            !event.target.closest(
                "#colonist-card"
            )
        ) {

            closeColonistMenu();

        }

    }
);


/* =========================
   GAME LOOP
========================= */

function gameLoop(
    currentTime
) {

    const delta =
        Math.min(
            (
                currentTime -
                lastTime
            ) / 1000,
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
).textContent =
    "1";


document.querySelector(
    ".card-name"
).textContent =
    colonist.name;


document.getElementById(
    "menu-name"
).textContent =
    colonist.name;


createZoomSlider();

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
