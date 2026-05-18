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
    includes: ["Customer list", "Review request tracking", "CSV data backup", "Editable templates", "30 automated review requests", "10 follow-up tasks"]
  },
  {
    id: "starter",
    name: "Starter",
    price: "INR 999 / month",
    fit: "For small shops or solo businesses that want organized review tracking.",
    limits: "Up to 500 customers/month",
    includes: ["Customer list", "Review request tracking", "CSV data backup", "100 automated review requests"]
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
    price: "INR 7,999 / month",
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
      status: "scheduled",
      source: "service"
    }
  ],
  tasks: [
    {
      id: 11,
      title: "Review request",
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
  ],
  deletedCustomerKeys: []
};

const storageKey = "vouchly-universal-state-v2";
const savedTaskTitleMap = {
  "Send review request": "Review request",
  "Review follow-up": "Review reminder",
  "Bulk review request": "Review request batch"
};
const savedCustomerStatusMap = {
  sent: "scheduled"
};
const customerListLimit = 50;
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

let hasStoredLocalState = false;
let state = loadLocalState();
let session = null;
let loading = true;
let authMode = "signin";
let authMessage = "";
let authNeedsConfirmation = false;
let lastAuthEmail = window.localStorage.getItem("vouchly-pending-email") || "";
let appMessage = "";
let syncStatus = "Starting";
let syncMessage = "Checking account...";
let saveTimer = null;
let pendingPlanId = window.localStorage.getItem("vouchly-pending-plan") || "";
let customerFilters = {
  query: "",
  status: "all",
  channel: "all"
};

function loadLocalState() {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return structuredClone(defaultState);
  }

  hasStoredLocalState = true;

  try {
    return mergeState(JSON.parse(stored));
  } catch {
    hasStoredLocalState = false;
    return structuredClone(defaultState);
  }
}

function mergeState(nextState = {}) {
  const tasks = nextState.tasks ?? defaultState.tasks;
  const customers = nextState.customers ?? defaultState.customers;
  const deletedCustomerKeys = nextState.deletedCustomerKeys ?? defaultState.deletedCustomerKeys;

  return {
    ...structuredClone(defaultState),
    ...nextState,
    business: {
      ...defaultState.business,
      ...(nextState.business ?? {})
    },
    customers: customers.map((customer) => ({
      ...customer,
      status: savedCustomerStatusMap[customer.status] ?? customer.status
    })),
    tasks: tasks.map((task) => ({
      ...task,
      title: savedTaskTitleMap[task.title] ?? task.title
    })),
    templates: nextState.templates ?? defaultState.templates,
    deletedCustomerKeys
  };
}

function saveLocalState() {
  hasStoredLocalState = true;
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
    const remoteState = mergeState(data.state);
    const nextState = hasStoredLocalState ? mergeWorkspaceStates(remoteState, state) : remoteState;
    const planFromLanding = pendingPlanId && !nextState.business.setupComplete ? pendingPlanId : "";
    const stateWithPlan = planFromLanding
      ? {
          ...nextState,
          business: {
            ...nextState.business,
            plan: planFromLanding
          }
        }
      : nextState;
    const shouldRepairRemote =
      stateWithPlan.customers.length !== remoteState.customers.length ||
      stateWithPlan.tasks.length !== remoteState.tasks.length ||
      Boolean(planFromLanding);

    setState(stateWithPlan, { skipRemote: true });
    syncStatus = "Cloud synced";
    syncMessage = shouldRepairRemote
      ? `Recovered local changes for ${session.user.email}`
      : `Private workspace for ${session.user.email}`;
    render();

    if (shouldRepairRemote) {
      await saveRemoteState();
    }

    return;
  }

  if (pendingPlanId) {
    setState(
      (current) => ({
        ...current,
        business: {
          ...current.business,
          plan: pendingPlanId
        }
      }),
      { skipRemote: true }
    );
  }

  await saveRemoteState();
}

function mergeWorkspaceStates(remoteState, localState) {
  const deletedCustomerKeys = [
    ...new Set([...(remoteState.deletedCustomerKeys ?? []), ...(localState.deletedCustomerKeys ?? [])])
  ];

  return {
    ...remoteState,
    activeView: localState.activeView ?? remoteState.activeView,
    business: {
      ...remoteState.business,
      ...localState.business
    },
    customers: mergeUniqueRecords(remoteState.customers, localState.customers, customerRecordKey).filter(
      (customer) => !deletedCustomerKeys.includes(customerRecordKey(customer))
    ),
    tasks: mergeUniqueRecords(remoteState.tasks, localState.tasks, taskRecordKey),
    templates: localState.templates?.length ? localState.templates : remoteState.templates,
    deletedCustomerKeys
  };
}

function mergeUniqueRecords(primaryRecords = [], secondaryRecords = [], getKey) {
  const seen = new Set();
  const records = [];

  [...primaryRecords, ...secondaryRecords].forEach((record) => {
    const key = getKey(record);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    records.push(record);
  });

  return records;
}

function customerRecordKey(customer) {
  const contact = customer.phone || customer.email || customer.name;
  return `${customer.name}|${contact}|${customer.visitDate}`.toLowerCase();
}

function taskRecordKey(task) {
  return `${task.title}|${task.customerName}|${task.channel}|${task.dueAt}`.toLowerCase();
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
      entry.id === customerId ? { ...entry, status: "scheduled" } : entry
    ),
    tasks: [
      {
        id: nextId(current.tasks),
        title: "Review reminder",
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
    const deletedCustomerKeys = customer
      ? [...new Set([...(current.deletedCustomerKeys ?? []), customerRecordKey(customer)])]
      : current.deletedCustomerKeys ?? [];

    return {
      ...current,
      deletedCustomerKeys,
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
        ${setupComplete ? navButton("automations", "Follow-ups") : ""}
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
  const pendingPlan = plans.find((plan) => plan.id === pendingPlanId) ?? plans[0];

  return `
    <main class="marketing-page">
      <nav class="marketing-nav">
        <a class="marketing-logo" href="#hero" aria-label="Vouchly home">
          <span>V</span>
          Vouchly
        </a>
        <div class="marketing-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div class="marketing-actions">
          <a class="ghost-button small" href="#auth-panel" data-auth-mode="signin">Sign in</a>
          <a class="primary-button small" href="#auth-panel" data-auth-mode="signup" data-plan-id="free">Start free</a>
        </div>
      </nav>

      <section class="marketing-hero" id="hero">
        <div class="hero-copy">
          <p class="hero-badge">First month free. No credit card needed.</p>
          <h1>Turn happy customers into <span>Google reviews.</span></h1>
          <p>
            Vouchly helps local businesses organize customers, schedule review requests,
            manage message templates, and track follow-ups from one simple dashboard.
          </p>
          <div class="hero-actions">
            <a class="primary-button" href="#auth-panel" data-auth-mode="signup" data-plan-id="free">Start free month -></a>
            <a class="ghost-button" href="#pricing">See plans -></a>
          </div>
        </div>
        <div class="hero-dashboard-card" aria-label="Vouchly dashboard preview">
          <div class="mock-topbar">
            <span></span><span></span><span></span>
            <strong>Vouchly Dashboard - My Salon</strong>
          </div>
          <div class="mock-stats">
            <article><strong>48</strong><small>Reviews this month</small></article>
            <article><strong>142</strong><small>Customers added</small></article>
            <article><strong>87%</strong><small>Request response rate</small></article>
          </div>
          <div class="mock-section-title">
            <span>Recent customers</span>
            <strong>12 pending follow-up</strong>
          </div>
          <div class="mock-row"><span>Rahul Kumar</span><small>WhatsApp request sent</small><strong>Reviewed</strong></div>
          <div class="mock-row"><span>Priya Shah</span><small>Reminder scheduled</small><strong>Scheduled</strong></div>
          <div class="mock-row"><span>Amit Mehta</span><small>Needs first request</small><strong>Pending</strong></div>
        </div>
      </section>

      <section class="marketing-section showcase-section" id="how">
        <p class="eyebrow">How it works</p>
        <h2>Simple enough for any local business owner</h2>
        <div class="marketing-grid four">
          ${marketingStep("1", "Set up profile", "Add your business name, type, city, and Google review link.")}
          ${marketingStep("2", "Add customers", "Add customers after a sale, visit, appointment, or service.")}
          ${marketingStep("3", "Schedule requests", "Preview the message and schedule the review request.")}
          ${marketingStep("4", "Track follow-ups", "See who is pending, scheduled, reviewed, or needs attention.")}
        </div>
      </section>

      <section class="marketing-section showcase-section feature-pop-section" id="features">
        <p class="eyebrow">Features</p>
        <h2>Everything needed to start review automation</h2>
        <div class="marketing-grid three">
          ${marketingFeature("Customer list management", "Store customer name, contact, visit date, channel, and status.")}
          ${marketingFeature("Review request scheduling", "Create review reminders for WhatsApp, SMS, or email workflows.")}
          ${marketingFeature("Editable templates", "Keep ready-made messages with your Google review link attached.")}
          ${marketingFeature("Follow-up tracking", "Know who still needs a reminder before reviews are lost.")}
          ${marketingFeature("CSV data backup", "Download customer and automation data in spreadsheet-friendly CSV format.")}
          ${marketingFeature("Built for local growth", "Simple workflows for shops, clinics, salons, hotels, services, and teams worldwide.")}
        </div>
      </section>

      <section class="marketing-section industries">
        <p class="eyebrow">Who uses Vouchly</p>
        <h2>Built for every local business</h2>
        <div class="industry-tags">
          ${[
            ["Restaurants", "🍽️"],
            ["Salons", "💇"],
            ["Clinics", "🏥"],
            ["Dentists", "🦷"],
            ["Hotels", "🏨"],
            ["Resorts", "🌴"],
            ["Bakeries", "🥐"],
            ["Fast Food", "🍔"],
            ["Garages", "🚗"],
            ["Car Wash", "🧽"],
            ["Bike Repair", "🏍️"],
            ["Coaching Classes", "📚"],
            ["Tuition Centers", "✏️"],
            ["Mobile Repair", "📱"],
            ["Electronics Stores", "🔌"],
            ["Furniture Stores", "🛋️"],
            ["Travel Agencies", "✈️"],
            ["Event Planners", "🎉"],
            ["Wedding Photographers", "💍"],
            ["Gyms", "💪"],
            ["Yoga Studios", "🧘"],
            ["Spas", "🧖"],
            ["Tattoo Studios", "🎨"],
            ["Pet Clinics", "🐾"],
            ["Pet Grooming", "🐶"],
            ["Pharmacies", "💊"],
            ["Diagnostic Labs", "🧪"],
            ["Real Estate", "🏠"],
            ["Packers & Movers", "📦"],
            ["Photographers", "📸"],
            ["Cleaning Services", "🧹"],
            ["Pest Control", "🛡️"],
            ["Service Providers", "🔧"],
            ["Cloud Kitchens", "🍱"],
            ["Bars & Lounges", "🍸"],
            ["Coworking Spaces", "💼"],
            ["Interior Designers", "🎯"],
            ["Tour Operators", "🗺️"],
            ["Dance Classes", "🎵"],
            ["Music Classes", "🎸"],
            ["Swimming Clubs", "🏊"],
            ["Internet Cafes", "🖥️"],
            ["Real Local Brands", "✨"]
          ].map(([item, icon]) => `<span><b>${icon}</b>${item}</span>`).join("")}
        </div>
      </section>

      <section class="marketing-section pricing-section" id="pricing">
        <p class="eyebrow">Pricing</p>
        <h2>Simple plans that grow with you</h2>
        <p class="section-sub">Start free. Upgrade when your customer volume grows.</p>
        <div class="pricing-grid">
          ${plans.map((plan) => renderMarketingPlan(plan)).join("")}
        </div>
      </section>

      <section class="marketing-auth-section" id="auth-panel">
        <div class="auth-trust-panel">
          <span class="brand-mark">V</span>
          <h2>More reviews. More customers. More trust.</h2>
          <p>Built for local businesses worldwide that want a simple review follow-up system without technical setup.</p>
          <ul>
            <li>No technical knowledge needed</li>
            <li>First month free</li>
            <li>Private workspace with Supabase login</li>
            <li>Works on mobile and desktop</li>
          </ul>
        </div>

        <section class="auth-card marketing-auth-card">
          <div class="auth-tabs">
            <button class="${!isSignup ? "active" : ""}" data-auth-mode="signin" type="button">Sign in</button>
            <button class="${isSignup ? "active" : ""}" data-auth-mode="signup" type="button">Create account</button>
          </div>
          <h2>${isSignup ? "Start your free month." : "Welcome back."}</h2>
          <p>${isSignup ? "Create your account. After signup, add your business details and Google review link." : "Sign in to manage customers, review requests, templates, and follow-ups."}</p>
          ${isSignup ? `<div class="selected-plan-note"><span>Selected plan</span><strong>${escapeHtml(pendingPlan.name)}</strong><small>${escapeHtml(pendingPlan.price)}</small></div>` : ""}
          <form id="auth-form" class="auth-form">
            <input name="email" type="email" placeholder="you@business.com" autocomplete="off" data-private-input required />
            <input name="password" type="password" placeholder="${isSignup ? "Create a password" : "Your password"}" autocomplete="new-password" data-private-input required minlength="6" />
            <button class="primary-button" type="submit">${isSignup ? "Create free account" : "Sign in to Vouchly"}</button>
          </form>
          ${
            authMessage
              ? `<div class="auth-message">${escapeHtml(authMessage)}</div>`
              : ""
          }
          ${
            authNeedsConfirmation && lastAuthEmail
              ? `<button class="ghost-button resend-button" data-action="resend-confirmation" type="button">Resend confirmation email</button>`
              : ""
          }
          <button class="link-button" data-auth-mode="${isSignup ? "signin" : "signup"}">
            ${isSignup ? "Already have an account? Sign in" : "New business? Start free"}
          </button>
        </section>
      </section>

      <footer class="marketing-footer">
        <strong>Vouchly</strong>
        <span>Review growth software for local businesses worldwide</span>
      </footer>
    </main>
  `;
}

function marketingStep(number, title, body) {
  return `
    <article class="marketing-card">
      <span class="step-number">${number}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function marketingFeature(title, body) {
  return `
    <article class="marketing-card feature-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function renderMarketingPlan(plan) {
  const isGrowth = plan.id === "growth";

  return `
    <article class="marketing-plan ${isGrowth ? "popular" : ""}">
      ${isGrowth ? `<span class="popular-pill">Most popular</span>` : ""}
      <span>${escapeHtml(plan.name)}</span>
      <strong>${escapeHtml(plan.price)}</strong>
      <p>${escapeHtml(plan.fit)}</p>
      <small>${escapeHtml(plan.limits)}</small>
      <ul>
        ${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <a class="${isGrowth ? "primary-button" : "ghost-button"} small" href="#auth-panel" data-auth-mode="signup" data-plan-id="${escapeHtml(plan.id)}">
        ${plan.id === "free" ? "Start free month" : `Choose ${escapeHtml(plan.name)}`}
      </a>
    </article>
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
      ${metricCard("Follow-ups", scheduled, "scheduled reminders")}
    </section>
    <section class="split-grid">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Requests</p>
            <h2>Customers to contact</h2>
          </div>
          <button class="ghost-button small" data-view="customers">Open</button>
        </div>
        ${customerRows(state.customers.slice(0, 5))}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Follow-ups</p>
            <h2>Scheduled reminders</h2>
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
  const filteredCustomers = filterCustomers(state.customers);
  const visibleCustomers = filteredCustomers.slice(0, customerListLimit);

  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Customers</p>
          <h2>Add customer and schedule a review request</h2>
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
      <div class="list-toolbar">
        <input data-filter="query" value="${escapeHtml(customerFilters.query)}" placeholder="Search name, phone, email..." />
        <select data-filter="status">
          <option value="all" ${customerFilters.status === "all" ? "selected" : ""}>All statuses</option>
          <option value="pending" ${customerFilters.status === "pending" ? "selected" : ""}>Pending</option>
          <option value="scheduled" ${customerFilters.status === "scheduled" ? "selected" : ""}>Scheduled</option>
          <option value="reviewed" ${customerFilters.status === "reviewed" ? "selected" : ""}>Reviewed</option>
        </select>
        <select data-filter="channel">
          <option value="all" ${customerFilters.channel === "all" ? "selected" : ""}>All channels</option>
          <option value="whatsapp" ${customerFilters.channel === "whatsapp" ? "selected" : ""}>WhatsApp</option>
          <option value="sms" ${customerFilters.channel === "sms" ? "selected" : ""}>SMS</option>
          <option value="email" ${customerFilters.channel === "email" ? "selected" : ""}>Email</option>
        </select>
        <span class="result-count">
          Showing ${visibleCustomers.length} of ${filteredCustomers.length} customers
        </span>
      </div>
      ${filteredCustomers.length > customerListLimit ? `<div class="list-note">Showing the latest ${customerListLimit}. Use search or filters to find older customers.</div>` : ""}
      ${customerRows(visibleCustomers)}
    </section>
  `;
}

function filterCustomers(customers) {
  const query = customerFilters.query.trim().toLowerCase();

  return customers.filter((customer) => {
    const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus =
      customerFilters.status === "all" || customer.status === customerFilters.status;
    const matchesChannel =
      customerFilters.channel === "all" || customer.channel === customerFilters.channel;

    return matchesQuery && matchesStatus && matchesChannel;
  });
}

function customerRows(customers) {
  if (!customers.length) {
    return `<div class="empty-state">No customers match this view.</div>`;
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
                    <button class="ghost-button small" data-action="preview-message" data-id="${customer.id}">Preview msg</button>
                    <button class="ghost-button small" data-action="queue" data-id="${customer.id}">Schedule</button>
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
          <p class="eyebrow">Follow-ups</p>
          <h2>Scheduled customer reminders</h2>
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
  window.setTimeout(() => {
    document.querySelectorAll("[data-private-input]").forEach((input) => {
      if (document.activeElement !== input) {
        input.value = "";
      }
    });
  }, 50);

  document.querySelector("#auth-form")?.addEventListener("submit", submitAuth);
  document
    .querySelector('[data-action="resend-confirmation"]')
    ?.addEventListener("click", resendConfirmationEmail);
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      authMode = event.currentTarget.dataset.authMode;
      if (event.currentTarget.dataset.planId) {
        pendingPlanId = event.currentTarget.dataset.planId;
        window.localStorage.setItem("vouchly-pending-plan", pendingPlanId);
      }
      authMessage = "";
      authNeedsConfirmation = false;
      render();
      window.setTimeout(() => {
        document.querySelector("#auth-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    });
  });
}

async function submitAuth(event) {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(event.currentTarget).entries());
  const cleanEmail = String(email).trim().toLowerCase();
  lastAuthEmail = cleanEmail;
  window.localStorage.setItem("vouchly-pending-email", cleanEmail);
  authNeedsConfirmation = false;
  authMessage = authMode === "signup" ? "Creating account..." : "Signing in...";
  render();

  const response =
    authMode === "signup"
      ? await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        })
      : await supabase.auth.signInWithPassword({ email: cleanEmail, password });

  if (response.error) {
    const errorMessage = response.error.message || "";
    const isConfirmationIssue =
      response.error.code === "email_not_confirmed" ||
      errorMessage.toLowerCase().includes("email not confirmed");

    authNeedsConfirmation = isConfirmationIssue || authMode === "signin";
    authMessage = isConfirmationIssue
      ? "Please confirm your email first. Check your inbox/spam, then sign in again."
      : authMode === "signin"
        ? "Could not sign in. If you just created the account, confirm your email first or resend the confirmation email."
        : errorMessage;
    render();
    return;
  }

  if (authMode === "signup" && !response.data.session) {
    authNeedsConfirmation = true;
    authMessage = `Account created for ${cleanEmail}. Check your inbox/spam and click the confirmation link, then sign in.`;
    authMode = "signin";
    render();
    return;
  }

  session = response.data.session ?? session;
  window.localStorage.removeItem("vouchly-pending-email");
  authNeedsConfirmation = false;
  lastAuthEmail = "";
  authMessage = "";

  if (session?.user) {
    await loadRemoteState();
  }
}

async function resendConfirmationEmail() {
  if (!lastAuthEmail) {
    authMessage = "Enter your email first, then resend confirmation.";
    authNeedsConfirmation = false;
    render();
    return;
  }

  authMessage = "Sending confirmation email...";
  render();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: lastAuthEmail,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  authNeedsConfirmation = true;
  authMessage = error
    ? error.message
    : `Confirmation email sent to ${lastAuthEmail}. Check inbox/spam, confirm, then sign in.`;
  render();
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
      if (action === "resend-confirmation") resendConfirmationEmail();
      if (action === "logout") logout();
    });
  });

  document.querySelector("#customer-form")?.addEventListener("submit", addCustomer);
  document.querySelector("#settings-form")?.addEventListener("submit", saveSettings);
  document.querySelectorAll("[data-filter]").forEach((field) => {
    field.addEventListener("input", () => {
      customerFilters = {
        ...customerFilters,
        [field.dataset.filter]: field.value
      };
      render();
    });
  });
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
  appMessage = `${customer.name} added to customers.`;

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
        title: "Review request",
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

  window.localStorage.removeItem("vouchly-pending-plan");
  pendingPlanId = "";
}

function bulkQueueRequests() {
  const pendingCustomers = state.customers.filter((customer) => customer.status === "pending");
  const tasks = pendingCustomers.map((customer, index) => ({
    id: Date.now() + index,
    title: "Review request batch",
    customerName: customer.name,
    channel: customer.channel,
    dueAt: `${new Date().toISOString().slice(0, 10)} 18:00`,
    status: "scheduled"
  }));

  setState((current) => ({
    ...current,
    customers: current.customers.map((customer) =>
      customer.status === "pending" ? { ...customer, status: "scheduled" } : customer
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
