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