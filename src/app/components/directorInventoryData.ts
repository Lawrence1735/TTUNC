/**
 * Director Dashboard – Inventory Seed Data
 * Extracted to keep DirectorDashboardEnhanced.tsx below Babel's 500KB threshold.
 * All factories accept `talentGroup` so they can return group-appropriate defaults.
 */

// ── Uniforms ─────────────────────────────────────────────────────────────────

export function createUniformsData(talentGroup: string) {
  const isMajorettes = talentGroup === 'majorettes';
  const isGleeClub   = talentGroup === 'glee-club';
  const isDanceClub  = talentGroup === 'dance-club';

  if (isMajorettes) return [
    { id: 'unf-maj-1', serialNumber: 'UNF-MAJ-DRESS-2024-001', uniformSet: 'Performance Dress 2024', size: 'Small',  pieces: 'Dress, Headdress, Shoes', condition: 'good', status: 'assigned',  assignedTo: 'Sofia Isabelle Cruz' },
    { id: 'unf-maj-2', serialNumber: 'UNF-MAJ-DRESS-2024-002', uniformSet: 'Performance Dress 2024', size: 'Medium', pieces: 'Dress, Headdress, Shoes', condition: 'good', status: 'assigned',  assignedTo: 'Andrea Fernandez' },
    { id: 'unf-maj-3', serialNumber: 'UNF-MAJ-DRESS-2024-003', uniformSet: 'Performance Dress 2024', size: 'Small',  pieces: 'Dress, Headdress, Shoes', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-maj-4', serialNumber: 'UNF-MAJ-DRESS-2023-001', uniformSet: 'Performance Dress 2023', size: 'Medium', pieces: 'Dress, Headdress, Shoes', condition: 'bad',  status: 'available', assignedTo: null },
    { id: 'unf-maj-5', serialNumber: 'UNF-MAJ-DRESS-2024-004', uniformSet: 'Performance Dress 2024', size: 'Large',  pieces: 'Dress, Headdress, Shoes', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-maj-6', serialNumber: 'UNF-MAJ-PRAC-2024-001', uniformSet: 'Practice Uniform 2024',  size: 'Small',  pieces: 'Practice Top, Shorts, Shoes', condition: 'good', status: 'assigned',  assignedTo: 'Bianca Sophia Cortez' },
    { id: 'unf-maj-7', serialNumber: 'UNF-MAJ-PRAC-2024-002', uniformSet: 'Practice Uniform 2024',  size: 'Medium', pieces: 'Practice Top, Shorts, Shoes', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-maj-8', serialNumber: 'UNF-MAJ-DRESS-2024-005', uniformSet: 'Performance Dress 2024', size: 'Small',  pieces: 'Dress, Headdress, Shoes', condition: 'good', status: 'available', assignedTo: null },
  ];

  if (isGleeClub) return [
    { id: 'unf-gle-1', serialNumber: 'UNF-GLE-BARONGA-2024-001', uniformSet: 'Barong A 2024',    size: 'Medium', pieces: 'Barong Top, Black Pants', condition: 'good', status: 'assigned',  assignedTo: 'Christian Miguel Diaz' },
    { id: 'unf-gle-2', serialNumber: 'UNF-GLE-BARONGA-2024-002', uniformSet: 'Barong A 2024',    size: 'Large',  pieces: 'Barong Top, Black Pants', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-gle-3', serialNumber: 'UNF-GLE-BARONGB-2024-001', uniformSet: 'Barong B 2024',    size: 'Medium', pieces: 'Barong Top, Black Pants', condition: 'good', status: 'assigned',  assignedTo: 'Nathaniel Jose Cruz' },
    { id: 'unf-gle-4', serialNumber: 'UNF-GLE-BARONGB-2024-002', uniformSet: 'Barong B 2024',    size: 'Small',  pieces: 'Barong Top, Black Pants', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-gle-5', serialNumber: 'UNF-GLE-POLO-2024-001',   uniformSet: 'Polo Shirt 2024',   size: 'Medium', pieces: 'White Polo, Black Pants', condition: 'good', status: 'assigned',  assignedTo: 'Gabriel Antonio Martinez' },
    { id: 'unf-gle-6', serialNumber: 'UNF-GLE-POLO-2024-002',   uniformSet: 'Polo Shirt 2024',   size: 'Large',  pieces: 'White Polo, Black Pants', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-gle-7', serialNumber: 'UNF-GLE-POLO-2023-001',   uniformSet: 'Polo Shirt 2023',   size: 'Medium', pieces: 'White Polo, Black Pants', condition: 'bad',  status: 'available', assignedTo: null },
    { id: 'unf-gle-8', serialNumber: 'UNF-GLE-BARONGA-2024-003', uniformSet: 'Barong A 2024',    size: 'Small',  pieces: 'Barong Top, Black Pants', condition: 'good', status: 'available', assignedTo: null },
  ];

  if (isDanceClub) return [
    { id: 'unf-dan-1', serialNumber: 'UNF-DAN-PERF-2024-001', uniformSet: 'Performance Set 2024', size: 'Medium', pieces: 'Dance Top, Dance Pants, Shoes',         condition: 'good', status: 'assigned',  assignedTo: 'Elena Victoria Ramos' },
    { id: 'unf-dan-2', serialNumber: 'UNF-DAN-PERF-2024-002', uniformSet: 'Performance Set 2024', size: 'Small',  pieces: 'Dance Top, Dance Pants, Shoes',         condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-dan-3', serialNumber: 'UNF-DAN-GALA-2024-001', uniformSet: 'Gala Costume 2024',    size: 'Medium', pieces: 'Gala Top, Gala Pants, Accessories',     condition: 'good', status: 'assigned',  assignedTo: 'Samantha Marie Torres' },
    { id: 'unf-dan-4', serialNumber: 'UNF-DAN-GALA-2024-002', uniformSet: 'Gala Costume 2024',    size: 'Large',  pieces: 'Gala Top, Gala Pants, Accessories',     condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-dan-5', serialNumber: 'UNF-DAN-PRAC-2024-001', uniformSet: 'Practice Set 2024',    size: 'Small',  pieces: 'Practice Top, Leggings',                condition: 'good', status: 'assigned',  assignedTo: 'Jasmine Rose Villanueva' },
    { id: 'unf-dan-6', serialNumber: 'UNF-DAN-PRAC-2024-002', uniformSet: 'Practice Set 2024',    size: 'Medium', pieces: 'Practice Top, Leggings',                condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-dan-7', serialNumber: 'UNF-DAN-PERF-2023-001', uniformSet: 'Performance Set 2023', size: 'Medium', pieces: 'Dance Top, Dance Pants, Shoes',         condition: 'bad',  status: 'available', assignedTo: null },
    { id: 'unf-dan-8', serialNumber: 'UNF-DAN-GALA-2024-003', uniformSet: 'Gala Costume 2024',    size: 'Small',  pieces: 'Gala Top, Gala Pants, Accessories',     condition: 'good', status: 'available', assignedTo: null },
  ];

  // Marching Band (default)
  return [
    { id: 'unf-1', serialNumber: 'UNF-GALA-2024-001', uniformSet: 'Type A Gala 2024',        size: 'Medium', pieces: 'Jacket, Pants, Hat, Gloves, Shoes', condition: 'good', status: 'assigned',  assignedTo: 'Maria Santos' },
    { id: 'unf-2', serialNumber: 'UNF-GALA-2024-002', uniformSet: 'Type A Gala 2024',        size: 'Large',  pieces: 'Jacket, Pants, Hat, Gloves, Shoes', condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-3', serialNumber: 'UNF-GALA-2023-001', uniformSet: 'Type A Gala 2023',        size: 'Medium', pieces: 'Jacket, Pants, Hat, Gloves, Shoes', condition: 'bad',  status: 'assigned',  assignedTo: 'Juan Dela Cruz' },
    { id: 'unf-4', serialNumber: 'UNF-GALA-2023-002', uniformSet: 'Type A Gala 2023',        size: 'Small',  pieces: 'Jacket, Pants, Hat, Gloves, Shoes', condition: 'bad',  status: 'available', assignedTo: null },
    { id: 'unf-5', serialNumber: 'UNF-PERF-2024-001', uniformSet: 'Type B Performance 2024', size: 'Large',  pieces: 'Polo Shirt, Pants, Cap, Shoes',      condition: 'good', status: 'assigned',  assignedTo: 'Ana Reyes' },
    { id: 'unf-6', serialNumber: 'UNF-PERF-2024-002', uniformSet: 'Type B Performance 2024', size: 'Medium', pieces: 'Polo Shirt, Pants, Cap, Shoes',      condition: 'good', status: 'available', assignedTo: null },
    { id: 'unf-7', serialNumber: 'UNF-PRAC-2024-001', uniformSet: 'Practice Uniform 2024',   size: 'Large',  pieces: 'T-shirt, Shorts',                   condition: 'good', status: 'assigned',  assignedTo: 'Pedro Garcia' },
    { id: 'unf-8', serialNumber: 'UNF-GALA-2024-003', uniformSet: 'Type A Gala 2024',        size: 'Small',  pieces: 'Jacket, Pants, Hat, Gloves, Shoes', condition: 'good', status: 'available', assignedTo: null },
  ];
}

// ── Instruments ──────────────────────────────────────────────────────────────

export const INSTRUMENTS_SEED_DATA = [
  { id: 'ins-1', serialNumber: 'INS-TRPT-001', instrumentType: 'Trumpet',    brand: 'Yamaha',  model: 'YTR-2330', condition: 'good', propertyType: 'unc-property', status: 'assigned',  assignedTo: 'Ana Reyes' },
  { id: 'ins-2', serialNumber: 'INS-CLRT-002', instrumentType: 'Clarinet',   brand: 'Buffet',  model: 'E11',      condition: 'good', propertyType: 'unc-property', status: 'available', assignedTo: null },
  { id: 'ins-3', serialNumber: 'INS-TRBN-003', instrumentType: 'Trombone',   brand: 'Bach',    model: 'TB301',    condition: 'bad',  propertyType: 'unc-property', status: 'assigned',  assignedTo: 'Pedro Cruz' },
  { id: 'ins-4', serialNumber: 'INS-TRPT-004', instrumentType: 'Trumpet',    brand: 'Jupiter', model: 'JTR500',   condition: 'good', propertyType: 'own-property', status: 'assigned',  assignedTo: 'Lisa Santos' },
  { id: 'ins-5', serialNumber: 'INS-DRUM-005', instrumentType: 'Snare Drum', brand: 'Pearl',   model: 'PFD1455',  condition: 'bad',  propertyType: 'unc-property', status: 'available', assignedTo: null },
];

// ── Accessories ──────────────────────────────────────────────────────────────

export function createAccessoriesData(talentGroup: string) {
  const isMajorettes = talentGroup === 'majorettes';

  if (isMajorettes) return [
    { id: 'acc-maj-1', accessoryName: 'Professional Performance Baton',  accessoryType: 'Baton',            description: '26 inch performance baton',          quantity: 15 },
    { id: 'acc-maj-2', accessoryName: 'Practice Baton',                   accessoryType: 'Baton',            description: '24 inch practice baton',             quantity: 20 },
    { id: 'acc-maj-3', accessoryName: 'Professional Performance Baton (Used)', accessoryType: 'Baton',      description: '26 inch performance baton - used',   quantity: 8  },
    { id: 'acc-maj-4', accessoryName: 'White Performance Gloves',         accessoryType: 'Performance Gloves', description: 'White gloves for performances (Pairs)', quantity: 25 },
    { id: 'acc-maj-5', accessoryName: 'Burgundy and Gold Ribbon Set',     accessoryType: 'Ribbon',           description: 'Decorative ribbon set for performances', quantity: 30 },
    { id: 'acc-maj-6', accessoryName: 'Performance Hairnets and Pins',    accessoryType: 'Hair Accessories', description: 'Hair accessories for performances',  quantity: 40 },
  ];

  // Marching Band / all others
  return [
    { id: 'acc-1', accessoryName: 'Ceremonial Plume',  accessoryType: 'Plume',      description: 'Red and gold feather plume',          quantity: 30 },
    { id: 'acc-2', accessoryName: 'White Cotton Gloves', accessoryType: 'Gloves',   description: 'White cotton gloves (Pairs)',          quantity: 50 },
    { id: 'acc-3', accessoryName: 'Trumpet Lyre',       accessoryType: 'Lyre',      description: 'Lyre for holding music sheets on trumpet', quantity: 8 },
    { id: 'acc-4', accessoryName: 'Drumsticks 5A',      accessoryType: 'Drumsticks', description: '5A wood tip drumsticks',             quantity: 25 },
  ];
}
