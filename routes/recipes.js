import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db/connector.js';

const router = Router();

// GET /api/recipes - Get all recipes (supports optional search keyword)
router.get('/', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { search } = req.query;
    let filterQuery = {};

    if (search) {
      // Basic text search on name or ingredients for search integration
      filterQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { ingredients: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const recipes = await db.collection('recipes').find(filterQuery).toArray();
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to retrieve recipes.' });
  }
});

// POST /api/recipes - Create a new recipe
router.post('/', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { name, cookingTime, ingredients, steps } = req.body;

    if (
      !name ||
      !cookingTime ||
      !Array.isArray(ingredients) ||
      !Array.isArray(steps)
    ) {
      return res.status(400).json({
        error:
          'Invalid or missing fields. Fields required: name, cookingTime, ingredients, steps.',
      });
    }

    const newRecipe = {
      name,
      cookingTime, // String format (e.g. "25 mins")
      ingredients, // String array
      steps, // String array
      createdAt: new Date(),
    };

    const result = await db.collection('recipes').insertOne(newRecipe);
    res.status(201).json({
      _id: result.insertedId,
      ...newRecipe,
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe.' });
  }
});

// PUT /api/recipes/:id - Update an existing recipe
router.put('/:id', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { id } = req.params;
    const { name, cookingTime, ingredients, steps } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID format.' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (cookingTime !== undefined) updateFields.cookingTime = cookingTime;
    if (ingredients !== undefined) {
      if (!Array.isArray(ingredients)) {
        return res.status(400).json({ error: 'Ingredients must be an array.' });
      }
      updateFields.ingredients = ingredients;
    }
    if (steps !== undefined) {
      if (!Array.isArray(steps)) {
        return res.status(400).json({ error: 'Steps must be an array.' });
      }
      updateFields.steps = steps;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const filter = { _id: new ObjectId(id) };
    const updateResult = await db
      .collection('recipes')
      .updateOne(filter, { $set: updateFields });

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const updatedRecipe = await db.collection('recipes').findOne(filter);
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe.' });
  }
});

// DELETE /api/recipes/:id - Delete a recipe
router.delete('/:id', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID format.' });
    }

    const result = await db
      .collection('recipes')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    res.status(200).json({ message: 'Recipe successfully deleted.' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe.' });
  }
});

export default router;
