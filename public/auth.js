/*
================================================
  QUANTUM NETWORK | FIREBASE AUTHENTICATION
  Email/Password · Google Sign-In · Firestore
================================================
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  updateProfile,
  getAdditionalUserInfo,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase Config ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB5cLsNHpbNQA97dLyWZ10Je-RVfQ-CW2s",
  authDomain:        "quantumnetwork-server-2121.firebaseapp.com",
  projectId:         "quantumnetwork-server-2121",
  storageBucket:     "quantumnetwork-server-2121.firebasestorage.app",
  messagingSenderId: "206362335033",
  appId:             "1:206362335033:web:096d168caa5cf3a42bbae8"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.addScope("profile");
provider.addScope("email");

// ── Toast Notification ───────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("auth-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = "auth-toast show " + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 4000);
}

// ── Firestore: Save User Doc ─────────────────────────────────────────────────
async function saveUserToFirestore(uid, email, username) {
  try {
    const userRef = doc(db, "users", uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        username: username || (email ? email.split("@")[0] : "Player"),
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    // Non-critical: auth already succeeded; log but don't block UX
    console.warn("Firestore write skipped:", err.message);
  }
}

// ── Navbar Auth State Manager ────────────────────────────────────────────────
function updateNavbar(user) {
  const loginBtn  = document.getElementById("navLoginBtn");
  const userInfo  = document.getElementById("navUserInfo");
  const userLabel = document.getElementById("navUserLabel");

  if (user) {
    const displayName = user.displayName || (user.email ? user.email.split("@")[0] : "Player");
    if (loginBtn)  loginBtn.style.display  = "none";
    if (userInfo)  userInfo.style.display  = "flex";
    if (userLabel) userLabel.textContent   = "⚡ " + displayName.toUpperCase();
  } else {
    if (loginBtn) loginBtn.style.display  = "inline-block";
    if (userInfo) userInfo.style.display  = "none";
  }
}

// ── Modal Controls ───────────────────────────────────────────────────────────
function openAuthModal(tab = "login") {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("open");
  switchTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("open");
}

function switchTab(tab) {
  document.querySelectorAll(".auth-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
  document.querySelectorAll(".auth-form").forEach(form => {
    form.style.display = form.id === tab + "-form" ? "flex" : "none";
  });
}

// ── Register (Email/Password) ─────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const username = document.getElementById("reg-username").value.trim();

  if (!username) { showToast("❌ Enter a username.", "error"); return; }
  if (password.length < 6) { showToast("❌ Password must be at least 6 characters.", "error"); return; }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    
    // 1. Set display name in Auth
    await updateProfile(cred.user, { displayName: username });
    
    // 2. Send verification email
    await sendEmailVerification(cred.user);
    
    // 3. Sign out immediately (can't login until verified)
    await signOut(auth);
    
    showToast("✉️ Verification email sent! Please check your inbox.", "success");
    closeAuthModal();
  } catch (err) {
    console.error("Register error:", err.code, err.message);
    showToast("❌ " + friendlyError(err.code), "error");
  }
}

// ── Login (Email/Password) ────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!cred.user.emailVerified) {
      await signOut(auth);
      showToast("✉️ Please verify your email before logging in.", "error");
      return;
    }

    // If verified, save to Firestore (if not exists) and login
    await saveUserToFirestore(cred.user.uid, email, cred.user.displayName);
    showToast("✅ Welcome back, Commander!", "success");
    
    console.log("Closing modal after Email Login success");
    closeAuthModal();
  } catch (err) {
    console.error("Login error:", err.code, err.message);
    showToast("❌ " + friendlyError(err.code), "error");
  }
}

// ── Google Sign-In (popup → redirect fallback) ────────────────────────────────
async function handleGoogleSignIn() {
  try {
    showToast("🔄 Verifying with Google...", "success");
    // Try popup first
    const result = await signInWithPopup(auth, provider);
    const user   = result.user;
    const info   = getAdditionalUserInfo(result);

    // If it's a new account, we force a manual verification email to Gmail
    if (info && info.isNewUser) {
      await sendEmailVerification(user);
      await signOut(auth);
      showToast("✉️ Verification email sent to your Gmail! Please check your inbox.", "success");
      closeAuthModal();
      return;
    }

    // Consistency: check verification even for existing Google users
    if (!user.emailVerified) {
      await signOut(auth);
      showToast("❌ Please verify your email before logging in.", "error");
      return;
    }

    await saveUserToFirestore(user.uid, user.email, user.displayName);
    showToast("✅ Welcome, " + (user.displayName || user.email), "success");
    
    console.log("Closing modal after Google Sign-In success");
    closeAuthModal();
  } catch (err) {
    console.error("Google signin error:", err.code, err.message);

    if (err.code === "auth/popup-blocked" || err.code === "auth/popup-cancelled") {
      // Popup blocked → fall back to redirect
      showToast("🔄 Redirecting for Google sign-in...", "success");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectErr) {
        showToast("❌ " + friendlyError(redirectErr.code), "error");
      }
    } else if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
      showToast("❌ " + friendlyError(err.code), "error");
    }
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function handleLogout() {
  try {
    await signOut(auth);
    showToast("👋 Logged out. See you on the server!", "success");
  } catch (err) {
    showToast("❌ Logout failed.", "error");
  }
}

// ── Friendly Error Messages ───────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":     "That email is already registered.",
    "auth/invalid-email":            "Invalid email address.",
    "auth/weak-password":            "Password must be at least 6 characters.",
    "auth/user-not-found":           "No account found with that email.",
    "auth/wrong-password":           "Incorrect password.",
    "auth/invalid-credential":       "Invalid email or password.",
    "auth/too-many-requests":        "Too many attempts. Try again later.",
    "auth/popup-blocked":            "Popup blocked — please allow popups for this site.",
    "auth/popup-closed-by-user":     "Sign-in popup was closed.",
    "auth/cancelled-popup-request":  "Only one popup allowed at a time.",
    "auth/operation-not-allowed":    "This sign-in method is not enabled in Firebase Console.",
    "auth/unauthorized-domain":      "This domain is not authorized. Add it in Firebase Console → Auth → Settings → Authorized domains.",
    "auth/network-request-failed":   "Network error. Check your connection.",
    "auth/user-disabled":            "This account has been disabled.",
    "auth/missing-email":            "Please enter your email address.",
    "auth/internal-error":           "Internal error. Please try again.",
    "auth/configuration-not-found":  "Firebase Auth is not configured. Check Firebase Console.",
  };
  return map[code] || `Error (${code}). Check the browser console for details.`;
}

// ── Auth State Observer ───────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  updateNavbar(user);
});

// ── Handle redirect result (comes back after signInWithRedirect) ──────────────
getRedirectResult(auth).then(async (result) => {
  if (result && result.user) {
    const user = result.user;
    const info = getAdditionalUserInfo(result);
    
    // Force verification for new Google users arriving via redirect
    if (info && info.isNewUser) {
      await sendEmailVerification(user);
      await signOut(auth);
      showToast("✉️ Verification email sent to your Gmail! Please check your inbox.", "success");
      closeAuthModal();
      return;
    }

    if (!user.emailVerified) {
      await signOut(auth);
      showToast("❌ Please verify your email before logging in.", "error");
      return;
    }

    await saveUserToFirestore(user.uid, user.email, user.displayName);
    showToast("✅ Welcome, " + (user.displayName || user.email), "success");
    
    console.log("Closing modal after Redirect success");
    closeAuthModal();
  }
}).catch(err => {
  if (err.code && err.code !== "auth/redirect-cancelled-by-user") {
    console.error("Redirect result error:", err.code, err.message);
    showToast("❌ " + friendlyError(err.code), "error");
  }
});

// ── DOM Bindings ──────────────────────────────────────────────────────────────
// Use a safe init function that works whether DOMContentLoaded has already fired
function initAuthUI() {
  // Navbar buttons
  const loginBtn  = document.getElementById("navLoginBtn");
  const logoutBtn = document.getElementById("navLogoutBtn");
  const closeBtn  = document.getElementById("authModalClose");
  const modal     = document.getElementById("authModal");

  if (loginBtn)  loginBtn.addEventListener("click", () => openAuthModal("login"));
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (closeBtn)  closeBtn.addEventListener("click", closeAuthModal);
  if (modal)     modal.addEventListener("click", (e) => { if (e.target === modal) closeAuthModal(); });

  // Tabs
  document.querySelectorAll(".auth-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Forms
  const loginForm    = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  if (loginForm)    loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  // Google buttons
  document.querySelectorAll(".google-signin-btn").forEach(btn => {
    btn.addEventListener("click", handleGoogleSignIn);
  });
}

// Safe: works even if DOMContentLoaded already fired (modules are deferred)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthUI);
} else {
  initAuthUI();
}
