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
document.getElementById('osprn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});

document.getElementById('osbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1c3LmAZ326oAmsJMEmIU61zMICW0PK_yZ'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('ospyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1yGvHc3Jki6tdlSfJGRwbnzPnJo_W808K'; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});