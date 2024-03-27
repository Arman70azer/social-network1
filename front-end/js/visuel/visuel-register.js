document.addEventListener("DOMContentLoaded", () => {
    let input = document.getElementById("avatar");
    let imageName = document.getElementById("imageName");
  
    input.addEventListener("change", () => {
      let inputImage = document.querySelector("input[type=file]").files[0];
  
      imageName.innerText = inputImage.name;
    });
});
  
