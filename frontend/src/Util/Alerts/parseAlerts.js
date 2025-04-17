import { CATEGORY_MAP } from "../CATEGORY_MAP";

export const parseAlerts = (data, readAlerts) => {
  const parsedAlerts = [];

  for (const category in data.alerts) {
    const categoryAlerts = data.alerts[category];

    categoryAlerts.forEach((alertObj) => {
      const alertText = alertObj.message;

      const stockMatch = alertText.match(/Stock:\s*(\d+)/i);
      const thresholdMatch = alertText.match(
        /\((?:Max|Reorder Point|Ideal):\s*(\d+)\)/i
      );
      const locationMatch = alertText.match(/at (.*?) (?:is|has|detected)/i);
      const productMatch = alertText.match(/ALERT: (.*?) at/i);

      const currentStock = stockMatch ? parseInt(stockMatch[1]) : 0;
      const threshold = thresholdMatch ? parseInt(thresholdMatch[1]) : 0;
      const location = locationMatch ? locationMatch[1] : "Unknown";
      const productName = productMatch ? productMatch[1] : "Unknown";

      parsedAlerts.push({
        id: alertObj.id,
        type: CATEGORY_MAP[category]?.type || "info",
        title: `${category.replace(/_/g, " ")} alert`,
        description: alertText,
        tags:
          CATEGORY_MAP[category]?.tags.map((label) => ({
            label,
            color: label.toLowerCase().replace(/\s+/g, "-"),
          })) || [],
        time: new Date(alertObj.timestamp).toLocaleString(),
        isNew: !readAlerts.includes(alertObj.id),
        currentStock,
        threshold,
        location,
        productName,
        productId: alertObj.product_id,
      });
    });
  }

  return parsedAlerts;
};
