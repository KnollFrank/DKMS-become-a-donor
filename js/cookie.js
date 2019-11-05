/* temporarily setting hidecookiedingsbums=0 */
/* document.cookie = 'hidecookiedingsbums=0;path=/' */
console.log('My cookies: ', document.cookie);
if (document.cookie.indexOf('hidecookiedingsbums=1') != -1) {
	$('#cookiedingsbums').hide();
} else {
	$('#cookiedingsbums').prependTo('body');
	$('#cookiedingsbumsCloser').show();
}

function hidecookiedingsbums() {
	document.cookie = 'hidecookiedingsbums=1;path=/';
	$('#cookiedingsbums').slideUp()
}
