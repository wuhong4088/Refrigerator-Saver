# Project 2: Design Document

## 1. Project Description

Refrigerator Saver is an interactive, full-stack recipe management web application designed to reduce household food waste. By matching available ingredients to a database of delicious meals, the application helps users answer the daily question: _"What can I cook with what I already have?"_

The project features a responsive single-page Client-Side Rendered (CSR) dashboard supported by a Node/Express backend and MongoDB.

### Core Features:

- **Fuzzy Keyword Search**: Real-time filtering of recipes by title or ingredients without page refreshes.
- **Dynamic Ingredient Chips Filter**: Interactive tag-based selection that aggregates unique ingredients from the active list to filter recipe cards instantly.
- **Three-Dots Action Menu**: Contextual inline menu toggles (`⋮`) on every recipe card allowing administrators to edit or delete records.
- **Interactive Recipe Form Modal**: A centered overlay form featuring dynamic tags creation (with delete triggers on the left) and step-by-step cooking instruction input rows.
- **Cloud Seeding Log**: Complete seed script that populates 1,050 recipe records and writes execution logs directly to MongoDB `system_logs`.

---

## 2. User Personas

### Persona 1: Kevin (The Busy Student)

- **Background**: A Northeastern student juggling classes and part-time work. His fridge is full of random leftover ingredients.
- **Goals / Needs**: Needs to find quick, practical meals he can cook in under 20 minutes before heading to his next class — without having to Google through endless recipe blogs.

### Persona 2: Chef Elena (The Site Admin)

- **Background**: A web administrator responsible for maintaining the quality of the shared recipe database.
- **Goals / Needs**: When she spots a recipe with incorrect ingredients, wrong cooking time, or missing steps, she needs to be able to jump in and fix it immediately — or remove it entirely — without any technical friction.

---

## 3. User Stories

### For Kevin (General Users)

- As Kevin, I want to search recipes by keyword so that I can quickly find a specific dish.
- As Kevin, I want to filter recipes by selecting multiple ingredient chips so that I can cook with what I already have.
- As Kevin, I want to view the cooking time on each recipe card so that I can select a meal that fits my busy schedule.
- As Kevin, I want to read clear, numbered step-by-step instructions so that I can prepare the meal without confusion.

### For Elena (Site Administrator)

- As Elena, I want to click a three-dots menu on any recipe card so that I can manage that specific entry.
- As Elena, I want to click "Edit Recipe" to open a pre-filled form so that I can update incorrect information.
- As Elena, I want to click "Delete Recipe" and confirm the action so that I can remove poor quality entries.
- As Elena, I want to click "+ New Recipe" to open a blank form so that I can insert fresh recipe ideas into the database.
- As Elena, I want to add ingredient tags and step rows dynamically in the form so that I can represent complex recipes easily.

---

## 4. Mockups & Wireframes

### Main Dashboard Page (index.html)

The dashboard uses a clean single-column structure designed for ease of use and responsive scaling.

#### Wireframe Diagram:

```
+-------------------------------------------------------------+
|                     REFRIGERATOR SAVER                      |
+-------------------------------------------------------------+
|                                                             |
|  +----------------------------+   +----------------------+  |
|  | search all recipes         |   |     + new recipe     |  |
|  +----------------------------+   +----------------------+  |
|                                                             |
|  Filter by Ingredient:                                      |
|  [ Beef ]  [ Garlic ]  [ Tomato ]  [ Onion ]  [ Soy Sauce ] |
|  ---------------------------------------------------------  |
|                                                             |
|  +-------------------+  +-------------------+  +----------+ |
|  | Classic Beef  (...) |  | Garlic Tofu   (...) |  | Recipe   | |
|  | 25 mins           |  | 15 mins           |  |          | |
|  |                   |  |                   |  |          | |
|  | [Beef] [Garlic]   |  | [Tofu] [Garlic]   |  |          | |
|  +-------------------+  +-------------------+  +----------+ |
|                                                             |
+-------------------------------------------------------------+
```

---

### Recipe Form Modal Overlay (recipe-modal)

The modal covers the dashboard with a blurred backdrop overlay to focus attention on form entry.

#### Wireframe Diagram:

```
+-------------------------------------------------------------+
|                                                             |
|  +-------------------------------------------------------+  |
|  | REFRIGERATOR SAVER                                 X  |  |
|  +-------------------------------------------------------+  |
|  | Recipe Name                                           |  |
|  | [ Recipe Name...                                    ] |  |
|  |                                                       |  |
|  | Cooking time                                          |  |
|  | [ 00:00 (e.g. 25 mins)                              ] |  |
|  |                                                       |  |
|  | Ingredients                                           |  |
|  | [ Ingredients...                             ]  [ + ] |  |
|  |  (X) Beef    (X) Garlic   (X) Soy Sauce               |  |
|  |                                                       |  |
|  | Steps                                                 |  |
|  |  Step 1: [ Wash the beef...                         ] |  |
|  |  Step 2: [ Marinate with soy sauce...               ] |  |
|  |  [ + add step ]                                       |  |
|  |                                                       |  |
|  | ----------------------------------------------------- |  |
|  |                                [ Cancel ] [ + Save ]  |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```
