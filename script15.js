function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listener for the button click
document.getElementById('nett').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1_9fsfr0wcq6Gz0JnQW1rNocGb73i6a2J'; // Change this to the correct file path
    const fileName = 'Networking Theory.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('netp').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1fV7fHfA1ed8VBYKBcuVBJSYazz8iKrvI'; // Change this to the correct file path
    const fileName = 'Networking Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('netbooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=19qlY6aWEdd_L8Kp6P8IEvgKCK-wwgTC_'; // Change this to the correct file path
    const fileName = 'Networking Books.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('netpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Microprocessor PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
