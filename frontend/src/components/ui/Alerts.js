"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  MoreHorizontal,
} from "lucide-react"


//import Header from "./Header.js";

// Alert card component
const AlertCard = ({ alert, onMarkAsRead, onDismiss }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Get the alert type from the ID (format: "type-index")
  const alertType = alert.id.split("-")[0]

  const getAlertTypeIcon = () => {
    switch (alertType) {
      case "overstock":
        return <Package className="w-5 h-5" />
      case "low_stock":
        return <AlertTriangle className="w-5 h-5" />
      case "shrinkage":
        return <AlertTriangle className="w-5 h-5" />
      case "near_expiration":
        return <Calendar className="w-5 h-5" />
      case "near_end_of_life":
        return <Info className="w-5 h-5" />
      case "sufficient_stock":
        return <CheckCircle className="w-5 h-5" />
      case "stocktaking":
        return <Package className="w-5 h-5" />
      case "product_recall":
        return <AlertTriangle className="w-5 h-5" />
      case "forecast":
        return <ShoppingCart className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getPriorityColor = () => {
    switch (alert.priority) {
      case "high":
        return "text-red-600 bg-red-100"
      case "medium":
        return "text-amber-600 bg-amber-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getCategoryColor = () => {
    switch (alert.category) {
      case "inventory":
        return "bg-purple-100 text-purple-600"
      case "forecast":
        return "bg-blue-100 text-blue-600"
      case "customer":
        return "bg-green-100 text-green-600"
      case "security":
        return "bg-red-100 text-red-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getAlertTypeColor = () => {
    switch (alertType) {
      case "overstock":
        return "bg-blue-100 text-blue-600"
      case "low_stock":
        return "bg-red-100 text-red-600"
      case "shrinkage":
        return "bg-amber-100 text-amber-600"
      case "near_expiration":
        return "bg-orange-100 text-orange-600"
      case "near_end_of_life":
        return "bg-gray-100 text-gray-600"
      case "sufficient_stock":
        return "bg-green-100 text-green-600"
      case "stocktaking":
        return "bg-purple-100 text-purple-600"
      case "product_recall":
        return "bg-red-100 text-red-600"
      case "forecast":
        return "bg-indigo-100 text-indigo-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const formatAlertType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  }

  return (
    <div
      className={`mb-4 overflow-hidden transition-all bg-white rounded-lg shadow border ${!alert.read ? "border-l-4 border-l-blue-500" : "border"}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${getAlertTypeColor()}`}>
              {getAlertTypeIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{alert.title}</h3>
                {!alert.read && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">New</span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{alert.description}</p>
              {expanded && alert.details && (
                <div className="mt-2 text-sm">
                  <p>{alert.details}</p>
                  {alert.actionRequired && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                      <strong>Action required:</strong> {alert.actionRequired}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor()}`}>
                  {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor()}`}>
                  {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getAlertTypeColor()}`}>
                  {formatAlertType(alertType)}
                </span>
                <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            {alert.details && (
              <button
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => navigate(`/alerts/${alert.id}`)}
            >
              Show more
            </button>
            )}
            <div className="relative">
              <button
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  {!alert.read && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        onMarkAsRead(alert.id)
                        setShowDropdown(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as read
                    </button>
                  )}
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onDismiss(alert.id)
                      setShowDropdown(false)
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Alerts component
const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedAlertType, setSelectedAlertType] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  // Use useCallback to memoize the transformApiResponse function
  const transformApiResponse = useCallback((apiAlerts) => {
    const alerts = []
    const now = new Date().toISOString()

    // Map alert types to categories and priorities
    const alertMappings = {
      overstock: { category: "inventory", priority: "medium" },
      low_stock: { category: "inventory", priority: "high" },
      shrinkage: { category: "inventory", priority: "high" },
      near_expiration: { category: "inventory", priority: "medium" },
      near_end_of_life: { category: "inventory", priority: "low" },
      sufficient_stock: { category: "inventory", priority: "low" },
      stocktaking: { category: "inventory", priority: "medium" },
      product_recall: { category: "security", priority: "high" },
      forecast: { category: "forecast", priority: "medium" },
    }

    // Process each alert type
    Object.entries(apiAlerts).forEach(([alertType, alertItems]) => {
      if (!alertItems || !Array.isArray(alertItems)) return

      const mapping = alertMappings[alertType] || {
        category: "inventory",
        priority: "medium",
      }

      alertItems.forEach((item, index) => {
        // Create a title based on the alert type
        const title = formatAlertTitle(alertType, item)

        // Create a description based on the alert data
        const description = formatAlertDescription(alertType, item)

        // Create details based on the alert data
        const details = formatAlertDetails(alertType, item)

        // Determine if action is required
        const actionRequired = determineActionRequired(alertType, item)

        alerts.push({
          id: `${alertType}-${index}`,
          title,
          description,
          details,
          actionRequired,
          category: mapping.category,
          priority: mapping.priority,
          timestamp: now, // You might want to extract this from the API data if available
          read: false,
        })
      })
    })

    // Sort by priority and then by alert type
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [])

  // Helper functions to format alert data
  const formatAlertTitle = useCallback((alertType, item) => {
    switch (alertType) {
      case "overstock":
        return `Overstock Alert: ${item.product_name || "Product"}`
      case "low_stock":
        return `Low Stock Alert: ${item.product_name || "Product"}`
      case "shrinkage":
        return `Inventory Shrinkage: ${item.product_name || "Product"}`
      case "near_expiration":
        return `Near Expiration: ${item.product_name || "Product"}`
      case "near_end_of_life":
        return `End of Life Alert: ${item.product_name || "Product"}`
      case "sufficient_stock":
        return `Sufficient Stock: ${item.product_name || "Product"}`
      case "stocktaking":
        return `Stocktaking Required: ${item.location || "Location"}`
      case "product_recall":
        return `Product Recall: ${item.product_name || "Product"}`
      case "forecast":
        return `forecast Alert: ${item.product_name || "Product"}`
      default:
        return `${alertType.charAt(0).toUpperCase() + alertType.slice(1)} Alert`
    }
  }, [])

  const formatAlertDescription = useCallback((alertType, item) => {
    switch (alertType) {
      case "overstock":
        return `Current stock: ${item.current_stock || 0} units. Maximum recommended: ${item.max_stock || 0} units.`
      case "low_stock":
        return `Current stock: ${item.current_stock || 0} units. Minimum required: ${item.min_stock || 0} units.`
      case "shrinkage":
        return `Expected: ${item.expected_stock || 0} units. Actual: ${item.actual_stock || 0} units. Discrepancy: ${item.discrepancy || 0} units.`
      case "near_expiration":
        return `${item.quantity || 0} units will expire in ${item.days_to_expiration || 0} days.`
      case "near_end_of_life":
        return `Product approaching end of life. ${item.days_remaining || 0} days remaining.`
      case "sufficient_stock":
        return `Current stock: ${item.current_stock || 0} units. Stock level is optimal.`
      case "stocktaking":
        return `Last stocktake: ${item.last_stocktake || "Unknown"}. Due: ${item.due_date || "Soon"}.`
      case "product_recall":
        return `Recall reason: ${item.reason || "Quality issue"}. Affected units: ${item.affected_units || 0}.`
      case "forecast":
        return `${item.description || "forecast trend detected"} for ${item.product_name || "product"}.`
      default:
        return JSON.stringify(item)
    }
  }, [])

  const formatAlertDetails = useCallback((alertType, item) => {
    // Create more detailed information based on the alert type and data
    switch (alertType) {
      case "overstock":
        return `This product has exceeded the maximum recommended stock level by ${item.current_stock - item.max_stock || 0} units. Consider running a promotion or reallocating inventory.`
      case "low_stock":
        return `Stock level is below the minimum threshold. Reorder point: ${item.reorder_point || 0} units. Lead time: ${item.lead_time || 0} days.`
      case "shrinkage":
        return `Inventory shrinkage detected. This may be due to theft, damage, administrative errors, or supplier fraud. Last inventory check: ${item.last_check || "Unknown"}.`
      case "near_expiration":
        return `Products will expire on ${item.expiration_date || "Unknown"}. Consider discounting these items to increase forecast velocity.`
      case "near_end_of_life":
        return `This product is being phased out. Last order date: ${item.last_order_date || "Unknown"}. Consider clearance pricing.`
      case "sufficient_stock":
        return `Inventory levels are within optimal range. Min: ${item.min_stock || 0}, Max: ${item.max_stock || 0}, Current: ${item.current_stock || 0}.`
      case "stocktaking":
        return `Regular inventory count is required for this location. Previous discrepancy rate: ${item.discrepancy_rate || "0%"}.`
      case "product_recall":
        return `Recall initiated on ${item.recall_date || "Unknown"}. Return process: ${item.return_process || "Contact supplier"}. Compensation: ${item.compensation || "To be determined"}.`
      case "forecast":
        return `${item.details || "No additional details available."}`
      default:
        return ""
    }
  }, [])

  const determineActionRequired = useCallback((alertType, item) => {
    switch (alertType) {
      case "overstock":
        return "Consider running a promotion or transferring inventory to another location."
      case "low_stock":
        return "Place a purchase order to replenish inventory."
      case "shrinkage":
        return "Investigate the cause of inventory discrepancy and update records."
      case "near_expiration":
        return "Apply discounts to increase forecast velocity before expiration."
      case "near_end_of_life":
        return "Plan for clearance pricing and replacement product."
      case "sufficient_stock":
        return null // No action required
      case "stocktaking":
        return "Schedule inventory count for this location."
      case "product_recall":
        return "Remove affected products from shelves and contact customers."
      case "forecast":
        return item.action_required || null
      default:
        return null
    }
  }, [])

  // Fetch alerts when component mounts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true)

        // For development, use mock data
        const mockData = {
          alerts: {
            overstock: [
              {
                product_name: "Premium Headphones",
                product_id: "SKU-1234",
                current_stock: 85,
                max_stock: 50,
              },
              {
                product_name: "Wireless Keyboard",
                product_id: "SKU-5678",
                current_stock: 120,
                max_stock: 75,
              },
            ],
            low_stock: [
              {
                product_name: "Smartphone Case",
                product_id: "SKU-9012",
                current_stock: 3,
                min_stock: 15,
                reorder_point: 20,
                lead_time: 7,
              },
              {
                product_name: "Wireless Earbuds",
                product_id: "SKU-3456",
                current_stock: 2,
                min_stock: 10,
                reorder_point: 15,
                lead_time: 5,
              },
            ],
            shrinkage: [
              {
                product_name: "Designer Sunglasses",
                product_id: "SKU-7890",
                expected_stock: 45,
                actual_stock: 38,
                discrepancy: 7,
                last_check: "2023-03-15",
              },
            ],
            near_expiration: [
              {
                product_name: "Organic Protein Bars",
                product_id: "SKU-2345",
                quantity: 28,
                days_to_expiration: 14,
                expiration_date: "2023-04-20",
              },
            ],
            product_recall: [
              {
                product_name: "Electric Kettle",
                product_id: "SKU-4567",
                reason: "Safety concern",
                affected_units: 120,
                recall_date: "2023-03-01",
                return_process: "Return to store",
                compensation: "Full refund",
              },
            ],
          },
        }

        // Transform the mock data
        const transformedAlerts = transformApiResponse(mockData.alerts)
        setAlerts(transformedAlerts)
        setError(null)

        
        
        const response = await fetch('http://localhost:8000/alerts');
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data received:', data);
        
        if (data && data.alerts) {
          // Transform the API response
          const transformedAlerts = transformApiResponse(data.alerts);
          setAlerts(transformedAlerts);
          setError(null);
        } else {
          console.error('Unexpected API response structure:', data);
          setError('API returned an unexpected response format');
          setAlerts([]);
        }
        
      } catch (err) {
        console.error("Error fetching alerts:", err)
        setError("Failed to load alerts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [transformApiResponse])

  // Get unique alert types from the data
  const alertTypes = [...new Set(alerts.map((alert) => alert.id.split("-")[0]))]

  // Filter alerts based on search query and selected filters
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority ? alert.priority === selectedPriority : true
    const matchesCategory = selectedCategory ? alert.category === selectedCategory : true
    const matchesAlertType = selectedAlertType ? alert.id.startsWith(selectedAlertType) : true

    return matchesSearch && matchesPriority && matchesCategory && matchesAlertType
  })

  // Filter alerts based on active tab
  const tabFilteredAlerts = (() => {
    switch (activeTab) {
      case "unread":
        return filteredAlerts.filter((alert) => !alert.read)
      case "critical":
        return filteredAlerts.filter((alert) => alert.priority === "high")
      case "all":
      default:
        return filteredAlerts
    }
  })()

  const handleMarkAsRead = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const handleDismiss = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const unreadCount = alerts.filter((alert) => !alert.read).length

  // Count alerts by category
  const categoryCounts = {
    critical: alerts.filter((alert) => alert.priority === "high").length,
    inventory: alerts.filter((alert) => alert.category === "inventory").length,
    forecast: alerts.filter((alert) => alert.category === "forecast").length,
  }
  console.log(categoryCounts);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Loading alerts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-bold">Error Loading Alerts</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">RetailPro Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-medium">
              RP
            </div>
          </div>
        </div>
      </header>


      <main className="container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Alerts Dashboard</h2>
            <p className="text-gray-600">Monitor and manage all retail alerts in one place.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium">Critical Alerts</h3>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold">{categoryCounts.critical}</div>
              <p className="text-xs text-gray-500">Requires immediate attention</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium">Inventory Alerts</h3>
                <Package className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">{categoryCounts.inventory}</div>
              <p className="text-xs text-gray-500">Stock level notifications</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium">forecast Alerts</h3>
                <ShoppingCart className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{categoryCounts.forecast}</div>
              <p className="text-xs text-gray-500">forecast performance insights</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border">
          <div className="bg-white rounded-lg shadow border">
  <div className="p-4 border-b">
    <div className="bg-[#f0f7f9] p-1 rounded-md inline-flex flex-wrap gap-2">
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === "all"
            ? "bg-gradient-to-r from-[#3eadc1] to-[#21c1de] text-white shadow-md"
            : "text-[#595959]"
        }`}
        onClick={() => setActiveTab("all")}
      >
        All Alerts
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === "unread"
            ? "bg-gradient-to-r from-[#3eadc1] to-[#21c1de] text-white shadow-md"
            : "text-[#595959]"
        }`}
        onClick={() => setActiveTab("unread")}
      >
        Unread
      </button>
      <button
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          activeTab === "critical"
            ? "bg-gradient-to-r from-[#c13e6c] to-[#d85c87] text-white shadow-md"
            : "text-[#595959]"
        }`}
        onClick={() => setActiveTab("critical")}
      >
        Critical
      </button>
    </div>
  </div>
</div>


            <div className="p-4">
              <div className="flex flex-col items-start justify-between gap-4 mb-4 md:flex-row md:items-center">
                <div className="relative w-full md:w-auto">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="search"
                    placeholder="Search alerts..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md md:w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <select
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPriority || ""}
                    onChange={(e) => setSelectedPriority(e.target.value || null)}
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <select
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">All Categories</option>
                    <option value="inventory">Inventory</option>
                    <option value="forecast">forecast</option>
                    <option value="customer">Customer</option>
                    <option value="security">Security</option>
                  </select>
                  <select
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAlertType || ""}
                    onChange={(e) => setSelectedAlertType(e.target.value || null)}
                  >
                    <option value="">All Types</option>
                    {alertTypes.map((type) => (
                      <option key={type} value={type}>
                        {type
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                <div className="space-y-4">
                  {tabFilteredAlerts.length > 0 ? (
                    tabFilteredAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onMarkAsRead={handleMarkAsRead}
                        onDismiss={handleDismiss}
                      />
                    ))
                  ) : (
                    <div className="bg-white rounded-lg shadow border">
                      <div className="flex flex-col items-center justify-center p-6">
                        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gray-100">
                          <CheckCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="mb-1 text-lg font-medium">
                          {activeTab === "unread"
                            ? "All caught up!"
                            : activeTab === "critical"
                              ? "No critical alerts"
                              : "No alerts found"}
                        </h3>
                        <p className="text-sm text-center text-gray-500">
                          {activeTab === "unread"
                            ? "You have no unread alerts at the moment."
                            : activeTab === "critical"
                              ? "There are no critical alerts at the moment."
                              : "There are no alerts matching your current filters."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Alerts

