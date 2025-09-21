const listEl = document.getElementById("compliance-list");
const modal = document.getElementById("compliance-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalDocs = document.getElementById("modal-documents");
const closeBtn = document.getElementById("close-btn");
const doneBtn = document.getElementById("done-btn");

let selectedCompliance = null;

// Render compliance cards
function renderCompliances() {
  listEl.innerHTML = "";
  compliances.forEach((c) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${c.name}</h3>
        <p class="text-sm">${c.authority} • Due: ${c.dueDate}</p>
      </div>
      <span class="status ${c.status}">${c.status}</span>
    `;
    card.addEventListener("click", () => openModal(c));
    listEl.appendChild(card);
  });
}

function openModal(c) {
  selectedCompliance = c;
  modalTitle.textContent = c.name;
  modalDescription.textContent = c.description;
  modalDocs.innerHTML = c.documents.map((d) => `<li>${d}</li>`).join("");
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  selectedCompliance = null;
}

closeBtn.addEventListener("click", closeModal);
doneBtn.addEventListener("click", () => {
  if (selectedCompliance) {
    selectedCompliance.status = "Completed";
    renderCompliances();
    closeModal();
  }
});

// Init
renderCompliances();
