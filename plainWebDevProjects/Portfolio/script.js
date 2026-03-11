// Hamburger Menu
const hamburger = document.querySelector(".hamburger-menu");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Close menu after clicking link
const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        navLinks.classList.remove("active");
    });
});

// Navbar shadow on scroll
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.5)";
    } else {
        header.style.boxShadow = "none";
    }
});

// View Work button scroll
const viewWorkBtn = document.getElementById("viewWork");

if (viewWorkBtn) {
    viewWorkBtn.addEventListener("click", function () {
        document.getElementById("projects").scrollIntoView({
            behavior: "smooth"
        });
    });
}