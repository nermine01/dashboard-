export function getReadAlertsFromStorage() {
  const stored = localStorage.getItem("readAlerts");
  return stored ? JSON.parse(stored) : [];
}

export function saveReadAlertToStorage(id) {
  const readAlerts = getReadAlertsFromStorage();
  if (!readAlerts.includes(id)) {
    readAlerts.push(id);
    localStorage.setItem("readAlerts", JSON.stringify(readAlerts));
  }
}
