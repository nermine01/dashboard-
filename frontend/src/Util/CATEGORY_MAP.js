export const CATEGORY_MAP = {
    low_stock: {
      type: "critical",
      tags: ["High Priority", "Inventory", "Low Stock"],
    },
    shrinkage: {
      type: "warning",
      tags: ["High Priority", "Inventory", "Shrinkage"],
    },
    near_expiration: { type: "warning", tags: ["Inventory", "Expiration"] },
    near_end_of_life: { type: "info", tags: ["Inventory", "Lifecycle"] },
    sufficient_stock: { type: "info", tags: ["Inventory", "OK"] },
    stocktaking: { type: "warning", tags: ["Inventory", "Stocktaking"] },
    product_recall: { type: "critical", tags: ["Recall", "Urgent"] },
    overstock: { type: "info", tags: ["Inventory", "Overstock"] },
    forecast: { type: "critical", tags: ["High Priority", "forecast"] },
  };