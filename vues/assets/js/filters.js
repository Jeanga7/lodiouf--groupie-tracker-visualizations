// Open Search
document.querySelector("#filter-box").addEventListener("click", function () {
    openFilter();
});

function openFilter() {
    document.querySelector("#filter-overlay").style.visibility = "visible";
    document.querySelector("#filter-overlay").style.opacity = "1";
    document.querySelector("#filter-overlay").style.backdropFilter = "blur(6px)";
    document.querySelector("#filter-block").style.left = "0";

    document.body.style.overflow = "hidden";
}

// Close filter
document.querySelectorAll("#filter-overlay, #close-filter").forEach(el => {
    el.addEventListener("click", function () {
        closeFilter();
    });
});

function closeFilter() {
    document.querySelector("#filter-overlay").style.visibility = "hidden";
    document.querySelector("#filter-overlay").style.opacity = "0";
    document.querySelector("#filter-overlay").style.backdropFilter = "blur(0px)";
    document.querySelector("#filter-block").style.left = "-360px";

    document.body.style.overflow = "auto";
}

/* ==============RANGE-JS============= */
// Creation date ranges start here
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangeDate = document.querySelectorAll(".range-date input");

rangeInput.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minRange = parseInt(rangeInput[0].value);
        let maxRange = parseInt(rangeInput[1].value);
        if (e.target.className === "min") {
            if (minRange > maxRange) {
                rangeInput[1].value = minRange;
            }
        } else {
            if (maxRange < minRange) {
                rangeInput[0].value = maxRange;
            }
        }

        rangeDate[0].value = rangeInput[0].value;
        rangeDate[1].value = rangeInput[1].value;
        document.querySelector("#minCreationDate_label").innerHTML = rangeInput[0].value;
        document.querySelector("#maxCreationDate_label").innerHTML = rangeInput[1].value;
        range.style.left = ((minRange - CreationDateMin) / (CreationDateMax - CreationDateMin)) * 100 + "%";
        range.style.right = 100 - ((maxRange - CreationDateMin) / (CreationDateMax - CreationDateMin)) * 100 + "%";
    });
});


rangeDate.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minDate = rangeDate[0].value;
        let maxDate = rangeDate[1].value;
        if (e.target.className === "min" && minDate > maxDate) {
            rangeInput[1].value = minDate;
        } else if (e.target.className === "max" && maxDate < minDate) {
            rangeInput[0].value = maxDate;
        }
        range.style.left = ((rangeInput[0].value - CreationDateMin) / (CreationDateMax - CreationDateMin)) * 100 + "%";
        range.style.right = 100 - ((rangeInput[1].value - CreationDateMin) / (CreationDateMax - CreationDateMin)) * 100 + "%";
    });
});
// Creation date ranges end here

// -------------------------------------------------------------------------------------------------------------

// First album ranges start here
const rangedate = document.querySelector(".range-selecteds");
const rangeInputs = document.querySelectorAll(".range-inputs input");
const rangeDates = document.querySelectorAll(".range-dates input");

rangeInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minRangedate = parseInt(rangeInputs[0].value);
        let maxRangedate = parseInt(rangeInputs[1].value);
        if (e.target.className === "mindate") {
            if (minRangedate > maxRangedate) {
                rangeInputs[1].value = minRangedate;
            }
        } else {
            if (maxRangedate < minRangedate) {
                rangeInputs[0].value = maxRangedate;
            }
        }

        rangeDates[0].value = rangeInputs[0].value;
        rangeDates[1].value = rangeInputs[1].value;
        document.querySelector("#minFirstAlbum_label").innerHTML = rangeInputs[0].value;
        document.querySelector("#maxFirstAlbum_label").innerHTML = rangeInputs[1].value;
        rangedate.style.left = ((minRangedate - FirstAlbumMin) / (FirstAlbumMax - FirstAlbumMin)) * 100 + "%";
        rangedate.style.right = 100 - ((maxRangedate - FirstAlbumMin) / (FirstAlbumMax - FirstAlbumMin)) * 100 + "%";
    });
});

rangeDates.forEach((input) => {
    input.addEventListener("input", (e) => {
        let minDatedate = rangeDates[0].value;
        let maxDatedate = rangeDates[1].value;
        if (e.target.className === "mindate" && minDatedate > maxDatedate) {
            rangeInputs[1].value = minDatedate;
        } else if (e.target.className === "maxdate" && maxDatedate < minDatedate) {
            rangeInputs[0].value = maxDatedate;
        }
        rangedate.style.left = ((rangeInputs[0].value - FirstAlbumMin) / (FirstAlbumMax - FirstAlbumMin)) * 100 + "%";
        rangedate.style.right = 100 - ((rangeInputs[1].value - FirstAlbumMin) / (FirstAlbumMax - FirstAlbumMin)) * 100 + "%";
    });
});

//-----------------------------------------------------
// les chiffres cochés parmis des checkboxs

const rangeLabel = document.querySelector('#checkedBox_Num');
const checkboxes = document.querySelectorAll('#checkbox-number input');

function updateCheckedMembers() {
    const checkedNumbers = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id.split('-')[1])
        .join(',');

    if (checkedNumbers === '') {
        rangeLabel.textContent = 'Nothing Checked';
    } else if (checkedNumbers === '1,2,3,4,5,6,7,8') {
        rangeLabel.textContent = 'All Checked';
    } else {
        rangeLabel.textContent = checkedNumbers;
    }
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateCheckedMembers);
});

updateCheckedMembers();

// ==============================BUTTON RESET==============================//

document.querySelector("#reset").addEventListener("click", () => {
    // Réinitialisation des filtres de  "Creation Dates"
    rangeInput[0].value = CreationDateMin;
    rangeInput[1].value = CreationDateMax;
    rangeDate[0].value = CreationDateMin;
    rangeDate[1].value = CreationDateMax;
    document.querySelector("#minCreationDate_label").innerHTML = CreationDateMin;
    document.querySelector("#maxCreationDate_label").innerHTML = CreationDateMax;
    range.style.left = "0%";
    range.style.right = "0%";

    // Réinitialisation des filtres de  "First Album"
    rangeInputs[0].value = FirstAlbumMin;
    rangeInputs[1].value = FirstAlbumMax;
    rangeDates[0].value = FirstAlbumMin;
    rangeDates[1].value = FirstAlbumMax;
    document.querySelector("#minFirstAlbum_label").innerHTML = FirstAlbumMin;
    document.querySelector("#maxFirstAlbum_label").innerHTML = FirstAlbumMax;
    rangedate.style.left = "0%";
    rangedate.style.right = "0%";

    // Réinitialisation des filtres des checkbaxs
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    updateCheckedMembers();

    // Vider le champ de recherche de la localisation
    document.getElementById("input-location-filter").value = "";
});

//===================================LOCATION-FILTER==================================//

function applyFilter() {
    const locationValue = document.querySelector("#input-location-filter").value.toLowerCase();
    const minCreationDate = document.querySelector("#minCreationDate_label").textContent !== "" ? parseInt(document.querySelector("#minCreationDate_label").textContent) : 0;
    const maxCreationDate = document.querySelector("#maxCreationDate_label").textContent !== "" ? parseInt(document.querySelector("#maxCreationDate_label").textContent) : Infinity;
    const minFirstAlbum = document.querySelector("#minFirstAlbum_label").textContent !== "" ? parseInt(document.querySelector("#minFirstAlbum_label").textContent) : 0;
    const maxFirstAlbum = document.querySelector("#maxFirstAlbum_label").textContent !== "" ? parseInt(document.querySelector("#maxFirstAlbum_label").textContent) : Infinity;

    checkedNumbersLabel = document.querySelector('#checkedBox_Num').textContent;

    let checkedNumbers;

    if (checkedNumbersLabel === 'All Checked') {
        checkedNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
    } else {
        checkedNumbers = checkedNumbersLabel.split(',').map(Number);
    }

    let resultsCount = 0;

    document.querySelectorAll('.artist-card').forEach(function (card) {
        // const artistLocation = card.querySelector('.artist-locations').getAttribute('data-location').toLowerCase();
        const creationDate = parseInt(card.querySelector('.artist-year').textContent);
        const firstAlbumDate = getYearFromDate(card.querySelector('.artist-firstAlbum').textContent);

        const membersList = card.querySelector('.artist-members').textContent;
        const numberOfMembers = membersList.split(',').length;

        // Filtre par localisation
        let locationFilter = false;
        if (locationValue !== "") {
            card.querySelectorAll('.concert-place').forEach(p => {
                const concertLocation = p.getAttribute('data-place').toLowerCase();
                if (concertLocation.includes(locationValue)) {
                    locationFilter = true;
                }
            });
        } else {
            locationFilter = true;
        }


        // Filtre par date de création
        const dateFilter = creationDate >= minCreationDate && creationDate <= maxCreationDate;

        // Filtre par premier album
        const firstAlbumFilter = firstAlbumDate >= minFirstAlbum && firstAlbumDate <= maxFirstAlbum;

        // Filtre par nombre de membres
        const allChecked = checkedNumbersLabel === 'All Checked';
        const membersFilter = allChecked || checkedNumbers.includes(numberOfMembers);

        // Appliquer le filtre
        if (locationFilter && dateFilter && firstAlbumFilter && membersFilter) {
            card.style.display = 'flex';
            resultsCount++;
        } else {
            card.style.display = 'none';
        }
    });

    PrintResultsCount(resultsCount)
}


document.querySelector("#apply").addEventListener("click", function () {
    closeFilter();
    scroll();
    applyFilter();
});

function scroll() {
    setTimeout(() => {
        document.querySelector("#artists").scrollIntoView({ behavior: 'smooth' });
    }, 0);
}

//vue que les dates se presente sous le format 14-12-1993 on a besoin de l'annee
function getYearFromDate(dateString) {
    const parts = dateString.split("-");
    if (parts.length === 3) {
        return parseInt(parts[2], 10);
    }
    return NaN;
}

function PrintResultsCount(resultsCount) {
    const artistCountElement = document.querySelector('#artistCount');
    if (resultsCount > 0) {
        artistCountElement.innerHTML = resultsCount + ' artists found.';
        artistCountElement.style.display = 'block';
    } else {
        artistCountElement.innerHTML = '';
        artistCountElement.style.display = 'none';
    }
}