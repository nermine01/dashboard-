// Create this file to handle API requests to your FastAPI backend

// Function to fetch alerts from your FastAPI endpoint
export async function fetchAlerts() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost:8000/alerts")
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching alerts:", error)
      throw error
    }
  }
  
  