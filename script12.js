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
document.getElementById('ssthe').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1O1ZLB3K4TE-aSNdC_olSZtH4P71YzCm5'; // Change this to the correct file path
    const fileName = 'Microprocessor Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('mpprn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Microprocessor Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('mpbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=18tL4jO3h2RyPgp1S4wZPqtOuOjFCPxg9'; // Change this to the correct file path
    const fileName = 'Microprocessor Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('mppyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Microprocessor PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
