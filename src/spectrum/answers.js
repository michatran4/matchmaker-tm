const answers = document.querySelectorAll('.answer')
const containers = document.querySelectorAll('.container')

function makeDraggable(element) {
    element.draggable = true;
    element.addEventListener('dragstart', () => {
        element.classList.add('dragging')
    })
    element.addEventListener('dragend', () => {
        element.classList.remove('dragging')
    })
}

function createAnswer(submit_button) { // this is creating only for the submit button
    let container = submit_button.parentNode;
    const text = container.querySelector('.answer-box').value;
    if (text == '') return alert('You cannot add an empty answer.');
    const answer = document.createElement('span');
    answer.classList.add('answer');
    makeDraggable(answer);
    answer.contentEditable = true;
    answer.innerHTML = text;
    container.querySelector('.spectrum').append(answer);
}

// do the spectrum of the one available question
containers.forEach(container => {
    const spectrum = container.querySelector('.spectrum')
    spectrum.addEventListener('dragover', e => { // ordering functionality
        e.preventDefault();
        const afterElement = getDragAfterElement(spectrum, e.clientX);
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            if (draggable != null) {
                spectrum.appendChild(draggable);
            }
        } else {
            spectrum.insertBefore(draggable, afterElement);
        }
    })
})

function populateAnswers(spectrum, list) { // this is creating pre made answers
    if (list == null) return;
    list.forEach(element => {
        const answer = document.createElement('span');
        answer.classList.add('answer');
        makeDraggable(answer);
        answer.contentEditable = true;
        answer.innerHTML = element;
        spectrum.append(answer);
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.answer:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

/**
 * Create a set of a question and answers graphically.
 * @param {string} q 
 * @param {object} answer_list 
 */
 function createSet(q, answer_list) {
    const container = document.createElement('div');
    container.classList.add('container');

    const qLabel = document.createElement('label');
    qLabel.htmlFor = 'question';
    qLabel.innerHTML = 'Question: '
    const question = document.createElement('input');
    question.classList.add('question');
    question.value = q;

    const spectrum = document.createElement('div');
    spectrum.classList.add('spectrum');
    spectrum.style = 'display:flex';
    spectrum.addEventListener('dragover', e => { // ordering functionality
        e.preventDefault();
        const afterElement = getDragAfterElement(spectrum, e.clientX)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            if (draggable != null) {
                spectrum.appendChild(draggable)
            }
        } else {
            spectrum.insertBefore(draggable, afterElement)
        }
    })

    const aLabel = document.createElement('label');
    aLabel.htmlFor = 'answer-box';
    aLabel.innerHTML = 'Add answer: '
    const answer_box = document.createElement('input');
    answer_box.classList.add('answer-box');

    const addAnswer = document.createElement('input');
    addAnswer.classList.add('answer-button');
    addAnswer.type = 'submit';
    addAnswer.value = 'Add Answer';

    container.appendChild(qLabel);
    container.appendChild(question);
    container.appendChild(spectrum);
    container.appendChild(aLabel);
    container.appendChild(answer_box);
    container.appendChild(addAnswer);
    document.body.appendChild(container);

    addAnswer.onclick = () => createAnswer(addAnswer);
    populateAnswers(spectrum, answer_list);
}

/**
 * Create a section label.
 */
function createSection(q) {
    const container = document.createElement('div');
    container.classList.add('container');

    const qLabel = document.createElement('label');
    qLabel.htmlFor = 'question';
    qLabel.innerHTML = 'Section: '
    const question = document.createElement('input');
    question.classList.add('question');
    question.value = q;

    container.appendChild(qLabel);
    container.appendChild(question);
    document.body.appendChild(container);
}

function openFile() {
    if (document.querySelector('.container') != null) {
        if (confirm('Opening a file will clear any changes. Is this OK?')) {
            document.querySelectorAll('.container').forEach(element => {
                element.remove();
            });
        }
        else {
            return;
        }
    }
    var fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.click();
    fileSelector.addEventListener('change', (event) => {
        const file = event.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = readerEvent => {
            let content = readerEvent.target.result.split("\n\n");
            console.log(content);
            content = content.filter(function(value, index, arr) {
                return value != ''; // extra new lines possibly, prune just in case
            })
            console.log(content);
            content.forEach(str => {
                if (str.endsWith('\n')) {
                    str = str.substring(0, str.length - 1);
                }
                if (str.includes("\n")) { // anomaly for last line
                    str = str.split("\n");
                    let question = str[0];
                    let answers = str[1].split(" | ");
                    createSet(question, answers);
                }
                else {
                    createSection(str);
                }
            });
        }
    });
}
