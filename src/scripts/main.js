let links = document.querySelectorAll('a[href^="#"]');

links.forEach((item) => {
	item.addEventListener("click", (e) => {
		e.preventDefault();

		let section = document.querySelector(item.getAttribute("href"));

		section.scrollIntoView({
			behavior: "smooth",
		});
	});
});
