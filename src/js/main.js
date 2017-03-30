$(document).ready(function () {

  //scroll to need block
  var catpos = $(".categories").position();
  $("#to-category").on("click", function () {
    console.log(Math.floor(catpos.top));
    $("html, body").animate({
      scrollTop: catpos.top
    }, 700);
  });
});
