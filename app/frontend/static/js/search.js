// ===========================================
// Search Module (Database Search Only)
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    // If there is no search form on this page, do nothing
    if (!searchForm || !searchInput) {
        return;
    }

    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const query = searchInput.value.trim();

        if (query === "") {
            searchInput.focus();
            return;
        }

        // Redirect to search results page
        window.location.href =
            `/search-page?query=${encodeURIComponent(query)}`;

    });

});