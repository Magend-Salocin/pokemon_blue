// Halte de Vireval.
import { halte } from '../interiors.js';

export default halte({
  id: 'halte_vireval',
  name: 'Halte de Vireval',
  exit: { map: 'vireval', x: 3, y: 4 },
  npcs: [
    { id: 'technicien', sprite: 'ouvrier', x: 7, y: 5, facing: 'left', movement: 'look', script: [{ cmd: 'say', text: 'halte_vireval_technicien' }] },
  ],
});
