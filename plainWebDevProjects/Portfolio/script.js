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
//Added scroll animation 
const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

sections.forEach(sec=>{
    sec.classList.add("hidden");
    observer.observe(sec);
});

//Improved Contact Form
const form = document.querySelector("form");

form.addEventListener("submit", function(e){
    e.preventDefault();
    alert("Message sent successfully!");
});


//Add Smooth Scroll for Navbar Links
document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener("click",function(e){
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior:"smooth"
        });
    });
});

//Added Dark / Light Theme Toggle
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-theme");

    if(document.body.classList.contains("light-theme")){
        themeToggle.textContent = "☀️";
    }else{
        themeToggle.textContent = "🌙";
    }

});