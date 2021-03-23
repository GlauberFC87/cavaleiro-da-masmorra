const TILE_SIZE = 48;
const HELMET_OFFSET = 12;
const GAME_SIZE = TILE_SIZE * 20;

const root = document.documentElement;
root.style.setProperty("--tile-size", `${TILE_SIZE}px`);
root.style.setProperty("--helmet-offset", `${HELMET_OFFSET}px`);
root.style.setProperty("--game-size", `${GAME_SIZE}px`);

function createBoard() {
  const boardElement = document.getElementById("board");
  const elements = [];
  function createElement(options) {
    let { item, top, left } = options;
    const currentElement = { item, currentPosition: { top, left } };
    elements.push(currentElement);

    const htmlElement = document.createElement("div");
    htmlElement.className = item;
    htmlElement.style.top = `${top}px`;
    htmlElement.style.left = `${left}px`;

    boardElement.appendChild(htmlElement);

    let steps = 50;
    let heroSteps = document.querySelector(".steps");
    heroSteps.textContent = "Passos: " + steps;

    function getNewDirection(buttonPressed, position) {
      switch (buttonPressed) {
        case "ArrowUp":
          return { top: position.top - TILE_SIZE, left: position.left };
        case "ArrowRight":
          return { top: position.top, left: position.left + TILE_SIZE };
        case "ArrowDown":
          return { top: position.top + TILE_SIZE, left: position.left };
        case "ArrowLeft":
          return { top: position.top, left: position.left - TILE_SIZE };
        default:
          return position;
      }
    }

    function validateMovement(position, conflictItem) {
      return (
        position.left >= 48 &&
        position.left <= 864 &&
        position.top >= 96 &&
        position.top <= 816 &&
        conflictItem?.item !== "forniture"
      );
    }

    function getMovementConflict(position, component) {
      const conflictItem = component.find((currentElement) => {
        return (
          currentElement.currentPosition.top === position.top &&
          currentElement.currentPosition.left === position.left
        );
      });
      return conflictItem;
    }

    function validateConflicts(currentComponent, conflictItem) {
      function finishGame(titulo, mensagem) {
        setTimeout(() => {
          Swal.fire({
            title: titulo,
            text: mensagem,
            allowOutsideClick: false,

            confirmButtonText: `Ok`,
          }).then((result) => {
            if (result.isConfirmed) {
              location.reload();
            }
          });
        }, 20);
      }

      if (!conflictItem) {
        return;
      }

      if (currentComponent.item === "hero") {
        if (
          conflictItem.item === "mini-demon" ||
          conflictItem.item === "trap"
        ) {
          finishGame("Você morreu!", "Tente novamente...");
        }
        if (conflictItem.item === "chest") {
          finishGame("Parabéns!!!", "você ganhou!");
        }
      }

      if (
        currentComponent.item === "mini-demon" &&
        conflictItem.item === "hero"
      ) {
        finishGame("Você morreu!");
      }
    }

    function move(buttonPressed) {
      const newPosition = getNewDirection(
        buttonPressed,
        currentElement.currentPosition
      );
      const conflictItem = getMovementConflict(newPosition, elements);

      const isValidMovement = validateMovement(newPosition, conflictItem);

      if (isValidMovement) {
        if (newPosition != currentElement.currentPosition) {
          if (currentElement.item === "hero") {
            steps = steps - 1;
            heroSteps.textContent = "Passos: " + steps;
          }
          if (steps === 0) {
            setTimeout(() => {
              Swal.fire({
                title: "Você morreu de cansaço...",
                text: "Mais sorte na próxima!",
                allowOutsideClick: false,
                confirmButtonText: `Retry`,
              }).then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                }
              });
            }, 20);
          }
        }
        currentElement.currentPosition = newPosition;
        htmlElement.style.top = `${newPosition.top}px`;
        htmlElement.style.left = `${newPosition.left}px`;

        validateConflicts(currentElement, conflictItem);
      }
    }

    return {
      move: move,
    };
  }
  function createItem(options) {
    createElement(options);
  }

  function createHero(options) {
    const hero = createElement({
      item: "hero",
      top: options.top,
      left: options.left,
    });

    document.addEventListener("keydown", (event) => {
      hero.move(event.key);
    });
  }

  function createEnemy(options) {
    const enemy = createElement({
      item: "mini-demon",
      top: options.top,
      left: options.left,
    });

    setInterval(() => {
      const direction = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
      const randomIndex = Math.floor(Math.random() * direction.length);

      const randomDirection = direction[randomIndex];

      enemy.move(randomDirection);
    }, 1000);
  }
  return {
    createItem: createItem,
    createHero: createHero,
    createEnemy: createEnemy,
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const board = createBoard();

board.createItem({
  item: "chest",
  top: TILE_SIZE * 2,
  left: TILE_SIZE * 18,
});

board.createItem({
  item: "forniture",
  top: TILE_SIZE * 17,
  left: TILE_SIZE * 2,
});

board.createItem({
  item: "forniture",
  top: TILE_SIZE * 2,
  left: TILE_SIZE * 3,
});

board.createItem({
  item: "forniture",
  top: TILE_SIZE * 2,
  left: TILE_SIZE * 8,
});

board.createItem({
  item: "forniture",
  top: TILE_SIZE * 2,
  left: TILE_SIZE * 16,
});

board.createHero({
  top: TILE_SIZE * 16,
  left: TILE_SIZE * 2,
});

function reset() {
  location.reload();
}

let resetButton = document.querySelector(".reset");

resetButton.addEventListener("click", reset);

for (i = 0; i < 15; i++) {
  board.createEnemy({
    top: TILE_SIZE * getRandomInt(3, 16),
    left: TILE_SIZE * getRandomInt(4, 18),
  });
}

for (i = 0; i < 22; i++) {
  const trap = board.createItem({
    item: "trap",
    top: TILE_SIZE * getRandomInt(3, 16),
    left: TILE_SIZE * getRandomInt(1, 18),
  });
}
