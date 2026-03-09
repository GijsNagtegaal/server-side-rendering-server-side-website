// 1. Target all list items inside your popovers
const allOpdrachten = document.querySelectorAll('.opdracht-popover li');

allOpdrachten.forEach((li) => {
    // Look for buttons strictly inside THIS specific list item
    const correctBtn = li.querySelector('.correct');
    const wrongBtn = li.querySelector('.incorrect');
    const hint = li.querySelector('.hint');
    const nextStep = li.querySelector('.nextstep');

    if (correctBtn && wrongBtn) {
        correctBtn.addEventListener('click', () => {
            correctBtn.classList.add('clicked');
            wrongBtn.classList.remove('clicked');

            if (nextStep) nextStep.classList.add('visible'); 
            if (hint) hint.classList.remove('visible');  
        });

        wrongBtn.addEventListener('click', () => {
            wrongBtn.classList.add('clicked');
            correctBtn.classList.add('wrong-choice'); // Optional: style the wrong one
            correctBtn.classList.remove('clicked');

            if (hint) hint.classList.add('visible');    
            if (nextStep) nextStep.classList.remove('visible');
        });
    }
});

// URL Cleanup logic for the Popover API
document.querySelectorAll('.opdracht-popover').forEach(popover => {
    popover.addEventListener('toggle', (event) => {
        if (event.newState === 'closed') {
            // Removes the #hash from the URL when the user closes the popover
            history.replaceState(null, document.title, window.location.pathname + window.location.search);
            
            // OPTIONAL: Reset the slider to the first question when closed
            popover.querySelector('ul').scrollTo({ left: 0 });
        }
    });
});
const styleknoppie = document.querySelector('.opdrachtgever');

styleknoppie.addEventListener('click', () => {

    const bestaande_link = document.getElementById('opdrachtgever-css');

    if (bestaande_link) {

        bestaande_link.remove();
        console.log('CSS VERWIJDERD');
    } else {

        const nieuwe_link = `<link id="opdrachtgever-css" rel="stylesheet" href="/assets/styles/opdrachtgever.css" type="text/css">`;
        document.head.insertAdjacentHTML('beforeend', nieuwe_link);
        console.log('CSS TOEGEVOEGD');
    }
});

