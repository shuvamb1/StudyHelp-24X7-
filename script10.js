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
document.getElementById('ddnote').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1Ydqh3XGq-hDvYX4eEsbzRTnWfuvAvRBD'; // Change this to the correct file path
    const fileName = 'C.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('pbc').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1pzclqDtR3Xvcnahixio7uxw2tm3_CXj9'; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('ddbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1tuZHEXf0jobTJMn8cwHMTZvQSWAtNR23'; // Change this to the correct file path
    const fileName = 'pdf of aa sir.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('ddrbpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});