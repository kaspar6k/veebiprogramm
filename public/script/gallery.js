window.onload = function(){
	let allThumbs = document.querySelector("#gallery").querySelectorAll(".thumbs");
	for(let i = 0; i < allThumbs.lenght; i ++){
		allThumbs[i].addEventListener("click", openModal);
	}
	document.querySelector("#modalClose").addEventListener("click", closeModal);
}
function OpenModal(e){
	document.querySelector("#modalImage").src = "/gallery/normal/" + e.target.dataset.filename;
	document.querySelector("#modalCaption").innerHTML = e.target.alt;
	document.querySelector("#modal").showModal();
}
function closeModal(){
	document.querySelector("#modalImage").close();
	docuemnt.querySelector("#modalImage").src = "../pic/empty.png";
	document.querySelector("#modalCaption").InnerHTML = "galeriipilt";
	
}