# Refrigerator Saver (Project 2)

An interactive recipe management dashboard designed to reduce household food waste by matching available ingredients to delicious meals.

**Author**: Wu Hung Hsiao & Logan  
**Class Link**: [CS 5610 Web Development](https://johnguerra.co/classes/webDevelopment_online_summer_2026/)  
**Public Page (Deployed URL)**: [Refrigerator Saver](https://refrigerator-saver.onrender.com)

---

## Project Objective

Refrigerator Saver is a full-stack recipe management web app that helps students find meals based on ingredients they already have in their fridge. Users can search and filter recipes by keyword or ingredient, while admins can create, edit, and delete recipes through an inline card menu and a structured form — all backed by a Node/Express/MongoDB stack.

---

## Short User Personas

- **Kevin**: A Northeastern student juggling classes and part-time work. His fridge is full of random leftover ingredients, and he needs to find a quick, practical meal he can cook in under 20 minutes before heading to his next class — without having to Google through endless recipe blogs.
- **Elena**: A web administrator responsible for maintaining the quality of the shared recipe database. When she spots a recipe with incorrect ingredients, wrong cooking time, or missing steps, she needs to be able to jump in and fix it immediately — or remove it entirely — without any technical friction.

---

## User Stories

- **As Kevin**, I want to search recipes by keyword and filter by ingredients, so I can quickly find something I can cook with what I already have.
- **As Elena**, I want to open a recipe card's menu to edit or delete it, and use the "+ New Recipe" form to add a new one with ingredients and steps, so the database stays accurate.

---

## Work Distribution (Independent)

- **@Logan**: Search & filter — keyword search bar + ingredient chip filtering, fetches matching recipes from MongoDB without page refresh. Includes all associated frontend and backend routes.
- **@Wu Hung Hsiao**: Recipe management — three-dot menu (edit/delete) on each card + the create/edit recipe form that writes to MongoDB. Includes all associated frontend and backend routes.

---

## Screenshot

<img width="3426" height="1986" alt="CleanShot 2026-06-23 at 15 56 44@2x" src="https://github.com/user-attachments/assets/56f1ef48-41c8-4ad3-b328-54d2518df0b1" />

---

## Tech Requirements / Tech Stack

- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Modular Layouts, Flexbox, Grid), Vanilla JS (ES6 Modules), Fetch API
- **Backend**: Node.js + Express (strictly ES Modules, no CommonJS/`require`)
- **Database**: MongoDB (Native Driver, no Mongoose/templates)
- **Quality Tools**: ESLint (v8), Prettier

---

## Build And Run Instructions

### Prerequisites

- Node.js
- A running MongoDB instance

### 1. Clone & Set Up Directory

```bash
git clone https://github.com/wuhong4088/Refrigerator-Saver.git
cd Refrigerator-Saver
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```ini
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/refrigerator_saver
PORT=3000
```

### 3. Seed Database

This script inserts 1,050 mock recipes and writes the seeding logs to the `system_logs` collection:

```bash
npm run seed
```

### 4. Run the Server

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### 5. Developer Quality Checks

```bash
# Run ESLint check
npm run lint

# Format code with Prettier
npm run format
```

---

## Design Document

The design document is available in [DESIGN.md](file:///Users/hung/Desktop/git/Refrigerator-Saver/DESIGN.md). It includes detail project definitions, full user personas, scenarios, and wireframe layouts.

---

## Submission Links

- **Deployed URL**: [Refrigerator Saver](https://refrigerator-saver.onrender.com)

---

## GenAI Disclosure

Generative AI was used as an assistant during this project. AI support was primarily used to help write, structure, and format the project documentation, including the README and the Design Document, as well as to verify that the implementation complies with the assignment rubric.
It was also used to help with debugging, especially later in the project after more code had been written.

---

## License

This project is licensed under the MIT License - see the [LICENSE](file:///Users/hung/Desktop/git/Refrigerator-Saver/LICENSE) file for details.
