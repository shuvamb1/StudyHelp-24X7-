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
document.getElementById('pptkg').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1YlVLTKcLZF3GTmEaeicyU8zYgTY-BeV9'; // Change this to the correct file path
    const fileName = 'js ppt.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('wpkg').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1032nf0oqmLeGtJlv12iSx_heBG16NRZS'; // Change this to the correct file path
    const fileName = 'WEB PAGES.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('kgpyq').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1ryTpy4Z49z2ip4NH3uOvfBVlvVqDssNW'; // Change this to the correct file path
    const fileName = 'HTML_PYQ.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});
document.getElementById('htmlcodes').addEventListener('click', function() {
    const fileUrl = 'https://drive.google.com/uc?export=download&id=1lIXnIjM-H_uayn3Yo_Kgu667fP3I_3ip'; // Change this to the correct file path
    const fileName = 'PRACTICAL_CODES.zip'; // Specify the file name
    downloadFile(fileUrl, fileName);
});