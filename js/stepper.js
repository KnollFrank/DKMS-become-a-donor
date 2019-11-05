/* adapted from test_Alex_geruest3.html */
var anz;
var z;

function prevpart() {
	z--;
	if (z < 1) {
		z = 1;
	}
	show();
}

function nextpart() {
	z++;
	if (z > anz) {
		z = anz;
	}
	show();
}

function show() {
	$('.part').hide();
	$('div:nth-of-type(' + z + ')').fadeIn(300);
}
$(document).ready(function () {
	anz = $('.part').length;
	z = 1;
	show();
});
