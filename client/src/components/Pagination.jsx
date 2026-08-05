export default function Pagination({ page, pageCount, onChange }) {
    if (pageCount <= 1) return null;
    return (
        <div className="pagination-bar" role="navigation" aria-label="Pagination">
            <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
            <span>Page {page} of {pageCount}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Next</button>
        </div>
    );
}
