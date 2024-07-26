const { jsPDF } = window.jspdf;

const maxNumberOfImages = 12;
const preview = document.getElementById('preview');
const imageUpload = document.getElementById('imageUpload');
const addImageButton = document.getElementById('addImageButton');
const generatePdfButton = document.getElementById('generatePdfButton');
const images = [];
const placaInput = document.getElementById('placa');
const fechaInput = document.getElementById('fecha');
const reporteInput = document.getElementById('reporte');
const matriculaInput = document.getElementById('matricula');
const ubicacionInput = document.getElementById('ubicacion');
const spinner = document.getElementById('spinner');
const tarimaInput = document.getElementById('tarima');
const caseton20Input = document.getElementById('caseton20');
const caseton30Input = document.getElementById('caseton30');
const hebillasInput = document.getElementById('hebillas');
const deslizableInput = document.getElementById('deslizable');
const flejeInput = document.getElementById('fleje');

const logo = './logo.png';

addImageButton.addEventListener('click', () => {
    if (images.length >= maxNumberOfImages) {
        alert('Solo puedes subir un máximo de 6 imágenes');
        return;
    }
    imageUpload.click();
});

imageUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    const maxFiles = maxNumberOfImages - images.length;

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (function(file) {
            return function(e) {
                const imageSrc = e.target.result;
                const image = document.createElement('div');
                image.classList.add('position-relative', 'd-inline-block', 'm-2');
                
                const imgElement = document.createElement('img');
                imgElement.src = imageSrc;
                imgElement.classList.add('img-fluid', 'rounded');
                
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete', 'btn', 'btn-danger', 'btn-sm', 'position-absolute', 'top-0', 'end-0');
                deleteButton.type = 'button';
                deleteButton.innerHTML = '&times;';
                deleteButton.addEventListener('click', (event) => {
                    if (confirm('¿Estás seguro de borrar la fotografía?')) {
                        const imgContainer = event.target.parentElement;
                        preview.removeChild(imgContainer);
                        const imgSrc = imgContainer.querySelector('img').src;
                        const index = images.indexOf(imgSrc);
                        if (index > -1) {
                            images.splice(index, 1);
                        }
                        if (images.length < maxNumberOfImages) {
                            addImageButton.disabled = false;
                        }
                    }
                });

                image.appendChild(imgElement);
                image.appendChild(deleteButton);
                preview.appendChild(image);

                images.push(imageSrc);
                if (images.length >= maxNumberOfImages) {
                    addImageButton.disabled = true;
                }
            };
        })(file);

        reader.readAsDataURL(file);
    }
});


generatePdfButton.addEventListener('click', () => {
    showSpinner();
    setTimeout(async () => {
        await generatePDF();
        hideSpinner();
    }, 1000);
});

async function generatePDF() {
    const placa = placaInput.value;
    const fecha = fechaInput.value;
    const reporte = reporteInput.value;
    const ubicacion = ubicacionInput.value;
    const matricula = matriculaInput.value;
    const tarima = tarimaInput.value;
    const caseton20 = caseton20Input.value;
    const caseton30 = caseton30Input.value;
    const hebillas = hebillasInput.value;
    const deslizable = deslizableInput.value;
    const fleje = flejeInput.value;

    if (images.length === 0) {
        alert('Por favor, sube al menos una imagen');
        return;
    }

    if (
        !placa.length ||
        !fecha.length ||
        !reporte.length ||
        !ubicacion.length ||
        !matricula.length ||
        !tarima.length ||
        !caseton20.length ||
        !caseton30.length ||
        !hebillas.length ||
        !deslizable.length ||
        !fleje.length
    ) {
        alert('Por favor, completa todos los campos');
        return;
    }

    const fileName = `${matricula}_${placa}_${fecha}_${reporte}_${ubicacion}`;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imageWidth = (pageWidth - margin * 3) / 2;
    const imageHeight = (pageHeight - margin * 3) / 2;
    const logoWidth = 30;
    const logoHeight = 10;
    let x = margin / 2 + pageWidth / 2;
    let y = margin + logoHeight;

    const addLogo = () => {
        pdf.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);
    };

    const addTable = () => {
        pdf.setFontSize(10);
        pdf.text('Tarima (PZA):', margin, y + 5);
        pdf.text(tarima, pageWidth / 4, y + 5);
        pdf.text('Casetón 20 (PZA):', margin, y + 10);
        pdf.text(caseton20, pageWidth / 4, y + 10);
        pdf.text('Casetón 30 (PZA):', margin, y + 15);
        pdf.text(caseton30, pageWidth / 4, y + 15);
        pdf.text('Hebillas (PZA):', margin, y + 20);
        pdf.text(hebillas, pageWidth / 4, y + 20);
        pdf.text('Deslizable (PZA):', margin, y + 25);
        pdf.text(deslizable, pageWidth / 4, y + 25);
        pdf.text('Fleje (MTS):', margin, y + 30);
        pdf.text(fleje, pageWidth / 4, y + 30);
    };

    addLogo();

    for (let i = 0; i < images.length + 1; i++) {
        if(i === 0) {
            addTable();
            continue;
        }
        if (i % 2 === 0 && i !== 0) {
            x = margin;
            y += imageHeight + margin;
        } else if (i % 2 !== 0) {
            x = pageWidth / 2 + margin / 2;
        }

        if (i > 0 && i % 6 === 0) {
            pdf.addPage();
            addLogo();
            x = margin;
            y = margin + logoHeight;
        }

        pdf.addImage(images[i - 1], 'JPEG', x, y, imageWidth, imageHeight);
    }

    const signatureY = pageHeight - 10;
    pdf.text(fileName.toUpperCase(), pageWidth / 2, signatureY, { align: 'center' });

    pdf.save(`${fileName.toUpperCase()}.pdf`);
    preview.innerHTML = '';
    images.length = 0;
    addImageButton.disabled = false;
    placa.value = '';
    fecha.value = '';
    reporte.value = '';
    ubicacion.value = '';
    matricula.value = '';
}

function showSpinner() {
    spinner.style.display = 'block';
}

function hideSpinner() {
    spinner.style.display = 'none';
}
