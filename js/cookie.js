console.log('My cookies: ', document.cookie);
var cookieAssignment = 'hidecookiedingsbums=1';

if (document.cookie.indexOf(cookieAssignment) != -1) {
	$('#cookiedingsbums').hide();
} else {
	$('#cookiedingsbums').prependTo('body');
	$('#cookiedingsbumsCloser').show();
}

function hidecookiedingsbums() {
	document.cookie = cookieAssignment + ';path=/';
	$('#cookiedingsbums').slideUp()
}
