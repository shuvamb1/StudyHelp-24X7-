
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for the button click
document.getElementById('netpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1CV-Dw4cM1MbuHAO0jIeGvLDX46MutAC7'; // Change this to the correct file path
    const fileName = 'probability PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('net1pyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1UpDJRhe8PkMyqjkKRGt4bcXVzAP7Pb3a'; // Change this to the correct file path
    const fileName = 'calculas PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('logo').addEventListener('click', function() {
            window.location.href = 'index1.html';
        });
		document.getElementById('ask').addEventListener('click', function() {
            window.location.href = 'https://studyhelp-24x7.onrender.com';
        });

