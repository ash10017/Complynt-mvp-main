const loginBtn = document.getElementById("login-btn");
const loginModal = document.getElementById("login-modal");
const closeLogin = document.getElementById("close-login");
const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");

loginBtn.addEventListener("click", () => loginModal.classList.remove("hidden"));
closeLogin.addEventListener("click", () => loginModal.classList.add("hidden"));

// Firebase Auth
signinBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    alert("Signup successful, you can now log in.");
  } catch (err) {
    alert(err.message);
  }
});

// Reveal on scroll
const faders = document.querySelectorAll(".fade-in-up, .fade-in-left, .fade-in-right");

const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(el => {
  appearOnScroll.observe(el);
});

// Mobile navbar toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});
// Close nav on link click (mobile)
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    if (navLinks.classList.contains("show")) {
      navLinks.classList.remove("show");
    }
  });
});
