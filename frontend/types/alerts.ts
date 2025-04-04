export interface Alert {
    id: string
    title: string
    description: string
    details?: string
    actionRequired?: string
    category: "inventory" | "sales" | "customer" | "security"
    priority: "low" | "medium" | "high"
    timestamp: string
    read: boolean
  }
  
  