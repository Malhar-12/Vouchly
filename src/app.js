import { createClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";
import { supabaseAnonKey, supabaseUrl } from "./supabase-config.js";

const businessTypes = [
  "Restaurant",
  "Cafe",
  "Fast Food Outlet",
  "Bakery",
  "Street Food Stall",
  "Cloud Kitchen",
  "Food Delivery Brand",
  "Hotel",
  "Resort",
  "Hostel",
  "Airbnb Property",
  "Salon",
  "Barber Shop",
  "Spa",
  "Tattoo Studio",
  "Skin Clinic",
  "Dentist",
  "Hospital",
  "Clinic",
  "Physiotherapy Center",
  "Diagnostic Lab",
  "Pharmacy Store",
  "Gym",
  "Yoga Studio",
  "Fitness Trainer",
  "Car Garage",
  "Car Detailing Center",
  "Bike Repair Shop",
  "Car Wash Service",
  "Electrician",
  "Plumber",
  "Cleaning Service",
  "Pest Control Service",
  "Coaching Class",
  "Tuition Center",
  "Coding Institute",
  "IELTS/GRE Coaching Center",
  "Pet Clinic",
  "Pet Grooming Center",
  "Pet Boarding Service",
  "Mobile Repair Shop",
  "Electronics Store",
  "Furniture Store",
  "Interior Designer",
  "Real Estate Agent",
  "Packers & Movers",
  "Travel Agency",
  "Tour Operator",
  "Event Planner",
  "Wedding Photographer",
  "Photographer",
  "Dance Class",
  "Music Class",
  "Swimming Pool & Club",
  "Bar",
  "Nightclub",
  "Lounge",
  "Gaming Cafe",
  "Internet Cafe",
  "Coworking Space",
  "General Store",
  "Textile Shop",
  "Mobile Shop",
  "Other Local Business"
];

const plans = [
  {
    id: "free",
    name: "Free Trial",
    price: "INR 0 / first month",
    fit: "For testing Vouchly with real customers before paying.",
    limits: "Up to 100 customers in the first month",
    includes: ["Customer list", "Review request tracking", "CSV data backup", "Editable templates", "25 automated review requests", "10 follow-up tasks"]
  },
  {
    id: "starter",
    name: "Starter",
    price: "INR 999 / month",
    fit: "For small shops or solo businesses that want organized review tracking.",
    limits: "Up to 500 customers/month",
    includes: ["Customer list", "Manual review request tracking", "CSV data backup", "No automated message sending"]
  },
  {
    id: "growth",
    name: "Growth",
    price: "INR 2,999 / month",
    fit: "Main plan for local businesses that need real follow-up automation.",
    limits: "Up to 1,500 customers/month",
    includes: ["Everything in Starter", "Automation tasks", "Editable message templates", "Review request sending workflow", "Lead follow-up"]
  },
  {
    id: "pro",
    name: "Pro",
    price: "INR 9,999 / month",
    fit: "For high-volume teams, multi-location services, and agencies.",
    limits: "Up to 5,000 customers/month",
    includes: ["Everything in Growth", "Priority support", "Future multi-user controls", "Advanced reporting"]
  }
];

const defaultState = {
  activeView: "dashboard",
  business: {
    name: "Bright Local Services",
    type: "General Store",
    owner: "Business Owner",
    city: "Bangalore",
    googleReviewLink: "",
    senderName: "Bright Local Services",
    plan: "free",
    setupComplete: false
  },
  customers: [
    {
      id: 1,
      name: "Priya Sharma",
      phone: "+91 98765 43210",
      email: "priya@example.com",
      channel: "whatsapp",
      visitDate: "2026-05-10",
      status: "pending",
      source: "walk-in"
    },
    {
      id: 2,
      name: "Rahul Mehta",
      phone: "+91 99887 77665",
      email: "",
      channel: "sms",
      visitDate: "2026-05-09",
      status: "sent",
      source: "service"
    }
  ],
  tasks: [
    {
      id: 11,
      title: "Send review request",
      customerName: "Priya Sharma",
      channel: "whatsapp",
      dueAt: "2026-05-11 11:00",
      status: "scheduled"
    }
  ],
  templates: [
    {
      id: 21,
      name: "First request",
      channel: "whatsapp",
      text: "Hi {{name}}, thank you for choosing {{business}}. Could you share a quick Google review? {{link}}"
    },
    {
      id: 22,
      name: "Reminder",
      channel: "sms",
      text: "Hi {{name}}, quick reminder from {{business}}. Your review helps local customers find us: {{link}}"
    }
  ]
};

const storageKey = "vouchly-universal-state-v2";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

let state = loadLocalState();
let session = null;
let loading = true;
let authMode = "signin";
let authMessage = "";
let appMessage = "";
let syncStatus = "Starting";
let syncMessage = "Checking account...";
let saveTimer = null;

function loadLocalState() {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return structuredClone(defaultState);
  }

  try {
    return mergeState(JSON.parse(stored));
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(nextState = {}) {
  return {
    ...structuredClone(defaultState),
    ...nextState,
    business: {
      ...defaultState.business,
      ...(nextState.business ?? {})
    },
    customers: nextState.customers ?? defaultState.customers,
    tasks: nextState.tasks ?? defaultState.tasks,
    templates: nextState.templates ?? defaultState.templates
  };
}

function saveLocalState() {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function setState(updater, options = {}) {
  state = typeof updater === "function" ? updater(state) : updater;
  saveLocalState();
  render();

  if (!options.skipRemote) {
    scheduleRemoteSave();
  }
}

function scheduleRemoteSave() {
  if (!session?.user) {
    return;
  }

  window.clearTimeout(saveTimer);
  syncStatus = "Saving";
  syncMessage = "Saving workspace...";
  render();

  saveTimer = window.setTimeout(async () => {
    await saveRemoteState();
  }, 450);
}

async function saveRemoteState() {
  if (!session?.user) {
    return;
  }

  const { error } = await supabase.from("vouchly_workspaces").upsert({
    user_id: session.user.id,
    state,
    updated_at: new Date().toISOString()
  });

  if (error) {
    syncStatus = "Local only";
    syncMessage = error.message;
  } else {
    syncStatus = "Cloud synced";
    syncMessage = `Private workspace for ${session.user.email}`;
  }

  render();
}

async function loadRemoteState() {
  if (!session?.user) {
    return;
  }

  syncStatus = "Loading";
  syncMessage = "Loading private workspace...";
  render();

  const { data, error } = await supabase
    .from("vouchly_workspaces")
    .select("state")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    syncStatus = "Local only";
    syncMessage = error.message;
    render();
    return;
  }

  if (data?.state) {
    setState(mergeState(data.state), { skipRemote: true });
    syncStatus = "Cloud synced";
    syncMessage = `Private workspace for ${session.user.email}`;
    render();
    return;
  }

  await saveRemoteState();
}

async function init() {
  const { data } = await supabase.auth.getSession();
  session = data.session;
  loading = false;

  supabase.auth.onAuthStateChange(async (_event, nextSession) => {
    session = nextSession;
    authMessage = "";

    if (session?.user) {
      await loadRemoteState();
    } else {
      syncStatus = "Signed out";
      syncMessage = "Sign in to use cloud sync.";
      render();
    }
  });

  if (session?.user) {
    await loadRemoteState();
  } else {
    syncStatus = "Signed out";
    syncMessage = "Sign in to create your workspace.";
    render();
  }
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => Number(item.id))) + 1 : Date.now();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function completionRate() {
  if (!state.customers.length) {
    return 0;
  }

  const reviewed = state.customers.filter((customer) => customer.status === "reviewed").length;
  return Math.round((reviewed / state.customers.length) * 100);
}

function isSetupComplete() {
  return Boolean(
    state.business.setupComplete &&
      state.business.name?.trim() &&
      state.business.type?.trim() &&
      state.business.owner?.trim() &&
      state.business.city?.trim() &&
      state.business.googleReviewLink?.trim()
  );
}

function requiredSetupFields(form) {
  return [
    ["Business name", form.name],
    ["Business type", form.type],
    ["Owner", form.owner],
    ["City", form.city],
    ["Subscription plan", form.plan],
    ["Google review link", form.googleReviewLink],
    ["Sender name", form.senderName],
    ["First review request message", form.firstTemplate],
    ["Reminder message", form.reminderTemplate]
  ].filter(([, value]) => !String(value ?? "").trim());
}

function buildMessage(customer) {
  const template =
    state.templates.find((item) => item.channel === customer.channel) ?? state.templates[0];

  return template.text
    .replaceAll("{{name}}", customer.name)
    .replaceAll("{{business}}", state.business.name)
    .replaceAll("{{link}}", state.business.googleReviewLink || "[Google review link]");
}

function queueReviewRequest(customerId) {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);

  setState((current) => ({
    ...current,
    customers: current.customers.map((entry) =>
      entry.id === customerId ? { ...entry, status: "sent" } : entry
    ),
    tasks: [
      {
        id: nextId(current.tasks),
        title: "Review follow-up",
        customerName: customer.name,
        channel: customer.channel,
        dueAt: `${dueDate.toISOString().slice(0, 10)} 17:00`,
        status: "scheduled"
      },
      ...current.tasks
    ]
  }));
}

function deleteCustomer(customerId) {
  setState((current) => {
    const customer = current.customers.find((entry) => entry.id === customerId);

    return {
      ...current,
      customers: current.customers.filter((entry) => entry.id !== customerId),
      tasks: current.tasks.filter((task) => !customer || task.customerName !== customer.name)
    };
  });
}

function exportData() {
  const rows = [
    ["record_type", "business_name", "business_type", "name", "phone", "email", "channel", "date_or_due", "status", "source_or_message"],
    [
      "business",
      state.business.name,
      state.business.type,
      state.business.owner,
      "",
      "",
      state.business.senderName,
      new Date().toISOString().slice(0, 10),
      "active",
      state.business.googleReviewLink
    ],
    ...state.customers.map((customer) => [
      "customer",
      state.business.name,
      state.business.type,
      customer.name,
      customer.phone,
      customer.email,
      customer.channel,
      customer.visitDate,
      customer.status,
      customer.source
    ]),
    ...state.tasks.map((task) => [
      "automation_task",
      state.business.name,
      state.business.type,
      task.customerName,
      "",
      "",
      task.channel,
      task.dueAt,
      task.status,
      task.title
    ])
  ];

  const csv = rows.map((row) => row.map(formatCsvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "vouchly-data-backup.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatCsvCell(value = "") {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function render() {
  const app = document.querySelector("#app");

  if (loading) {
    app.innerHTML = `<main class="auth-page"><section class="auth-card"><h1>Vouchly</h1><p>Loading workspace...</p></section></main>`;
    return;
  }

  if (!session?.user) {
    app.innerHTML = renderAuth();
    bindAuthEvents();
    return;
  }

  const setupComplete = isSetupComplete();

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">V</span>
          <div>
            <strong>Vouchly</strong>
            <small>Review Growth Console</small>
          </div>
        </div>
        ${setupComplete ? navButton("dashboard", "Dashboard") : ""}
        ${setupComplete ? navButton("customers", "Customers") : ""}
        ${setupComplete ? navButton("automations", "Automations") : ""}
        ${setupComplete ? navButton("templates", "Templates") : ""}
        ${navButton("settings", setupComplete ? "Settings" : "Setup")}
        <div class="business-card">
          <small>Business</small>
          <strong>${escapeHtml(state.business.name)}</strong>
          <span>${escapeHtml(state.business.type)} - ${escapeHtml(state.business.city)}</span>
          <span>${escapeHtml(syncStatus)}</span>
        </div>
      </aside>
      <main class="main">
        ${renderHeader()}
        ${renderSyncBanner()}
        ${renderAppMessage()}
        ${setupComplete ? renderView() : renderOnboarding()}
      </main>
    </div>
  `;

  bindEvents();
}

function renderAuth() {
  const isSignup = authMode === "signup";

  return `
    <main class="auth-page">
      <section class="auth-card">
        <div class="auth-brand">
          <span class="brand-mark">V</span>
          <div>
            <p class="eyebrow">Vouchly</p>
            <strong>Review Growth Console</strong>
          </div>
        </div>
        <h1>${isSignup ? "Start your review engine" : "Welcome back to Vouchly"}</h1>
        <p>${isSignup ? "Create a private workspace for customers, review links, follow-ups, and templates." : "Open your saved customer and automation workspace."}</p>
        <form id="auth-form" class="auth-form">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required minlength="6" />
          <button class="primary-button" type="submit">${isSignup ? "Create account" : "Sign in"}</button>
        </form>
        ${authMessage ? `<div class="auth-message">${escapeHtml(authMessage)}</div>` : ""}
        <button class="link-button" data-auth-mode="${isSignup ? "signin" : "signup"}">
          ${isSignup ? "Already have an account? Sign in" : "New business? Create account"}
        </button>
      </section>
      <section class="auth-preview" aria-hidden="true">
        <div class="preview-top">
          <span>Today</span>
          <strong>Review requests</strong>
        </div>
        <div class="preview-metric">
          <strong>42</strong>
          <span>customers queued</span>
        </div>
        <div class="preview-row">
          <span>WhatsApp follow-up</span>
          <strong>Ready</strong>
        </div>
        <div class="preview-row">
          <span>Google review link</span>
          <strong>Attached</strong>
        </div>
        <div class="preview-row">
          <span>Reminder template</span>
          <strong>Saved</strong>
        </div>
      </section>
    </main>
  `;
}

function renderSyncBanner() {
  return `
    <div class="sync-banner">
      <strong>${escapeHtml(syncStatus)}</strong>
      <span>${escapeHtml(syncMessage)}</span>
    </div>
  `;
}

function renderAppMessage() {
  if (!appMessage) {
    return "";
  }

  return `<div class="app-message">${escapeHtml(appMessage)}</div>`;
}

function navButton(view, label) {
  return `<button class="nav-button ${state.activeView === view ? "active" : ""}" data-view="${view}">${label}</button>`;
}

function renderHeader() {
  const setupComplete = isSetupComplete();

  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${escapeHtml(state.business.type)}</p>
        <h1>${escapeHtml(state.business.name)}</h1>
      </div>
      <div class="top-actions">
        <span class="account-pill">${escapeHtml(session.user.email)}</span>
        <button class="ghost-button" data-action="logout">Logout</button>
        ${setupComplete ? `<button class="primary-button" data-action="bulk-send">Send requests</button>` : ""}
      </div>
    </header>
  `;
}

function renderView() {
  if (state.activeView === "customers") return renderCustomers();
  if (state.activeView === "automations") return renderAutomations();
  if (state.activeView === "templates") return renderTemplates();
  if (state.activeView === "settings") return renderSettings();
  return renderDashboard();
}

function renderOnboarding() {
  return `
    <section class="setup-hero">
      <p class="eyebrow">Business setup</p>
      <h2>Set up the review workflow before sending requests</h2>
      <p>Vouchly will use this profile and the templates below when customers receive review requests.</p>
    </section>
    ${renderSettings(true)}
  `;
}

function renderDashboard() {
  const scheduled = state.tasks.filter((task) => task.status === "scheduled").length;
  const pending = state.customers.filter((customer) => customer.status === "pending").length;

  return `
    <section class="metrics-grid">
      ${metricCard("Customers", state.customers.length, "contacts in workspace")}
      ${metricCard("Review rate", `${completionRate()}%`, "marked reviewed")}
      ${metricCard("Pending", pending, "need first request")}
      ${metricCard("Automations", scheduled, "scheduled tasks")}
    </section>
    <section class="split-grid">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Queue</p>
            <h2>Customers needing action</h2>
          </div>
          <button class="ghost-button small" data-view="customers">Open</button>
        </div>
        ${customerRows(state.customers.slice(0, 5))}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Automation</p>
            <h2>Upcoming follow-ups</h2>
          </div>
          <button class="ghost-button small" data-view="automations">Open</button>
        </div>
        ${taskRows(state.tasks.slice(0, 5))}
      </div>
    </section>
  `;
}

function metricCard(label, value, detail) {
  return `
    <article class="metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderCustomers() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Customers</p>
          <h2>Add customer and queue review automation</h2>
        </div>
      </div>
      <form class="inline-form" id="customer-form">
        <input name="name" placeholder="Customer name" required />
        <input name="phone" placeholder="Phone" />
        <input name="email" placeholder="Email" />
        <select name="channel">
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>
        <input name="visitDate" type="date" value="${new Date().toISOString().slice(0, 10)}" />
        <input name="source" placeholder="Source" value="walk-in" />
        <button class="primary-button" type="submit">Add customer</button>
      </form>
      ${customerRows(state.customers)}
    </section>
  `;
}

function customerRows(customers) {
  if (!customers.length) {
    return `<div class="empty-state">No customers yet.</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Channel</th>
            <th>Visit</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${customers
            .map(
              (customer) => `
                <tr>
                  <td>${escapeHtml(customer.name)}</td>
                  <td>${escapeHtml(customer.phone || customer.email || "Missing")}</td>
                  <td>${escapeHtml(customer.channel)}</td>
                  <td>${escapeHtml(customer.visitDate)}</td>
                  <td><span class="status ${escapeHtml(customer.status)}">${escapeHtml(customer.status)}</span></td>
                  <td class="row-actions">
                    <button class="ghost-button small" data-action="preview-message" data-id="${customer.id}">Preview</button>
                    <button class="ghost-button small" data-action="queue" data-id="${customer.id}">Queue</button>
                    <button class="danger-button small" data-action="delete-customer" data-id="${customer.id}">Delete</button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderAutomations() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Automations</p>
          <h2>Scheduled review follow-ups</h2>
        </div>
      </div>
      ${taskRows(state.tasks)}
    </section>
  `;
}

function taskRows(tasks) {
  if (!tasks.length) {
    return `<div class="empty-state">No automation tasks yet.</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Customer</th>
            <th>Channel</th>
            <th>Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${tasks
            .map(
              (task) => `
                <tr>
                  <td>${escapeHtml(task.title)}</td>
                  <td>${escapeHtml(task.customerName)}</td>
                  <td>${escapeHtml(task.channel)}</td>
                  <td>${escapeHtml(task.dueAt)}</td>
                  <td><span class="status ${escapeHtml(task.status)}">${escapeHtml(task.status)}</span></td>
                  <td>
                    <button class="ghost-button small" data-action="complete-task" data-id="${task.id}">
                      ${task.status === "done" ? "Done" : "Mark done"}
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTemplates() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Templates</p>
          <h2>Message templates</h2>
        </div>
      </div>
      <div class="template-grid">
        ${state.templates
          .map(
            (template) => `
              <article class="template-card">
                <span>${escapeHtml(template.channel)}</span>
                <h3>${escapeHtml(template.name)}</h3>
                <p>${escapeHtml(template.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSettings(isOnboarding = false) {
  const firstTemplate = state.templates[0] ?? defaultState.templates[0];
  const reminderTemplate = state.templates[1] ?? defaultState.templates[1];
  const selectedPlan = plans.find((plan) => plan.id === state.business.plan) ?? plans[0];

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">${isOnboarding ? "Step 1" : "Settings"}</p>
          <h2>${isOnboarding ? "Business profile and messages" : "Business profile"}</h2>
        </div>
      </div>
      <form class="settings-form" id="settings-form">
        <label>
          Business name
          <input name="name" value="${escapeHtml(state.business.name)}" />
        </label>
        <label>
          Business type
          <select name="type">
            ${businessTypes
              .map(
                (type) =>
                  `<option value="${escapeHtml(type)}" ${state.business.type === type ? "selected" : ""}>${escapeHtml(type)}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>
          Owner
          <input name="owner" value="${escapeHtml(state.business.owner)}" />
        </label>
        <label>
          City
          <input name="city" value="${escapeHtml(state.business.city)}" />
        </label>
        <div class="wide">
          <p class="field-title">Subscription plan</p>
          <div class="plan-grid" role="radiogroup" aria-label="Subscription plan">
            ${plans
              .map(
                (plan) => `
                  <label class="plan-card ${selectedPlan.id === plan.id ? "selected" : ""}">
                    <input name="plan" type="radio" value="${escapeHtml(plan.id)}" ${selectedPlan.id === plan.id ? "checked" : ""} />
                    <span>${escapeHtml(plan.name)}</span>
                    <strong>${escapeHtml(plan.price)}</strong>
                    <small>${escapeHtml(plan.fit)}</small>
                  </label>
                `
              )
              .join("")}
          </div>
          <div class="plan-detail" id="plan-detail">
            ${renderPlanDetail(selectedPlan)}
          </div>
        </div>
        <label class="wide">
          Google review link
          <input name="googleReviewLink" value="${escapeHtml(state.business.googleReviewLink)}" placeholder="https://g.page/r/..." />
        </label>
        <label class="wide">
          Sender name
          <input name="senderName" value="${escapeHtml(state.business.senderName)}" />
        </label>
        <label class="wide">
          First review request message
          <textarea name="firstTemplate" rows="4">${escapeHtml(firstTemplate.text)}</textarea>
        </label>
        <label class="wide">
          Reminder message
          <textarea name="reminderTemplate" rows="4">${escapeHtml(reminderTemplate.text)}</textarea>
        </label>
        <div class="template-help wide">
          Use <code>{{name}}</code>, <code>{{business}}</code>, and <code>{{link}}</code>. Vouchly adds the Google review link automatically.
        </div>
        ${isOnboarding ? "" : `<button class="ghost-button wide" data-action="export" type="button">Download data backup</button>`}
        <button class="primary-button" type="submit">${isOnboarding ? "Finish setup" : "Save settings"}</button>
      </form>
    </section>
  `;
}

function renderPlanDetail(plan) {
  return `
    <strong>${escapeHtml(plan.name)} includes</strong>
    <span>${escapeHtml(plan.limits)}</span>
    <ul>
      ${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function bindAuthEvents() {
  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document.querySelector("[data-auth-mode]")?.addEventListener("click", (event) => {
    authMode = event.currentTarget.dataset.authMode;
    authMessage = "";
    render();
  });
}

async function submitAuth(event) {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(event.currentTarget).entries());
  authMessage = authMode === "signup" ? "Creating account..." : "Signing in...";
  render();

  const response =
    authMode === "signup"
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

  if (response.error) {
    authMessage = response.error.message;
    render();
    return;
  }

  if (authMode === "signup" && !response.data.session) {
    authMessage = "Account created. Check email if confirmation is enabled, then sign in.";
    authMode = "signin";
    render();
    return;
  }

  authMessage = "";
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      setState((current) => ({ ...current, activeView: button.dataset.view }));
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const id = Number(button.dataset.id);

      if (action === "export") exportData();
      if (action === "bulk-send") bulkQueueRequests();
      if (action === "queue") queueReviewRequest(id);
      if (action === "delete-customer") deleteCustomer(id);
      if (action === "complete-task") completeTask(id);
      if (action === "preview-message") previewMessage(id);
      if (action === "logout") logout();
    });
  });

  document.querySelector("#customer-form")?.addEventListener("submit", addCustomer);
  document.querySelector("#settings-form")?.addEventListener("submit", saveSettings);
  document.querySelectorAll('input[name="plan"]').forEach((input) => {
    input.addEventListener("change", () => {
      const selectedPlan = plans.find((plan) => plan.id === input.value) ?? plans[0];
      document
        .querySelectorAll(".plan-card")
        .forEach((card) => card.classList.toggle("selected", card.contains(input)));

      const detail = document.querySelector("#plan-detail");
      if (detail) {
        detail.innerHTML = renderPlanDetail(selectedPlan);
      }
    });
  });
}

function addCustomer(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const customer = Object.fromEntries(form.entries());

  setState((current) => ({
    ...current,
    customers: [
      {
        id: nextId(current.customers),
        ...customer,
        status: "pending"
      },
      ...current.customers
    ],
    tasks: [
      {
        id: nextId(current.tasks),
        title: "Send review request",
        customerName: customer.name,
        channel: customer.channel,
        dueAt: `${customer.visitDate} 11:00`,
        status: "scheduled"
      },
      ...current.tasks
    ]
  }));
}

function saveSettings(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  const { firstTemplate, reminderTemplate, ...business } = form;
  const missingFields = requiredSetupFields(form);

  if (missingFields.length) {
    appMessage = `Please fill: ${missingFields.map(([label]) => label).join(", ")}.`;
    render();
    return;
  }

  appMessage = "Business setup saved.";

  setState((current) => ({
    ...current,
    activeView: "dashboard",
    business: {
      ...current.business,
      ...business,
      setupComplete: true
    },
    templates: current.templates.map((template, index) => {
      if (index === 0) {
        return { ...template, text: firstTemplate };
      }

      if (index === 1) {
        return { ...template, text: reminderTemplate };
      }

      return template;
    })
  }));
}

function bulkQueueRequests() {
  const pendingCustomers = state.customers.filter((customer) => customer.status === "pending");
  const tasks = pendingCustomers.map((customer, index) => ({
    id: Date.now() + index,
    title: "Bulk review request",
    customerName: customer.name,
    channel: customer.channel,
    dueAt: `${new Date().toISOString().slice(0, 10)} 18:00`,
    status: "scheduled"
  }));

  setState((current) => ({
    ...current,
    customers: current.customers.map((customer) =>
      customer.status === "pending" ? { ...customer, status: "sent" } : customer
    ),
    tasks: [...tasks, ...current.tasks]
  }));
}

function completeTask(taskId) {
  setState((current) => ({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId ? { ...task, status: "done" } : task
    )
  }));
}

function previewMessage(customerId) {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  window.alert(buildMessage(customer));
}

async function logout() {
  window.clearTimeout(saveTimer);
  session = null;
  authMessage = "";
  appMessage = "";
  syncStatus = "Signed out";
  syncMessage = "Sign in to use cloud sync.";
  render();

  await supabase.auth.signOut();
}

render();
init();
