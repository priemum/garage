const currentUrl = '<%= window.location.href %>';

// loop through each navigation item and check if the URL matches
const navItems = document.querySelectorAll('.navbarItem');
for (let i = 0; i < navItems.length; i++) {
	const navItem = navItems[i];
	if (navItem.querySelector('a').href === currentUrl) {
		navItem.classList.add('active');
	} else {
		navItem.classList.remove('active');
	}
}
