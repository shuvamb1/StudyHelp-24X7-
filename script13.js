function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for the button click
document.getElementById('aaal').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1yvwIDuQ40OW1t20pUSCMI0mzthAvC_Dl'; // Change this to the correct file path
    const fileName = 'Algorithm aa Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('ssal').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1IdFYTu_0-eqZRVCSlUqH8MWc6GXhC2xc'; // Change this to the correct file path
    const fileName = 'Algorithm ss Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('albooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1Ib9Aef_q9ngrIChIORxb6-vqOhfz_DLa'; // Change this to the correct file path
    const fileName = 'Microprocessor Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('alpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Microprocessor PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
