const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.innerHTML = isOpen ? '&#10005;' : '&#9776;';
});

navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
        navMenu.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.innerHTML = '&#9776;';
    });
});

console.log("From Client Side JS");
