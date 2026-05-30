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
    customerLimit: 100,
    requestLimit: 30,
    trialDays: 30,
    includes: ["Customer list", "Review request tracking", "CSV data backup", "Editable templates", "30 prepared review requests", "10 follow-up tasks", "Upgrade required after 30 days"]
  },
  {
    id: "starter",
    name: "Starter",
    price: "INR 499 / month",
    originalPrice: "INR 999 / month",
    offer: "Launch 50% off",
    fit: "For small shops that want affordable review tracking and light automation.",
    limits: "Up to 500 customers/month",
    customerLimit: 500,
    requestLimit: 100,
    includes: ["Customer list", "Review request tracking", "CSV data backup", "100 automated review requests"]
  },
  {
    id: "growth",
    name: "Growth",
    price: "INR 1,499 / month",
    originalPrice: "INR 2,999 / month",
    offer: "Launch 50% off",
    fit: "Main plan for growing local businesses that need follow-up automation.",
    limits: "Up to 1,500 customers/month",
    customerLimit: 1500,
    requestLimit: 1500,
    includes: ["Everything in Starter", "Automation tasks", "Editable message templates", "Review request sending workflow", "Lead follow-up"]
  },
  {
    id: "pro",
    name: "Pro",
    price: "INR 2,999 / month",
    originalPrice: "INR 5,999 / month",
    offer: "Launch 50% off",
    fit: "For high-volume teams, multi-location services, and agencies.",
    limits: "Up to 5,000 customers/month",
    customerLimit: 5000,
    requestLimit: 5000,
    includes: ["Everything in Growth", "Priority support", "Future multi-user controls", "Advanced reporting"]
  }
];

const messageTypeOptions = [
  { id: "review", label: "Review request", taskTitle: "Review request", dueTime: "11:00" },
  { id: "review_reminder", label: "Reminder", taskTitle: "Review reminder", dueTime: "17:00" },
  { id: "offer", label: "Offer", taskTitle: "Offer follow-up", dueTime: "18:00" },
  { id: "launch", label: "New launch", taskTitle: "New launch update", dueTime: "18:00" },
  { id: "festival", label: "Festival sale", taskTitle: "Festival sale update", dueTime: "18:00" }
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
    trialStartedAt: "",
    acceptedTermsAt: "",
    setupComplete: false
  },
  sending: {
    preferredChannel: "whatsapp",
    whatsapp: "not_connected",
    sms: "not_connected",
    email: "not_connected"
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
      purpose: "review",
      text: "Hi {{name}}, thank you for choosing {{business}}. Could you share a quick Google review? {{link}}"
    },
    {
      id: 22,
      name: "Reminder",
      channel: "whatsapp",
      purpose: "review_reminder",
      text: "Hi {{name}}, quick reminder from {{business}}. Your review helps local customers find us: {{link}}"
    },
    {
      id: 23,
      name: "Offer follow-up",
      channel: "whatsapp",
      purpose: "offer",
      text: "Hi {{name}}, {{business}} has a new offer for returning customers: {{offer}}. Reply here if you want details."
    },
    {
      id: 24,
      name: "New launch update",
      channel: "whatsapp",
      purpose: "launch",
      text: "Hi {{name}}, quick update from {{business}}: we just launched {{offer}}. Thought you may like to know."
    },
    {
      id: 25,
      name: "Festival sale",
      channel: "whatsapp",
      purpose: "festival",
      text: "Hi {{name}}, festival update from {{business}}: {{offer}}. Reply here if you want details."
    }
  ],
  deletedCustomerKeys: []
};

const storageKey = "vouchly-universal-state-v2";
const savedTaskTitleMap = {
  "Send review request": "Review request",
  "Review follow-up": "Review reminder",
  "Bulk review request": "Review request",
  "Review request batch": "Review request"
};
const savedCustomerStatusMap = {
  sent: "scheduled"
};
const customerPageSize = 10;
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
let customerFilters = defaultCustomerFilters();
let outboxFilters = defaultOutboxFilters();
let messagePreviewCustomerId = null;
let messagePreviewPurpose = "review";
let bulkCampaignPurpose = "review";
let editingCustomerId = null;

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
    sending: {
      ...defaultState.sending,
      ...(nextState.sending ?? {})
    },
    customers: customers.map((customer) => ({
      ...customer,
      status: savedCustomerStatusMap[customer.status] ?? customer.status
    })),
    tasks: normalizeTasks(tasks),
    templates: mergeTemplates(nextState.templates),
    deletedCustomerKeys
  };
}

function mergeTemplates(savedTemplates = []) {
  const savedByName = new Map(savedTemplates.map((template) => [template.name, template]));

  return defaultState.templates.map((defaultTemplate) => ({
    ...defaultTemplate,
    ...(savedByName.get(defaultTemplate.name) ?? {})
  }));
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
    tasks: normalizeTasks(mergeUniqueRecords(remoteState.tasks, localState.tasks, taskRecordKey)),
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

function taskDayKey(task) {
  const dueDate = String(task.dueAt ?? "").slice(0, 10);
  return `${task.title}|${task.customerName}|${task.channel}|${task.purpose ?? ""}|${dueDate}|${task.status}`.toLowerCase();
}

function normalizeTasks(tasks = []) {
  const seen = new Set();
  const normalizedTasks = [];

  tasks.forEach((task) => {
    const normalizedTask = {
      ...task,
      title: savedTaskTitleMap[task.title] ?? task.title
    };
    const key = taskDayKey(normalizedTask);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    normalizedTasks.push(normalizedTask);
  });

  return normalizedTasks;
}

function hasScheduledRequestForCustomer(tasks, customer, dueAt) {
  const targetDay = String(dueAt).slice(0, 10);

  return tasks.some(
    (task) =>
      task.customerName === customer.name &&
      task.channel === customer.channel &&
      String(task.dueAt ?? "").slice(0, 10) === targetDay &&
      task.status !== "done"
  );
}

function getMessageTypeOption(purpose = "review") {
  return messageTypeOptions.find((option) => option.id === purpose) ?? messageTypeOptions[0];
}

function getTemplateForCustomer(customer, purpose = "review") {
  return (
    state.templates.find((item) => item.purpose === purpose && item.channel === customer.channel) ??
    state.templates.find((item) => item.purpose === purpose) ??
    state.templates.find((item) => item.purpose === "review" && item.channel === customer.channel) ??
    state.templates.find((item) => item.purpose === "review") ??
    state.templates[0]
  );
}

function messageTypeOptionsHtml(selectedPurpose = "review") {
  return messageTypeOptions
    .map(
      (option) =>
        `<option value="${escapeHtml(option.id)}" ${selectedPurpose === option.id ? "selected" : ""}>${escapeHtml(option.label)}</option>`
    )
    .join("");
}

function formatCustomerStatus(status = "") {
  if (status === "scheduled") return "prepared";
  if (status === "reviewed") return "reviewed";
  return status || "pending";
}

function formatTaskStatus(status = "") {
  if (status === "scheduled") return "prepared";
  if (status === "done") return "sent manually";
  return status || "needs follow-up";
}

function inferTaskPurpose(task = {}) {
  const title = String(task.title ?? "").toLowerCase();

  if (task.purpose) return task.purpose;
  if (title.includes("reminder")) return "review_reminder";
  if (title.includes("offer")) return "offer";
  if (title.includes("launch")) return "launch";
  if (title.includes("festival")) return "festival";
  return "review";
}

function findCustomerForTask(task = {}) {
  return (
    state.customers.find((customer) => customer.id === task.customerId) ??
    state.customers.find(
      (customer) => customer.name === task.customerName && customer.channel === task.channel
    ) ??
    state.customers.find((customer) => customer.name === task.customerName)
  );
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

function getTodayDateValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getDateValueFromToday(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function defaultCustomerFilters() {
  return {
    query: "",
    status: "all",
    channel: "all",
    dateMode: "all",
    selectedDate: getTodayDateValue(),
    page: 1
  };
}

function defaultOutboxFilters() {
  return {
    query: "",
    status: "ready",
    channel: "all",
    dateMode: "today",
    selectedDate: getTodayDateValue()
  };
}

function createEmptyWorkspaceState() {
  return mergeState({
    ...structuredClone(defaultState),
    activeView: "settings",
    business: {
      ...defaultState.business,
      name: "",
      owner: "",
      city: "",
      googleReviewLink: "",
      senderName: "",
      trialStartedAt: "",
      acceptedTermsAt: "",
      setupComplete: false
    },
    customers: [],
    tasks: [],
    deletedCustomerKeys: []
  });
}

function createDemoWorkspaceState() {
  const today = getTodayDateValue();
  const yesterday = getDateValueFromToday(-1);
  const twoDaysAgo = getDateValueFromToday(-2);
  const now = new Date().toISOString();

  return mergeState({
    ...structuredClone(defaultState),
    activeView: "dashboard",
    business: {
      ...defaultState.business,
      name: "Bright Local Services",
      type: "General Store",
      owner: "Business Owner",
      city: "Bangalore",
      googleReviewLink: "https://g.page/r/demo-review-link",
      senderName: "Bright Local Services",
      plan: "free",
      trialStartedAt: state.business.trialStartedAt || now,
      acceptedTermsAt: state.business.acceptedTermsAt || now,
      setupComplete: true
    },
    customers: [
      {
        id: 101,
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        email: "priya@example.com",
        channel: "whatsapp",
        visitDate: today,
        status: "scheduled",
        source: "walk-in"
      },
      {
        id: 102,
        name: "Rahul Mehta",
        phone: "+91 99887 77665",
        email: "",
        channel: "whatsapp",
        visitDate: today,
        status: "pending",
        source: "service"
      },
      {
        id: 103,
        name: "Neha Kapoor",
        phone: "+91 90909 11223",
        email: "neha@example.com",
        channel: "email",
        visitDate: yesterday,
        status: "reviewed",
        source: "online"
      },
      {
        id: 104,
        name: "Amit Verma",
        phone: "+91 80808 33445",
        email: "",
        channel: "sms",
        visitDate: twoDaysAgo,
        status: "pending",
        source: "referral"
      }
    ],
    tasks: [
      {
        id: 201,
        title: "Review request",
        customerName: "Priya Sharma",
        channel: "whatsapp",
        dueAt: `${today} 11:00`,
        status: "scheduled"
      },
      {
        id: 202,
        title: "Review reminder",
        customerName: "Rahul Mehta",
        channel: "whatsapp",
        dueAt: `${today} 18:00`,
        status: "scheduled"
      },
      {
        id: 203,
        title: "Review request",
        customerName: "Neha Kapoor",
        channel: "email",
        dueAt: `${yesterday} 11:00`,
        status: "done"
      }
    ],
    deletedCustomerKeys: []
  });
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

function getCurrentPlan() {
  return plans.find((plan) => plan.id === state.business.plan) ?? plans[0];
}

function getConnectedProviders() {
  return ["whatsapp", "sms", "email"].filter((provider) => state.sending?.[provider] === "connected");
}

function isAnyProviderConnected() {
  return getConnectedProviders().length > 0;
}

function getSendingModeLabel() {
  return isAnyProviderConnected() ? "Auto-send connected" : "Owner WhatsApp mode";
}

function getSendingModeDetail() {
  if (isAnyProviderConnected()) {
    return `Connected: ${getConnectedProviders().join(", ")}. Vouchly can prepare approved delivery through connected channels.`;
  }

  return "Vouchly prepares the review message and opens the owner's WhatsApp. The owner checks it and taps Send from their own number.";
}

function getTrialStartedAt() {
  return state.business.trialStartedAt || state.business.createdAt || "";
}

function getTrialDaysUsed() {
  const startedAt = getTrialStartedAt();
  if (!startedAt) {
    return 0;
  }

  const started = new Date(startedAt);
  if (Number.isNaN(started.getTime())) {
    return 0;
  }

  const diff = Date.now() - started.getTime();
  return Math.max(0, Math.floor(diff / 86400000) + 1);
}

function countPreparedRequests() {
  return state.tasks.filter((task) => task.title.toLowerCase().startsWith("review request")).length;
}

function getCurrentMonthPrefix() {
  return getTodayDateValue().slice(0, 7);
}

function isInCurrentMonth(value = "") {
  return String(value).startsWith(getCurrentMonthPrefix());
}

function countCustomersThisMonth() {
  return state.customers.filter((customer) => isInCurrentMonth(customer.visitDate)).length;
}

function countPreparedRequestsThisMonth() {
  return state.tasks.filter((task) => {
    const title = task.title.toLowerCase();
    return title.startsWith("review request") && isInCurrentMonth(task.dueAt);
  }).length;
}

function getPlanUsage(plan = getCurrentPlan()) {
  const trialDaysUsed = getTrialDaysUsed();
  const trialDaysLeft =
    plan.trialDays && state.business.trialStartedAt
      ? Math.max(0, plan.trialDays - trialDaysUsed)
      : plan.trialDays ?? null;

  return {
    customers: countCustomersThisMonth(),
    customerLimit: plan.customerLimit ?? Infinity,
    requests: countPreparedRequestsThisMonth(),
    requestLimit: plan.requestLimit ?? Infinity,
    trialDaysLeft,
    trialExpired: Boolean(plan.trialDays && state.business.trialStartedAt && trialDaysUsed > plan.trialDays)
  };
}

function isPlanLocked() {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);
  return plan.id === "free" && usage.trialExpired;
}

function getPlanAccessMessage() {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);

  if (usage.trialExpired) {
    return "Free trial ended. Upgrade to Starter, Growth, or Pro to keep adding customers and preparing review requests.";
  }

  if (usage.customers >= usage.customerLimit) {
    return `${plan.name} customer limit reached (${usage.customerLimit}). Upgrade to continue adding customers.`;
  }

  if (usage.requests >= usage.requestLimit) {
    return `${plan.name} request limit reached (${usage.requestLimit}). Upgrade to prepare more review requests.`;
  }

  return "";
}

function getCustomerLimitMessage(extraCustomers = 1) {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);

  if (usage.trialExpired) {
    return getPlanAccessMessage();
  }

  if (usage.customers + extraCustomers > usage.customerLimit) {
    return `${plan.name} allows ${usage.customerLimit} customers. Upgrade to add more.`;
  }

  return "";
}

function getRequestLimitMessage(extraRequests = 1) {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);

  if (usage.trialExpired) {
    return getPlanAccessMessage();
  }

  if (usage.requests + extraRequests > usage.requestLimit) {
    return `${plan.name} allows ${usage.requestLimit} prepared review requests. Upgrade to prepare more.`;
  }

  return "";
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

function buildMessage(customer, purpose = "review") {
  const template = getTemplateForCustomer(customer, purpose);

  return template.text
    .replaceAll("{{name}}", customer.name)
    .replaceAll("{{business}}", state.business.name)
    .replaceAll("{{link}}", state.business.googleReviewLink || "[Google review link]")
    .replaceAll("{{offer}}", "your latest offer or update");
}

function formatDueAt(dueAt = "") {
  const [date = "", time = ""] = String(dueAt).split(" ");
  if (!time) {
    return date;
  }

  const [hourValue = "0", minute = "00"] = time.split(":");
  const hour = Number(hourValue);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${date}, ${displayHour}:${minute} ${suffix}`;
}

function queueReviewRequest(customerId, purpose = "review_reminder") {
  const requestLimitMessage = getRequestLimitMessage();
  if (requestLimitMessage) {
    appMessage = requestLimitMessage;
    render();
    return;
  }

  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  messagePreviewCustomerId = null;
  messagePreviewPurpose = "review";
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const option = getMessageTypeOption(purpose);
  const dueAt = `${dueDate.toISOString().slice(0, 10)} ${option.dueTime}`;

  setState((current) => {
    if (hasScheduledRequestForCustomer(current.tasks, customer, dueAt)) {
      appMessage = `${customer.name} already has a prepared ${option.label.toLowerCase()} for tomorrow.`;
      return current;
    }

    appMessage = `${customer.name} ${option.label.toLowerCase()} prepared for ${formatDueAt(dueAt)}. This is not auto-sent; open WhatsApp and tap Send.`;

    return {
      ...current,
      customers: current.customers.map((entry) =>
        entry.id === customerId ? { ...entry, status: "scheduled" } : entry
      ),
      tasks: [
        {
          id: nextId(current.tasks),
          title: option.taskTitle,
          customerId: customer.id,
          customerName: customer.name,
          channel: customer.channel,
          purpose,
          dueAt,
          status: "scheduled"
        },
        ...current.tasks
      ]
    };
  });
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
      getTodayDateValue(),
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

  downloadCsv("vouchly-data-backup.csv", rows);
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(formatCsvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
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
    app.innerHTML = renderVouchlyLandingAuth();
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
        ${setupComplete ? navButton("automations", "Outbox") : ""}
        ${setupComplete ? navButton("sending", "Sending") : ""}
        ${setupComplete ? navButton("templates", "Templates") : ""}
        ${navButton("settings", setupComplete ? "Settings" : "Setup")}
        ${setupComplete ? navButton("legal", "Terms & Privacy") : ""}
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
        ${setupComplete ? renderPlanBanner() : ""}
        ${setupComplete ? renderView() : renderOnboarding()}
        ${renderMessagePreview()}
        ${renderCustomerEditor()}
      </main>
    </div>
  `;

  bindEvents();
}

function renderAuth() {
  const isSignup = authMode === "signup";
  const pendingPlan = plans.find((plan) => plan.id === pendingPlanId) ?? plans[0];

  return `
    <main class="marketing-page premium-landing">
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
        <div class="hero-orb hero-orb-one"></div>
        <div class="hero-orb hero-orb-two"></div>
        <div class="floating-review floating-review-left">
          <strong>Rahul Kumar</strong>
          <span>&#9733;&#9733;&#9733;&#9733;&#9733; Just reviewed on Google</span>
        </div>
        <div class="floating-review floating-review-right">
          <strong>Priya Shah</strong>
          <span>Review request opened 2 min ago</span>
        </div>
        <div class="hero-copy">
          <p class="hero-badge"><span>&#10024;</span> First month free. No credit card needed.</p>
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
        <div class="hero-dashboard-card dashboard-3d" aria-label="Vouchly dashboard preview">
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

      <section class="proof-bar" aria-label="Vouchly proof">
        <div class="proof-track">
          <span>&#9733;&#9733;&#9733;&#9733;&#9733; 500+ businesses use Vouchly</span>
          <span>Restaurants</span>
          <span>Salons</span>
          <span>Clinics</span>
          <span>Hotels</span>
          <span>Gyms</span>
          <span>Garages</span>
          <span>Coaching classes</span>
          <span>10,000+ review requests tracked</span>
          <span>&#9733;&#9733;&#9733;&#9733;&#9733; 500+ businesses use Vouchly</span>
          <span>Restaurants</span>
          <span>Salons</span>
          <span>Clinics</span>
          <span>Hotels</span>
          <span>Gyms</span>
          <span>Garages</span>
          <span>Coaching classes</span>
          <span>10,000+ review requests tracked</span>
        </div>
      </section>

      <section class="marketing-section showcase-section" id="how">
        <p class="eyebrow">How it works</p>
        <h2>Simple enough for any local business owner</h2>
        <p class="section-sub">No technical setup. If the owner can use WhatsApp, they can understand this workflow.</p>
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
        <p class="section-sub">Focused tools for reviews, follow-ups, and simple customer tracking. Nothing noisy.</p>
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
          ].map(([item]) => `<span>${item}</span>`).join("")}
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

      <section class="testimonial-section">
        <p class="eyebrow">What owners want</p>
        <h2>Less chasing. More reviews. Better trust.</h2>
        <div class="testimonial-grid">
          <article>
            <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <p>"I can add customers after each visit and see exactly who needs a reminder."</p>
            <strong>Salon owner</strong>
          </article>
          <article>
            <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <p>"The templates save time and keep the review link ready in every request."</p>
            <strong>Clinic admin</strong>
          </article>
          <article>
            <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <p>"It feels simple enough for my team, but professional enough for customers."</p>
            <strong>Local business owner</strong>
          </article>
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
          ${isSignup ? `<div class="selected-plan-note"><span>Selected plan</span><strong>${escapeHtml(pendingPlan.name)}</strong><small>${pendingPlan.originalPrice ? `${escapeHtml(pendingPlan.offer)}: ${escapeHtml(pendingPlan.price)}` : escapeHtml(pendingPlan.price)}</small></div>` : ""}
          <form id="auth-form" class="auth-form">
            <input name="email" type="email" placeholder="you@business.com" autocomplete="off" data-private-input required />
            <input name="password" type="password" placeholder="${isSignup ? "Create a strong password" : "Your password"}" autocomplete="new-password" data-private-input required minlength="${isSignup ? 10 : 6}" />
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

      ${renderPublicLegalSection()}
      ${renderMarketingFooter("Vouchly")}
    </main>
  `;
}

function renderMarketingFooter(brandLabel = "Vouchly") {
  return `
    <footer class="marketing-footer">
      <div>
        <strong>${brandLabel}</strong>
        <span>Review growth software for local businesses worldwide · 30-day free trial · No spam, fake reviews, or purchased contact lists</span>
      </div>
      <nav class="footer-legal-links" aria-label="Legal links">
        <a href="#terms">Terms</a>
        <a href="#privacy">Privacy</a>
        <a href="#refund">Refund</a>
        <a href="#contact">Contact</a>
      </nav>
    </footer>
  `;
}

function renderPublicLegalSection() {
  return `
    <section class="public-legal-section" id="legal">
      <div class="public-legal-inner">
        <p class="eyebrow">Legal</p>
        <h2>Clear rules before customers start sending requests.</h2>
        <div class="public-legal-grid">
          ${publicLegalCard("terms", "Terms & Conditions", "Free Trial is limited to 30 days, 100 customers, and 30 prepared review requests. Businesses must upgrade after the free limit to keep adding customers or preparing requests. Vouchly can suspend accounts for spam, fake reviews, abuse, payment failure, or attempts to bypass limits.")}
          ${publicLegalCard("privacy", "Privacy Policy", "Customer names, phone numbers, emails, visit dates, templates, and business settings are treated as private workspace data. Businesses are responsible for adding only lawful customer data and deleting records when customers request it.")}
          ${publicLegalCard("refund", "Refund Policy", "Launch pricing is subscription based. Refunds should be handled case by case for duplicate charges, accidental payments, or service issues. A final lawyer-reviewed refund policy should be added before collecting live payments.")}
          ${publicLegalCard("contact", "Contact", "For support, billing, data deletion, or legal requests, business owners should contact Vouchly support from their registered email. Add your final support email before public launch.")}
        </div>
      </div>
    </section>
  `;
}

function publicLegalCard(id, title, body) {
  return `
    <article class="public-legal-card" id="${id}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
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
      ${renderPlanPrice(plan)}
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

function renderPlanPrice(plan) {
  return `
    <div class="price-stack">
      ${
        plan.originalPrice
          ? `<div class="price-offer-row"><del>${escapeHtml(plan.originalPrice)}</del><span class="sale-pill">${escapeHtml(plan.offer ?? "50% off")}</span></div>`
          : ""
      }
      <strong>${escapeHtml(plan.price)}</strong>
      ${plan.originalPrice ? `<em>Limited launch price</em>` : ""}
    </div>
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

function renderPlanBanner() {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);
  const alert = getPlanAccessMessage();

  if (alert) {
    return `
      <div class="plan-banner warning">
        <strong>Upgrade needed</strong>
        <span>${escapeHtml(alert)}</span>
      </div>
    `;
  }

  if (plan.id === "free") {
    return `
      <div class="plan-banner">
        <strong>Free trial</strong>
        <span>${usage.trialDaysLeft} day${usage.trialDaysLeft === 1 ? "" : "s"} left · ${usage.customers}/${usage.customerLimit} customers · ${usage.requests}/${usage.requestLimit} prepared requests</span>
      </div>
    `;
  }

  return `
    <div class="plan-banner">
      <strong>${escapeHtml(plan.name)} plan</strong>
      <span>${usage.customers}/${usage.customerLimit} customers · ${usage.requests}/${usage.requestLimit} prepared requests this workspace</span>
    </div>
  `;
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
        ${setupComplete ? `<button class="primary-button" data-action="bulk-send">Prepare messages</button>` : ""}
      </div>
    </header>
  `;
}

function renderView() {
  if (state.activeView === "customers") return renderCustomers();
  if (state.activeView === "automations") return renderAutomations();
  if (state.activeView === "sending") return renderSending();
  if (state.activeView === "templates") return renderTemplates();
  if (state.activeView === "settings") return renderSettings();
  if (state.activeView === "legal") return renderLegal();
  return renderDashboard();
}

function renderOnboarding() {
  return `
    <section class="setup-hero">
      <p class="eyebrow">Business setup</p>
      <h2>Set up the review workflow before sending requests</h2>
      <p>Vouchly will use this profile and the templates below when customers receive review requests.</p>
      <div class="setup-actions">
        <button class="primary-button" data-action="load-demo" type="button">Try demo workspace</button>
        <button class="ghost-button" data-action="reset-workspace" type="button">Start clean setup</button>
      </div>
    </section>
    ${renderSettings(true)}
  `;
}

function renderDashboard() {
  const scheduled = state.tasks.filter((task) => task.status === "scheduled").length;
  const pending = state.customers.filter((customer) => customer.status === "pending").length;

  return `
    ${renderSendingModeBanner()}
    ${renderPlanUsageStrip()}
    ${renderDashboardQuickActions(pending, scheduled)}
    <section class="metrics-grid">
      ${metricCard("Customers", state.customers.length, "contacts in workspace")}
      ${metricCard("Review rate", `${completionRate()}%`, "marked reviewed")}
      ${metricCard("Pending", pending, "need review request")}
      ${metricCard("Outbox", scheduled, "prepared messages")}
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
            <p class="eyebrow">Outbox</p>
            <h2>Messages ready to send</h2>
          </div>
          <button class="ghost-button small" data-view="automations">Open</button>
        </div>
        ${taskRows(state.tasks.slice(0, 5))}
      </div>
    </section>
  `;
}

function renderPlanUsageStrip() {
  const plan = getCurrentPlan();
  const usage = getPlanUsage(plan);

  return `
    <section class="usage-strip">
      <div>
        <p class="eyebrow">Plan usage</p>
        <h2>${escapeHtml(plan.name)} this month</h2>
      </div>
      ${usageMeter("Customers", usage.customers, usage.customerLimit)}
      ${usageMeter("Prepared requests", usage.requests, usage.requestLimit)}
      ${
        usage.trialDaysLeft === null
          ? ""
          : usageMeter("Trial days left", usage.trialDaysLeft, plan.trialDays ?? usage.trialDaysLeft, true)
      }
    </section>
  `;
}

function usageMeter(label, value, limit, reverse = false) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : value || 1;
  const percent = Math.min(100, Math.round((value / safeLimit) * 100));
  const visualPercent = reverse ? Math.max(0, Math.round((value / safeLimit) * 100)) : percent;

  return `
    <article class="usage-meter">
      <div>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(Number.isFinite(limit) ? ` / ${limit}` : "")}</span>
      </div>
      <p>${escapeHtml(label)}</p>
      <progress class="meter-progress" max="100" value="${visualPercent}">${visualPercent}%</progress>
    </article>
  `;
}

function renderSendingModeBanner() {
  return `
    <section class="sending-mode-banner ${isAnyProviderConnected() ? "ready" : "manual"}">
      <div>
        <strong>${escapeHtml(getSendingModeLabel())}</strong>
        <span>${escapeHtml(getSendingModeDetail())}</span>
      </div>
      <button class="ghost-button small" data-view="sending" type="button">View sending setup</button>
    </section>
  `;
}

function renderDashboardQuickActions(pending, scheduled) {
  return `
    <section class="quick-actions">
      ${quickActionCard("Add customer", "Add a new customer after a sale, visit, or service.", "customers", "")}
      ${quickActionCard("Prepare messages", `${pending} pending customer${pending === 1 ? "" : "s"} can be prepared with auto-filled names.`, "", "bulk-send")}
      ${quickActionCard("Outbox", `${scheduled} prepared message${scheduled === 1 ? "" : "s"} ready for WhatsApp.`, "automations", "")}
      ${quickActionCard("Sending setup", getSendingModeLabel(), "sending", "")}
    </section>
  `;
}

function quickActionCard(title, detail, view, action) {
  const attribute = view ? `data-view="${view}"` : `data-action="${action}"`;

  return `
    <button class="quick-action-card" ${attribute} type="button">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
    </button>
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
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / customerPageSize));
  const currentPage = Math.min(customerFilters.page, totalPages);
  const startIndex = (currentPage - 1) * customerPageSize;
  const visibleCustomers = filteredCustomers.slice(startIndex, startIndex + customerPageSize);

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
        <input name="visitDate" type="date" value="${getTodayDateValue()}" />
        <input name="source" placeholder="Source" value="walk-in" />
        <button class="primary-button" type="submit">Add customer</button>
      </form>
      <div class="import-card">
        <div>
          <strong>Import customers from CSV</strong>
          <span>Use columns: name, phone, email, channel, visitDate, source. Imported customers start as pending.</span>
        </div>
        <div class="import-actions">
          <label class="file-button">
            Choose CSV
            <input id="csv-import" type="file" accept=".csv,text/csv" />
          </label>
          <button class="ghost-button small" data-action="download-csv-template" type="button">Download template</button>
        </div>
      </div>
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
        <select data-filter="dateMode">
          <option value="all" ${customerFilters.dateMode === "all" ? "selected" : ""}>All dates</option>
          <option value="today" ${customerFilters.dateMode === "today" ? "selected" : ""}>Today</option>
          <option value="yesterday" ${customerFilters.dateMode === "yesterday" ? "selected" : ""}>Yesterday</option>
          <option value="custom" ${customerFilters.dateMode === "custom" ? "selected" : ""}>Choose date</option>
        </select>
        <input
          data-filter="selectedDate"
          type="date"
          value="${escapeHtml(customerFilters.selectedDate)}"
          ${customerFilters.dateMode === "custom" ? "" : "disabled"}
        />
        <span class="result-count">
          Showing ${visibleCustomers.length} of ${filteredCustomers.length} customers
        </span>
        <button class="ghost-button small" data-action="clear-customer-filters" type="button">Clear filters</button>
      </div>
      <div class="list-note">
        Serial numbers follow the selected date/search view, so today's list starts from 1 and yesterday's list has its own numbering.
      </div>
      <div class="campaign-toolbar">
        <div>
          <strong>Bulk message prepare</strong>
          <span>Choose a purpose and prepare messages for pending customers in this filtered view. Names and links auto-fill.</span>
        </div>
        <select data-bulk-purpose>
          ${messageTypeOptionsHtml(bulkCampaignPurpose)}
        </select>
        <button class="primary-button small" data-action="bulk-send" type="button">Prepare filtered</button>
      </div>
      ${customerRows(visibleCustomers, startIndex)}
      ${customerPagination(currentPage, totalPages, filteredCustomers.length)}
    </section>
  `;
}

function filterCustomers(customers) {
  const query = customerFilters.query.trim().toLowerCase();
  const today = getTodayDateValue();
  const yesterday = getDateValueFromToday(-1);
  const targetDate =
    customerFilters.dateMode === "today"
      ? today
      : customerFilters.dateMode === "yesterday"
        ? yesterday
        : customerFilters.dateMode === "custom"
          ? customerFilters.selectedDate
          : "";

  return customers.filter((customer) => {
    const searchable = `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus =
      customerFilters.status === "all" || customer.status === customerFilters.status;
    const matchesChannel =
      customerFilters.channel === "all" || customer.channel === customerFilters.channel;
    const matchesDate = !targetDate || customer.visitDate === targetDate;

    return matchesQuery && matchesStatus && matchesChannel && matchesDate;
  });
}

function customerPagination(currentPage, totalPages, totalCustomers) {
  if (totalCustomers <= customerPageSize) {
    return "";
  }

  return `
    <div class="pagination-bar">
      <button class="ghost-button small" data-action="customer-prev-page" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button class="ghost-button small" data-action="customer-next-page" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
    </div>
  `;
}

function customerRows(customers, startIndex = 0) {
  if (!customers.length) {
    return `<div class="empty-state">No customers match this view.</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Serial</th>
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
              (customer, index) => `
                <tr>
                  <td>${startIndex + index + 1}</td>
                  <td>${escapeHtml(customer.name)}</td>
                  <td>${escapeHtml(customer.phone || customer.email || "Missing")}</td>
                  <td>${escapeHtml(customer.channel)}</td>
                  <td>${escapeHtml(customer.visitDate)}</td>
                  <td><span class="status ${escapeHtml(customer.status)}">${escapeHtml(formatCustomerStatus(customer.status))}</span></td>
                  <td class="row-actions">
                    <button class="ghost-button small" data-action="preview-message" data-id="${customer.id}" data-purpose="review">Preview</button>
                    <button class="whatsapp-button small" data-action="open-whatsapp-message" data-id="${customer.id}" data-purpose="review">Open WhatsApp</button>
                    <button class="ghost-button small" data-action="edit-customer" data-id="${customer.id}">Edit</button>
                    ${
                      customer.status === "reviewed"
                        ? `<span class="row-note">Reviewed</span>`
                        : `<button class="ghost-button small" data-action="queue" data-id="${customer.id}" data-purpose="review_reminder">Prepare follow-up</button>
                           <button class="primary-button small" data-action="mark-reviewed" data-id="${customer.id}">Mark reviewed</button>`
                    }
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

function renderMessagePreview() {
  const customer = state.customers.find((entry) => entry.id === messagePreviewCustomerId);
  if (!customer) {
    return "";
  }
  const selectedOption = getMessageTypeOption(messagePreviewPurpose);

  return `
    <div class="modal-backdrop" data-action="close-preview">
      <section class="modal-card message-modal" role="dialog" aria-modal="true" aria-labelledby="message-preview-title">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Message preview</p>
            <h2 id="message-preview-title">${escapeHtml(customer.name)}</h2>
          </div>
          <button class="ghost-button small" data-action="close-preview" type="button">Close</button>
        </div>
        <p class="modal-meta">
          Channel: <strong>${escapeHtml(customer.channel)}</strong>. Vouchly fills <strong>${escapeHtml(customer.name)}</strong>, your business name, and saved link automatically.
        </p>
        <div class="preview-type-row">
          <label>
            Message type
            <select data-preview-purpose>
              ${messageTypeOptionsHtml(messagePreviewPurpose)}
            </select>
          </label>
          <span>Use this for reviews, reminders, offers, new launches, or festival sale updates.</span>
        </div>
        <textarea class="message-preview" readonly>${escapeHtml(buildMessage(customer, messagePreviewPurpose))}</textarea>
        <div class="modal-actions">
          <button class="primary-button" data-action="copy-preview-message" data-purpose="${escapeHtml(messagePreviewPurpose)}" type="button">Copy message</button>
          <button class="whatsapp-button" data-action="open-whatsapp-message" data-id="${customer.id}" data-purpose="${escapeHtml(messagePreviewPurpose)}" type="button">Open WhatsApp</button>
          <button class="ghost-button" data-action="queue" data-id="${customer.id}" data-purpose="${escapeHtml(messagePreviewPurpose)}" type="button">Prepare ${escapeHtml(selectedOption.label)}</button>
        </div>
      </section>
    </div>
  `;
}

function renderCustomerEditor() {
  const customer = state.customers.find((entry) => entry.id === editingCustomerId);
  if (!customer) {
    return "";
  }

  return `
    <div class="modal-backdrop" data-action="close-customer-editor">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="customer-editor-title">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Customer</p>
            <h2 id="customer-editor-title">Edit customer</h2>
          </div>
          <button class="ghost-button small" data-action="close-customer-editor" type="button">Close</button>
        </div>
        <form class="customer-editor-form" id="customer-editor-form">
          <label>
            Name
            <input name="name" value="${escapeHtml(customer.name)}" required />
          </label>
          <label>
            Phone
            <input name="phone" value="${escapeHtml(customer.phone)}" />
          </label>
          <label>
            Email
            <input name="email" type="email" value="${escapeHtml(customer.email)}" />
          </label>
          <label>
            Channel
            <select name="channel">
              ${["whatsapp", "sms", "email"]
                .map(
                  (channel) =>
                    `<option value="${channel}" ${customer.channel === channel ? "selected" : ""}>${escapeHtml(channel)}</option>`
                )
                .join("")}
            </select>
          </label>
          <label>
            Visit date
            <input name="visitDate" type="date" value="${escapeHtml(customer.visitDate)}" required />
          </label>
          <label>
            Source
            <input name="source" value="${escapeHtml(customer.source)}" />
          </label>
          <label>
            Review status
            <select name="status">
              ${["pending", "scheduled", "reviewed"]
                .map(
                  (status) =>
                    `<option value="${status}" ${customer.status === status ? "selected" : ""}>${escapeHtml(status)}</option>`
                )
                .join("")}
            </select>
          </label>
          <div class="modal-actions wide">
            <button class="primary-button" type="submit">Save customer</button>
            ${
              customer.status === "reviewed"
                ? ""
                : `<button class="ghost-button" data-action="mark-reviewed" data-id="${customer.id}" type="button">Mark reviewed</button>`
            }
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderAutomations() {
  const readyTasks = state.tasks.filter((task) => task.status !== "done");
  const sentTasks = state.tasks.filter((task) => task.status === "done");
  const filteredTasks = filterOutboxTasks(state.tasks);
  const readyFilteredTasks = filteredTasks.filter((task) => task.status !== "done");
  const sentFilteredTasks = filteredTasks.filter((task) => task.status === "done");

  return `
    <section class="panel outbox-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Outbox</p>
          <h2>Prepared messages waiting for WhatsApp</h2>
        </div>
      </div>
      <div class="list-note">
        Schedule means Vouchly prepares the message for that time. It does not send automatically yet. Open WhatsApp, check the auto-filled message, tap Send, then mark it sent here.
      </div>
      <div class="outbox-summary">
        ${outboxStat("Ready", readyTasks.length, "prepared, not auto-sent")}
        ${outboxStat("Sent", sentTasks.length, "marked sent manually")}
        ${outboxStat("Total", state.tasks.length, "prepared messages")}
      </div>
      <div class="outbox-toolbar">
        <input data-outbox-filter="query" value="${escapeHtml(outboxFilters.query)}" placeholder="Search customer or task..." />
        <select data-outbox-filter="status">
          <option value="ready" ${outboxFilters.status === "ready" ? "selected" : ""}>Ready to send</option>
          <option value="sent" ${outboxFilters.status === "sent" ? "selected" : ""}>Sent history</option>
          <option value="all" ${outboxFilters.status === "all" ? "selected" : ""}>All messages</option>
        </select>
        <select data-outbox-filter="channel">
          <option value="all" ${outboxFilters.channel === "all" ? "selected" : ""}>All channels</option>
          <option value="whatsapp" ${outboxFilters.channel === "whatsapp" ? "selected" : ""}>WhatsApp</option>
          <option value="sms" ${outboxFilters.channel === "sms" ? "selected" : ""}>SMS</option>
          <option value="email" ${outboxFilters.channel === "email" ? "selected" : ""}>Email</option>
        </select>
        <select data-outbox-filter="dateMode">
          <option value="today" ${outboxFilters.dateMode === "today" ? "selected" : ""}>Today</option>
          <option value="tomorrow" ${outboxFilters.dateMode === "tomorrow" ? "selected" : ""}>Tomorrow</option>
          <option value="all" ${outboxFilters.dateMode === "all" ? "selected" : ""}>All dates</option>
          <option value="custom" ${outboxFilters.dateMode === "custom" ? "selected" : ""}>Choose date</option>
        </select>
        <input
          data-outbox-filter="selectedDate"
          type="date"
          value="${escapeHtml(outboxFilters.selectedDate)}"
          ${outboxFilters.dateMode === "custom" ? "" : "disabled"}
        />
        <button class="ghost-button small" data-action="clear-outbox-filters" type="button">Clear filters</button>
      </div>
      <div class="result-count">
        Showing ${filteredTasks.length} of ${state.tasks.length} prepared messages
      </div>
      <div class="outbox-section">
        <h3>Ready to send</h3>
        ${taskRows(readyFilteredTasks, "No ready messages match this view.")}
      </div>
      <div class="outbox-section">
        <h3>Sent history</h3>
        ${taskRows(sentFilteredTasks.slice(0, 20), "No sent messages match this view.")}
      </div>
    </section>
  `;
}

function filterOutboxTasks(tasks) {
  const query = outboxFilters.query.trim().toLowerCase();
  const targetDate =
    outboxFilters.dateMode === "today"
      ? getTodayDateValue()
      : outboxFilters.dateMode === "tomorrow"
        ? getDateValueFromToday(1)
        : outboxFilters.dateMode === "custom"
          ? outboxFilters.selectedDate
          : "";

  return tasks.filter((task) => {
    const searchable = `${task.title} ${task.customerName} ${task.channel}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus =
      outboxFilters.status === "all" ||
      (outboxFilters.status === "ready" && task.status !== "done") ||
      (outboxFilters.status === "sent" && task.status === "done");
    const matchesChannel = outboxFilters.channel === "all" || task.channel === outboxFilters.channel;
    const matchesDate = !targetDate || String(task.dueAt ?? "").slice(0, 10) === targetDate;

    return matchesQuery && matchesStatus && matchesChannel && matchesDate;
  });
}

function outboxStat(label, value, detail) {
  return `
    <article class="outbox-stat">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
      <small>${escapeHtml(detail)}</small>
    </article>
  `;
}

function renderSending() {
  return `
    <section class="setup-hero sending-hero">
      <p class="eyebrow">WhatsApp sending</p>
      <h2>Send from the owner's own WhatsApp number</h2>
      <p>
        Vouchly reads the saved customer name and phone, fills the message automatically, adds the Google review link,
        and opens WhatsApp. The owner only checks the message and taps Send.
      </p>
    </section>
    <section class="sending-readiness">
      ${readinessItem("1", "Business profile", isSetupComplete(), "Complete business name, city, sender name, and Google review link.")}
      ${readinessItem("2", "Message templates", state.templates.every((template) => template.text?.includes("{{link}}")), "Keep review link placeholder in request and reminder templates.")}
      ${readinessItem("3", "Customer permission", Boolean(state.business.acceptedTermsAt), "Owner confirms they will only message real customers who agreed to be contacted.")}
      ${readinessItem("4", "WhatsApp ready", true, "Use Open WhatsApp on each customer to send from the owner's own number.")}
    </section>
    <section class="manual-send-grid">
      ${manualSendCard("1", "Names auto-fill", "Add the customer once. {{name}} becomes Priya, Rahul, or that exact customer automatically.")}
      ${manualSendCard("2", "Open WhatsApp", "Click Open WhatsApp on a customer row. Vouchly opens the owner's WhatsApp with the message ready.")}
      ${manualSendCard("3", "Campaign follow-ups", "Use templates for reviews, offers, sale reminders, new product launches, festival deals, or service reminders.")}
      ${manualSendCard("4", "Bulk prepare", "Prepare many reminders at once, then send them one-by-one from WhatsApp so the number stays safe.")}
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Simple workflow</p>
          <h2>What happens after clicking Schedule or Open WhatsApp?</h2>
        </div>
      </div>
      <div class="workflow-list">
        ${workflowStep("1", "Preview msg", "Shows the final message with the customer's name, your business name, and your Google review link filled in.")}
        ${workflowStep("2", "Open WhatsApp", "Opens WhatsApp Web/app with the customer number and message already filled. Owner taps Send from their own number.")}
        ${workflowStep("3", "Prepare follow-up", "Creates a prepared reminder for tomorrow at 5:00 PM. At that time, open WhatsApp and tap Send.")}
        ${workflowStep("4", "Mark sent", "After the owner sends the message or finishes the follow-up, mark it sent for tracking.")}
      </div>
    </section>
  `;
}

function manualSendCard(number, title, body) {
  return `
    <article class="manual-send-card">
      <strong>${escapeHtml(number)}</strong>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
      </div>
    </article>
  `;
}

function readinessItem(number, title, done, detail) {
  return `
    <article class="readiness-item ${done ? "done" : ""}">
      <strong>${done ? "✓" : number}</strong>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(detail)}</p>
      </div>
    </article>
  `;
}

function renderProviderCard(provider) {
  const status = state.sending?.[provider.id] ?? "not_connected";
  const isPreferred = state.sending?.preferredChannel === provider.id;

  return `
    <article class="provider-card ${isPreferred ? "preferred" : ""}">
      <div class="provider-top">
        <div>
          <p class="eyebrow">${isPreferred ? "Preferred" : "Provider"}</p>
          <h3>${escapeHtml(provider.name)}</h3>
        </div>
        <span class="status ${escapeHtml(status)}">${escapeHtml(formatProviderStatus(status))}</span>
      </div>
      <p>${escapeHtml(provider.bestFor)}</p>
      <small>${escapeHtml(provider.nextStep)}</small>
      <div class="provider-actions">
        <button class="ghost-button small" data-action="set-preferred-provider" data-provider="${escapeHtml(provider.id)}">
          ${isPreferred ? "Preferred" : "Make preferred"}
        </button>
        <button class="primary-button small" data-action="show-provider-next-step" data-provider="${escapeHtml(provider.id)}">
          Setup guide
        </button>
      </div>
    </article>
  `;
}

function workflowStep(number, title, body) {
  return `
    <article class="workflow-step">
      <strong>${number}</strong>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(body)}</p>
      </div>
    </article>
  `;
}

function formatProviderStatus(status) {
  return status.replaceAll("_", " ");
}

function taskRows(tasks, emptyMessage = "No prepared messages yet.") {
  if (!tasks.length) {
    return `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Customer</th>
            <th>Channel</th>
            <th>Prepared for</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${tasks
            .map((task) => {
              const customer = findCustomerForTask(task);
              const purpose = inferTaskPurpose(task);
              const canOpenWhatsApp = Boolean(customer && task.channel === "whatsapp" && task.status !== "done");

              return `
                <tr>
                  <td>${escapeHtml(task.title)}</td>
                  <td>${escapeHtml(task.customerName)}</td>
                  <td>${escapeHtml(task.channel)}</td>
                  <td>${escapeHtml(formatDueAt(task.dueAt))}</td>
                  <td><span class="status ${escapeHtml(task.status)}">${escapeHtml(formatTaskStatus(task.status))}</span></td>
                  <td class="row-actions">
                    ${
                      canOpenWhatsApp
                        ? `<button class="whatsapp-button small" data-action="open-task-whatsapp" data-id="${task.id}" data-purpose="${escapeHtml(purpose)}">Open WhatsApp</button>`
                        : ""
                    }
                    <button class="ghost-button small" data-action="complete-task" data-id="${task.id}">
                      ${task.status === "done" ? "Sent" : "Mark sent"}
                    </button>
                  </td>
                </tr>
              `;
            })
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
          <h2>Message templates with auto-fill fields</h2>
        </div>
      </div>
      <div class="template-explainer">
        <strong>No manual name typing needed.</strong>
        <span>When you open WhatsApp for a customer, Vouchly replaces <code>{{name}}</code> with that customer's name, <code>{{business}}</code> with your business name, and <code>{{link}}</code> with your Google review link.</span>
      </div>
      <div class="template-grid">
        ${state.templates
          .map(
            (template) => `
              <article class="template-card">
                <span>${escapeHtml(template.channel)} - ${escapeHtml(templatePurposeLabel(template))}</span>
                <h3>${escapeHtml(template.name)}</h3>
                <p>${escapeHtml(template.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="template-explainer soft">
        <strong>Follow-ups are not only for reviews.</strong>
        <span>You can also use Vouchly for sale reminders, new product launches, festival offers, service reminders, and loyalty messages. Keep review requests honest; do not offer rewards in exchange for positive reviews.</span>
      </div>
    </section>
  `;
}

function renderLegal() {
  return `
    <section class="panel legal-panel">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Legal</p>
          <h2>Terms, privacy, and acceptable use</h2>
        </div>
      </div>
      <div class="legal-grid">
        <article class="legal-card">
          <h3>Subscription and free trial</h3>
          <p>The Free Trial is limited to 30 days, 100 customers, and 30 prepared review requests. After the trial ends, the workspace stays accessible for account review and data backup, but adding customers and preparing new requests requires a paid plan.</p>
          <p>Plan limits may change for future customers. Existing paid users should be notified before major pricing or limit changes.</p>
        </article>
        <article class="legal-card">
          <h3>Customer consent</h3>
          <p>Business owners must only add customers who have interacted with their business and may reasonably receive service follow-up messages. Vouchly must not be used for spam, scraped contacts, purchased contact lists, harassment, illegal promotions, or misleading review requests.</p>
        </article>
        <article class="legal-card">
          <h3>Review policy</h3>
          <p>Vouchly helps businesses request honest reviews. Owners must not offer fake incentives, force positive reviews, hide negative feedback, impersonate customers, or violate Google/marketplace review policies.</p>
        </article>
        <article class="legal-card">
          <h3>Data privacy</h3>
          <p>Customer names, phone numbers, emails, visit dates, message templates, and business settings are treated as private workspace data. Owners are responsible for deleting customer records on request and for collecting data lawfully in their country.</p>
        </article>
        <article class="legal-card">
          <h3>Sending providers</h3>
          <p>Manual WhatsApp opens the owner's own WhatsApp session. Automatic WhatsApp, SMS, or email sending requires a connected provider and may have extra provider fees, template approvals, opt-out requirements, delivery rules, and regional compliance requirements.</p>
        </article>
        <article class="legal-card">
          <h3>Service limits</h3>
          <p>Vouchly can suspend accounts for abuse, spam behavior, payment failure, security risk, or attempts to bypass plan limits. Data export remains available where technically and legally possible.</p>
        </article>
      </div>
      <div class="legal-note">
        This is product policy copy for the MVP. Before charging real customers, get a local lawyer to review final Terms of Service, Privacy Policy, refund policy, and DPDP/GDPR compliance language.
      </div>
    </section>
  `;
}

function templateFormFieldName(template, index) {
  const purpose = template.purpose ?? "";

  if (purpose === "review" || index === 0) return "firstTemplate";
  if (purpose === "review_reminder" || index === 1) return "reminderTemplate";

  return `template_${purpose || template.id}`;
}

function templatePurposeLabel(template) {
  return getMessageTypeOption(template.purpose).label;
}

function renderTemplateEditorFields() {
  return state.templates
    .map((template, index) => {
      const fieldName = templateFormFieldName(template, index);
      const purposeLabel = templatePurposeLabel(template);
      const helpText =
        template.purpose === "review"
          ? "Main review request. Use {{name}}, {{business}}, and {{link}}."
          : template.purpose === "review_reminder"
            ? "Review reminder for customers who did not review yet."
            : "Campaign/follow-up message. Use {{name}}, {{business}}, and {{offer}}.";

      return `
        <label class="wide">
          ${escapeHtml(purposeLabel)} message
          <small>${escapeHtml(helpText)}</small>
          <textarea name="${escapeHtml(fieldName)}" rows="4">${escapeHtml(template.text)}</textarea>
        </label>
      `;
    })
    .join("");
}

function renderSettings(isOnboarding = false) {
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
                    ${renderPlanPrice(plan)}
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
        ${renderTemplateEditorFields()}
        <div class="template-help wide">
          You do not type every customer name manually. Use <code>{{name}}</code>, <code>{{business}}</code>, <code>{{link}}</code>, and <code>{{offer}}</code>; Vouchly fills them automatically when opening WhatsApp.
        </div>
        <label class="terms-check wide">
          <input name="acceptTerms" type="checkbox" ${state.business.acceptedTermsAt ? "checked" : ""} />
          <span>I agree to Vouchly's Terms, Privacy rules, anti-spam policy, and honest-review policy. I will only message customers who gave their contact details or have a real business relationship with me.</span>
        </label>
        ${
          isOnboarding
            ? ""
            : `<div class="workspace-tools wide">
                <button class="ghost-button" data-action="load-demo" type="button">Load demo data</button>
                <button class="ghost-button" data-action="export" type="button">Download data backup</button>
                <button class="danger-button" data-action="reset-workspace" type="button">Reset workspace</button>
              </div>`
        }
        <button class="primary-button" type="submit">${isOnboarding ? "Finish setup" : "Save settings"}</button>
      </form>
    </section>
  `;
}

function renderPlanDetail(plan) {
  return `
    <strong>${escapeHtml(plan.name)} includes</strong>
    ${plan.originalPrice ? `<span>${escapeHtml(plan.offer ?? "50% off")}: <del>${escapeHtml(plan.originalPrice)}</del> now ${escapeHtml(plan.price)}</span>` : `<span>${escapeHtml(plan.price)}</span>`}
    <span>${escapeHtml(plan.limits)}</span>
    <ul>
      ${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

function renderVouchlyLandingAuth() {
  const isSignup = authMode === "signup";
  const pendingPlan = plans.find((plan) => plan.id === pendingPlanId) ?? plans[0];

  return `
    <main class="vouchly-landing">
      <nav class="vouchly-nav">
        <a class="vouchly-logo" href="#hero" aria-label="Vouchly home"><span>⭐</span>Vouchly</a>
        <div class="vouchly-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div class="vouchly-nav-actions">
          <a class="btn-ghost-nav" href="#auth-panel" data-auth-mode="signin">Sign in</a>
          <a class="btn-fill-nav" href="#auth-panel" data-auth-mode="signup" data-plan-id="free">Start free →</a>
        </div>
      </nav>

      <section class="vouchly-hero" id="hero">
        <div class="hero-grid"></div>
        <div class="hero-orb o1"></div>
        <div class="hero-orb o2"></div>
        <div class="hero-orb o3"></div>
        ${vouchlyReviewBadge("rf1", "RK", "Rahul Kumar", "★★★★★ Just now · Google", "green")}
        ${vouchlyReviewBadge("rf2", "PS", "Priya Shah", "★★★★★ 2 min ago · Google", "amber")}
        ${vouchlyReviewBadge("rf3", "AM", "Amit Mehta", "★★★★★ 5 min ago · Google", "violet")}

        <div class="vouchly-hero-copy">
          <div class="hero-pill"><span>⭐</span> First month free · No credit card · Built for local businesses</div>
          <h1>Turn happy customers into <span>Google reviews.</span></h1>
          <p>Vouchly helps local businesses collect more Google reviews by organizing customers, scheduling review requests, managing message templates, and tracking follow-ups.</p>
          <div class="hero-actions">
            <a class="btn-hp" href="#auth-panel" data-auth-mode="signup" data-plan-id="free">✨ Start free month</a>
            <a class="btn-hs" href="#pricing">See all plans →</a>
          </div>
        </div>

        <div class="dashboard-stage">
          <div class="hdash" id="dash3d">
            <div class="dshell">
              <div class="dbar">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                <strong>Vouchly Dashboard — My Salon, Pune</strong>
              </div>
              <div class="dbody">
                <article class="dst active"><strong>48</strong><span>⭐ Reviews this month</span><small>↑ +18 vs last month</small></article>
                <article class="dst warm"><strong>142</strong><span>Customers added</span><small>↑ 89% open rate</small></article>
                <article class="dst"><strong>87%</strong><span>Request response rate</span><small>↑ Above average</small></article>
                <div class="dtbl">
                  <div class="dtblh">Recent customers <span>12 pending follow-up</span></div>
                  ${vouchlyMockCustomerRow("RK", "Rahul Kumar", "Today, 2:30pm", "Reviewed", "green")}
                  ${vouchlyMockCustomerRow("PS", "Priya Shah", "Today, 11am", "Request sent", "amber")}
                  ${vouchlyMockCustomerRow("AM", "Amit Mehta", "Yesterday", "Scheduled", "violet")}
                  ${vouchlyMockCustomerRow("SJ", "Sunita Joshi", "2 days ago", "Follow-up due", "teal")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="proof-bar" aria-label="Vouchly proof">
        <div class="proof-track">
          ${vouchlyProofItems().concat(vouchlyProofItems()).map((item) => `<span>${item}</span>`).join("")}
        </div>
      </section>

      <section class="vouchly-section how-section" id="how">
        <p class="eyebrow">How it works</p>
        <h2>Simple enough for any local business owner</h2>
        <p class="section-sub">No tech knowledge needed. If you can use WhatsApp, you can use Vouchly.</p>
        <div class="steps">
          <div class="step-line"></div>
          ${vouchlyStep("1", "🏪", "Set up your profile", "Add your business name and paste your Google review link. Takes 2 minutes.")}
          ${vouchlyStep("2", "👥", "Add your customers", "After a purchase or visit, add the customer's name and number instantly.")}
          ${vouchlyStep("3", "💬", "Schedule requests", "Preview your message, pick when to send it, and track the follow-up.")}
          ${vouchlyStep("4", "📊", "Track everything", "See who reviewed, who's pending, and who needs a follow-up in one place.")}
        </div>
      </section>

      <section class="vouchly-section feature-pop-section" id="features">
        <p class="eyebrow">Features</p>
        <h2>Everything you need. Nothing you don't.</h2>
        <p class="section-sub">Built for busy shop owners, clinics, salons, hotels, and service teams.</p>
        <div class="feats">
          ${vouchlyFeature("📋", "Customer List Management", "Keep customers organized in one place. Add them quickly after a sale, visit, or appointment.", true)}
          ${vouchlyFeature("🗓️", "Review Request Scheduling", "Schedule review requests at the right time, when your customer is happiest.")}
          ${vouchlyFeature("💬", "Ready-made Message Templates", "WhatsApp, SMS, and email templates ready to use and easy to edit.")}
          ${vouchlyFeature("🔔", "Follow-up Reminders", "Know who still needs a reminder before reviews are lost.")}
          ${vouchlyFeature("🔗", "Google Review Link Storage", "Store the review link once. Vouchly adds it to every message automatically.")}
          ${vouchlyFeature("📥", "CSV Data Backup", "Download customer and automation data in spreadsheet-friendly CSV format.")}
        </div>
      </section>

      <section class="vouchly-section industries" id="industries">
        <p class="eyebrow">Who uses Vouchly</p>
        <h2>Built for every local business</h2>
        <div class="industry-tags">
          ${vouchlyIndustries().map(([emoji, item]) => `<span><b>${emoji}</b>${item}</span>`).join("")}
        </div>
      </section>

      <section class="vouchly-section pricing-section" id="pricing">
        <p class="eyebrow">Pricing</p>
        <h2>Simple, honest pricing</h2>
        <p class="section-sub">Start free. Upgrade only when you grow. No hidden charges, no surprises.</p>
        <div class="pricing-grid vouchly-pricing-grid">
          ${plans.map((plan) => vouchlyMarketingPlan(plan)).join("")}
        </div>
      </section>

      <section class="testimonial-section">
        <p class="eyebrow">What business owners say</p>
        <h2>They got more reviews. Now it's your turn.</h2>
        <div class="testimonial-grid">
          ${vouchlyTestimonial("Neha Patil", "Salon owner", "Within the first month I got more Google reviews without chasing customers manually.")}
          ${vouchlyTestimonial("Rahul Desai", "Garage owner", "I just add customers after service. The follow-up list keeps everything clear.")}
          ${vouchlyTestimonial("Dr. Kavita Joshi", "Clinic owner", "The setup is simple enough for my front desk team and professional enough for patients.")}
        </div>
      </section>

      <section class="vouchly-auth-section" id="auth-panel">
        <div class="auth-trust-panel">
          <span class="brand-mark">⭐</span>
          <h2>More reviews. More customers. More trust.</h2>
          <p>Built for local businesses worldwide that want a simple review follow-up system without technical setup.</p>
          <ul>
            <li>No technical knowledge needed</li>
            <li>First month free</li>
            <li>Private workspace with Supabase login</li>
            <li>Works on mobile and desktop</li>
          </ul>
        </div>

        <section class="auth-card marketing-auth-card vouchly-auth-card">
          <div class="auth-tabs">
            <button class="${!isSignup ? "active" : ""}" data-auth-mode="signin" type="button">Sign in</button>
            <button class="${isSignup ? "active" : ""}" data-auth-mode="signup" type="button">Create account</button>
          </div>
          <h2>${isSignup ? "Start your free month." : "Welcome back."}</h2>
          <p>${isSignup ? "Create your account. After signup, add your business details and Google review link." : "Sign in to manage customers, review requests, templates, and follow-ups."}</p>
          ${isSignup ? `<div class="selected-plan-note"><span>Selected plan</span><strong>${escapeHtml(pendingPlan.name)}</strong><small>${pendingPlan.originalPrice ? `${escapeHtml(pendingPlan.offer)}: ${escapeHtml(pendingPlan.price)}` : escapeHtml(pendingPlan.price)}</small></div>` : ""}
          <form id="auth-form" class="auth-form">
            <input name="email" type="email" placeholder="you@business.com" autocomplete="off" data-private-input required />
            <input name="password" type="password" placeholder="${isSignup ? "Create a strong password" : "Your password"}" autocomplete="new-password" data-private-input required minlength="${isSignup ? 10 : 6}" />
            <button class="primary-button" type="submit">${isSignup ? "Create free account →" : "Sign in to Vouchly →"}</button>
          </form>
          ${authMessage ? `<div class="auth-message">${escapeHtml(authMessage)}</div>` : ""}
          ${authNeedsConfirmation && lastAuthEmail ? `<button class="ghost-button resend-button" data-action="resend-confirmation" type="button">Resend confirmation email</button>` : ""}
          <button class="link-button" data-auth-mode="${isSignup ? "signin" : "signup"}">
            ${isSignup ? "Already have an account? Sign in" : "New business? Start free"}
          </button>
        </section>
      </section>

      ${renderPublicLegalSection()}
      ${renderMarketingFooter("⭐ Vouchly")}
    </main>
  `;
}

function vouchlyReviewBadge(position, initials, name, meta, tone) {
  return `
    <div class="review-float ${position}">
      <div class="review-badge">
        <div class="review-avatar ${tone}">${initials}</div>
        <div><strong>${name}</strong><span>${meta}</span></div>
      </div>
    </div>
  `;
}

function vouchlyMockCustomerRow(initials, name, date, status, tone) {
  return `
    <div class="crow">
      <span class="cav ${tone}">${initials}</span>
      <strong>${name}</strong>
      <small>${date}</small>
      <em>${status}</em>
    </div>
  `;
}

function vouchlyProofItems() {
  return [
    "★★★★★ 500+ businesses trust Vouchly",
    "🍽️ Restaurants",
    "💇 Salons",
    "🏥 Clinics",
    "🦷 Dentists",
    "🏨 Hotels",
    "💪 Gyms",
    "📚 Coaching Classes",
    "🚗 Garages",
    "10,000+ review requests tracked"
  ];
}

function vouchlyStep(number, emoji, title, body) {
  return `
    <article class="step">
      <span class="step-icon">${emoji}</span>
      <small>Step ${number}</small>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function vouchlyFeature(emoji, title, body, highlighted = false) {
  return `
    <article class="feature-card ${highlighted ? "highlight" : ""}">
      <span class="feature-icon">${emoji}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
      ${highlighted ? `<small>Most used</small>` : ""}
    </article>
  `;
}

function vouchlyIndustries() {
  return [
    ["🍽️", "Restaurants"],
    ["☕", "Cafes"],
    ["💇", "Salons"],
    ["🏥", "Clinics"],
    ["🦷", "Dentists"],
    ["🏨", "Hotels"],
    ["🌴", "Resorts"],
    ["🥐", "Bakeries"],
    ["🍔", "Fast Food"],
    ["🚗", "Garages"],
    ["🧽", "Car Wash"],
    ["🏍️", "Bike Repair"],
    ["📚", "Coaching Classes"],
    ["✏️", "Tuition Centers"],
    ["📱", "Mobile Repair"],
    ["🔌", "Electronics Stores"],
    ["🛋️", "Furniture Stores"],
    ["✈️", "Travel Agencies"],
    ["🎉", "Event Planners"],
    ["💍", "Wedding Photographers"],
    ["💪", "Gyms"],
    ["🧘", "Yoga Studios"],
    ["🧖", "Spas"],
    ["🎨", "Tattoo Studios"],
    ["🐾", "Pet Clinics"],
    ["🐶", "Pet Grooming"],
    ["💊", "Pharmacies"],
    ["🧪", "Diagnostic Labs"],
    ["🏠", "Real Estate"],
    ["📦", "Packers & Movers"],
    ["📸", "Photographers"],
    ["🧹", "Cleaning Services"],
    ["🛡️", "Pest Control"],
    ["🔧", "Service Providers"],
    ["🍱", "Cloud Kitchens"],
    ["🍸", "Bars & Lounges"],
    ["💼", "Coworking Spaces"]
  ];
}

function vouchlyMarketingPlan(plan) {
  const isGrowth = plan.id === "growth";
  const displayPrice = plan.price
    .replace("INR 0 / first month", "₹0 / first month")
    .replace("INR 999 / month", "₹999 / month")
    .replace("INR 2,999 / month", "₹2,999 / month")
    .replace("INR 7,999 / month", "₹7,999 / month");

  return `
    <article class="marketing-plan ${isGrowth ? "popular" : ""}">
      ${isGrowth ? `<span class="popular-pill">⭐ Most popular</span>` : ""}
      <span>${escapeHtml(plan.name)}</span>
      ${renderPlanPrice(plan)}
      <p>${escapeHtml(plan.fit)}</p>
      <small>${escapeHtml(plan.limits)}</small>
      <ul>${plan.includes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <a class="${isGrowth ? "primary-button" : "ghost-button"} small" href="#auth-panel" data-auth-mode="signup" data-plan-id="${escapeHtml(plan.id)}">
        ${plan.id === "free" ? "Start free month" : `Get ${escapeHtml(plan.name)}`}
      </a>
    </article>
  `;
}

function vouchlyTestimonial(name, role, text) {
  return `
    <article>
      <span>★★★★★</span>
      <p>"${escapeHtml(text)}"</p>
      <strong>${escapeHtml(name)}</strong>
      <small>${escapeHtml(role)}</small>
    </article>
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

  if (authMode === "signup" && String(password).length < 10) {
    authNeedsConfirmation = false;
    authMessage = "Use at least 10 characters for the password. Longer is safer.";
    render();
    return;
  }

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
      const purpose = button.dataset.purpose;

      if (action === "export") exportData();
      if (action === "download-csv-template") downloadCsvTemplate();
      if (action === "bulk-send") bulkQueueRequests(bulkCampaignPurpose);
      if (action === "queue") queueReviewRequest(id, purpose || "review_reminder");
      if (action === "delete-customer") deleteCustomer(id);
      if (action === "complete-task") completeTask(id);
      if (action === "preview-message") previewMessage(id, purpose || "review");
      if (action === "open-whatsapp-message") openWhatsAppMessage(id, purpose || messagePreviewPurpose);
      if (action === "open-task-whatsapp") openTaskWhatsApp(id);
      if (action === "copy-preview-message") copyPreviewMessage(purpose || messagePreviewPurpose);
      if (action === "close-preview") closeMessagePreview();
      if (action === "edit-customer") editCustomer(id);
      if (action === "close-customer-editor") closeCustomerEditor();
      if (action === "mark-reviewed") markCustomerReviewed(id);
      if (action === "resend-confirmation") resendConfirmationEmail();
      if (action === "set-preferred-provider") setPreferredProvider(button.dataset.provider);
      if (action === "show-provider-next-step") showProviderNextStep(button.dataset.provider);
      if (action === "customer-prev-page") moveCustomerPage(-1);
      if (action === "customer-next-page") moveCustomerPage(1);
      if (action === "clear-customer-filters") clearCustomerFilters();
      if (action === "clear-outbox-filters") clearOutboxFilters();
      if (action === "load-demo") loadDemoWorkspace();
      if (action === "reset-workspace") resetWorkspaceData();
      if (action === "logout") logout();
    });
  });

  document.querySelector("#customer-form")?.addEventListener("submit", addCustomer);
  document.querySelector("#csv-import")?.addEventListener("change", importCustomersFromCsv);
  document.querySelector("#customer-editor-form")?.addEventListener("submit", saveCustomerEdits);
  document.querySelector("#settings-form")?.addEventListener("submit", saveSettings);
  document.querySelectorAll(".modal-card").forEach((modal) => {
    modal.addEventListener("click", (event) => event.stopPropagation());
  });
  document.querySelectorAll("[data-filter]").forEach((field) => {
    const updateFilter = () => {
      customerFilters = {
        ...customerFilters,
        [field.dataset.filter]: field.value,
        page: 1
      };
      render();
    };

    field.addEventListener("input", updateFilter);
    field.addEventListener("change", updateFilter);
  });
  document.querySelectorAll("[data-outbox-filter]").forEach((field) => {
    const updateFilter = () => {
      outboxFilters = {
        ...outboxFilters,
        [field.dataset.outboxFilter]: field.value
      };
      render();
    };

    field.addEventListener("input", updateFilter);
    field.addEventListener("change", updateFilter);
  });
  document.querySelector("[data-preview-purpose]")?.addEventListener("change", (event) => {
    messagePreviewPurpose = event.currentTarget.value;
    render();
  });
  document.querySelector("[data-bulk-purpose]")?.addEventListener("change", (event) => {
    bulkCampaignPurpose = event.currentTarget.value;
    render();
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

function moveCustomerPage(direction) {
  const totalPages = Math.max(1, Math.ceil(filterCustomers(state.customers).length / customerPageSize));
  customerFilters = {
    ...customerFilters,
    page: Math.min(totalPages, Math.max(1, customerFilters.page + direction))
  };
  render();
}

function clearCustomerFilters() {
  customerFilters = defaultCustomerFilters();
  render();
}

function clearOutboxFilters() {
  outboxFilters = defaultOutboxFilters();
  render();
}

function loadDemoWorkspace() {
  const hasWorkspaceData = isSetupComplete() && (state.customers.length || state.tasks.length);
  const shouldReplace =
    !hasWorkspaceData ||
    window.confirm("Load demo workspace? This will replace the current Vouchly workspace on this account.");

  if (!shouldReplace) {
    return;
  }

  customerFilters = defaultCustomerFilters();
  outboxFilters = defaultOutboxFilters();
  messagePreviewCustomerId = null;
  editingCustomerId = null;
  appMessage = "Demo workspace loaded. You can now explore the full flow safely.";
  setState(createDemoWorkspaceState());
}

function resetWorkspaceData() {
  const shouldReset =
    !isSetupComplete() ||
    window.confirm("Reset Vouchly workspace? This removes customers, follow-ups, and setup details from this account.");

  if (!shouldReset) {
    return;
  }

  customerFilters = defaultCustomerFilters();
  outboxFilters = defaultOutboxFilters();
  messagePreviewCustomerId = null;
  editingCustomerId = null;
  appMessage = "Workspace reset. Start clean setup or load demo data.";
  setState(createEmptyWorkspaceState());
}

function addCustomer(event) {
  event.preventDefault();
  const customerLimitMessage = getCustomerLimitMessage();
  if (customerLimitMessage) {
    appMessage = customerLimitMessage;
    render();
    return;
  }

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
    ]
  }));
}

function downloadCsvTemplate() {
  const rows = [
    ["name", "phone", "email", "channel", "visitDate", "source"],
    ["Priya Sharma", "+91 98765 43210", "priya@example.com", "whatsapp", getTodayDateValue(), "walk-in"]
  ];
  downloadCsv("vouchly-customer-import-template.csv", rows);
}

async function importCustomersFromCsv(event) {
  const file = event.currentTarget.files?.[0];
  event.currentTarget.value = "";

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const importedCustomers = parseCustomerCsv(text);

    if (!importedCustomers.length) {
      appMessage = "No valid customers found. CSV needs at least a name and phone or email.";
      render();
      return;
    }

    const customerLimitMessage = getCustomerLimitMessage(importedCustomers.length);
    if (customerLimitMessage) {
      appMessage = customerLimitMessage;
      render();
      return;
    }

    appMessage = `${importedCustomers.length} customer${importedCustomers.length === 1 ? "" : "s"} imported from CSV.`;
    customerFilters = {
      ...defaultCustomerFilters(),
      dateMode: "all"
    };

    setState((current) => ({
      ...current,
      customers: [
        ...importedCustomers.map((customer, index) => ({
          id: nextId(current.customers) + index,
          ...customer,
          status: "pending"
        })),
        ...current.customers
      ]
    }));
  } catch (error) {
    appMessage = `CSV import failed: ${error.message}`;
    render();
  }
}

function parseCustomerCsv(text) {
  const rows = parseCsvRows(text).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => normalizeCsvHeader(header));
  return rows
    .slice(1)
    .map((row) => csvRowToCustomer(headers, row))
    .filter((customer) => customer.name && (customer.phone || customer.email));
}

function csvRowToCustomer(headers, row) {
  const values = {};
  headers.forEach((header, index) => {
    values[header] = row[index]?.trim() ?? "";
  });

  return {
    name: values.name || values.customername || values.customer || "",
    phone: values.phone || values.mobile || values.contact || "",
    email: values.email || "",
    channel: normalizeChannel(values.channel || values.mode || "whatsapp"),
    visitDate: normalizeDateValue(values.visitdate || values.date || values.visit || getTodayDateValue()),
    source: values.source || "csv-import"
  };
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function normalizeCsvHeader(value = "") {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeChannel(value = "") {
  const channel = value.toLowerCase().trim();
  return ["whatsapp", "sms", "email"].includes(channel) ? channel : "whatsapp";
}

function normalizeDateValue(value = "") {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const indianDate = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (indianDate) {
    const [, day, month, year] = indianDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return getTodayDateValue();
}

function saveSettings(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  const { acceptTerms, ...formValues } = form;
  const templateFieldNames = new Set(
    state.templates.map((template, index) => templateFormFieldName(template, index))
  );
  const business = Object.fromEntries(
    Object.entries(formValues).filter(([key]) => !templateFieldNames.has(key))
  );
  const missingFields = requiredSetupFields(form);

  if (missingFields.length) {
    appMessage = `Please fill: ${missingFields.map(([label]) => label).join(", ")}.`;
    render();
    return;
  }

  if (!acceptTerms) {
    appMessage = "Please accept the Terms, Privacy rules, anti-spam policy, and honest-review policy before using Vouchly.";
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
      trialStartedAt: current.business.trialStartedAt || new Date().toISOString(),
      acceptedTermsAt: current.business.acceptedTermsAt || new Date().toISOString(),
      setupComplete: true
    },
    templates: current.templates.map((template, index) => {
      const fieldName = templateFormFieldName(template, index);
      return form[fieldName] !== undefined ? { ...template, text: form[fieldName] } : template;
    })
  }));

  window.localStorage.removeItem("vouchly-pending-plan");
  pendingPlanId = "";
}

function bulkQueueRequests(purpose = bulkCampaignPurpose) {
  const option = getMessageTypeOption(purpose);
  const pendingCustomers = filterCustomers(state.customers).filter((customer) => customer.status === "pending");
  const todayDueAt = `${getTodayDateValue()} ${option.dueTime}`;

  setState((current) => {
    const customersToSchedule = pendingCustomers.filter(
      (customer) => !hasScheduledRequestForCustomer(current.tasks, customer, todayDueAt)
    );

    if (!customersToSchedule.length) {
      appMessage = "No pending customers in this filtered view need preparing right now.";
      return current;
    }

    const requestLimitMessage = getRequestLimitMessage(customersToSchedule.length);
    if (requestLimitMessage) {
      appMessage = requestLimitMessage;
      return current;
    }

    const tasks = customersToSchedule.map((customer, index) => ({
      id: Date.now() + index,
      title: option.taskTitle,
      customerId: customer.id,
      customerName: customer.name,
      channel: customer.channel,
      purpose,
      dueAt: todayDueAt,
      status: "scheduled"
    }));

    appMessage = isAnyProviderConnected()
      ? `${customersToSchedule.length} ${option.label.toLowerCase()} message${customersToSchedule.length === 1 ? "" : "s"} prepared for connected delivery.`
      : `${customersToSchedule.length} ${option.label.toLowerCase()} message${customersToSchedule.length === 1 ? "" : "s"} prepared for ${option.dueTime}. This does not auto-send; open WhatsApp and tap Send for each customer.`;

    return {
      ...current,
      customers: current.customers.map((customer) =>
        customersToSchedule.some((entry) => entry.id === customer.id)
          ? { ...customer, status: "scheduled" }
          : customer
      ),
      tasks: normalizeTasks([...tasks, ...current.tasks])
    };
  });
}

function completeTask(taskId) {
  const task = state.tasks.find((entry) => entry.id === taskId);
  appMessage = task ? `${task.customerName} marked as sent.` : "";

  setState((current) => ({
    ...current,
    tasks: current.tasks.map((task) =>
      task.id === taskId ? { ...task, status: "done" } : task
    )
  }));
}

async function openTaskWhatsApp(taskId) {
  const task = state.tasks.find((entry) => entry.id === taskId);
  const customer = task ? findCustomerForTask(task) : null;

  if (!task || !customer) {
    appMessage = "Customer not found for this outbox item. Prepare the message again from Customers.";
    render();
    return;
  }

  await openWhatsAppMessage(customer.id, inferTaskPurpose(task));
}

function setPreferredProvider(providerId) {
  if (!["whatsapp", "sms", "email"].includes(providerId)) {
    return;
  }

  appMessage = `${providerId.toUpperCase()} is now the preferred sending channel.`;
  setState((current) => ({
    ...current,
    sending: {
      ...current.sending,
      preferredChannel: providerId
    }
  }));
}

function showProviderNextStep(providerId) {
  const guide = {
    whatsapp: "Current mode: Vouchly opens the owner's WhatsApp with the message ready. The owner checks it and taps Send. Automatic background sending can be added later.",
    sms: "SMS is optional later. Most local customers respond better on WhatsApp first.",
    email: "Email is optional later for receipts, reports, and backup delivery."
  };

  appMessage = guide[providerId] ?? "Choose a sending provider first.";
  window.alert(appMessage);
  render();
}

function previewMessage(customerId, purpose = "review") {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  messagePreviewCustomerId = customerId;
  messagePreviewPurpose = purpose;
  render();
}

function closeMessagePreview() {
  messagePreviewCustomerId = null;
  messagePreviewPurpose = "review";
  render();
}

function normalizePhoneForWhatsApp(phone = "") {
  const digits = String(phone).replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

async function openWhatsAppMessage(customerId, purpose = messagePreviewPurpose || "review") {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  const phone = normalizePhoneForWhatsApp(customer.phone);
  const message = buildMessage(customer, purpose);

  try {
    await navigator.clipboard.writeText(message);
  } catch {
    // Opening WhatsApp still works; copy is a helpful fallback when allowed.
  }

  if (!phone) {
    appMessage = `${customer.name} has no phone number. Message copied if browser allowed it.`;
    render();
    return;
  }

  appMessage = `${customer.name} WhatsApp message opened. Review the auto-filled text before sending.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  closeMessagePreview();
}

async function copyPreviewMessage(purpose = messagePreviewPurpose || "review") {
  const customer = state.customers.find((entry) => entry.id === messagePreviewCustomerId);
  if (!customer) {
    return;
  }

  try {
    await navigator.clipboard.writeText(buildMessage(customer, purpose));
    appMessage = `${customer.name} message copied. Paste it into ${customer.channel}.`;
  } catch {
    appMessage = "Copy was blocked by the browser. Select the message and copy it manually.";
  }

  closeMessagePreview();
}

function editCustomer(customerId) {
  if (!state.customers.some((entry) => entry.id === customerId)) {
    return;
  }

  editingCustomerId = customerId;
  render();
}

function closeCustomerEditor() {
  editingCustomerId = null;
  render();
}

function saveCustomerEdits(event) {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget).entries());
  const currentCustomer = state.customers.find((entry) => entry.id === editingCustomerId);
  if (!currentCustomer) {
    return;
  }

  appMessage = `${form.name} customer details saved.`;
  const customerWasMarkedReviewed = form.status === "reviewed";
  const customerId = editingCustomerId;
  editingCustomerId = null;

  setState((current) => ({
    ...current,
    customers: current.customers.map((customer) =>
      customer.id === customerId ? { ...customer, ...form } : customer
    ),
    tasks: current.tasks.map((task) => {
      const belongsToCustomer = task.customerName === currentCustomer.name;
      if (!belongsToCustomer) {
        return task;
      }

      return {
        ...task,
        customerName: form.name,
        channel: form.channel,
        status: customerWasMarkedReviewed && task.status === "scheduled" ? "done" : task.status
      };
    })
  }));
}

function markCustomerReviewed(customerId) {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    return;
  }

  appMessage = `${customer.name} marked reviewed.`;
  messagePreviewCustomerId = null;
  editingCustomerId = null;

  setState((current) => ({
    ...current,
    customers: current.customers.map((entry) =>
      entry.id === customerId ? { ...entry, status: "reviewed" } : entry
    ),
    tasks: current.tasks.map((task) =>
      task.customerName === customer.name && task.status === "scheduled"
        ? { ...task, status: "done" }
        : task
    )
  }));
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
