function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for the button click
document.getElementById('swet').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=101QmFpZDDhKWUSSj3g57sm_iXMhCd7Ih'; // Change this to the correct file path
    const fileName = 'Software Engineering Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('swep').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1ybGezNhKySUV0yqaaeyn9QWdEG1DltvY'; // Change this to the correct file path
    const fileName = 'Software Engineering Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('swebooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1jt81zScRqnWZ_WYYWEYXNUTjc6trnsEE'; // Change this to the correct file path
    const fileName = 'Microprocessor Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('swepyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1afpYkLlq3olbTNJumj8YxVQdpj8kg5lu'; // Change this to the correct file path
    const fileName = 'Microprocessor PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('logo').addEventListener('click', function() {
            window.location.href = 'index1.html';
        });
		document.getElementById('ask').addEventListener('click', function() {
            window.location.href = 'https://studyhelp-24x7.onrender.com';
        });
