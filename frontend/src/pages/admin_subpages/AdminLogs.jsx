import { useEffect, useState, useCallback } from "react";
import { api } from "../../utils/api";
import "../../styles/admin_logs.css";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetchLogs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (actionFilter) {
        params.action = actionFilter;
      }

      if (timeFilter !== "all") {
        const now = new Date();
        if (timeFilter === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          params.from = today.toISOString();
        } else if (timeFilter === "7days") {
          const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.from = past.toISOString();
        } else if (timeFilter === "30days") {
          const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.from = past.toISOString();
        }
      }

      const res = await api.get("/admin/logs", { params });
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, actionFilter, timeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setSearch("");
    setActionFilter("");
    setTimeFilter("all");
    setPage(1);
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return { full: "N/A", relative: "" };
    const date = new Date(dateStr);

    const full = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    let relative = "";
    if (diffSec < 60) relative = "Just now";
    else if (diffMin < 60) relative = `${diffMin}m ago`;
    else if (diffHour < 24) relative = `${diffHour}h ago`;
    else if (diffDay < 30) relative = `${diffDay}d ago`;
    else relative = date.toLocaleDateString();

    return { full, relative };
  };

  const getBadgeClass = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("LOGIN")) return "badge-login";
    if (act.includes("CREATE") || act.includes("IMPORT")) return "badge-create";
    if (act.includes("DELETE") || act.includes("DISABLED")) return "badge-delete";
    if (act.includes("UPDATE") || act.includes("ENABLED") || act.includes("RESET")) return "badge-update";
    return "badge-system";
  };

  const renderMetadata = (meta) => {
    if (!meta || Object.keys(meta).length === 0) {
      return <span style={{ color: "#94a3b8", fontSize: "12px" }}>None</span>;
    }

    if (meta.createdEmail) {
      return (
        <span className="adm-log-meta-tag">
          User: <strong>{meta.createdEmail}</strong> ({meta.role || "user"})
        </span>
      );
    }
    if (meta.courseCode) {
      return (
        <span className="adm-log-meta-tag">
          Course: <strong>{meta.courseCode}</strong> {meta.title ? `– ${meta.title}` : ""}
        </span>
      );
    }
    if (meta.email) {
      return (
        <span className="adm-log-meta-tag">
          Email: <strong>{meta.email}</strong> {meta.role ? `(${meta.role})` : ""}
        </span>
      );
    }
    if (meta.count) {
      return (
        <span className="adm-log-meta-tag">
          Count: <strong>{meta.count} users</strong>
        </span>
      );
    }

    // Generic JSON string representation
    const metaString = JSON.stringify(meta);
    return (
      <span className="adm-log-meta-tag" title={metaString}>
        {metaString.length > 50 ? `${metaString.substring(0, 50)}...` : metaString}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  // Calculate quick stats from logs
  const loginCount = logs.filter((l) => (l.action || "").includes("LOGIN")).length;
  const userActionsCount = logs.filter((l) => (l.action || "").includes("USER")).length;
  const courseActionsCount = logs.filter((l) => (l.action || "").includes("COURSE")).length;

  return (
    <div className="adm-logs-page">
      {/* Page Header */}
      <div className="adm-logs-header">
        <div>
          <h2 className="adm-logs-title">System & Audit Logs</h2>
          <p className="adm-logs-subtitle">
            Track user activity, administrative actions, and security events.
          </p>
        </div>

        <div className="adm-logs-actions">
          <button
            className="adm-refresh-btn"
            onClick={() => fetchLogs(true)}
            disabled={refreshing || loading}
            title="Refresh logs"
          >
            <svg
              className={refreshing ? "spinning" : ""}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="adm-logs-stats-bar">
        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="adm-stat-number">{total}</div>
            <div className="adm-stat-label">Total Logged Events</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <div>
            <div className="adm-stat-number">{loginCount}</div>
            <div className="adm-stat-label">Logins (Current View)</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="adm-stat-number">{userActionsCount}</div>
            <div className="adm-stat-label">User Management Events</div>
          </div>
        </div>

        <div className="adm-stat-card">
          <div className="adm-stat-icon-wrapper purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <div className="adm-stat-number">{courseActionsCount}</div>
            <div className="adm-stat-label">Course Events</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="adm-logs-card">
        {/* Toolbar / Filters */}
        <div className="adm-logs-toolbar">
          <div className="adm-logs-filters-left">
            {/* Search */}
            <div className="adm-search-input-box">
              <svg
                className="adm-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="adm-search-input"
                placeholder="Search action or IP..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Action filter */}
            <select
              className="adm-select-filter"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Action Types</option>
              <option value="USER_LOGIN">User Logins</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="USER_ENABLED">User Enabled</option>
              <option value="USER_DISABLED">User Disabled</option>
              <option value="PASSWORD_RESET">Password Updated</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="COURSE_UPDATED">Course Updated</option>
              <option value="COURSE_DELETED">Course Deleted</option>
              <option value="USERS_BULK_IMPORT">Bulk Import</option>
              <option value="SYSTEM_SETTINGS_UPDATE">System Update</option>
            </select>

            {/* Time filter */}
            <select
              className="adm-select-filter"
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            {(search || actionFilter || timeFilter !== "all") && (
              <button className="adm-btn-clear" onClick={handleResetFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content / Table */}
        {loading ? (
          <div className="adm-loading" style={{ minHeight: "260px" }}>
            <div className="adm-loading-spinner" />
            <span>Loading audit logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="adm-logs-empty">
            <div className="adm-logs-empty-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="adm-logs-empty-title">No activity logs found</h3>
            <p className="adm-logs-empty-text">
              {search || actionFilter || timeFilter !== "all"
                ? "Try clearing or changing your filters to see more results."
                : "System events and user activity will appear here as they occur."}
            </p>
          </div>
        ) : (
          <div className="adm-table-responsive">
            <table className="adm-logs-table">
              <thead>
                <tr>
                  <th style={{ width: "180px" }}>Timestamp</th>
                  <th style={{ width: "160px" }}>Action</th>
                  <th style={{ width: "220px" }}>Actor / User</th>
                  <th>Details & Context</th>
                  <th style={{ width: "120px" }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const { full, relative } = formatTimestamp(log.createdAt);
                  const actor = log.actor;

                  return (
                    <tr key={log._id}>
                      {/* Timestamp */}
                      <td>
                        <span className="adm-log-time">{full}</span>
                        <span className="adm-log-relative">{relative}</span>
                      </td>

                      {/* Action Badge */}
                      <td>
                        <span className={`adm-action-badge ${getBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Actor */}
                      <td>
                        {actor ? (
                          <div className="adm-log-actor">
                            <span className="adm-log-actor-name">{actor.name || "Unknown"}</span>
                            <span className="adm-log-actor-email">{actor.email || "No email"}</span>
                            <span className={`adm-log-role-pill role-${actor.role || "student"}`}>
                              {actor.role || "student"}
                            </span>
                          </div>
                        ) : (
                          <div className="adm-log-actor">
                            <span className="adm-log-actor-name" style={{ color: "#64748b" }}>
                              System / Anonymous
                            </span>
                            <span className="adm-log-role-pill role-system">System</span>
                          </div>
                        )}
                      </td>

                      {/* Metadata */}
                      <td>
                        <div className="adm-log-meta-box">
                          {renderMetadata(log.meta)}
                        </div>
                      </td>

                      {/* IP */}
                      <td>
                        <span className="adm-log-ip">{log.ip || "127.0.0.1"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && total > 0 && (
          <div className="adm-logs-pagination">
            <div className="adm-pagination-info">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
            </div>

            <div className="adm-pagination-btns">
              <button
                className="adm-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                ← Previous
              </button>
              <span className="adm-page-current">
                Page {page} of {totalPages}
              </span>
              <button
                className="adm-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
