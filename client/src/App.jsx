import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchCity, setSearchCity] = useState('');
    const [searchType, setSearchType] = useState('');
    const [searchRoute, setSearchRoute] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [gotoPageInput, setGotoPageInput] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 1,
        limit: 20,
        page: 1,
    });

    const API_BASE = 'http://localhost:5000/api';

    useEffect(() => {
        fetchEmployers();
    }, []);

    const fetchEmployers = async (
        name = '',
        city = '',
        type = '',
        route = '',
        page = 1
    ) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 20);
            if (name) params.append('name', name);
            if (city) params.append('city', city);
            if (type) params.append('type', type);
            if (route) params.append('route', route);

            // Always use search endpoint when we have filters or pagination
            const hasFilters = name || city || type || route;
            const endpoint = hasFilters
                ? `${API_BASE}/employers/search?${params}`
                : `${API_BASE}/employers?${params}`;

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch employers');
            const result = await response.json();

            // Always expect pagination structure from backend
            if (result.data && result.pagination) {
                setEmployers(result.data);
                setPagination(result.pagination);
                setCurrentPage(result.pagination.page);
            } else if (Array.isArray(result)) {
                // Fallback: if backend returns array directly, paginate on frontend
                const total = result.length;
                const skip = (page - 1) * 20;
                const paginatedData = result.slice(skip, skip + 20);
                setEmployers(paginatedData);
                setPagination({
                    total,
                    page,
                    limit: 20,
                    pages: Math.ceil(total / 20),
                });
                setCurrentPage(page);
            } else {
                // Unexpected format
                console.warn('Unexpected response format:', result);
                setEmployers([]);
                setPagination({
                    total: 0,
                    pages: 1,
                    limit: 20,
                    page: 1,
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmployers(searchName, searchCity, searchType, searchRoute, 1);
    };

    const handleReset = () => {
        setSearchName('');
        setSearchCity('');
        setSearchType('');
        setSearchRoute('');
        fetchEmployers('', '', '', '', 1);
    };

    const googleSearch = (employer) => {
        const searchTerm = `${employer.name} ${employer.city || ''} ${
            employer.county || ''
        }`.trim();
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
            searchTerm
        )}`;
        window.open(googleUrl, '_blank');
    };

    const handlePageChange = (newPage) => {
        fetchEmployers(
            searchName,
            searchCity,
            searchType,
            searchRoute,
            newPage
        );
    };

    const handleGotoPage = () => {
        const pageNum = parseInt(gotoPageInput, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.pages) {
            handlePageChange(pageNum);
            setGotoPageInput('');
        } else {
            setError(
                `Please enter a valid page number between 1 and ${pagination.pages}`
            );
        }
    };

    const startEditing = (employer) => {
        setEditingId(employer._id);
        setEditForm({
            website: employer.website || '',
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEmployer = async () => {
        try {
            const response = await fetch(`${API_BASE}/employers/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (!response.ok) throw new Error('Failed to update employer');
            const updated = await response.json();
            setEmployers(
                employers.map((e) => (e._id === editingId ? updated : e))
            );
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const updateStatus = async (employerId, newStatus) => {
        try {
            const response = await fetch(
                `${API_BASE}/employers/${employerId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            if (!response.ok) throw new Error('Failed to update status');
            const updated = await response.json();
            setEmployers(
                employers.map((e) => (e._id === employerId ? updated : e))
            );
            setStatusDropdownId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleRemoval = async (employerId) => {
        try {
            setDeletingId(employerId);
            const response = await fetch(
                `${API_BASE}/employers/${employerId}`,
                { method: 'DELETE' }
            );
            if (!response.ok) throw new Error('Failed to delete employer');
            setEmployers(employers.filter((e) => e._id !== employerId));
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>UK Employers List</h1>
                <p>Search and filter approved employers</p>
            </header>

            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="name">Organisation Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Search by name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                            id="city"
                            type="text"
                            placeholder="Search by city..."
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Type & Rating</label>
                        <input
                            id="type"
                            type="text"
                            placeholder="Search by type..."
                            value={searchType}
                            onChange={(e) => setSearchType(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="route">Route</label>
                        <input
                            id="route"
                            type="text"
                            placeholder="Search by route..."
                            value={searchRoute}
                            onChange={(e) => setSearchRoute(e.target.value)}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="results-section">
                {loading ? (
                    <p className="loading">Loading employers...</p>
                ) : employers.length === 0 ? (
                    <p className="no-results">No employers found</p>
                ) : (
                    <>
                        <p className="result-count">
                            Found {pagination.total} employer(s)
                        </p>
                        <div className="employers-grid">
                            {employers.map((employer) => (
                                <div
                                    key={employer._id}
                                    className={`employer-card ${
                                        employer.toRemove ? 'to-remove' : ''
                                    }`}>
                                    <div className="card-header">
                                        <h3 className="employer-name">
                                            {employer.name}
                                        </h3>
                                        <div className="status-dropdown-wrapper">
                                            <button
                                                className={`status-badge status-${employer.status}`}
                                                onClick={() =>
                                                    setStatusDropdownId(
                                                        statusDropdownId ===
                                                            employer._id
                                                            ? null
                                                            : employer._id
                                                    )
                                                }
                                                title="Click to change status">
                                                {employer.status}
                                            </button>
                                            {statusDropdownId ===
                                                employer._id && (
                                                <div className="status-dropdown">
                                                    {[
                                                        'pending',
                                                        'contacted',
                                                        'interested',
                                                        'not-interested',
                                                    ].map((status) => (
                                                        <button
                                                            key={status}
                                                            className={`status-option status-${status}`}
                                                            onClick={() =>
                                                                updateStatus(
                                                                    employer._id,
                                                                    status
                                                                )
                                                            }>
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="google-search-btn"
                                            onClick={() =>
                                                googleSearch(employer)
                                            }
                                            title="Search on Google">
                                            🔍 Search on Google
                                        </button>
                                    </div>

                                    {editingId === employer._id ? (
                                        <div className="inline-edit">
                                            <input
                                                type="url"
                                                value={editForm.website}
                                                onChange={(e) =>
                                                    setEditForm({
                                                        website: e.target.value,
                                                    })
                                                }
                                                placeholder="https://example.com"
                                                autoFocus
                                            />
                                            <button
                                                className="btn btn-small btn-primary"
                                                onClick={saveEmployer}>
                                                Save
                                            </button>
                                            <button
                                                className="btn btn-small btn-secondary"
                                                onClick={cancelEditing}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="employer-details">
                                                {employer.city && (
                                                    <div className="detail">
                                                        <span className="label">
                                                            City:
                                                        </span>{' '}
                                                        {employer.city}
                                                    </div>
                                                )}
                                                {employer.county && (
                                                    <div className="detail">
                                                        <span className="label">
                                                            County:
                                                        </span>{' '}
                                                        {employer.county}
                                                    </div>
                                                )}
                                                {employer.type && (
                                                    <div className="detail">
                                                        <span className="label">
                                                            Type:
                                                        </span>{' '}
                                                        {employer.type}
                                                    </div>
                                                )}
                                                {employer.route && (
                                                    <div className="detail">
                                                        <span className="label">
                                                            Route:
                                                        </span>{' '}
                                                        {employer.route}
                                                    </div>
                                                )}
                                                <div className="detail website-detail">
                                                    <span className="label">
                                                        Website:
                                                    </span>
                                                    <div className="website-input-wrapper">
                                                        <input
                                                            type="text"
                                                            value={
                                                                employer.website ||
                                                                ''
                                                            }
                                                            readOnly
                                                            className="website-input"
                                                        />
                                                        {employer.website && (
                                                            <button
                                                                className="btn btn-small btn-secondary"
                                                                onClick={() =>
                                                                    window.open(
                                                                        employer.website,
                                                                        '_blank'
                                                                    )
                                                                }
                                                                title="Open website">
                                                                Open
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-small btn-primary"
                                                            onClick={() =>
                                                                startEditing(
                                                                    employer
                                                                )
                                                            }>
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>

                                                {employer.lastContacted && (
                                                    <div className="detail">
                                                        <span className="label">
                                                            Last Contacted:
                                                        </span>{' '}
                                                        {new Date(
                                                            employer.lastContacted
                                                        ).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card-actions">
                                                <button
                                                    className="btn btn-small btn-danger"
                                                    onClick={() =>
                                                        toggleRemoval(
                                                            employer._id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        employer._id
                                                    }
                                                    style={{
                                                        opacity:
                                                            deletingId ===
                                                            employer._id
                                                                ? 0.6
                                                                : 1,
                                                        cursor:
                                                            deletingId ===
                                                            employer._id
                                                                ? 'not-allowed'
                                                                : 'pointer',
                                                    }}>
                                                    {deletingId === employer._id
                                                        ? 'Deleting...'
                                                        : 'Delete'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {pagination && pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() =>
                                        handlePageChange(
                                            Math.max(1, currentPage - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}>
                                    ← Previous
                                </button>
                                <span className="pagination-info">
                                    Page {currentPage} of {pagination.pages}
                                </span>
                                <div className="goto-page">
                                    <input
                                        type="number"
                                        min="1"
                                        max={pagination.pages}
                                        value={gotoPageInput}
                                        onChange={(e) =>
                                            setGotoPageInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === 'Enter' &&
                                            handleGotoPage()
                                        }
                                        placeholder="Go to page..."
                                        className="goto-page-input"
                                    />
                                    <button
                                        className="btn btn-small btn-primary"
                                        onClick={handleGotoPage}>
                                        Go
                                    </button>
                                </div>
                                <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() =>
                                        handlePageChange(
                                            Math.min(
                                                pagination.pages,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    disabled={currentPage === pagination.pages}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
