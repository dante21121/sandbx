const map = document.getElementById("map");
const menu = document.getElementById("colonist-menu");

const moveButton = document.getElementById("move-button");
const waitButton = document.getElementById("wait-button");
const infoButton = document.getElementById("info-button");

const TILE_SIZE = 40;

const colonist = {
    x: 10,
    y: 8,

    targetX: 10,
    targetY: 8,

    speed: 1.5,

    moving: true,
    waiting: false
};

const colonistElement = document.createElement("div");

colonistElement.id = "colonist";

map.appendChild(colonistElement);

function updateColonistPosition() {
    colonistElement.style.left = `${colonist.x * TILE_SIZE + TILE_SIZE / 2}px`;
    colonistElement.style.top = `${colonist.y * TILE_SIZE + TILE_SIZE / 2}px`;
}

function chooseRandomTarget() {
    const mapWidth = Math.floor(map.clientWidth / TILE_SIZE);
    const mapHeight = Math.floor(map.clientHeight / TILE_SIZE);

    colonist.targetX = Math.floor(Math.random() * mapWidth);
    colonist.targetY = Math.floor(Math.random() * mapHeight);
}

function moveColonist() {
    if (!colonist.moving || colonist.waiting) {
        return;
    }

    const dx = colonist.targetX - colonist.x;
    const dy = colonist.targetY - colonist.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.05) {
        colonist.x = colonist.targetX;
        colonist.y = colonist.targetY;

        chooseRandomTarget();
        return;
    }

    colonist.x += (dx / distance) * 0.015 * colonist.speed;
    colonist.y += (dy / distance) * 0.015 * colonist.speed;

    updateColonistPosition();
}

function gameLoop() {
    moveColonist();
    requestAnimationFrame(gameLoop);
}

colonistElement.addEventListener("click", (event) => {
    event.stopPropagation();

    menu.classList.remove("hidden");

    menu.style.left = `${colonist.x * TILE_SIZE + 45}px`;
    menu.style.top = `${colonist.y * TILE_SIZE}px`;
});

moveButton.addEventListener("click", () => {
    colonist.waiting = false;
    colonist.moving = true;

    chooseRandomTarget();

    menu.classList.add("hidden");
});

waitButton.addEventListener("click", () => {
    colonist.waiting = true;

    menu.classList.add("hidden");

    setTimeout(() => {
        colonist.waiting = false;
    }, 3000);
});

infoButton.addEventListener("click", () => {
    alert(
        "Colono\n\n" +
        "Estado: " + (colonist.waiting ? "Esperando" : "Libre") + "\n" +
        "Trabajo: Ninguno"
    );
});

map.addEventListener("click", (event) => {
    if (event.target === map) {
        menu.classList.add("hidden");
    }
});

updateColonistPosition();
chooseRandomTarget();
gameLoop();
