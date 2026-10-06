// In-memory data store for the CraftCircle prototype.
// Replaces MongoDB entirely — all data lives in this process's memory and
// resets whenever the server restarts. Good for a quick working prototype;
// swap this module out for a real database when you're ready to persist data.

const store = {
  users: [],
  tutorials: [],
  products: [],
  carts: [],
  orders: [],
};

module.exports = store;
