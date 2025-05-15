document.getElementById('downloadCV').addEventListener('click',function(e){
    e.preventDefault();
    const link = document.createElement('a');
    link.href = 'content/Ahmed-CV.pdf';
     link.setAttribute('download', 'Ahmed-CV.pdf');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
});
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.querySelector('nav ul');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
})
