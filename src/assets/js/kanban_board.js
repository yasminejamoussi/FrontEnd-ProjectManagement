// src/assets/js/kanban_board.js
import Muuri from 'muuri';

function initializeKanbanBoard() {
  const itemContainers = [].slice.call(document.querySelectorAll('.board-column-content'));
  const columnGrids = [];

  console.log("Conteneurs trouvés pour Muuri :", itemContainers);

  // Initialiser la grille principale (boardGrid) avant les colonnes
  const board = document.querySelector('.board');
  const boardGrid = new Muuri(board, {
    items: '.board-column',
    layout: {
      horizontal: true,
      fillGaps: false,
    },
    layoutDuration: 400,
    layoutEasing: 'ease',
    dragEnabled: false,
  });

  itemContainers.forEach((container) => {
    const grid = new Muuri(container, {
      items: '.board-item',
      layoutDuration: 400,
      layoutEasing: 'ease',
      dragEnabled: true,
      dragSort: () => columnGrids,
      dragSortInterval: 0,
      dragContainer: document.body,
      dragReleaseDuration: 400,
      dragReleaseEasing: 'ease',
      dragStartPredicate: {
        distance: 10,
        delay: 0,
      },
    })
      .on('dragStart', (item) => {
        item.getElement().style.width = `${item.getWidth()}px`;
        item.getElement().style.height = `${item.getHeight()}px`;
        item.getElement().style.zIndex = '1000';
      })
      .on('dragReleaseEnd', (item) => {
        item.getElement().style.width = '';
        item.getElement().style.height = '';
        item.getElement().style.zIndex = '';
        columnGrids.forEach((grid) => grid.refreshItems());
      })
      .on('layoutStart', () => {
        boardGrid.refreshItems().layout(); // Utilisation correcte de boardGrid
      });

    columnGrids.push(grid);
  });

  return { columnGrids, boardGrid };
}

export default initializeKanbanBoard;