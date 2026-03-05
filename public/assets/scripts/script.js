const correctBtn = document.querySelector('.correct');
const wrongBtn = document.querySelector('.incorrect');
const hint = document.querySelector('.hint');
const nextStep = document.querySelector('.nextstep');

correctBtn.addEventListener('click', () => {

    correctBtn.classList.add('clicked');
    wrongBtn.classList.remove('clicked');

    nextStep.classList.add('visible'); 
    hint.classList.remove('visible');  
});

wrongBtn.addEventListener('click', () => {

    wrongBtn.classList.add('clicked');
    correctBtn.classList.remove('clicked');


    hint.classList.add('visible');    
    nextStep.classList.remove('visible');
});

console.log(wrongBtn)