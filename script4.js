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
document.getElementById('sdpdf').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1bSeXU9_2n_hv0Wwh0jlKZDUECHhTqjGU'; // Change this to the correct file path
    const fileName = 'Data Structure.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('dsanotes').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id='; // Change this to the correct file path
    const fileName = 'Practical.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('dsabooks').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1FikE6ibWJEAK_Pydzptbdy0i0SwkjLRk'; // Change this to the correct file path
    const fileName = 'notes of jgd mam.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});

document.getElementById('dsapyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1CI91o0avVufNsVf3OnHqWUQXO0CJjxAt'; // Change this to the correct file path
    const fileName = 'Discrete Mathamatics PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});