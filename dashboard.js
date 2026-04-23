const listEl = document.getElementById("compliance-list");
const alertBar = document.getElementById("alert-bar");
const progressBar = document.getElementById("progress-bar");

const modal = document.getElementById("compliance-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalDocs = document.getElementById("modal-documents");
const modalHistory = document.getElementById("modal-history");
const closeBtn = document.getElementById("close-btn");
const doneBtn = document.getElementById("done-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileInput = document.getElementById("file-input");

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const themeToggle = document.getElementById("theme-toggle");
const logoutBtn = document.getElementById("logout-btn");
const userEmailEl = document.getElementById("user-email");

let selectedCompliance = null;
let compliances = [];

// Firebase Auth check
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    userEmailEl.textContent = user.email;

    // Load compliances from Firestore (or localStorage fallback)
    const db = firebase.firestore();
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        compliances = doc.data().compliances;
      } else {
        compliances = window.compliances; // demo data
      }
      renderCompliances();
    });
  }
});

// Save to Firestore
function save() {
  const user = firebase.auth().currentUser;
  if (user) {
    firebase.firestore().collection("users").doc(user.uid).set({ compliances });
  }
}

// Render compliances
function renderCompliances() {
  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  listEl.innerHTML = "";

  let dueSoon = 0, overdue = 0, completed = 0;

  compliances.forEach((c) => {
    if (filter && c.category !== filter) return;
    if (search && !c.name.toLowerCase().includes(search)) return;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${c.name}</h3>
        <p>${c.authority} • Due: ${c.dueDate}</p>
      </div>
      <span class="status ${c.status}">${c.status}</span>
    `;
    card.addEventListener("click", () => openModal(c));
    listEl.appendChild(card);

    if (c.status === "Completed") completed++;
    else {
      const dueDate = new Date(c.dueDate);
      const today = new Date();
      const diff = (dueDate - today) / (1000 * 60 * 60 * 24);
      if (diff < 0) overdue++;
      else if (diff <= 7) dueSoon++;
    }
  });

  progressBar.style.width = `${(completed / compliances.length) * 100}%`;

  if (overdue > 0 || dueSoon > 0) {
    alertBar.textContent = `${overdue} overdue • ${dueSoon} due soon`;
    alertBar.classList.remove("hidden");
  } else {
    alertBar.classList.add("hidden");
  }
}

// Modal controls
function openModal(c) {
  selectedCompliance = c;
  modalTitle.textContent = c.name;
  modalDescription.textContent = c.description;
  modalDocs.innerHTML = c.documents.map((d) => `<li>${d}</li>`).join("");
  modalHistory.innerHTML = c.history.map((h) => `<li>${h}</li>`).join("");
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); selectedCompliance = null; }
closeBtn.addEventListener("click", closeModal);

doneBtn.addEventListener("click", () => {
  if (selectedCompliance) {
    selectedCompliance.status = "Completed";
    selectedCompliance.history.push("Marked completed on " + new Date().toLocaleDateString());
    save();
    renderCompliances();
    closeModal();
  }
});

uploadBtn.addEventListener("click", () => {
  if (selectedCompliance && fileInput.files.length > 0) {
    const file = fileInput.files[0].name;
    selectedCompliance.history.push("Uploaded " + file + " on " + new Date().toLocaleDateString());
    save();
    renderCompliances();
    openModal(selectedCompliance);
    fileInput.value = "";
  }
});

// Filters and search
searchInput.addEventListener("input", renderCompliances);
filterSelect.addEventListener("change", renderCompliances);

// Dark mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Logout
logoutBtn.addEventListener("click", () => {
  firebase.auth().signOut().then(() => window.location.href = "index.html");
});
