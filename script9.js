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
document.getElementById('jgdcso').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1caLPJxfoUkPCVFa1dnOFM-UNS4cbGGUU'; // Change this to the correct file path
    const fileName = 'C.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('ppdf').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('csobooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1LYLem_kvxRCZbOtCfkMgzaQgJZChaKEb'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('csopyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1TuOF9wnZuzJg9J1DudeLzrt0M-OdTBLM'; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});