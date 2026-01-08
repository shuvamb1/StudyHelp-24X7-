
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
document.getElementById('tocthe').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1uaE4juDG5hjabohwudmBLg4mrzzc-SMd'; // Change this to the correct file path
    const fileName = 'TOC Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('tocbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=12ywyIH3T37LPuTv4kwVLdh7W2xl-XMvf'; // Change this to the correct file path
    const fileName = 'TOC Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('tocpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'TOC PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('logo').addEventListener('click', function() {
            window.location.href = 'index1.html';
        });
		document.getElementById('ask').addEventListener('click', function() {
            window.location.href = 'https://studyhelp-24x7.onrender.com';
        });
