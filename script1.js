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
document.getElementById('pptButton').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1cpMy8s2d3M55PipHwB60DQXGkIHoS6EV'; // Change this to the correct file path
    const fileName = 'ppt.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('prn').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1hOq6ArsWu4N48kBIIL65k5EZpBm91Ft-'; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('dbmspyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1QnKsSCFA6yCIwihUxLdLx7tBFlvXNep5'; // Change this to the correct file path
    const fileName = 'dbmspyq.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('dbmsbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=120-5Tz66g8KnhbyD-oj3V9Q-xhsSxaXc'; // Change this to the correct file path
    const fileName = 'dbmsbooks.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
