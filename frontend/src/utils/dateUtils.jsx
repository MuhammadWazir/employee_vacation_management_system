export const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  export const formatDateForInput = (dateString) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }
  
  export const calculateDuration = (fromDate, toDate) => {
    const from = new Date(fromDate)
    const to = new Date(toDate)
  
    // Reset time part to ensure accurate day calculation
    from.setHours(0, 0, 0, 0)
    to.setHours(0, 0, 0, 0)
  
    if (to < from) {
      throw new Error("End date must be after start date")
    }
  
    // Calculate difference in days (inclusive of start and end dates)
    const diffTime = to.getTime() - from.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  
    return diffDays
  }