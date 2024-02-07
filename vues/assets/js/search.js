// Open Search
document.querySelector("#search-box").addEventListener("click", function () {
    openSearch();
});

// Close Search
document.querySelectorAll("#search-overlay, #close-search").forEach(el => {
    el.addEventListener("click", function () {
        closeSearch();
    });
});

// Show results
document.querySelector("#input-search").addEventListener("input", function(){
    showMatches();
});

function showMatches(){
    var wanted = document.querySelector("#input-search").value;
    var resCount = 0;
    document.querySelectorAll(".search-info").forEach(el => {
        el.innerHTML = el.innerHTML.replaceAll('<strong class="found">', '');
        el.innerHTML = el.innerHTML.replaceAll('</strong>', '');

        var display = false;
        if (containType(wanted)) {
            let parts = wanted.split(" - ");
            const typeClasses = {
                "member" : "members",
                "location" : "locations",
                "artist/band" : "artist",
                "creation-date" : "creation-date",
                "concert-date" : "concert-date",
                "first-album" : "first-album"
            };
            var regex = new RegExp(`(?<!<[^>]*)${escapeRegExp(parts[0])}(?![^<]*>)`, "gi");
            var pos = el.querySelectorAll("."+typeClasses[parts[1]]);
            pos.forEach(p => {
                if (parts[0].length > 0 && regex.test(p.textContent)) {
                    p.innerHTML = p.innerHTML.replaceAll(regex, function(match){
                        return '<strong class="found">' + match + '</strong>';
                    });
                    display = true;
                    resCount++;
                }
            });
        } else {
            var regex = new RegExp(`(?<!<[^>]*)${escapeRegExp(wanted)}(?![^<]*>)`, "gi");
            if (wanted.length > 0 && regex.test(el.textContent)) {
                el.innerHTML = el.innerHTML.replaceAll(regex, function(match){
                    return '<strong class="found">' + match + '</strong>';
                })
                display = true;
                resCount++;
            }
        }
        el.parentElement.style.display = display ? "flex" : "none";
    });
    if (resCount != 0 || wanted.length == 0) {
        document.querySelector("#no-matches").style.display = "none";
    }else{
        document.querySelector("#no-matches").style.display = "block";
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

 function containType(wanted) {
    let parts = wanted.split(" - ");
    const types = ["member","location","artist/band","creation-date","concert-date","first-album"];
    if (parts.length == 2) {
        for (let i = 0; i < types.length; i++) {
            if (parts[1].indexOf(types[i]) != -1) {
                return true;
            }            
        }
        return false;
    } else {
        return false;
    }
 }

// Acces to result element
document.querySelectorAll(".search-body").forEach(el => {
    el.addEventListener("click", function (){
        closeSearch();
        let id = this.getAttribute("id").split("_")[1];
        goToCard(id);
        openModal(id);
    });
});

function openSearch() {
    document.querySelector("#search-overlay").style.visibility = "visible";
    document.querySelector("#search-overlay").style.opacity = "1";
    document.querySelector("#search-overlay").style.backdropFilter = "blur(6px)";
    document.querySelector("#search-results").style.right = "0";

    // Disable page scrollbar
    document.body.style.overflow = "hidden";
}

function goToCard(id){
    setTimeout(() => {
        document.querySelector("#card_"+id).scrollIntoView({behavior: 'smooth'});
    }, 0);
}

function openModal(id) {
    document.querySelector("#see_"+id).click()
}

function closeSearch() {
    document.querySelector("#search-overlay").style.visibility = "hidden";
    document.querySelector("#search-overlay").style.backdropFilter = "blur(0px)";
    document.querySelector("#search-overlay").style.opacity = "0";
    document.querySelector("#search-results").style.right = "-360px";

    // Enable page scrollbar
    document.body.style.overflow = "auto";
}