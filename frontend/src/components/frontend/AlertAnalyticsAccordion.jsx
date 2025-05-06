"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Custom color palette
const COLORS = {
  teal: "#3eadc1",
  darkBlue: "#041f3a",
  gray: "#595959",
  white: "#ffffff",
  darkTeal: "#2b7886",
  mediumBlue: "#0a5096",
  darkGreen: "#18434a",
  lightGray: "#d9d9d9",
  magenta: "#c13e6c",
  orange: "#ffa641",
  lightBlue: "#21c1de",
}

const CHART_COLORS = [COLORS.teal, COLORS.magenta, COLORS.orange, COLORS.mediumBlue, COLORS.darkGreen, COLORS.lightBlue]

const styles = {
  container: "border rounded-lg shadow-lg mt-6 overflow-hidden bg-white",
  header: `w-full px-4 py-3 text-left font-medium text-white transition-all duration-200 ease-in-out`,
  headerBackground: `bg-gradient-to-r from-[${COLORS.darkBlue}] to-[${COLORS.darkTeal}]`,
  tabContainer: "flex gap-3 border-b mb-6 flex-wrap px-2",
  activeTab: `px-4 py-2 rounded-t-lg font-medium border-b-2 text-[${COLORS.darkBlue}] border-[${COLORS.teal}]`,
  inactiveTab: `px-4 py-2 rounded-t-lg font-medium text-[${COLORS.gray}] hover:text-[${COLORS.darkBlue}] transition-colors duration-200`,
  chartContainer: "px-4 pb-8",
  chartTitle: `text-xl font-medium text-[${COLORS.darkBlue}] mb-4 text-center`,
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="font-medium text-sm" style={{ color: COLORS.darkBlue }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function AlertAnalyticsAccordion({ alerts }) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("Alert Severity")

  const getAlertSeverityDistribution = () => {
    const distribution = {}
    alerts.forEach((alert) => {
      const severity = alert.type || "Unknown"
      distribution[severity] = (distribution[severity] || 0) + 1
    })
    return Object.entries(distribution).map(([severity, count]) => ({ name: severity, value: count }))
  }

  const getAlertStatusDistribution = () => {
    const distribution = { New: 0, Reviewed: 0 }
    alerts.forEach((alert) => {
      if (alert.isNew) distribution.New += 1
      else distribution.Reviewed += 1
    })
    return Object.entries(distribution).map(([status, count]) => ({ name: status, value: count }))
  }

  const getAlertTrendData = () => [
    { date: "Mon", New: 4, Reviewed: 2 },
    { date: "Tue", New: 3, Reviewed: 4 },
    { date: "Wed", New: 7, Reviewed: 3 },
    { date: "Thu", New: 5, Reviewed: 6 },
    { date: "Fri", New: 10, Reviewed: 8 },
    { date: "Sat", New: 8, Reviewed: 9 },
    { date: "Sun", New: 6, Reviewed: 4 },
  ]

  const getAlertResponseTime = () => [
    { name: "Critical", value: 25 },
    { name: "High", value: 60 },
    { name: "Medium", value: 120 },
    { name: "Low", value: 240 },
  ]

  const getAlertResolutionComparison = () => [
    { name: "Inventory", avg: 45, min: 15, max: 120 },
    { name: "Forecast", avg: 30, min: 10, max: 90 },
    { name: "Price", avg: 60, min: 20, max: 180 },
    { name: "Quality", avg: 120, min: 30, max: 300 },
  ]

  const getResolvedUnresolvedDistribution = () => {
    const resolvedCount = alerts.filter(alert => alert.isResolved).length
    const unresolvedCount = alerts.length - resolvedCount
    return [
      { name: "Resolved", value: resolvedCount },
      { name: "Unresolved", value: unresolvedCount },
    ]
  }

  const severityDistribution = getAlertSeverityDistribution()
  const statusDistribution = getAlertStatusDistribution()
  const alertTrendData = getAlertTrendData()
  const alertResponseTime = getAlertResponseTime()
  const alertResolutionComparison = getAlertResolutionComparison()
  const resolvedUnresolvedDistribution = getResolvedUnresolvedDistribution()

  return (
    <div className={styles.container}>
      <button
        className={`${styles.header} ${styles.headerBackground}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: `linear-gradient(to right, ${COLORS.darkBlue}, ${COLORS.darkTeal})` }}
      >
        <div className="flex justify-between items-center">
          <span className="text-lg">Alert Analytics</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>

      {isOpen && (
        <div className="bg-white">
          <div className={styles.tabContainer}>
            {["Alert Severity", "Alert Status", "Alert Trends", "Response Time", "Comparison", "Resolution"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.activeTab : styles.inactiveTab}
                onClick={() => setActiveTab(tab)}
                style={{
                  color: activeTab === tab ? COLORS.darkBlue : COLORS.gray,
                  borderBottomColor: activeTab === tab ? COLORS.teal : "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={styles.chartContainer}>
            {/* Alert Severity Tab */}
            {activeTab === "Alert Severity" && (
              <>
                <h3 className={styles.chartTitle}>Alert Severity Distribution</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        innerRadius={60}
                        stroke={COLORS.white}
                        strokeWidth={2}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {severityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: COLORS.darkBlue }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Alert Status Tab */}
            {activeTab === "Alert Status" && (
              <>
                <h3 className={styles.chartTitle}>Alert Status Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          stroke={COLORS.white}
                          strokeWidth={2}
                          paddingAngle={2}
                          label
                        >
                          <Cell fill={COLORS.teal} />
                          <Cell fill={COLORS.magenta} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span style={{ color: COLORS.darkBlue }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
                        <XAxis dataKey="name" stroke={COLORS.gray} />
                        <YAxis stroke={COLORS.gray} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" barSize={60} radius={[4, 4, 0, 0]}>
                          <Cell fill={COLORS.teal} />
                          <Cell fill={COLORS.magenta} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Alert Trends Tab */}
            {activeTab === "Alert Trends" && (
              <>
                <h3 className={styles.chartTitle}>Alert Trends Over Time</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={alertTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
                      <XAxis dataKey="date" stroke={COLORS.gray} />
                      <YAxis stroke={COLORS.gray} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="New"
                        stroke={COLORS.teal}
                        strokeWidth={3}
                        dot={{ r: 6, fill: COLORS.white, strokeWidth: 3 }}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Reviewed"
                        stroke={COLORS.magenta}
                        strokeWidth={3}
                        dot={{ r: 6, fill: COLORS.white, strokeWidth: 3 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Response Time Tab */}
            {activeTab === "Response Time" && (
              <>
                <h3 className={styles.chartTitle}>Average Alert Response Time (minutes)</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertResponseTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
                      <XAxis dataKey="name" stroke={COLORS.gray} />
                      <YAxis stroke={COLORS.gray} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" barSize={60}>
                        {alertResponseTime.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Comparison Tab */}
            {activeTab === "Comparison" && (
              <>
                <h3 className={styles.chartTitle}>Alert Resolution Time Comparison (minutes)</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertResolutionComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
                      <XAxis dataKey="name" stroke={COLORS.gray} />
                      <YAxis stroke={COLORS.gray} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="min" name="Minimum" fill={COLORS.teal} />
                      <Bar dataKey="avg" name="Average" fill={COLORS.orange} />
                      <Bar dataKey="max" name="Maximum" fill={COLORS.magenta} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Resolution Tab */}
            {activeTab === "Resolution" && (
              <>
                <h3 className={styles.chartTitle}>Resolved vs Unresolved Alerts</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resolvedUnresolvedDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={140}
                        innerRadius={60}
                        stroke={COLORS.white}
                        strokeWidth={2}
                        paddingAngle={2}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {resolvedUnresolvedDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: COLORS.darkBlue }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )

}

export default AlertAnalyticsAccordion;
