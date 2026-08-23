const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = question.nextElementSibling;
    const icon = question.querySelector(".faq-icon");

    if (answer.style.display === "block") {
      answer.style.display = "none";
      icon.textContent = "＋";
    } else {
      answer.style.display = "block";
      icon.textContent = "−";
    }
  });
});

const menuCards = document.querySelectorAll(".menu-card");
const modal = document.querySelector("#menu-modal");

const modalTitle = modal.querySelector(".modal-title");
const modalDescription = modal.querySelector(".modal-description");
const modalPrice = modal.querySelector(".modal-price");

const modalClose = modal.querySelector(".modal-close");
const modalOverlay = modal.querySelector(".modal-overlay");

menuCards.forEach((card) => {
  const button = card.querySelector(".menu-detail-button");

  button.addEventListener("click", () => {
    modalTitle.textContent = card.dataset.title;
    modalDescription.textContent = card.dataset.description;
    modalPrice.textContent = card.dataset.price;

    modal.classList.add("is-open");
  });
});

modalClose.addEventListener("click", () => {
  modal.classList.remove("is-open");
});

modalOverlay.addEventListener("click", () => {
  modal.classList.remove("is-open");
});

const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");
const navLinks = nav.querySelectorAll("a");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open");

  const isOpen = nav.classList.contains("is-open");

  menuToggle.setAttribute("aria-expanded", isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});