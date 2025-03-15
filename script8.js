// Function to download the PowerPoint file
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for the button click
document.getElementById('osnote').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1EZwM2E9Y0PbNvfg7gUSQDsBFadCEyIuv'; // Change this to the correct file path
    const fileName = 'OS.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('prn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1hOq6ArsWu4N48kBIIL65k5EZpBm91Ft-'; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('jgd').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1i6b-yoEUulMcm5zAz8FnIy805RRJQGBf'; // Change this to the correct file path
    const fileName = 'notes of jgd mam.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('aap').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=18PIUR7u-0rr7fb8c1jHTaQwd3eVrQ2PF'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('pyq3').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=14h2hXEBLt69P98QBDHlNcKFaCV3pNEif'; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});