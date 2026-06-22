/**
 * Refrigerator Saver - Core Client Application Logic
 * Implements CSR (Client-Side Rendering) with pure Vanilla JavaScript
 */

// Global State
let globalRecipes = [];
const activeIngredientFilters = new Set();
let currentSearchQuery = '';

// Active Modal State
let modalMode = 'new'; // 'new' or 'edit'
let activeEditRecipeId = null;
let modalIngredients = [];

// DOM Elements
const elements = {
  recipeGrid: document.getElementById('recipe-grid'),
  emptyState: document.getElementById('empty-state'),
  searchInput: document.getElementById('search-input'),
  filterChipsContainer: document.getElementById('filter-chips-container'),
  btnNewRecipe: document.getElementById('btn-new-recipe'),

  // Modal Elements
  recipeModal: document.getElementById('recipe-modal'),
  modalTitle: document.getElementById('modal-title'),
  btnModalClose: document.getElementById('btn-modal-close'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  recipeForm: document.getElementById('recipe-form'),
  formRecipeId: document.getElementById('form-recipe-id'),
  formRecipeName: document.getElementById('form-recipe-name'),
  formRecipeTime: document.getElementById('form-recipe-time'),
  formIngredientInput: document.getElementById('form-ingredient-input'),
  btnAddIngredient: document.getElementById('btn-add-ingredient'),
  formIngredientsChips: document.getElementById('form-ingredients-chips'),
  formStepsContainer: document.getElementById('form-steps-container'),
  btnAddStep: document.getElementById('btn-add-step'),
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchRecipes();
});

// ==========================================================================
// EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Search Keyup handler with simple debounce/throttling
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearchQuery = e.target.value.trim();
      fetchRecipes(); // Re-fetch with search filter applied
    }, 250);
  });

  // Modal Open Trigger
  elements.btnNewRecipe.addEventListener('click', () => {
    openRecipeModal('new');
  });

  // Modal Close Triggers
  elements.btnModalClose.addEventListener('click', closeRecipeModal);
  elements.btnModalCancel.addEventListener('click', closeRecipeModal);

  // Close modal when clicking on background backdrop
  elements.recipeModal.addEventListener('click', (e) => {
    if (e.target === elements.recipeModal) {
      closeRecipeModal();
    }
  });

  // Form Ingredients Adder
  elements.btnAddIngredient.addEventListener('click', handleAddFormIngredient);
  elements.formIngredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFormIngredient();
    }
  });

  // Form Steps Row Adder
  elements.btnAddStep.addEventListener('click', () => {
    addStepInputRow('');
  });

  // Form Submit handler
  elements.recipeForm.addEventListener('submit', handleFormSubmit);

  // Global document click handler to close active three-dot dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.card-dropdown');
    dropdowns.forEach((dropdown) => {
      const cardMenuContainer = dropdown.closest('.card-menu-container');
      if (cardMenuContainer && !cardMenuContainer.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  });
}

// ==========================================================================
// DATA FETCHING & FILTER PROCESSING
// ==========================================================================
async function fetchRecipes() {
  try {
    // Incorporate the search term in API request if query is active
    let url = '/api/recipes';
    if (currentSearchQuery) {
      url += `?search=${encodeURIComponent(currentSearchQuery)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    globalRecipes = await response.json();

    // Extract unique ingredients list to populate filtering chips
    updateFilterChipsPanel();

    // Render current dataset
    renderRecipes();
  } catch (error) {
    console.error('Failed to load recipes:', error);
    elements.recipeGrid.innerHTML = `<div class="error-panel" style="grid-column: 1 / -1; padding: 20px; text-align: center; border: 3px solid var(--primary-forest); border-radius: var(--border-radius-lg); font-weight: 700;">Error loading recipes from database. Please ensure your backend server and MongoDB connection are active.</div>`;
  }
}

// Extract ingredients dynamically from all fetched recipes to make filter chips
function updateFilterChipsPanel() {
  const allIngredientsSet = new Set();

  // Collect all ingredients from the active recipe list
  globalRecipes.forEach((recipe) => {
    if (Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        if (ing) allIngredientsSet.add(ing.trim());
      });
    }
  });

  const uniqueIngredients = Array.from(allIngredientsSet).sort();

  // Save current active filters that might no longer exist in the new dataset
  const currentActive = Array.from(activeIngredientFilters);
  activeIngredientFilters.clear();
  currentActive.forEach((ing) => {
    if (uniqueIngredients.includes(ing)) {
      activeIngredientFilters.add(ing);
    }
  });

  // Render filter chips
  elements.filterChipsContainer.innerHTML = '';

  if (uniqueIngredients.length === 0) {
    elements.filterChipsContainer.innerHTML =
      '<span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">No ingredients available.</span>';
    return;
  }

  uniqueIngredients.forEach((ingredient) => {
    const chipButton = document.createElement('button');
    chipButton.type = 'button';
    chipButton.className = 'filter-chip';
    if (activeIngredientFilters.has(ingredient)) {
      chipButton.classList.add('active');
    }
    chipButton.textContent = ingredient;

    chipButton.addEventListener('click', () => {
      if (activeIngredientFilters.has(ingredient)) {
        activeIngredientFilters.delete(ingredient);
        chipButton.classList.remove('active');
      } else {
        activeIngredientFilters.add(ingredient);
        chipButton.classList.add('active');
      }
      renderRecipes();
    });

    elements.filterChipsContainer.appendChild(chipButton);
  });
}

// ==========================================================================
// RENDERING CARDS GRID
// ==========================================================================
function renderRecipes() {
  // Apply local filtering based on sidebar chips selection
  let filteredList = globalRecipes;

  if (activeIngredientFilters.size > 0) {
    filteredList = globalRecipes.filter((recipe) => {
      // Recipe must contain ALL selected active ingredients
      return Array.from(activeIngredientFilters).every((filterIng) =>
        recipe.ingredients.some(
          (recipeIng) => recipeIng.toLowerCase() === filterIng.toLowerCase()
        )
      );
    });
  }

  // Clear Grid container
  elements.recipeGrid.innerHTML = '';

  if (filteredList.length === 0) {
    elements.emptyState.style.display = 'block';
    return;
  }

  elements.emptyState.style.display = 'none';

  filteredList.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';
    card.dataset.id = recipe._id;

    // Build ingredient tags HTML
    const ingredientsHtml = (recipe.ingredients || [])
      .map((ing) => `<span class="ingredient-badge">${escapeHTML(ing)}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-menu-container">
        <button type="button" class="btn-three-dots" aria-label="Open menu">&#8942;</button>
        <div class="card-dropdown">
          <button type="button" class="btn-dropdown-item edit-action">
            <svg style="width: 14px; height: 14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Recipe
          </button>
          <button type="button" class="btn-dropdown-item delete-item delete-action">
            <svg style="width: 14px; height: 14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Recipe
          </button>
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(recipe.name)}</h3>
        <div class="card-time">
          <svg class="card-time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>${escapeHTML(recipe.cookingTime)}</span>
        </div>
      </div>
      <div class="card-ingredients">
        ${ingredientsHtml}
      </div>
    `;

    // Hook events inside the recipe card
    const btnThreeDots = card.querySelector('.btn-three-dots');
    const dropdown = card.querySelector('.card-dropdown');
    const btnEdit = card.querySelector('.edit-action');
    const btnDelete = card.querySelector('.delete-action');

    // Click on three dots opens menu
    btnThreeDots.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close all other dropdown menus first
      document.querySelectorAll('.card-dropdown').forEach((d) => {
        if (d !== dropdown) d.classList.remove('active');
      });
      dropdown.classList.toggle('active');
    });

    // Edit action trigger
    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('active');
      openRecipeModal('edit', recipe._id);
    });

    // Delete action trigger
    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('active');
      handleDeleteRecipe(recipe._id, recipe.name);
    });

    elements.recipeGrid.appendChild(card);
  });
}

// ==========================================================================
// RECIPE DELETION HANDLER
// ==========================================================================
async function handleDeleteRecipe(recipeId, recipeName) {
  if (confirm(`Are you sure you want to delete the recipe "${recipeName}"?`)) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete recipe. Status: ${response.status}`);
      }

      // Re-fetch datasets
      fetchRecipes();
    } catch (error) {
      console.error('Delete operation failed:', error);
      alert('Failed to delete recipe. Check console logs for details.');
    }
  }
}

// ==========================================================================
// MODAL WORKFLOW & FORM ACTIONS
// ==========================================================================
function openRecipeModal(mode, recipeId = null) {
  modalMode = mode;
  activeEditRecipeId = recipeId;
  modalIngredients = [];

  // Clear any existing invalid state layouts
  clearValidationState();

  // Reset/Empty steps fields
  elements.formStepsContainer.innerHTML = '';

  if (mode === 'new') {
    elements.formRecipeId.value = '';
    elements.formRecipeName.value = '';
    elements.formRecipeTime.value = '';
    elements.formIngredientInput.value = '';
    elements.formIngredientsChips.innerHTML = '';

    // Add one default empty step input row to begin
    addStepInputRow('');
  } else if (mode === 'edit') {
    const recipe = globalRecipes.find((r) => r._id === recipeId);
    if (!recipe) {
      alert('Error fetching recipe from memory.');
      return;
    }

    elements.formRecipeId.value = recipe._id;
    elements.formRecipeName.value = recipe.name;
    elements.formRecipeTime.value = recipe.cookingTime;
    elements.formIngredientInput.value = '';

    // Populate ingredients chips from item
    modalIngredients = [...(recipe.ingredients || [])];
    renderFormIngredientsChips();

    // Populate steps rows
    const steps = recipe.steps || [];
    if (steps.length === 0) {
      addStepInputRow('');
    } else {
      steps.forEach((stepText) => {
        addStepInputRow(stepText);
      });
    }
  }

  // Display backdrop screen
  elements.recipeModal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Lock main scrolling window
}

function closeRecipeModal() {
  elements.recipeModal.style.display = 'none';
  document.body.style.overflow = ''; // Release window scroll lock
}

// Add an ingredient chip to the modal list
function handleAddFormIngredient() {
  const val = elements.formIngredientInput.value.trim();
  if (val) {
    // Prevent duplicate ingredient tags within the same recipe
    if (
      !modalIngredients.some((ing) => ing.toLowerCase() === val.toLowerCase())
    ) {
      modalIngredients.push(val);
      renderFormIngredientsChips();
    }
    elements.formIngredientInput.value = '';
    elements.formIngredientInput.focus();
  }
}

// Remove ingredient chip from list
function removeFormIngredientChip(index) {
  modalIngredients.splice(index, 1);
  renderFormIngredientsChips();
}

// Render dynamic chips for modal form
function renderFormIngredientsChips() {
  elements.formIngredientsChips.innerHTML = '';
  modalIngredients.forEach((ing, index) => {
    const chip = document.createElement('span');
    chip.className = 'form-chip';
    chip.innerHTML = `
      <button type="button" class="btn-delete-chip" aria-label="Remove ingredient">X</button>
      <span>${escapeHTML(ing)}</span>
    `;

    // Wire delete button
    chip.querySelector('.btn-delete-chip').addEventListener('click', () => {
      removeFormIngredientChip(index);
    });

    elements.formIngredientsChips.appendChild(chip);
  });
}

// Append a new dynamic step input row inside the steps stack
function addStepInputRow(initialText = '') {
  const rowCount = elements.formStepsContainer.children.length;
  const stepNumber = rowCount + 1;

  const row = document.createElement('div');
  row.className = 'step-row-item';
  row.innerHTML = `
    <span class="step-number-badge">Step ${stepNumber}</span>
    <input type="text" placeholder="Describe this cooking step..." value="${escapeHTML(initialText)}" required />
    <button type="button" class="btn-delete-step-row" aria-label="Delete step row">&times;</button>
  `;

  // Bind delete action
  row.querySelector('.btn-delete-step-row').addEventListener('click', () => {
    row.remove();
    reindexStepNumbers();
  });

  elements.formStepsContainer.appendChild(row);
}

// Re-adjust numbers (Step 1, Step 2, etc.) when rows are dynamically removed
function reindexStepNumbers() {
  const rows = elements.formStepsContainer.querySelectorAll('.step-row-item');
  rows.forEach((row, index) => {
    const label = row.querySelector('.step-number-badge');
    if (label) label.textContent = `Step ${index + 1}`;
  });
}

// ==========================================================================
// FORM SUBMISSION & VALIDATION
// ==========================================================================
async function handleFormSubmit(e) {
  e.preventDefault();

  clearValidationState();

  const name = elements.formRecipeName.value.trim();
  const cookingTime = elements.formRecipeTime.value.trim();

  // Extract steps from input elements
  const steps = [];
  const stepInputs = elements.formStepsContainer.querySelectorAll(
    '.step-row-item input[type="text"]'
  );
  stepInputs.forEach((input) => {
    const val = input.value.trim();
    if (val) steps.push(val);
  });

  // Client-Side validation flags
  let isValid = true;

  if (!name) {
    elements.formRecipeName.parentElement.classList.add('invalid');
    isValid = false;
  }
  if (!cookingTime) {
    elements.formRecipeTime.parentElement.parentElement.classList.add(
      'invalid'
    );
    isValid = false;
  }
  if (modalIngredients.length === 0) {
    elements.formIngredientsChips.parentElement.classList.add('invalid');
    isValid = false;
  }
  if (steps.length === 0) {
    elements.formStepsContainer.parentElement.classList.add('invalid');
    isValid = false;
  }

  if (!isValid) return;

  const payload = {
    name,
    cookingTime,
    ingredients: modalIngredients,
    steps,
  };

  try {
    let response;

    if (modalMode === 'new') {
      response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      response = await fetch(`/api/recipes/${activeEditRecipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errRes = await response.json();
      throw new Error(
        errRes.error || `Server failed response: ${response.status}`
      );
    }

    // Success: Close modal and refresh recipe catalog without reloading the page
    closeRecipeModal();
    fetchRecipes();
  } catch (error) {
    console.error('Failed to submit form data:', error);
    alert(`Failed to save recipe: ${error.message}`);
  }
}

// Reset error layouts
function clearValidationState() {
  const invalidGroups = document.querySelectorAll('.form-group.invalid');
  invalidGroups.forEach((grp) => grp.classList.remove('invalid'));
}

// ==========================================================================
// UTILITIES
// ==========================================================================
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
