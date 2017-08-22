var $image = document.getElementById('profile-photo-img');
var $imageLabel = document.getElementById('profile-photo-label');

function getPhoto(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(event) {
      $image.src = event.target.result;
      $imageLabel.innerText = 'Change photo';
    };
    reader.readAsDataURL(input.files[0]);
  }
}
