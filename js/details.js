var $closedClass = 'details-closed';
var $openClass = 'details-open';

function getDetailLinks() {
  return $('a.details-link');
}

function removeAndAddClassOn($obj, class2Remove, class2Add) {
  return $obj.removeClass(class2Remove).addClass(class2Add);
}

function setOpenClassOn($obj) {
  return removeAndAddClassOn($obj, $closedClass, $openClass);
}

function setCloseClassOn($obj) {
  return removeAndAddClassOn($obj, $openClass, $closedClass);
}

function filterOpen($objs) {
  return $objs.filter('.' + $openClass);
}

function openContent($content, $link, animationTime) {
  $content.slideDown(animationTime);
  setOpenClassOn($content);
  setOpenClassOn($link);
}

function closeOpenContents(animationTime) {
  var $openContents = filterOpen($('.details-content'));
  $openContents.slideUp(animationTime);
  setCloseClassOn($openContents);
  setCloseClassOn(filterOpen(getDetailLinks()));
}

function openOrCloseContentReferencedBy($link) {
  var $content = $($link.attr("href"));
  var shallOpenContent = $content.hasClass($closedClass);
  var animationTime = 500;

  closeOpenContents(animationTime);
  if (shallOpenContent) {
    openContent($content, $link, animationTime);
  }
}

$(document).ready(function() {
  getDetailLinks().click(function(event) {
    event.preventDefault();
    var $detailsLink = $(this);
    openOrCloseContentReferencedBy($detailsLink);
  });
});
