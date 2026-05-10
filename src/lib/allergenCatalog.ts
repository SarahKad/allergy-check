// Built-in allergen catalog. The Profile screen lets users toggle these
// on/off. Hidden names below are merged into the system prompt so Claude
// catches them on labels.

export type CatalogAllergen = {
  id: string;
  label: string;
  hiddenNames: string[];
  // Optional human-friendly note shown under the chip, e.g. exceptions.
  note?: string;
};

export const ALLERGEN_CATALOG: CatalogAllergen[] = [
  {
    id: 'tree-nuts',
    label: 'Tree nuts',
    hiddenNames: [
      'almond',
      'cashew',
      'walnut',
      'pistachio',
      'pecan',
      'hazelnut',
      'macadamia',
      'brazil nut',
      'pine nut',
      'marzipan',
      'praline',
      'nougat',
      'nut butter',
      'mixed nuts',
      'trail mix',
    ],
    note: 'Coconut is not a tree nut for most allergies.',
  },
  {
    id: 'peanuts',
    label: 'Peanuts',
    hiddenNames: [
      'peanut butter',
      'groundnut',
      'arachis oil',
      'mixed nuts',
      'satay',
    ],
  },
  {
    id: 'eggs',
    label: 'Eggs',
    hiddenNames: [
      'albumin',
      'albumen',
      'globulin',
      'lysozyme',
      'mayonnaise',
      'meringue',
      'egg wash',
      'ovomucin',
      'ovalbumin',
      'lecithin (egg)',
    ],
  },
  {
    id: 'dairy',
    label: 'Dairy / milk',
    hiddenNames: [
      'casein',
      'caseinate',
      'whey',
      'lactalbumin',
      'lactose',
      'butter',
      'ghee',
      'cream',
      'cheese',
      'yogurt',
    ],
  },
  {
    id: 'green-peas',
    label: 'Green peas / pea protein',
    hiddenNames: [
      'snap peas',
      'snow peas',
      'pea flour',
      'pea starch',
      'pea protein',
      'pea protein isolate',
      'pea protein concentrate',
    ],
    note: 'Other legumes (lentils, chickpeas) are usually fine unless dish also contains pea protein.',
  },
  {
    id: 'soy',
    label: 'Soy',
    hiddenNames: [
      'soybean',
      'soya',
      'tofu',
      'edamame',
      'tempeh',
      'miso',
      'soy lecithin',
      'tamari',
    ],
  },
  {
    id: 'wheat-gluten',
    label: 'Wheat / gluten',
    hiddenNames: [
      'wheat',
      'flour',
      'semolina',
      'spelt',
      'kamut',
      'durum',
      'farro',
      'barley',
      'rye',
      'malt',
      'seitan',
    ],
  },
  {
    id: 'sesame',
    label: 'Sesame',
    hiddenNames: ['tahini', 'sesame oil', 'sesame seed', 'gomashio', 'halva'],
  },
  {
    id: 'mustard',
    label: 'Mustard',
    hiddenNames: ['mustard powder', 'mustard oil', 'mustard greens', 'mustard seed'],
  },
  {
    id: 'shellfish',
    label: 'Shellfish',
    hiddenNames: [
      'shrimp',
      'prawn',
      'crab',
      'lobster',
      'crayfish',
      'clam',
      'oyster',
      'scallop',
      'mussel',
      'surimi',
      'imitation crab',
    ],
    note: 'Finned fish (salmon, tuna, cod) is separate.',
  },
  {
    id: 'fish',
    label: 'Fish (finned)',
    hiddenNames: [
      'anchovy',
      'fish sauce',
      'worcestershire',
      'caesar dressing',
      'tuna',
      'salmon',
      'cod',
    ],
  },
];
