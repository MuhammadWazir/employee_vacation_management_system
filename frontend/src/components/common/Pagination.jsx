import "../../styles/Pagination.css"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => onPageChange(1)} className="page-number">
          1
        </button>,
      )

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="ellipsis">
            ...
          </span>,
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button key={i} onClick={() => onPageChange(i)} className={`page-number ${i === currentPage ? "active" : ""}`}>
          {i}
        </button>,
      )
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="ellipsis">
            ...
          </span>,
        )
      }

      pages.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)} className="page-number">
          {totalPages}
        </button>,
      )
    }

    return pages
  }

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-arrow">
        ←
      </button>

      <div className="page-numbers">{renderPageNumbers()}</div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-arrow"
      >
        →
      </button>
    </div>
  )
}

export default Pagination
