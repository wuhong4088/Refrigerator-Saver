import dotenv from 'dotenv';
dotenv.config();

import { client, db } from './db/connector.js';

// Helper to pick random elements
function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function runSeed() {
  if (!db) {
    console.error('Database connection is not active. Aborting seeding.');
    process.exit(1);
  }

  try {
    console.log('Clearing existing data...');
    // Clean old data
    await db.collection('recipes').deleteMany({});
    await db.collection('system_logs').deleteMany({});

    // Start log
    await db.collection('system_logs').insertOne({
      action: 'DATABASE_SEED_START',
      timestamp: new Date(),
      details: 'Seeding process started.',
    });

    console.log('Generating recipes...');
    const adjectives = [
      'Classic',
      'Homemade',
      'Savory',
      'Spicy',
      'Sweet',
      'Tangy',
      'Crispy',
      'Garlic',
      'Zesty',
      'Herb-crusted',
      'Smoky',
      'Golden',
      'Creamy',
      'Sesame',
      'Honeyed',
    ];
    const methods = [
      'Braised',
      'Steamed',
      'Stir-fried',
      'Pan-seared',
      'Roasted',
      'Baked',
      'Grilled',
      'Slow-cooked',
      'Sautéed',
      'Poached',
      'Deep-fried',
      'Charred',
      'Glazed',
      'Simmered',
      'Broiled',
    ];
    const bases = [
      'Beef',
      'Chicken',
      'Pork',
      'Salmon',
      'Tofu',
      'Eggplant',
      'Shrimp',
      'Mushrooms',
      'Cabbage',
      'Broccoli',
      'Tomatoes',
      'Potatoes',
      'Spinach',
      'Pumpkin',
      'Eggs',
    ];

    const recipes = [];
    const usedNames = new Set();

    let adjIndex = 0;
    let methodIndex = 0;
    let baseIndex = 0;

    while (recipes.length < 1050) {
      const adj = adjectives[adjIndex];
      const method = methods[methodIndex];
      const base = bases[baseIndex];

      const name = `${adj} ${method} ${base}`;

      if (!usedNames.has(name)) {
        usedNames.add(name);

        const durationMinutes = Math.floor(Math.random() * 51) + 10; // 10 to 60 minutes
        const cookingTime = `${durationMinutes} mins`;

        const ingredients = [
          base,
          ...getRandomElements(
            [
              'Garlic',
              'Ginger',
              'Green Onion',
              'Chili Pepper',
              'Soy Sauce',
              'Sesame Oil',
              'Olive Oil',
              'Black Pepper',
              'White Pepper',
              'Sugar',
              'Salt',
              'Basil',
              'Cilantro',
              'Rice Wine',
              'Vinegar',
            ],
            Math.floor(Math.random() * 3) + 2
          ),
        ];

        const steps = [
          `Wash the ${base.toLowerCase()} and cut into bite-sized pieces.`,
          `Prepare the seasoning ingredients: ${ingredients.slice(1).join(', ')}.`,
          `Heat a small amount of oil in a pan and sauté the aromatics until fragrant.`,
          `Add the ${base.toLowerCase()} along with the seasonings to cook using a ${method.toLowerCase()} style.`,
          `Cook until the dish is thoroughly done, garnish with fresh herbs, and serve hot.`,
        ];

        recipes.push({
          name,
          cookingTime,
          ingredients,
          steps,
        });
      }

      baseIndex++;
      if (baseIndex >= bases.length) {
        baseIndex = 0;
        methodIndex++;
        if (methodIndex >= methods.length) {
          methodIndex = 0;
          adjIndex++;
          if (adjIndex >= adjectives.length) {
            adjIndex = 0;
          }
        }
      }
    }

    console.log(`Inserting ${recipes.length} recipes...`);
    const insertResult = await db.collection('recipes').insertMany(recipes);

    // Complete log
    await db.collection('system_logs').insertOne({
      action: 'DATABASE_SEED_COMPLETE',
      timestamp: new Date(),
      count: insertResult.insertedCount,
      details: 'Successfully seeded recipes.',
    });

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

runSeed();
