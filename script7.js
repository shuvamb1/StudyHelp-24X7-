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
document.getElementById('java').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1O1ZLB3K4TE-aSNdC_olSZtH4P71YzCm5'; // Change this to the correct file path
    const fileName = 'JAVA.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('javaprn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('javabooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1f9YQLjWQA8z9slmizlFaM49Zl2FaR0Nt'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('javapyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});