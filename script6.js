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
document.getElementById('cnote').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1U1-_R2hsAYYMFMIBitzJ7xPHWaD1gwBd'; // Change this to the correct file path
    const fileName = 'C.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('cprn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('cbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1OWDnObgOcq_RxAz81p1VgY-xuSxwu_6q'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('cpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1eIs6bmCB_EEmdWoPAeF5hnEE20VEfwrk'; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});