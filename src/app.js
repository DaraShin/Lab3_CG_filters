let selectedColor = 'rgb(10, 72, 39)';
let blankColor = 'rgb(228, 255, 241)';
let centerColor = 'rgb(220, 20, 60)';

let curCenterRow = 0;
let curCenterClmn = 0;

createTable(3,3);


document.getElementById('medianBtn').addEventListener('click', () => {
    let sizeValid = medianSizeIsValid(document.getElementById('nonlinearSizeInput').value);
    setErrorMessage(document.getElementById('nonlinearSizeError'),sizeValid, "Введите целое нечетное число не меньше 3");
    if (!sizeValid) {
        return;
    }
    updateCanvasSize(document.getElementById("canvasOutput"));
    medianFilter(document.getElementById("inputImg"), document.getElementById("canvasOutput"), getFilterSize());
});

document.getElementById('maximumBtn').addEventListener('click', () => {
    let sizeValid = minmaxSizeIsValid(document.getElementById('nonlinearSizeInput').value);
    setErrorMessage(document.getElementById('nonlinearSizeError'),sizeValid, "Введите целое положительное число");
    if (!sizeValid) {
        return;
    }
    updateCanvasSize(document.getElementById("canvasOutput"));
    maximumFilter(document.getElementById("inputImg"), document.getElementById("canvasOutput"), getFilterSize());
});

document.getElementById('minimumBtn').addEventListener('click', () => {
    let sizeValid = minmaxSizeIsValid(document.getElementById('nonlinearSizeInput').value);
    setErrorMessage(document.getElementById('nonlinearSizeError'), sizeValid, "Введите целое положительное число");
    if (!sizeValid) {
        return;
    }
    updateCanvasSize(document.getElementById("canvasOutput"));
    minimumFilter(document.getElementById("inputImg"), document.getElementById("canvasOutput"), getFilterSize());
});

document.getElementById('erosionBtn').addEventListener('click', () => {
    updateCanvasSize(document.getElementById("canvasOutput"));
    let kernelParams = getMatFromTable();
    let kernelMatrix = kernelParams.kernel;
    let anchor = kernelParams.anchor;
    //let kernelMatrix = cv.Mat.ones(5, 5, cv.CV_8U);
    //let anchor = new cv.Point(-1, -1);
    erosion(document.getElementById("inputImg"), document.getElementById("canvasOutput"), kernelMatrix, anchor);
    kernelMatrix.delete();
});

document.getElementById('dilationBtn').addEventListener('click', () => {
    updateCanvasSize(document.getElementById("canvasOutput"));
    let kernelParams = getMatFromTable();
    let kernelMatrix = kernelParams.kernel;
    let anchor = kernelParams.anchor;
    dilation(document.getElementById("inputImg"), document.getElementById("canvasOutput"), kernelMatrix, anchor);
    kernelMatrix.delete();
});

document.getElementById('openingBtn').addEventListener('click', () => {
    updateCanvasSize(document.getElementById("canvasOutput"));
    let kernelParams = getMatFromTable();
    let kernelMatrix = kernelParams.kernel;
    let anchor = kernelParams.anchor;
    opening(document.getElementById("inputImg"), document.getElementById("canvasOutput"), kernelMatrix, anchor);
    kernelMatrix.delete();
});

document.getElementById('closingBtn').addEventListener('click', () => {
    updateCanvasSize(document.getElementById("canvasOutput"));
    let kernelParams = getMatFromTable();
    let kernelMatrix = kernelParams.kernel;
    let anchor = kernelParams.anchor;
    closing(document.getElementById("inputImg"), document.getElementById("canvasOutput"), kernelMatrix, anchor);
    kernelMatrix.delete();
});

document.getElementById("fileInput").addEventListener("change", (e) => {
    var image = document.getElementById("inputImg");
    image.classList.remove("image-area-sized");
    image.classList.add("image-area");
    image.src = URL.createObjectURL(e.target.files[0]);
});

document.getElementById('showTableBtn').addEventListener('click', () => {
    let sizeValid = minmaxSizeIsValid(document.getElementById('widthInput').value) && minmaxSizeIsValid(document.getElementById('heightInput').value);
    if(!sizeValid){
        setErrorMessage(document.getElementById('tableSizeError'), false, "Введите целые положительные числа");
        return;
    }
    let rowsNum = Number.parseInt(document.getElementById('widthInput').value);
    let columnsNum = Number.parseInt(document.getElementById('heightInput').value);
    createTable(rowsNum, columnsNum);
});

document.getElementById('maskTable').addEventListener('click', function (e) {
    const cell = e.target.closest('th');
    if (!cell) { return; } // Quit, not clicked on a cell
    if (cell.style.backgroundColor == selectedColor) {
        cell.style.backgroundColor = blankColor;
    } else if (cell.style.backgroundColor == blankColor) {
        cell.style.backgroundColor = selectedColor;
    }
});


document.getElementById('maskTable').addEventListener('contextmenu', function (e) {
    e.preventDefault();
    const cell = e.target.closest('th');
    const table = document.getElementById('maskTable');
    if (!cell) { return; } // Quit, not clicked on a cell
    if (cell.style.backgroundColor == centerColor) {
        curCenterRow = Math.round(table.rows.length / 2) - 1;
        curCenterClmn = Math.round(table.rows[0].cells.length / 2) - 1;
        cell.style.backgroundColor = selectedColor;
        table.rows[curCenterRow].cells[curCenterClmn].style.backgroundColor = centerColor;
    } else {
        table.rows[curCenterRow].cells[curCenterClmn].style.backgroundColor = selectedColor;
        curCenterRow = cell.parentElement.rowIndex;
        curCenterClmn = cell.cellIndex;
        cell.style.backgroundColor = centerColor;
    }
});



function updateCanvasSize(canvas) {
    canvas.classList.remove("image-area-sized");
    canvas.classList.add("image-area");
}


function getMatFromTable() {
    let tableElem = document.getElementById('maskTable');
    let rows = Number.parseInt(document.getElementById('widthInput').value);
    let columns = Number.parseInt(document.getElementById('heightInput').value);

    let kernelMatrix = cv.Mat.ones(rows, columns, cv.CV_8U);
    let center = new cv.Point(-1, -1);

    for (let row = 0; row < tableElem.rows.length; row++) {
        for (let clmn = 0; clmn < tableElem.rows[0].cells.length; clmn++) {
            let cell = tableElem.rows[row].cells[clmn];
        
            if (cell.style.backgroundColor == blankColor) {
                kernelMatrix.ucharPtr(row, clmn)[0] = 0;
            } else if (cell.style.backgroundColor == centerColor) {
                center = new cv.Point(clmn, row);
            }
        }
    }
    return { 'kernel': kernelMatrix, 'anchor': center };
}

function medianSizeIsValid(sizeString){
    return /^[13579]+$/.test(sizeString) && Number.parseInt(sizeString) > 1;
}

function minmaxSizeIsValid(sizeString){
    return /^\d+$/.test(sizeString) && Number.parseInt(sizeString) > 0;
}

function setErrorMessage(errorElem, isValid, message){
    if(isValid){
        errorElem.style.visibility = 'collapsed';
    }else {
        errorElem.style.visibility = 'visible';
        errorElem.textContent = message;
    }
}

function getFilterSize() {
    let sizeInput = document.getElementById("nonlinearSizeInput");
    if (sizeInput.value == "") {
        sizeInput.value = "3";
    }
    return Number.parseInt(sizeInput.value);
}
function medianFilter(inputImg, outputCanvas, kernelSize) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    cv.medianBlur(src, dst, kernelSize);
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete();
}

function maximumFilter(inputImg, outputCanvas, kernelSize) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    let M = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete(); M.delete();
}

function minimumFilter(inputImg, outputCanvas, kernelSize) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    let M = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.erode(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete(); M.delete();
}

function erosion(inputImg, outputCanvas, kernelMatrix, anchor) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    cv.erode(src, dst, kernelMatrix, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete();
}

function dilation(inputImg, outputCanvas, kernelMatrix, anchor) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    cv.dilate(src, dst, kernelMatrix, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete();
}

// Opening is just another name of erosion followed by dilation. It is useful in removing noise.
function opening(inputImg, outputCanvas, kernelMatrix, anchor) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    cv.morphologyEx(src, dst, cv.MORPH_OPEN, kernelMatrix, anchor, 1,
        cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete();
}

// Dilation followed by Erosion. It is useful in closing small holes inside the foreground objects, or small black points on the object
function closing(inputImg, outputCanvas, kernelMatrix, anchor) {
    let src = cv.imread(inputImg);
    let dst = new cv.Mat();
    //let M = cv.Mat.ones(kernelSize, kernelSize, cv.CV_8U);
    //let anchor = new cv.Point(-1, -1);
    cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernelMatrix);
    cv.imshow(outputCanvas, dst);
    src.delete(); dst.delete();
}

function createTable(rowsNum, columnsNum) {
    var table = document.getElementById("maskTable");
    table.innerHTML = '';
    for (let rowIndex = 0; rowIndex < rowsNum; rowIndex++) {
        var row = document.createElement("tr");
        for (let colIndex = 0; colIndex < columnsNum; colIndex++) {
            var cell = document.createElement("th");
            var cellContents = document.createTextNode("");
            cell.appendChild(cellContents);
            row.appendChild(cell);
            cell.style.backgroundColor = selectedColor;
        }
        table.appendChild(row);
    }
    curCenterRow = Math.round(rowsNum / 2) - 1;
    curCenterClmn = Math.round(columnsNum / 2) - 1;
    document.getElementById('maskTable').rows[curCenterRow].cells[curCenterClmn].style.backgroundColor = centerColor;
}