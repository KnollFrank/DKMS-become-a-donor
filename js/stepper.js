/* adapted from test_Alex_geruest3.html */
var anz;
var z = 1; //zählvariable
function prevpart() { //click preve
	z--;
	if (z < 1) {
		z = 1;
	}
	show(z); //funct. z. Anzeige mit akt. z
}

function nextpart() {
	z++;
	if (z > anz) {
		z = anz;
	}
	show(z);
}

function show(x) { //das x. .part einblenden
	$('.part').hide();
	$('div:nth-of-type(' + x + ')').fadeIn(300);
}
$(document).ready(function () {
	anz = $('.part').length; //wie oft .part
	show(z); //bei Seitenaufruf 1. .part anzeigen
});
