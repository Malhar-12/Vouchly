const businessTypes = [
  "General Store",
  "Hospital",
  "Clinic",
  "Dental",
  "Orthopedic",
  "Eye Care",
  "Textile Shop",
  "Barber",
  "Hotel",
  "Restaurant",
  "Car Service",
  "Car Care",
  "Mobile Shop",
  "Salon",
  "Gym",
  "Coaching Class"
];

const defaultState = {
  activeView: "dashboard",
  business: {
    name: "Bright Local Services",
    type: "General Store",
    owner: "Business Owner",
    city: "Bangalore",
    googleReviewLink: "",
    senderName: "Bright Local Services"
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
    },
    {
      id: 3,
      name: "Aisha Khan",
      phone: "",
      email: "aisha@example.com",
      channel: "email",
      visitDate: "2026-05-08",
      status: "reviewed",
      source: "online"
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
    },
    {
      id: 12,
      title: "Second reminder",
      customerName: "Rahul Mehta",
      channel: "sms",
      dueAt: "2026-05-12 16:00",
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

const storageKey = "reviewloop-universal-state-v1";
let state = loadState();

function loadState() {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return structuredClone(defaultState);
  }

  try {
    return { ...structuredClone(defaultState), ...JSON.parse(stored) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function setState(updater) {
  state = typeof updater === "function" ? updater(state) : updater;
  saveState();
  render();
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : Date.now();
}

function completionRate() {
  if (!state.customers.length) {
    return 0;
  }

  const reviewed = state.customers.filter((customer) => customer.status === "reviewed").length;
  return Math.round((reviewed / state.customers.length) * 100);
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
  setState((current) => ({
    ...current,
    customers: current.customers.filter((customer) => customer.id !== customerId),
    tasks: current.tasks.filter((task) => {
      const customer = current.customers.find((entry) => entry.id === customerId);
      return !customer || task.customerName !== customer.name;
    })
  }));
}

function exportData() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), ...state }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "reviewloop-data.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function render() {
  document.querySelector("#app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">R</span>
          <div>
            <strong>ReviewLoop</strong>
            <small>Universal Review Console</small>
          </div>
        </div>
        ${navButton("dashboard", "Dashboard")}
        ${navButton("customers", "Customers")}
        ${navButton("automations", "Automations")}
        ${navButton("templates", "Templates")}
        ${navButton("settings", "Settings")}
        <div class="business-card">
          <small>Business</small>
          <strong>${state.business.name}</strong>
          <span>${state.business.type} · ${state.business.city}</span>
        </div>
      </aside>
      <main class="main">
        ${renderHeader()}
        ${renderView()}
      </main>
    </div>
  `;

  bindEvents();
}

function navButton(view, label) {
  return `<button class="nav-button ${state.activeView === view ? "active" : ""}" data-view="${view}">${label}</button>`;
}

function renderHeader() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${state.business.type}</p>
        <h1>${state.business.name}</h1>
      </div>
      <div class="top-actions">
        <button class="ghost-button" data-action="export">Export</button>
        <button class="primary-button" data-action="bulk-send">Send requests</button>
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
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
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
                  <td>${customer.name}</td>
                  <td>${customer.phone || customer.email || "Missing"}</td>
                  <td>${customer.channel}</td>
                  <td>${customer.visitDate}</td>
                  <td><span class="status ${customer.status}">${customer.status}</span></td>
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
                  <td>${task.title}</td>
                  <td>${task.customerName}</td>
                  <td>${task.channel}</td>
                  <td>${task.dueAt}</td>
                  <td><span class="status ${task.status}">${task.status}</span></td>
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
                <span>${template.channel}</span>
                <h3>${template.name}</h3>
                <p>${template.text}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Settings</p>
          <h2>Business profile</h2>
        </div>
      </div>
      <form class="settings-form" id="settings-form">
        <label>
          Business name
          <input name="name" value="${state.business.name}" />
        </label>
        <label>
          Business type
          <select name="type">
            ${businessTypes
              .map(
                (type) =>
                  `<option value="${type}" ${state.business.type === type ? "selected" : ""}>${type}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>
          Owner
          <input name="owner" value="${state.business.owner}" />
        </label>
        <label>
          City
          <input name="city" value="${state.business.city}" />
        </label>
        <label class="wide">
          Google review link
          <input name="googleReviewLink" value="${state.business.googleReviewLink}" placeholder="https://g.page/r/..." />
        </label>
        <label class="wide">
          Sender name
          <input name="senderName" value="${state.business.senderName}" />
        </label>
        <button class="primary-button" type="submit">Save settings</button>
      </form>
    </section>
  `;
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
    });
  });

  document.querySelector("#customer-form")?.addEventListener("submit", addCustomer);
  document.querySelector("#settings-form")?.addEventListener("submit", saveSettings);
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
  const business = Object.fromEntries(new FormData(event.currentTarget).entries());
  setState((current) => ({ ...current, business }));
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

render();
