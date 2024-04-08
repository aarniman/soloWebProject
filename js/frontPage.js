window.onscroll = function() {scrollFunction()};

const header = document.getElementById("myHeader");

const sticky = header.offsetTop;

function scrollFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
}