// main.js - frontend logic

let globalRecipes = [];
const activeIngredientFilters = new Set();
let currentSearchQuery = '';

let modalMode = 'new';
let activeEditRecipeId = null;
let modalIngredients = [];

// DOM elements
const recipeGrid = document.getElementById('recipe-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterChipsContainer = document.getElementById('filter-chips-container');
const btnNewRecipe = document.getElementById('btn-new-recipe');

const recipeModal = document.getElementById('recipe-modal');
const btnModalClose = document.getElementById('btn-modal-close');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const recipeForm = document.getElementById('recipe-form');
const formRecipeId = document.getElementById('form-recipe-id');
const formRecipeName = document.getElementById('form-recipe-name');
const formRecipeTime = document.getElementById('form-recipe-time');
const formIngredientInput = document.getElementById('form-ingredient-input');
const btnAddIngredient = document.getElementById('btn-add-ingredient');
const formIngredientsChips = document.getElementById('form-ingredients-chips');
const formStepsContainer = document.getElementById('form-steps-container');
const btnAddStep = document.getElementById('btn-add-step');

// Init
setupEventListeners();
fetchRecipes();
setupLogsPanel();

function setupEventListeners() {
  // ===== LOGAN SEARCH PART START =====
  // Hey Logan, this is where your search input logic goes.
  // I set up a quick 250ms delay so it doesn't spam the server.
  // It calls fetchRecipes() which already handles the API query string.
  // Feel free to modify or replace this block!
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearchQuery = e.target.value.trim();
      fetchRecipes();
    }, 250);
  });
  // ===== LOGAN SEARCH PART END =====

  btnNewRecipe.addEventListener('click', () => {
    openRecipeModal('new');
  });

  btnModalClose.addEventListener('click', closeRecipeModal);
  btnModalCancel.addEventListener('click', closeRecipeModal);

  recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
      closeRecipeModal();
    }
  });

  btnAddIngredient.addEventListener('click', handleAddFormIngredient);
  formIngredientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFormIngredient();
    }
  });

  btnAddStep.addEventListener('click', () => {
    addStepInputRow('');
  });

  recipeForm.addEventListener('submit', handleFormSubmit);

  // Close dropdowns if clicking outside
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

// Fetch data from backend
async function fetchRecipes() {
  try {
    let url = '/api/recipes';
    if (currentSearchQuery) {
      url += `?search=${encodeURIComponent(currentSearchQuery)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Status error: ${response.status}`);
    }

    globalRecipes = await response.json();
    updateFilterChipsPanel();
    renderRecipes();
  } catch (error) {
    console.error('Fetch error:', error);
    recipeGrid.innerHTML = `<div class="error-panel" style="grid-column: 1 / -1; padding: 20px; text-align: center; border: 3px solid var(--primary-forest); border-radius: 16px; font-weight: 700;">Error loading recipes. Please check server connection.</div>`;
  }
}

// ===== LOGAN FILTER CHIPS START =====
// Logan, this function renders the ingredient chips right below the search bar.
// It collects unique ingredients from the active recipes list and makes them buttons.
// Feel free to replace this with your own styling or implementation!
function updateFilterChipsPanel() {
  const allIngredientsSet = new Set();

  globalRecipes.forEach((recipe) => {
    if (Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing) => {
        if (ing) allIngredientsSet.add(ing.trim());
      });
    }
  });

  const uniqueIngredients = Array.from(allIngredientsSet).sort();

  const currentActive = Array.from(activeIngredientFilters);
  activeIngredientFilters.clear();
  currentActive.forEach((ing) => {
    if (uniqueIngredients.includes(ing)) {
      activeIngredientFilters.add(ing);
    }
  });

  filterChipsContainer.innerHTML = '';

  if (uniqueIngredients.length === 0) {
    filterChipsContainer.innerHTML =
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

    filterChipsContainer.appendChild(chipButton);
  });
}
// ===== LOGAN FILTER CHIPS END =====

// Render recipes on the page
function renderRecipes() {
  // ===== LOGAN CARD FILTERING START =====
  // Logan, this handles filtering the recipes locally based on the chips clicked.
  // It filters out any recipes that don't match the selected ingredients.
  // Feel free to update how this array filtering works!
  let filteredList = globalRecipes;

  if (activeIngredientFilters.size > 0) {
    filteredList = globalRecipes.filter((recipe) => {
      return Array.from(activeIngredientFilters).every((filterIng) =>
        recipe.ingredients.some(
          (recipeIng) => recipeIng.toLowerCase() === filterIng.toLowerCase()
        )
      );
    });
  }
  // ===== LOGAN CARD FILTERING END =====

  recipeGrid.innerHTML = '';

  if (filteredList.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  filteredList.forEach((recipe) => {
    const card = document.createElement('article');
    card.className = 'recipe-card';
    card.dataset.id = recipe._id;

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

    const btnThreeDots = card.querySelector('.btn-three-dots');
    const dropdown = card.querySelector('.card-dropdown');
    const btnEdit = card.querySelector('.edit-action');
    const btnDelete = card.querySelector('.delete-action');

    btnThreeDots.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-dropdown').forEach((d) => {
        if (d !== dropdown) d.classList.remove('active');
      });
      dropdown.classList.toggle('active');
    });

    btnEdit.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('active');
      openRecipeModal('edit', recipe._id);
    });

    btnDelete.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.remove('active');
      handleDeleteRecipe(recipe._id, recipe.name);
    });

    recipeGrid.appendChild(card);
  });
}

// Delete recipe
async function handleDeleteRecipe(recipeId, recipeName) {
  if (confirm(`Are you sure you want to delete "${recipeName}"?`)) {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      showToast('Recipe deleted successfully!');
      logUserAction('RECIPE_DELETE', `Deleted recipe: ${recipeName}`);
      fetchRecipes();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete recipe.');
    }
  }
}

// Modal logic
function openRecipeModal(mode, recipeId = null) {
  modalMode = mode;
  activeEditRecipeId = recipeId;
  modalIngredients = [];

  clearValidationState();
  formStepsContainer.innerHTML = '';

  if (mode === 'new') {
    formRecipeId.value = '';
    formRecipeName.value = '';
    formRecipeTime.value = '';
    formIngredientInput.value = '';
    formIngredientsChips.innerHTML = '';

    addStepInputRow('');
  } else if (mode === 'edit') {
    const recipe = globalRecipes.find((r) => r._id === recipeId);
    if (!recipe) return;

    formRecipeId.value = recipe._id;
    formRecipeName.value = recipe.name;
    formRecipeTime.value = recipe.cookingTime;
    formIngredientInput.value = '';

    modalIngredients = [...(recipe.ingredients || [])];
    renderFormIngredientsChips();

    const steps = recipe.steps || [];
    if (steps.length === 0) {
      addStepInputRow('');
    } else {
      steps.forEach((stepText) => {
        addStepInputRow(stepText);
      });
    }
  }

  recipeModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
  recipeModal.style.display = 'none';
  document.body.style.overflow = '';
}

// Add ingredient tag
function handleAddFormIngredient() {
  const val = formIngredientInput.value.trim();
  if (val) {
    if (
      !modalIngredients.some((ing) => ing.toLowerCase() === val.toLowerCase())
    ) {
      modalIngredients.push(val);
      renderFormIngredientsChips();
    }
    formIngredientInput.value = '';
    formIngredientInput.focus();
  }
}

// Remove ingredient tag
function removeFormIngredientChip(index) {
  modalIngredients.splice(index, 1);
  renderFormIngredientsChips();
}

// Show ingredient chips in form
function renderFormIngredientsChips() {
  formIngredientsChips.innerHTML = '';
  modalIngredients.forEach((ing, index) => {
    const chip = document.createElement('span');
    chip.className = 'form-chip';
    chip.innerHTML = `
      <button type="button" class="btn-delete-chip" aria-label="Remove">X</button>
      <span>${escapeHTML(ing)}</span>
    `;

    chip.querySelector('.btn-delete-chip').addEventListener('click', () => {
      removeFormIngredientChip(index);
    });

    formIngredientsChips.appendChild(chip);
  });
}

// Add dynamic step input
function addStepInputRow(initialText = '') {
  const rowCount = formStepsContainer.children.length;
  const stepNumber = rowCount + 1;

  const row = document.createElement('div');
  row.className = 'step-row-item';
  row.innerHTML = `
    <span class="step-number-badge">Step ${stepNumber}</span>
    <input type="text" placeholder="Describe this cooking step..." value="${escapeHTML(initialText)}" required />
    <button type="button" class="btn-delete-step-row" aria-label="Delete">&times;</button>
  `;

  row.querySelector('.btn-delete-step-row').addEventListener('click', () => {
    row.remove();
    reindexStepNumbers();
  });

  formStepsContainer.appendChild(row);
}

// Re-number steps
function reindexStepNumbers() {
  const rows = formStepsContainer.querySelectorAll('.step-row-item');
  rows.forEach((row, index) => {
    const label = row.querySelector('.step-number-badge');
    if (label) label.textContent = `Step ${index + 1}`;
  });
}

// Submit form
async function handleFormSubmit(e) {
  e.preventDefault();
  clearValidationState();

  const name = formRecipeName.value.trim();
  const cookingTime = formRecipeTime.value.trim();

  const steps = [];
  const stepInputs = formStepsContainer.querySelectorAll(
    '.step-row-item input[type="text"]'
  );
  stepInputs.forEach((input) => {
    const val = input.value.trim();
    if (val) steps.push(val);
  });

  let isValid = true;

  if (!name) {
    formRecipeName.parentElement.classList.add('invalid');
    isValid = false;
  }
  if (!cookingTime) {
    formRecipeTime.parentElement.parentElement.classList.add('invalid');
    isValid = false;
  }
  if (modalIngredients.length === 0) {
    formIngredientsChips.parentElement.classList.add('invalid');
    isValid = false;
  }
  if (steps.length === 0) {
    formStepsContainer.parentElement.classList.add('invalid');
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
      throw new Error(errRes.error || `Error status: ${response.status}`);
    }

    showToast(
      modalMode === 'new'
        ? 'Recipe created successfully!'
        : 'Recipe updated successfully!'
    );
    logUserAction(
      modalMode === 'new' ? 'RECIPE_CREATE' : 'RECIPE_UPDATE',
      `${modalMode === 'new' ? 'Created' : 'Updated'} recipe: ${name}`
    );
    closeRecipeModal();
    fetchRecipes();
  } catch (error) {
    console.error('Submit error:', error);
    alert(`Failed to save: ${error.message}`);
  }
}

// Clear input errors
function clearValidationState() {
  const invalidGroups = document.querySelectorAll('.form-group.invalid');
  invalidGroups.forEach((grp) => grp.classList.remove('invalid'));
}

// Escape HTML utility
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Show success toast
function showToast(message) {
  let toast = document.getElementById('success-toast');
  if (toast) toast.remove();

  toast = document.createElement('div');
  toast.id = 'success-toast';
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <svg style="width: 18px; height: 18px; color: #ffffff;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);
  toast.offsetHeight;
  toast.classList.add('visible');

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Logs panel logic
let isLogsOpen = false;

function setupLogsPanel() {
  const btnToggleLogs = document.getElementById('btn-toggle-logs');
  const logsContent = document.getElementById('logs-content');
  const btnAddCustomLog = document.getElementById('btn-add-custom-log');
  const logCustomInput = document.getElementById('log-custom-input');
  const btnClearAllLogs = document.getElementById('btn-clear-all-logs');

  if (!btnToggleLogs || !logsContent) return;

  btnToggleLogs.addEventListener('click', () => {
    isLogsOpen = !isLogsOpen;
    logsContent.style.display = isLogsOpen ? 'block' : 'none';
    if (isLogsOpen) {
      fetchAndRenderLogs();
    }
  });

  btnAddCustomLog.addEventListener('click', async () => {
    const val = logCustomInput.value.trim();
    if (!val) return;

    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'USER_NOTE', details: val }),
      });
      if (response.ok) {
        logCustomInput.value = '';
        fetchAndRenderLogs();
      }
    } catch (err) {
      console.error('Failed to add custom log:', err);
    }
  });

  logCustomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnAddCustomLog.click();
    }
  });

  btnClearAllLogs.addEventListener('click', async () => {
    if (confirm('Clear audit logs history?')) {
      try {
        const res = await fetch('/api/logs');
        const logs = await res.json();
        for (const log of logs) {
          await fetch(`/api/logs/${log._id}`, { method: 'DELETE' });
        }
        fetchAndRenderLogs();
      } catch (err) {
        console.error('Failed to clear logs:', err);
      }
    }
  });
}

async function fetchAndRenderLogs() {
  const logsList = document.getElementById('logs-list');
  if (!logsList) return;

  try {
    const response = await fetch('/api/logs');
    if (!response.ok) throw new Error('Failed to fetch logs');
    const logs = await response.json();

    logsList.innerHTML = '';
    if (logs.length === 0) {
      logsList.innerHTML =
        '<li style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 10px;">No audit logs recorded yet.</li>';
      return;
    }

    logs.forEach((log) => {
      const li = document.createElement('li');
      li.className = 'log-item';
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      li.innerHTML = `
        <div class="log-info-stack">
          <div class="log-badge-row">
            <span class="log-badge-action">${escapeHTML(log.action)}</span>
            <span class="log-time-stamp">${timeStr}</span>
          </div>
          <span class="log-item-details">${escapeHTML(log.details)}</span>
        </div>
        <div class="log-actions-flex">
          <button type="button" class="btn-edit-log-row" title="Edit Log">✏️</button>
          <button type="button" class="btn-delete-log-row" title="Delete Log">&times;</button>
        </div>
      `;

      li.querySelector('.btn-edit-log-row').addEventListener(
        'click',
        async () => {
          const newDetails = prompt('Update log description:', log.details);
          if (newDetails !== null) {
            const trimmed = newDetails.trim();
            if (trimmed) {
              try {
                const res = await fetch(`/api/logs/${log._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ details: trimmed }),
                });
                if (res.ok) fetchAndRenderLogs();
              } catch (err) {
                console.error('Failed to update log:', err);
              }
            }
          }
        }
      );

      li.querySelector('.btn-delete-log-row').addEventListener(
        'click',
        async () => {
          try {
            const res = await fetch(`/api/logs/${log._id}`, {
              method: 'DELETE',
            });
            if (res.ok) fetchAndRenderLogs();
          } catch (err) {
            console.error('Failed to delete log:', err);
          }
        }
      );

      logsList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    logsList.innerHTML =
      '<li style="color: var(--danger-color);">Error loading logs.</li>';
  }
}

async function logUserAction(action, details) {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details }),
    });
    if (isLogsOpen) {
      fetchAndRenderLogs();
    }
  } catch (err) {
    console.error('Logging action failed:', err);
  }
}
