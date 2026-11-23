import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Globe,
  Server,
  Network,
  LayoutDashboard,
  Terminal,
  History,
  ShieldCheck,
  ArrowRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

const initialRoutes = [
  { region: "Europe", server: "Server-Omega" },
  { region: "Asia", server: "Server-Omega" },
];

const validServers = [
  "Server-Alpha-Primary",
  "Server-Beta-Primary",
  "Server-Omega",
];

const API_URL = "http://localhost:3001/api/execute";

function parseCommand(input) {
  const text = input.toLowerCase().trim();

  const region = text.includes("europe")
    ? "Europe"
    : text.includes("asia")
      ? "Asia"
      : null;

  if (!region) {
    return { error: "Please specify Europe or Asia." };
  }

  if (
    text.includes("rollback") ||
    text.includes("restore") ||
    text.includes("undo") ||
    text.includes("previous server")
  ) {
    return { action: "ROLLBACK", region };
  }

  const targetServer = validServers.find((server) =>
    text.includes(server.toLowerCase())
  );

  if (!targetServer) {
    return {
      error: "Please mention a valid target server.",
    };
  }

  return {
    action: "REROUTE",
    region,
    targetServer,
  };
}

function formatLog(log) {
  return {
    ...log,
    id: log.id || log.auditID,
    time:
      log.time ||
      (log.timestamp
        ? new Date(log.timestamp).toLocaleString()
        : "Timestamp unavailable"),
  };
}

export default function App() {
  const [routes, setRoutes] = useState(initialRoutes);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState("CONNECTING");
  const hasLoadedState = useRef(false);

  // Load actual routing state and audit history from AWS on page load.
  useEffect(() => {
    if (hasLoadedState.current) return;
    hasLoadedState.current = true;

    async function loadAWSState() {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "GET_STATE",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to retrieve AWS routing state."
          );
        }

        if (Array.isArray(data.routes)) {
          setRoutes(data.routes);
        }

        if (Array.isArray(data.logs)) {
          setLogs(data.logs.map(formatLog));
        }

        setConnectionStatus("AWS CONNECTED");
      } catch (error) {
        console.error("AWS state loading error:", error);
        setConnectionStatus("AWS UNAVAILABLE");
        setMessage({
          type: "error",
          text: error.message || "Unable to load AWS state.",
        });
      }
    }

    loadAWSState();
  }, []);

  async function executeCommand(value = command) {
    if (!value.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a command first.",
      });
      return;
    }

    const parsed = parseCommand(value);

    if (parsed.error) {
      setMessage({
        type: "error",
        text: parsed.error,
      });
      return;
    }

    setMessage({
      type: "info",
      text: "Sending command to AWS Lambda...",
    });

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: parsed.action,
          region: parsed.region,
          ...(parsed.action === "REROUTE"
            ? { targetServer: parsed.targetServer }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AWS operation failed.");
      }

      // Update the selected region using Lambda's response.
      setRoutes((previous) =>
        previous.map((route) =>
          route.region === data.region
            ? {
                ...route,
                server: data.newServer,
              }
            : route
        )
      );

      // Add the persistent AWS audit record to the dashboard.
      const log = formatLog({
        id: data.auditID,
        action: data.action,
        region: data.region,
        previousServer: data.previousServer,
        newServer: data.newServer,
        timestamp: data.timestamp,
      });

      setLogs((previous) => [log, ...previous]);

      setConnectionStatus("AWS CONNECTED");

      setMessage({
        type: "success",
        text: data.message,
      });

      setCommand("");
    } catch (error) {
      console.error("AWS command execution error:", error);

      setMessage({
        type: "error",
        text: error.message || "Unable to connect to AWS.",
      });
    }
  }

  function useExample(example) {
    setCommand(example);
    setMessage(null);
  }

  const rerouteCount = logs.filter(
    (log) => log.action === "REROUTE"
  ).length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">
            <Network size={23} />
          </div>
          <div>
            <h2>
              Net<span>Orchestrator</span>
            </h2>
            <p>CLOUD CONTROL CENTER</p>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-section">WORKSPACE</div>

        <nav className="navigation">
          <a href="#overview" className="nav-link active">
            <LayoutDashboard size={18} />
            Overview
          </a>
          <a href="#commands" className="nav-link">
            <Terminal size={18} />
            Command Centre
          </a>
          <a href="#routing" className="nav-link">
            <Server size={18} />
            Routing Management
          </a>
          <a href="#audit" className="nav-link">
            <History size={18} />
            Audit History
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="security-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Secure environment</strong>
            <span>AWS-backed infrastructure</span>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="heading-group">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <div>
              <div className="breadcrumb">
                WORKSPACE <span>/</span> OVERVIEW
              </div>
              <h1>Network Operations</h1>
              <p>
                Monitor, manage and orchestrate your cloud routing
                infrastructure.
              </p>
            </div>
          </div>

          <div className="environment-status">
            <span className="status-dot" />
            {connectionStatus}
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>MANAGED REGIONS</span>
              <div className="stat-icon purple">
                <Globe size={19} />
              </div>
            </div>
            <h2>02</h2>
            <p>Europe and Asia</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>AVAILABLE SERVERS</span>
              <div className="stat-icon blue">
                <Server size={19} />
              </div>
            </div>
            <h2>03</h2>
            <p>Configured destinations</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>ROUTING OPERATIONS</span>
              <div className="stat-icon violet">
                <Activity size={19} />
              </div>
            </div>
            <h2>{rerouteCount}</h2>
            <p>Recorded AWS reroutes</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>CONTROLLER STATUS</span>
              <div className="stat-icon green">
                <Zap size={19} />
              </div>
            </div>
            <h2 className="ready-text">
              {connectionStatus === "AWS CONNECTED"
                ? "READY"
                : connectionStatus === "CONNECTING"
                  ? "..."
                  : "CHECK"}
            </h2>
            <p>AWS Lambda controller</p>
          </div>
        </section>

        <section className="main-grid">
          <div className="panel routing-panel" id="routing">
            <div className="panel-header">
              <div>
                <h3>Regional Routing</h3>
                <p>Current AWS server assignments</p>
              </div>
              <div className="panel-header-icon">
                <Globe size={19} />
              </div>
            </div>

            <div className="route-list">
              {routes.map((route) => (
                <div className="route-item" key={route.region}>
                  <div className="region-info">
                    <div className="region-icon">
                      <Globe size={19} />
                    </div>
                    <div>
                      <strong>{route.region}</strong>
                      <span>Geographic region</span>
                    </div>
                  </div>

                  <div className="route-connector">
                    <ArrowRight size={17} />
                  </div>

                  <div className="server-info">
                    <div className="server-icon">
                      <Server size={18} />
                    </div>
                    <div>
                      <strong>{route.server}</strong>
                      <span>Assigned destination</span>
                    </div>
                  </div>

                  <div className="active-label">
                    <span /> ACTIVE
                  </div>
                </div>
              ))}
            </div>

            <div className="routing-footer">
              <ShieldCheck size={16} />
              Live routing state retrieved from AWS DynamoDB.
            </div>
          </div>

          <div className="panel command-panel" id="commands">
            <div className="panel-header">
              <div>
                <h3>Command Centre</h3>
                <p>Control routing using natural language</p>
              </div>
              <div className="panel-header-icon">
                <Terminal size={19} />
              </div>
            </div>

            <label htmlFor="command-input">
              ENTER YOUR INSTRUCTION
            </label>

            <textarea
              id="command-input"
              value={command}
              onChange={(event) => {
                setCommand(event.target.value);
                setMessage(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  executeCommand();
                }
              }}
              placeholder="Example: Shift Europe to Server-Omega"
            />

            <div className="example-label">TRY AN EXAMPLE</div>

            <div className="example-buttons">
              <button
                onClick={() =>
                  useExample("Shift Europe to Server-Omega")
                }
              >
                Reroute Europe
              </button>
              <button
                onClick={() =>
                  useExample("Move Asia to Server-Beta-Primary")
                }
              >
                Reroute Asia
              </button>
              <button
                onClick={() => useExample("Rollback Europe")}
              >
                Rollback Europe
              </button>
            </div>

            <button
              className="execute-button"
              onClick={() => executeCommand()}
            >
              <Send size={16} />
              Execute command
            </button>

            {message && (
              <div className={`feedback ${message.type}`}>
                {message.type === "success" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="parser-indicator">
              <span className="parser-dot" />
              RULE-BASED NLP PARSER · AWS LAMBDA
            </div>
          </div>
        </section>

        {/* NETWORK TOPOLOGY */}
        <section className="panel topology-panel" id="topology">
          <div className="panel-header">
            <div>
              <h3>Network Topology</h3>
              <p>Live logical routing connections</p>
            </div>
            <div className="panel-header-icon">
              <Network size={19} />
            </div>
          </div>

          <div className="topology-regions">
            {routes.map((route) => (
              <div className="topology-route" key={route.region}>
                <div className="topology-node region-node">
                  <Globe size={20} />
                  <div>
                    <strong>{route.region}</strong>
                    <span>Source region</span>
                  </div>
                </div>

                <div className="topology-link">
                  <span />
                  <ArrowRight size={19} />
                </div>

                <div className="topology-node server-node active-server">
                  <Server size={20} />
                  <div>
                    <strong>{route.server}</strong>
                    <span>Assigned destination</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="topology-server-pool">
            <div className="topology-pool-heading">
              <strong>SERVER POOL</strong>
              <span>{validServers.length} CONFIGURED SERVERS</span>
            </div>

            <div className="topology-server-grid">
              {validServers.map((server) => {
                const assignedCount = routes.filter(
                  (route) => route.server === server
                ).length;
                return (
                  <div
                    className={`topology-server-card ${
                      assignedCount > 0 ? "server-in-use" : ""
                    }`}
                    key={server}
                  >
                    <Server size={18} />
                    <strong>{server}</strong>
                    <span>
                      {assignedCount > 0
                        ? `${assignedCount} active route${
                            assignedCount > 1 ? "s" : ""
                          }`
                        : "Available"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="topology-legend">
            <span className="legend-active" />
            Active routing
            <span className="legend-available" />
            Available server
          </div>
        </section>

        <section className="panel audit-panel" id="audit">
          <div className="panel-header">
            <div>
              <h3>Recent Activity</h3>
              <p>Persistent routing audit history from AWS DynamoDB</p>
            </div>
            <div className="event-count">
              {logs.length} EVENTS
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <History size={25} />
              </div>
              <strong>No activity recorded yet</strong>
              <span>
                Execute your first routing command above.
              </span>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ACTION</th>
                    <th>REGION</th>
                    <th>PREVIOUS SERVER</th>
                    <th>NEW SERVER</th>
                    <th>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span
                          className={`action-pill ${log.action.toLowerCase()}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>{log.region}</td>
                      <td>{log.previousServer}</td>
                      <td>{log.newServer}</td>
                      <td>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="footer">
          <span>NETORCHESTRATOR</span>
          <span>INTENT-BASED CLOUD NETWORK MANAGEMENT</span>
          <span>DEMO BUILD 01</span>
        </footer>
      </main>
    </div>
  );
}