
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
document.getElementById('aithe').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1mPu5k_KionBwxsMmBf_FUHlWbRyggnny'; // Change this to the correct file path
    const fileName = 'AI Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('aiprn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1Cm9o72Cwj4qew0Wo9-ZpecVwoubD4R34'; // Change this to the correct file path
    const fileName = 'Microprocessor Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('aibooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=18tL4jO3h2RyPgp1S4wZPqtOuOjFCPxg9'; // Change this to the correct file path
    const fileName = 'Microprocessor Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('aipyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=13woZn2lBB-IDoSP18MZIGbrbxptsep8H'; // Change this to the correct file path
    const fileName = 'Microprocessor PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('logo').addEventListener('click', function() {
            window.location.href = 'index1.html';
        });
		document.getElementById('ask').addEventListener('click', function() {
            window.location.href = 'https://studyhelp-24x7.onrender.com';
        });
