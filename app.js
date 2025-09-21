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
